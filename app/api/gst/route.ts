import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

// ── Rate limiting (in-memory, resets on server restart)
const GST_REQUESTS = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function isRateLimited(key: string): boolean {
  const now       = Date.now();
  const windowMs  = 60_000;
  const limit     = 30;
  const current   = GST_REQUESTS.get(key);

  if (!current || current.resetAt < now) {
    GST_REQUESTS.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (current.count >= limit) return true;
  current.count += 1;
  GST_REQUESTS.set(key, current);
  return false;
}

function validateGSTFormat(gst: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
}

export async function GET(req: NextRequest) {
  const session   = await getServerSession(authOptions);
  const authGuard = requireRole(session, ["ADMIN", "INITIATOR", "APPROVER", "IC_TEAM", "ACCOUNTS"]);
  if (authGuard) return authGuard;

  if (isRateLimited(getClientIp(req))) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const gstin = searchParams.get("gstin")?.toUpperCase().trim();

  if (!gstin) {
    return NextResponse.json(
      { success: false, error: "GSTIN is required" },
      { status: 400 }
    );
  }

  if (gstin.length !== 15) {
    return NextResponse.json(
      { success: false, error: "GSTIN must be exactly 15 characters" },
      { status: 400 }
    );
  }

  if (!validateGSTFormat(gstin)) {
    return NextResponse.json(
      { success: false, error: "Invalid GSTIN format" },
      { status: 400 }
    );
  }

  // Simulate real GST API latency
  await new Promise((r) => setTimeout(r, 600));

  try {
    // Query gst_master table from Neon DB
    const record = await prisma.gstMaster.findUnique({
      where: { gstin },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: "GSTIN not found. Please verify the number and try again." },
        { status: 404 }
      );
    }

    if (record.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "This GSTIN is inactive or cancelled." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "GSTIN verified successfully",
      data: {
        gstin:              record.gstin,
        tradeName:          record.tradeName,
        legalName:          record.legalName,
        pan:                record.pan,
        dateOfRegistration: record.dateOfRegistration,
        status:             record.status,
        businessType:       record.businessType,
        addressLine1:       record.addressLine1,
        addressLine2:       record.addressLine2,
        city:               record.city,
        state:              record.state,
        pincode:            record.pincode,
        natureOfBusiness:   record.natureOfBusiness,
        annualTurnover:     record.annualTurnover,
        compositeScheme:    record.compositeScheme,
        eInvoiceApplicable: record.eInvoiceApplicable,
      },
    });

  } catch (error) {
    console.error("GST lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to lookup GSTIN" },
      { status: 500 }
    );
  }
}
