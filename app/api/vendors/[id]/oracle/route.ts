import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const guard = requireRole(session, ["ADMIN", "ACCOUNTS"]);
  if (guard) return guard;

  try {
    const { id } = await params;
    const body = await req.json();

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        oracleVendorId: body.oracleVendorId || null,
        oracleSiteId: body.oracleSiteId || null,
      },
    });

    return NextResponse.json({ success: true, vendor });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update Oracle IDs" },
      { status: 500 }
    );
  }
}