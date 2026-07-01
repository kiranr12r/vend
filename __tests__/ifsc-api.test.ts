import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: { bankMaster: { findUnique: vi.fn() } },
}));

import { GET } from "@/app/api/ifsc/route";
import { prisma } from "@/lib/prisma";

function req(ifsc: string | null) {
  const url = ifsc
    ? `http://localhost/api/ifsc?ifsc=${encodeURIComponent(ifsc)}`
    : "http://localhost/api/ifsc";
  return new NextRequest(url);
}

const bankRecord = {
  ifscCode: "HDFC0001234",
  bankName: "HDFC Bank",
  branchName: "MG Road",
  city: "Bengaluru",
  state: "Karnataka",
};

describe("GET /api/ifsc", () => {
  beforeEach(() => vi.clearAllMocks());

  it("SECURITY FINDING: succeeds with no session/authentication at all", async () => {
    // No getServerSession call exists in this route at all - confirming the
    // gap noted in the manual test suite ("RBAC - API Access" module).
    (prisma.bankMaster.findUnique as any).mockResolvedValue(bankRecord);
    const res = await GET(req("HDFC0001234"));
    expect(res.status).toBe(200);
  });

  it("returns 400 when ifsc param is missing", async () => {
    const res = await GET(req(null));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/IFSC code is required/);
  });

  it("returns 400 for a malformed IFSC (missing the required '0')", async () => {
    const res = await GET(req("HDFC12345"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid IFSC format/);
  });

  it("returns 404 when a well-formed IFSC is not in bank_master", async () => {
    (prisma.bankMaster.findUnique as any).mockResolvedValue(null);
    const res = await GET(req("ZZZZ0999999"));
    expect(res.status).toBe(404);
  });

  it("returns 200 with bank details for a valid, known IFSC", async () => {
    (prisma.bankMaster.findUnique as any).mockResolvedValue(bankRecord);
    const res = await GET(req("HDFC0001234"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.bankName).toBe("HDFC Bank");
  });

  it("normalizes lowercase ifsc before lookup", async () => {
    (prisma.bankMaster.findUnique as any).mockResolvedValue(bankRecord);
    const res = await GET(req("hdfc0001234"));
    expect(res.status).toBe(200);
    expect(prisma.bankMaster.findUnique).toHaveBeenCalledWith({
      where: { ifscCode: "HDFC0001234" },
    });
  });
});
