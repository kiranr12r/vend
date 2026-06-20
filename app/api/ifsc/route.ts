import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function validateIFSC(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ifsc = searchParams.get("ifsc")?.toUpperCase().trim();

  if (!ifsc) {
    return NextResponse.json(
      { success: false, error: "IFSC code is required" },
      { status: 400 }
    );
  }

  if (!validateIFSC(ifsc)) {
    return NextResponse.json(
      { success: false, error: "Invalid IFSC format. Example: HDFC0001234" },
      { status: 400 }
    );
  }

  try {
    // Query bank_master table in Neon DB
    const bank = await prisma.bankMaster.findUnique({
      where: { ifscCode: ifsc },
    });

    if (!bank) {
      return NextResponse.json(
        { success: false, error: "IFSC not found in bank master" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ifsc:       bank.ifscCode,
        bankName:   bank.bankName,
        branchName: bank.branchName,
        city:       bank.city,
        state:      bank.state,
      },
    });
  } catch (error) {
    console.error("IFSC lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to lookup IFSC" },
      { status: 500 }
    );
  }
}
