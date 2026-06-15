import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: { bankAccounts: true, documents: true, auditLogs: true },
    });
    if (!vendor) return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
    return NextResponse.json({ success: true, vendor });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch vendor" }, { status: 500 });
  }
}