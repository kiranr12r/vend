import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, sanitizeVendorForRole } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const guard = requireRole(session, [
      "ADMIN",
      "INITIATOR",
      "APPROVER",
      "IC_TEAM",
      "ACCOUNTS",
    ]);
    if (guard) return guard;

  try {
    const { id } = await params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: { bankAccounts: true, documents: true, auditLogs: true },
    });
    if (!vendor) return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
    return NextResponse.json({
      success: true,
      vendor: sanitizeVendorForRole(vendor, session!.user.role),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch vendor" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const guard = requireRole(session, ["ADMIN", "INITIATOR"]);
  if (guard) return guard;

  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.vendor.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
    }

    const updated = await prisma.vendor.update({
      where: { id },
      data: {
        tradeName: body.tradeName ?? existing.tradeName,
        legalName: body.legalName ?? existing.legalName,
        pan: body.pan ?? existing.pan,
        addressLine1: body.addressLine1 ?? existing.addressLine1,
        addressLine2: body.addressLine2 ?? null,
        city: body.city ?? existing.city,
        state: body.state ?? existing.state,
        pincode: body.pincode ?? existing.pincode,
        contactPerson: body.contactPerson ?? existing.contactPerson,
        contactEmail: body.contactEmail ?? existing.contactEmail,
        contactPhone: body.contactPhone ?? existing.contactPhone,
        departmentName: body.departmentName ?? null,
        natureOfService: body.natureOfService ?? existing.natureOfService,
        paymentFrequency: body.paymentFrequency ?? existing.paymentFrequency,
        paygroup: body.paygroup ?? null,
        groupCode: body.groupCode ?? null,
        compositeGstScheme: body.compositeGstScheme ?? existing.compositeGstScheme,
        eInvoiceRequired: body.eInvoiceRequired ?? existing.eInvoiceRequired,
        registeredMsme: body.registeredMsme ?? existing.registeredMsme,
        msmeNumber: body.msmeNumber ?? null,
        itrFiledLastYear: body.itrFiledLastYear ?? existing.itrFiledLastYear,
        taxExemption: body.taxExemption ?? existing.taxExemption,
        tdsRate: body.tdsRate ?? existing.tdsRate,
        agreementStartDate: body.agreementStartDate
          ? new Date(body.agreementStartDate)
          : existing.agreementStartDate,
        agreementEndDate: body.agreementEndDate
          ? new Date(body.agreementEndDate)
          : existing.agreementEndDate,
        autoRenewal: body.autoRenewal ?? existing.autoRenewal,
        noticePeriodDays: body.noticePeriodDays ?? existing.noticePeriodDays,
        agreementNotes: body.agreementNotes ?? existing.agreementNotes,
      },
      include: {
        bankAccounts: true,
        documents: true,
      },
    });

    if (body.bankAccounts && Array.isArray(body.bankAccounts)) {
      await prisma.bankAccount.deleteMany({ where: { vendorId: id } });
      await prisma.bankAccount.createMany({
        data: body.bankAccounts.map((acc: any, index: number) => ({
          vendorId: id,
          accountNumber: acc.accountNumber,
          ifscCode: acc.ifscCode,
          beneficiaryName: acc.beneficiaryName ?? null,
          bankName: acc.bankName,
          branchName: acc.branchName,
          crn: acc.crn ?? null,
          accountType: acc.accountType ?? "CURRENT",
          isPrimary: acc.isPrimary ?? index === 0,
        })),
      });
    }

    await prisma.auditLog.create({
      data: {
        vendorId: id,
        action: "VENDOR_UPDATED",
        changedBy: session!.user.email ?? "SYSTEM",
      },
    });

    return NextResponse.json({
      success: true,
      vendor: sanitizeVendorForRole(updated, session!.user.role),
    });
  } catch (error) {
    console.error("Vendor update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update vendor" }, { status: 500 });
  }
}