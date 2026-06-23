import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, sanitizeVendorForRole } from "@/lib/rbac";

const DOCUMENT_TYPE_MAP: Record<string, string> = {
  registrationCertificate: "REGISTRATION_CERTIFICATE",
  panCardCopy: "PAN_CARD_COPY",
  addressProof: "ADDRESS_PROOF",
  itrProof: "ITR_PROOF",
  msmeCertificate: "MSME_CERTIFICATE",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = requireRole(session, ["ADMIN", "INITIATOR"]);
  if (guard) return guard;

  try {
    const body = await req.json();

    const vendor = await prisma.vendor.create({
      data: {
        // Step 1
        gstNumber: body.gstNumber,
        tradeName: body.tradeName,
        legalName: body.legalName,
        pan: body.pan,
        dateOfRegistration: new Date(body.dateOfRegistration),
        panLinkedAadhaar: body.panLinkedAadhaar ?? false,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2 ?? null,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        contactPerson: body.contactPerson,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        departmentName: body.departmentName ?? null,

        // Step 2
        natureOfService: body.natureOfService,
        paymentFrequency: body.paymentFrequency,
        paygroup: body.paygroup ?? null,
        groupCode: body.groupCode ?? null,
        compositeGstScheme: body.compositeGstScheme ?? false,
        eInvoiceRequired: body.eInvoiceRequired ?? true,
        registeredMsme: body.registeredMsme ?? false,
        msmeNumber: body.msmeNumber ?? null,

        // Step 4
        itrFiledLastYear: body.itrFiledLastYear ?? false,
        taxExemption: body.taxExemption ?? false,
        tdsRate: body.tdsRate ?? null,

        // Step 5
        agreementStartDate: body.agreementStartDate
          ? new Date(body.agreementStartDate)
          : null,
        agreementEndDate: body.agreementEndDate
          ? new Date(body.agreementEndDate)
          : null,

        status: "PENDING_APPROVAL",

        // Step 3 - Bank accounts
        bankAccounts: body.bankAccounts?.length
          ? {
              create: body.bankAccounts.map((acc: any, index: number) => ({
                accountNumber: acc.accountNumber,
                ifscCode: acc.ifscCode,
                beneficiaryName: acc.beneficiaryName ?? null,
                bankName: acc.bankName,
                branchName: acc.branchName,
                crn: acc.crn ?? null,
                accountType: acc.accountType ?? "CURRENT",
                isPrimary: index === 0,
              })),
            }
          : undefined,
      },
      include: {
        bankAccounts: true,
        documents: true,
      },
    });

    if (body.uploads && typeof body.uploads === "object") {
      for (const [key, doc] of Object.entries(body.uploads as Record<string, any>)) {
        await prisma.vendorDocument.create({
          data: {
            vendorId: vendor.id,
            documentType: (DOCUMENT_TYPE_MAP[key] || "OTHER") as any,
            fileName: doc.name,
            fileUrl: doc.url,
            fileSize: doc.size,
            mimeType: doc.type,
          },
        });
      }
    }

    return NextResponse.json(
      { success: true, vendor },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Vendor creation error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "GST number already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const guard = requireAuth(session);
  if (guard) return guard;

  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        bankAccounts: true,
        documents: true,
      },
    });

    return NextResponse.json({
      success: true,
      vendors: vendors.map((vendor: any) => sanitizeVendorForRole(vendor, session!.user.role)),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
