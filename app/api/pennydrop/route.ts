import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function validateIFSC(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
}

function validateAccountNumber(acc: string): boolean {
  return /^[0-9]{9,18}$/.test(acc);
}

export async function POST(req: NextRequest) {
  try {
    const body          = await req.json();
    const accountNumber = body.accountNumber?.trim();
    const ifscCode      = body.ifscCode?.trim().toUpperCase();

    // ── Validation
    if (!accountNumber || !ifscCode) {
      return NextResponse.json(
        { success: false, error: "Account number and IFSC code are required" },
        { status: 400 }
      );
    }

    if (!validateAccountNumber(accountNumber)) {
      return NextResponse.json(
        { success: false, error: "Account number must be 9–18 digits" },
        { status: 400 }
      );
    }

    if (!validateIFSC(ifscCode)) {
      return NextResponse.json(
        { success: false, error: "Invalid IFSC code format (e.g. HDFC0001234)" },
        { status: 400 }
      );
    }

    // ── Simulate real penny drop API latency
    await new Promise((r) => setTimeout(r, 900));

    // ── Query penny_drop_logs table from Neon DB
    const log = await prisma.pennyDropLog.findUnique({
      where: {
        accountNumber_ifscCode: { accountNumber, ifscCode },
      },
      include: {
        bankMaster: true, // joins bank_master to get bankName + branchName
      },
    });

    // Account not in DB
    if (!log) {
      return NextResponse.json(
        {
          success: false,
          error:   "Account not found. Please verify account number and IFSC code.",
          code:    "ACCOUNT_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Name mismatch scenario
    if (log.status === "NAME_MISMATCH") {
      return NextResponse.json(
        {
          success:       false,
          error:         "Account holder name does not match vendor name.",
          code:          "NAME_MISMATCH",
          transactionId: log.transactionId,
        },
        { status: 422 }
      );
    }

    // Frozen account scenario
    if (log.status === "ACCOUNT_FROZEN") {
      return NextResponse.json(
        {
          success:       false,
          error:         "This bank account is frozen or inactive.",
          code:          "ACCOUNT_FROZEN",
          transactionId: log.transactionId,
        },
        { status: 422 }
      );
    }

    // ── SUCCESS — return data from DB
    return NextResponse.json({
      success:       true,
      message:       "Penny drop successful — account verified",
      transactionId: log.transactionId,
      data: {
        accountNumber:   log.accountNumber,
        ifscCode:        log.ifscCode,
        beneficiaryName: log.beneficiaryName,
        bankName:        log.bankMaster.bankName,
        branchName:      log.bankMaster.branchName,
        accountType:     log.accountType,
      },
    });

  } catch (error) {
    console.error("Penny drop error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
