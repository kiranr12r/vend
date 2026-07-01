import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: { pennyDropLog: { findUnique: vi.fn() } },
}));

import { POST } from "@/app/api/pennydrop/route";
import { prisma } from "@/lib/prisma";

function req(body: Record<string, any>) {
  return new NextRequest("http://localhost/api/pennydrop", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const goodLog = {
  accountNumber: "123456789012",
  ifscCode: "HDFC0001234",
  beneficiaryName: "Acme Traders",
  accountType: "CURRENT",
  status: "SUCCESS",
  transactionId: "TXN123",
  bankMaster: { bankName: "HDFC Bank", branchName: "MG Road" },
};

describe("POST /api/pennydrop", () => {
  beforeEach(() => vi.clearAllMocks());

  it("SECURITY FINDING: succeeds with no session/authentication at all", async () => {
    (prisma.pennyDropLog.findUnique as any).mockResolvedValue(goodLog);
    const res = await POST(
      req({ accountNumber: "123456789012", ifscCode: "HDFC0001234" })
    );
    expect(res.status).toBe(200);
    // Beneficiary name is exposed to a fully anonymous caller
    const body = await res.json();
    expect(body.data.beneficiaryName).toBe("Acme Traders");
  });

  it("returns 400 when accountNumber or ifscCode is missing", async () => {
    const res = await POST(req({ ifscCode: "HDFC0001234" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when accountNumber is shorter than 9 digits", async () => {
    const res = await POST(
      req({ accountNumber: "12345678", ifscCode: "HDFC0001234" })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/9.{1,3}18 digits/);
  });

  it("returns 400 when accountNumber is longer than 18 digits", async () => {
    const res = await POST(
      req({ accountNumber: "1234567890123456789", ifscCode: "HDFC0001234" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for a non-numeric accountNumber", async () => {
    const res = await POST(
      req({ accountNumber: "12345ABCD9", ifscCode: "HDFC0001234" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for a malformed IFSC", async () => {
    const res = await POST(
      req({ accountNumber: "123456789012", ifscCode: "HDFC12345" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 with code ACCOUNT_NOT_FOUND when no matching log exists", async () => {
    (prisma.pennyDropLog.findUnique as any).mockResolvedValue(null);
    const res = await POST(
      req({ accountNumber: "123456789012", ifscCode: "HDFC0001234" })
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.code).toBe("ACCOUNT_NOT_FOUND");
  });

  it("returns 422 with code NAME_MISMATCH for a mismatched account", async () => {
    (prisma.pennyDropLog.findUnique as any).mockResolvedValue({
      ...goodLog,
      status: "NAME_MISMATCH",
    });
    const res = await POST(
      req({ accountNumber: "123456789012", ifscCode: "HDFC0001234" })
    );
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.code).toBe("NAME_MISMATCH");
  });

  it("returns 422 with code ACCOUNT_FROZEN for a frozen account", async () => {
    (prisma.pennyDropLog.findUnique as any).mockResolvedValue({
      ...goodLog,
      status: "ACCOUNT_FROZEN",
    });
    const res = await POST(
      req({ accountNumber: "123456789012", ifscCode: "HDFC0001234" })
    );
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.code).toBe("ACCOUNT_FROZEN");
  });

  it("returns 200 with bank + transaction details on success", async () => {
    (prisma.pennyDropLog.findUnique as any).mockResolvedValue(goodLog);
    const res = await POST(
      req({ accountNumber: "123456789012", ifscCode: "HDFC0001234" })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.transactionId).toBe("TXN123");
    expect(body.data.bankName).toBe("HDFC Bank");
  });
});
