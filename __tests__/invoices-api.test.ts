import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    bankAccount: { findUnique: vi.fn() },
    invoice: { create: vi.fn(), findMany: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/pennyDropVerify", () => ({ verifyBankAccount: vi.fn() }));

import { POST, GET } from "@/app/api/invoices/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { verifyBankAccount } from "@/lib/pennyDropVerify";

const vendorSession = (vendorId = "vendor1") => ({
  user: { id: "u1", email: "vendor@acme.com", name: "Vendor User", role: "VENDOR", vendorId },
});
const staffSession = (role: string) => ({
  user: { id: "u2", email: "staff@kotak.com", name: "Staff", role },
});

function postReq(body: Record<string, any>) {
  return new NextRequest("http://localhost/api/invoices", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
function getReq(qs = "") {
  return new NextRequest(`http://localhost/api/invoices${qs}`);
}

const bankAccountStub = {
  id: "ba1",
  vendorId: "vendor1",
  accountNumber: "123456789012",
  ifscCode: "HDFC0001234",
};

const invoiceBody = {
  bankAccountId: "ba1",
  invoiceNumber: "INV-001",
  invoiceDate: "2026-06-01",
  amount: 50000,
  documentName: "invoice.pdf",
  documentUrl: "https://blob/invoice.pdf",
};

describe("POST /api/invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.bankAccount.findUnique as any).mockResolvedValue(bankAccountStub);
    (prisma.invoice.create as any).mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "inv1", ...data })
    );
  });

  it("rejects unauthenticated requests with 401", async () => {
    (getServerSession as any).mockResolvedValue(null);
    const res = await POST(postReq(invoiceBody));
    expect(res.status).toBe(401);
  });

  it("rejects roles outside VENDOR/ADMIN/ACCOUNTS/INITIATOR with 403", async () => {
    (getServerSession as any).mockResolvedValue(staffSession("APPROVER"));
    const res = await POST(postReq(invoiceBody));
    expect(res.status).toBe(403);
  });

  it("a VENDOR user always submits against their own vendorId, ignoring any vendorId in the body", async () => {
    (getServerSession as any).mockResolvedValue(vendorSession("vendor1"));
    (verifyBankAccount as any).mockResolvedValue({
      outcome: "VERIFIED",
      transactionId: "TXN1",
      beneficiaryName: "Acme Traders",
      bankName: "HDFC Bank",
      branchName: "MG Road",
      accountType: "CURRENT",
    });
    const res = await POST(postReq({ ...invoiceBody, vendorId: "someone-elses-vendor-id" }));
    expect(res.status).toBe(201);
    const created = (prisma.invoice.create as any).mock.calls[0][0].data;
    expect(created.vendorId).toBe("vendor1"); // NOT "someone-elses-vendor-id"
  });

  it("a VENDOR user is blocked from submitting against a bank account belonging to a different vendor", async () => {
    (getServerSession as any).mockResolvedValue(vendorSession("vendor2")); // different vendor
    const res = await POST(postReq(invoiceBody)); // bankAccountStub.vendorId === "vendor1"
    expect(res.status).toBe(403);
  });

  it("CONFIRMS the invoice when penny-drop verification succeeds", async () => {
    (getServerSession as any).mockResolvedValue(vendorSession("vendor1"));
    (verifyBankAccount as any).mockResolvedValue({
      outcome: "VERIFIED",
      transactionId: "TXN1",
      beneficiaryName: "Acme Traders",
      bankName: "HDFC Bank",
      branchName: "MG Road",
      accountType: "CURRENT",
    });
    const res = await POST(postReq(invoiceBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.invoice.status).toBe("CONFIRMED");
    expect(body.invoice.verificationTxnId).toBe("TXN1");
  });

  it("DECLINES the invoice when penny-drop reports NAME_MISMATCH", async () => {
    (getServerSession as any).mockResolvedValue(vendorSession("vendor1"));
    (verifyBankAccount as any).mockResolvedValue({ outcome: "NAME_MISMATCH", transactionId: "TXN2" });
    const res = await POST(postReq(invoiceBody));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.invoice.status).toBe("DECLINED");
    expect(body.invoice.declineReason).toMatch(/name does not match/);
  });

  it("DECLINES the invoice when penny-drop reports ACCOUNT_FROZEN", async () => {
    (getServerSession as any).mockResolvedValue(vendorSession("vendor1"));
    (verifyBankAccount as any).mockResolvedValue({ outcome: "ACCOUNT_FROZEN", transactionId: "TXN3" });
    const res = await POST(postReq(invoiceBody));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.invoice.status).toBe("DECLINED");
  });

  it("DECLINES the invoice when the account can't be found in penny-drop records at all", async () => {
    (getServerSession as any).mockResolvedValue(vendorSession("vendor1"));
    (verifyBankAccount as any).mockResolvedValue({ outcome: "NOT_FOUND" });
    const res = await POST(postReq(invoiceBody));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.invoice.status).toBe("DECLINED");
    expect(body.invoice.verificationTxnId).toBeNull();
  });

  it("writes an audit log entry reflecting the confirm/decline outcome", async () => {
    (getServerSession as any).mockResolvedValue(vendorSession("vendor1"));
    (verifyBankAccount as any).mockResolvedValue({ outcome: "VERIFIED", transactionId: "TXN1", beneficiaryName: "Acme", bankName: "HDFC", branchName: "MG Rd", accountType: "CURRENT" });
    await POST(postReq(invoiceBody));
    const logCall = (prisma.auditLog.create as any).mock.calls[0][0];
    expect(logCall.data.action).toBe("INVOICE_CONFIRMED");
    expect(logCall.data.vendorId).toBe("vendor1");
  });

  it("ADMIN/ACCOUNTS/INITIATOR can submit on behalf of a vendor by passing vendorId explicitly", async () => {
    (getServerSession as any).mockResolvedValue(staffSession("ACCOUNTS"));
    (verifyBankAccount as any).mockResolvedValue({ outcome: "VERIFIED", transactionId: "TXN1", beneficiaryName: "Acme", bankName: "HDFC", branchName: "MG Rd", accountType: "CURRENT" });
    const res = await POST(postReq({ ...invoiceBody, vendorId: "vendor1" }));
    expect(res.status).toBe(201);
  });

  it("returns 404 when the bank account does not exist", async () => {
    (getServerSession as any).mockResolvedValue(vendorSession("vendor1"));
    (prisma.bankAccount.findUnique as any).mockResolvedValue(null);
    const res = await POST(postReq(invoiceBody));
    expect(res.status).toBe(404);
  });

  it("returns 400 when required fields are missing", async () => {
    (getServerSession as any).mockResolvedValue(vendorSession("vendor1"));
    const { invoiceNumber, ...rest } = invoiceBody;
    const res = await POST(postReq(rest));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.invoice.findMany as any).mockResolvedValue([]);
  });

  it("blocks unauthenticated requests", async () => {
    (getServerSession as any).mockResolvedValue(null);
    const res = await GET(getReq());
    expect(res.status).toBe(401);
  });

  it("blocks INITIATOR from viewing invoices", async () => {
    (getServerSession as any).mockResolvedValue(staffSession("INITIATOR"));
    const res = await GET(getReq());
    expect(res.status).toBe(403);
  });

  it("scopes a VENDOR user's query to only their own vendorId", async () => {
    (getServerSession as any).mockResolvedValue(vendorSession("vendor1"));
    await GET(getReq());
    const callArgs = (prisma.invoice.findMany as any).mock.calls[0][0];
    expect(callArgs.where.vendorId).toBe("vendor1");
  });

  it("ADMIN can filter by an arbitrary vendorId query param", async () => {
    (getServerSession as any).mockResolvedValue(staffSession("ADMIN"));
    await GET(getReq("?vendorId=vendorX"));
    const callArgs = (prisma.invoice.findMany as any).mock.calls[0][0];
    expect(callArgs.where.vendorId).toBe("vendorX");
  });

  it("ADMIN without a vendorId filter sees all vendors' invoices (no vendorId constraint)", async () => {
    (getServerSession as any).mockResolvedValue(staffSession("ADMIN"));
    await GET(getReq());
    const callArgs = (prisma.invoice.findMany as any).mock.calls[0][0];
    expect(callArgs.where.vendorId).toBeUndefined();
  });
});