import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: { gstin_profiles: { findUnique: vi.fn() } },
}));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

import { GET } from "@/app/api/gst/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const mockSession = (role: string | null) =>
  role
    ? { user: { id: "u1", email: "u@test.com", name: "U", role } }
    : null;

function req(gstin: string | null, ip = "1.1.1.1") {
  const url = gstin
    ? `http://localhost/api/gst?gstin=${encodeURIComponent(gstin)}`
    : "http://localhost/api/gst";
  return new NextRequest(url, { headers: { "x-forwarded-for": ip } });
}

const activeRecord = {
  gstin: "27ABCDE1234F1Z5",
  tradeName: "Acme Traders",
  legalName: "Acme Traders Pvt Ltd",
  pan: "ABCDE1234F",
  dateOfRegistration: "2020-01-01",
  status: "ACTIVE",
  businessType: "Private Limited",
  addressLine1: "MG Road",
  addressLine2: null,
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
  natureOfBusiness: "Trading",
  annualTurnover: "5000000",
  compositeScheme: false,
  eInvoiceApplicable: true,
};

describe("GET /api/gst", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession("INITIATOR"));
  });

  it("rejects unauthenticated requests with 401", async () => {
    (getServerSession as any).mockResolvedValue(null);
    const res = await GET(req("27ABCDE1234F1Z5", "2.2.2.1"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when gstin param is missing", async () => {
    const res = await GET(req(null, "2.2.2.2"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/GSTIN is required/);
  });

  it("returns 400 when gstin is not exactly 15 characters", async () => {
    const res = await GET(req("27ABCDE1234F1Z", "2.2.2.3")); // 14 chars
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/exactly 15 characters/);
  });

  it("returns 400 when gstin has correct length but invalid pattern", async () => {
    const res = await GET(req("AAAAAAAAAAAAAAA", "2.2.2.4"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid GSTIN format/);
  });

  it("returns 404 when gstin is well-formed but not found", async () => {
    (prisma.gstin_profiles.findUnique as any).mockResolvedValue(null);
    const res = await GET(req("27ABCDE1234F1Z5", "2.2.2.5"));
    expect(res.status).toBe(404);
  });

  it("returns 422 when the GSTIN status is INACTIVE", async () => {
    (prisma.gstin_profiles.findUnique as any).mockResolvedValue({
      ...activeRecord,
      status: "INACTIVE",
    });
    const res = await GET(req("27ABCDE1234F1Z5", "2.2.2.6"));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toMatch(/inactive or cancelled/);
  });

  it("treats a null status as inactive too (edge case)", async () => {
    (prisma.gstin_profiles.findUnique as any).mockResolvedValue({
      ...activeRecord,
      status: null,
    });
    const res = await GET(req("27ABCDE1234F1Z5", "2.2.2.7"));
    expect(res.status).toBe(422);
  });

  it("returns 200 with profile data for a valid, active GSTIN", async () => {
    (prisma.gstin_profiles.findUnique as any).mockResolvedValue(activeRecord);
    const res = await GET(req("27ABCDE1234F1Z5", "2.2.2.8"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.tradeName).toBe("Acme Traders");
    expect(body.data.pan).toBe("ABCDE1234F");
  });

  it("normalizes lowercase gstin before validating/looking up", async () => {
    (prisma.gstin_profiles.findUnique as any).mockResolvedValue(activeRecord);
    const res = await GET(req("27abcde1234f1z5", "2.2.2.9"));
    expect(res.status).toBe(200);
    expect(prisma.gstin_profiles.findUnique).toHaveBeenCalledWith({
      where: { gstin: "27ABCDE1234F1Z5" },
    });
  });

  it(
    "throttles the 31st request within 60s from the same IP with 429",
    async () => {
      (prisma.gstin_profiles.findUnique as any).mockResolvedValue(activeRecord);
      const ip = "9.9.9.9";
      let last;
      for (let i = 0; i < 31; i++) {
        last = await GET(req("27ABCDE1234F1Z5", ip));
      }
      expect(last!.status).toBe(429);
    },
    25000
  );
});
