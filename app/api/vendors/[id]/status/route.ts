import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, changedBy } = await req.json();

    const validStatuses = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "INACTIVE"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.vendor.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });

    const vendor = await prisma.vendor.update({
      where: { id },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        vendorId: id,
        action: "STATUS_CHANGED",
        oldValue: existing.status,
        newValue: status,
        changedBy: changedBy || "ADMIN",
      },
    });

    return NextResponse.json({ success: true, vendor });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 });
  }
}