import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: { invoice: { findMany: vi.fn() } },
}));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

import { GET } from "@/app/api/reports/vendor-spend/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const staffSession = (role: string) => ({ user: { id: "u1", email: "u@kotak.com", name: "U", role } });

function req(qs = "") {
  return new NextRequest(`http://localhost/api/reports/vendor-spend${qs}`);
}

function inv(vendorId: string, tradeName: string, amount: number, status: string) {
  return {
    vendorId,
    amount,
    status,
    vendor: { id: vendorId, tradeName, gstNumber: `GST-${vendorId}` },
  };
}

describe("GET /api/reports/vendor-spend", () => {
  beforeEach(() => vi.clearAllMocks());

  it("blocks non ADMIN/ACCOUNTS roles", async () => {
    (getServerSession as any).mockResolvedValue(staffSession("APPROVER"));
    const res = await GET(req());
    expect(res.status).toBe(403);
  });

  it("sums only CONFIRMED invoices into confirmedTotal, per vendor, sorted descending", async () => {
    (getServerSession as any).mockResolvedValue(staffSession("ACCOUNTS"));
    (prisma.invoice.findMany as any).mockResolvedValue([
      inv("v1", "Acme", 10000, "CONFIRMED"),
      inv("v1", "Acme", 5000, "CONFIRMED"),
      inv("v1", "Acme", 99999, "DECLINED"), // must NOT count toward total
      inv("v2", "Globex", 50000, "CONFIRMED"),
      inv("v2", "Globex", 1000, "PENDING_VERIFICATION"),
    ]);

    const res = await GET(req());
    expect(res.status).toBe(200);
    const body = await res.json();

    const globex = body.vendors.find((v: any) => v.vendorId === "v2");
    const acme = body.vendors.find((v: any) => v.vendorId === "v1");

    expect(globex.confirmedTotal).toBe(50000);
    expect(globex.confirmedCount).toBe(1);
    expect(globex.pendingCount).toBe(1);

    expect(acme.confirmedTotal).toBe(15000);
    expect(acme.confirmedCount).toBe(2);
    expect(acme.declinedCount).toBe(1);

    // Globex (50000) should be ranked above Acme (15000)
    expect(body.vendors[0].vendorId).toBe("v2");

    expect(body.grandTotalConfirmed).toBe(65000);
  });

  it("returns an empty comparison when there are no invoices", async () => {
    (getServerSession as any).mockResolvedValue(staffSession("ADMIN"));
    (prisma.invoice.findMany as any).mockResolvedValue([]);
    const res = await GET(req());
    const body = await res.json();
    expect(body.vendors).toEqual([]);
    expect(body.grandTotalConfirmed).toBe(0);
  });

  it("applies dateFrom/dateTo as an invoiceDate range filter", async () => {
    (getServerSession as any).mockResolvedValue(staffSession("ADMIN"));
    (prisma.invoice.findMany as any).mockResolvedValue([]);
    await GET(req("?dateFrom=2026-01-01&dateTo=2026-01-31"));
    const callArgs = (prisma.invoice.findMany as any).mock.calls[0][0];
    expect(callArgs.where.invoiceDate.gte).toEqual(new Date("2026-01-01"));
    expect(callArgs.where.invoiceDate.lte).toEqual(new Date("2026-01-31T23:59:59.999Z"));
  });
});