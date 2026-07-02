import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/rbac";
import { verifyBankAccount } from "@/lib/pennyDropVerify";

// ─── POST /api/invoices ──────────────────────────────────────────────────
// A vendor (or Admin/Accounts, submitting on the vendor's behalf) uploads an
// invoice against one of the vendor's registered bank accounts. The account
// is immediately re-verified via penny-drop:
//   VERIFIED       -> invoice.status = CONFIRMED
//   NAME_MISMATCH  -> invoice.status = DECLINED (reason recorded)
//   ACCOUNT_FROZEN -> invoice.status = DECLINED (reason recorded)
//   NOT_FOUND      -> invoice.status = DECLINED (reason recorded)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const roleCheck = requireRole(session, ["VENDOR", "ADMIN", "ACCOUNTS", "INITIATOR"]);
    if (roleCheck) return roleCheck;

    const user = session!.user;
    const body = await req.json();

    const {
      vendorId: bodyVendorId,
      bankAccountId,
      invoiceNumber,
      invoiceDate,
      amount,
      currency,
      documentName,
      documentUrl,
      documentSize,
    } = body;

    if (!bankAccountId || !invoiceNumber || !invoiceDate || !amount || !documentUrl || !documentName) {
      return NextResponse.json(
        { error: "bankAccountId, invoiceNumber, invoiceDate, amount, documentName and documentUrl are required" },
        { status: 400 }
      );
    }

    // A VENDOR-role user may only ever submit against their own vendorId,
    // regardless of what (if anything) is sent in the body.
    // ADMIN/ACCOUNTS/INITIATOR must explicitly say which vendor this is for.
    let vendorId: string | null | undefined;
    if (user.role === "VENDOR") {
      vendorId = user.vendorId;
      if (!vendorId) {
        return NextResponse.json(
          { error: "This account is not linked to a vendor record" },
          { status: 403 }
        );
      }
    } else {
      vendorId = bodyVendorId;
      if (!vendorId) {
        return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
      }
    }

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!bankAccount) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
    }

    // Ownership check: the bank account must actually belong to this vendor —
    // otherwise a vendor could submit an invoice claiming another vendor's
    // (already-verified) bank account.
    if (bankAccount.vendorId !== vendorId) {
      return NextResponse.json(
        { error: "This bank account does not belong to the specified vendor" },
        { status: 403 }
      );
    }

    const verification = await verifyBankAccount(bankAccount.accountNumber, bankAccount.ifscCode);

    let status: "CONFIRMED" | "DECLINED";
    let declineReason: string | null = null;
    let verificationTxnId: string | null = null;

    switch (verification.outcome) {
      case "VERIFIED":
        status = "CONFIRMED";
        verificationTxnId = verification.transactionId;
        break;
      case "NAME_MISMATCH":
        status = "DECLINED";
        declineReason = "Bank account holder name does not match on re-verification.";
        verificationTxnId = verification.transactionId;
        break;
      case "ACCOUNT_FROZEN":
        status = "DECLINED";
        declineReason = "Bank account is frozen or inactive.";
        verificationTxnId = verification.transactionId;
        break;
      case "NOT_FOUND":
        status = "DECLINED";
        declineReason = "Bank account could not be re-verified against penny-drop records.";
        break;
    }

    const invoice = await prisma.invoice.create({
      data: {
        vendorId: vendorId!,
        bankAccountId,
        invoiceNumber,
        invoiceDate: new Date(invoiceDate),
        amount,
        currency: currency || "INR",
        documentName,
        documentUrl,
        documentSize,
        status,
        verificationOutcome: verification.outcome,
        verificationTxnId,
        declineReason,
        submittedBy: user.email,
        verifiedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        vendorId: vendorId!,
        action: status === "CONFIRMED" ? "INVOICE_CONFIRMED" : "INVOICE_DECLINED",
        oldValue: null,
        newValue: `${invoiceNumber} — ${status}${declineReason ? ` (${declineReason})` : ""}`,
        changedBy: user.email,
      },
    });

    return NextResponse.json({ invoice }, { status: status === "CONFIRMED" ? 201 : 422 });
  } catch (error) {
    console.error("Invoice submission error:", error);
    return NextResponse.json({ error: "Failed to submit invoice" }, { status: 500 });
  }
}

// ─── GET /api/invoices ───────────────────────────────────────────────────
// VENDOR sees only their own invoices. ADMIN/ACCOUNTS/APPROVER/IC_TEAM see
// all (financial visibility roles). INITIATOR is intentionally excluded —
// invoicing/payment is not part of the initiator's workflow.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const authGuard = requireAuth(session);
  if (authGuard) return authGuard;

  const user = session!.user;
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");
  const vendorIdFilter = searchParams.get("vendorId");

  if (!["VENDOR", "ADMIN", "ACCOUNTS", "APPROVER", "IC_TEAM"].includes(user.role)) {
    return NextResponse.json(
      { error: "Access denied. Required role: VENDOR, ADMIN, ACCOUNTS, APPROVER or IC_TEAM" },
      { status: 403 }
    );
  }

  const where: any = {};
  if (user.role === "VENDOR") {
    if (!user.vendorId) {
      return NextResponse.json({ invoices: [] });
    }
    where.vendorId = user.vendorId;
  } else if (vendorIdFilter) {
    where.vendorId = vendorIdFilter;
  }

  if (statusFilter) {
    where.status = statusFilter;
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      vendor: { select: { tradeName: true, gstNumber: true } },
      bankAccount: { select: { bankName: true, ifscCode: true, accountNumber: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ invoices });
}
