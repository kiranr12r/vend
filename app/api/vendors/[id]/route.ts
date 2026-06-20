import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, sanitizeVendorForRole } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const guard = requireAuth(session);
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