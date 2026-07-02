import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = requireRole(session, ["ADMIN", "ACCOUNTS"]);
  if (guard) return guard;

  const url = req.nextUrl;
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");

  const where: any = {};
  if (dateFrom || dateTo) {
    where.invoiceDate = {};
    if (dateFrom) where.invoiceDate.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(`${dateTo}T23:59:59.999Z`);
      where.invoiceDate.lte = end;
    }
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: { vendor: true },
  });

  const vendorMap = new Map<string, {
    vendorId: string;
    tradeName: string;
    gstNumber: string;
    confirmedTotal: number;
    confirmedCount: number;
    pendingCount: number;
    declinedCount: number;
  }>();

  for (const invoice of invoices) {
    if (!vendorMap.has(invoice.vendorId)) {
      vendorMap.set(invoice.vendorId, {
        vendorId: invoice.vendorId,
        tradeName: invoice.vendor.tradeName,
        gstNumber: invoice.vendor.gstNumber,
        confirmedTotal: 0,
        confirmedCount: 0,
        pendingCount: 0,
        declinedCount: 0,
      });
    }

    const vendor = vendorMap.get(invoice.vendorId)!;
    if (invoice.status === "CONFIRMED") {
      vendor.confirmedTotal += invoice.amount;
      vendor.confirmedCount += 1;
    } else if (invoice.status === "PENDING_VERIFICATION") {
      vendor.pendingCount += 1;
    } else {
      vendor.declinedCount += 1;
    }
  }

  const vendors = Array.from(vendorMap.values()).sort(
    (a, b) => b.confirmedTotal - a.confirmedTotal
  );

  const grandTotalConfirmed = vendors.reduce(
    (sum, vendor) => sum + vendor.confirmedTotal,
    0
  );

  return NextResponse.json({ vendors, grandTotalConfirmed });
}
