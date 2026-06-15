import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const vendor = await prisma.vendor.update({
      where: { id: params.id },
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