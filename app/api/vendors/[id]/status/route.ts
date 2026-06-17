import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only APPROVER and ACCOUNTS can change vendor status
  const session = await getServerSession(authOptions);
  const guard = requireRole(session, ["ADMIN", "APPROVER", "ACCOUNTS"]);
  if (guard) return guard;

  try {
    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "INACTIVE"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.vendor.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });

    const vendor = await prisma.vendor.update({ where: { id }, data: { status } });

    await prisma.auditLog.create({
      data: {
        vendorId: id,
        action: "STATUS_CHANGED",
        oldValue: existing.status,
        newValue: status,
        changedBy: session!.user.email ?? "SYSTEM",
      },
    });

    return NextResponse.json({ success: true, vendor });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 });
  }
}
