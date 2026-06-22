import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = requireRole(session, ["ADMIN"]);
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const action   = searchParams.get("action")   ?? "";
  const search   = searchParams.get("search")   ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo   = searchParams.get("dateTo")   ?? "";

  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        ...(action   ? { action }                                                                    : {}),
        ...(search   ? { OR: [{ changedBy: { contains: search, mode: "insensitive" } },
                              { vendorId:  { contains: search, mode: "insensitive" } }] }           : {}),
        ...(dateFrom ? { changedAt: { gte: new Date(dateFrom) } }                                   : {}),
        ...(dateTo   ? { changedAt: { lte: new Date(dateTo + "T23:59:59Z") } }                      : {}),
      },
      orderBy: { changedAt: "desc" },
      take: 200,
      include: {
        vendor: { select: { tradeName: true, gstNumber: true } },
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch logs" }, { status: 500 });
  }
}