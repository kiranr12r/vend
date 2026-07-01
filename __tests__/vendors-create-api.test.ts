import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    vendor: { create: vi.fn(), findMany: vi.fn() },
    vendorDocument: { create: vi.fn() },
  },
}));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

import { POST } from "@/app/api/vendors/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const mockSession = (role: string | null) =>
  role ? { user: { id: "u1", email: "u@test.com", name: "U", role } } : null;

function req(body: Record<string, any>) {
  return new NextRequest("http://localhost/api/vendors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const basePayload = {
  gstNumber: "27ABCDE1234F1Z5",
  tradeName: "Acme Traders",
  legalName: "Acme Traders Pvt Ltd",
  pan: "ABCDE1234F",
  dateOfRegistration: "2020-01-01",
  addressLine1: "MG Road",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
  contactPerson: "John Doe",
  contactEmail: "john@acme.com",
  contactPhone: "9876543210",
  natureOfService: "Consulting",
  paymentFrequency: "Monthly",
};

const createdVendorStub = { id: "v1", ...basePayload, bankAccounts: [], documents: [] };

describe("POST /api/vendors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession("INITIATOR"));
    (prisma.vendor.create as any).mockResolvedValue(createdVendorStub);
  });

  it("rejects unauthenticated requests with 401", async () => {
    (getServerSession as any).mockResolvedValue(null);
    const res = await POST(req(basePayload));
    expect(res.status).toBe(401);
  });

  it("rejects roles other than ADMIN/INITIATOR with 403", async () => {
    (getServerSession as any).mockResolvedValue(mockSession("APPROVER"));
    const res = await POST(req(basePayload));
    expect(res.status).toBe(403);
  });

  it("creates a vendor and always sets status to PENDING_APPROVAL, never DRAFT", async () => {
    const res = await POST(req(basePayload));
    expect(res.status).toBe(201);
    const callArgs = (prisma.vendor.create as any).mock.calls[0][0];
    expect(callArgs.data.status).toBe("PENDING_APPROVAL");
  });

  it("returns 409 when gstNumber already exists (Prisma P2002)", async () => {
    (prisma.vendor.create as any).mockRejectedValue({ code: "P2002" });
    const res = await POST(req(basePayload));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/GST number already exists/);
  });

  it("VALIDATION GAP: accepts a malformed PAN/phone/email directly at the API (no server-side Zod re-check)", async () => {
    const badPayload = {
      ...basePayload,
      pan: "1234567890", // fails step1Schema PAN regex
      contactPhone: "000", // fails step1Schema phone regex
      contactEmail: "not-an-email", // fails step1Schema email format
    };
    const res = await POST(req(badPayload));
    // The route has no schema validation before prisma.vendor.create, so this
    // is accepted (201) even though the client Zod schema would reject it.
    expect(res.status).toBe(201);
    const callArgs = (prisma.vendor.create as any).mock.calls[0][0];
    expect(callArgs.data.pan).toBe("1234567890");
  });

  it("DATA-INTEGRITY GAP: creates a vendor with zero bank accounts despite the UI requiring at least one", async () => {
    const res = await POST(req({ ...basePayload, bankAccounts: [] }));
    expect(res.status).toBe(201);
    const callArgs = (prisma.vendor.create as any).mock.calls[0][0];
    // bankAccounts.create block is skipped entirely for an empty array
    expect(callArgs.data.bankAccounts).toBeUndefined();
  });

  it("BUSINESS LOGIC: forces isPrimary=true only on the first bank account, ignoring client input", async () => {
    const payload = {
      ...basePayload,
      bankAccounts: [
        { accountNumber: "111", ifscCode: "HDFC0001234", bankName: "HDFC", branchName: "MG Rd", accountType: "CURRENT", isPrimary: false },
        { accountNumber: "222", ifscCode: "ICIC0001234", bankName: "ICICI", branchName: "Indiranagar", accountType: "SAVINGS", isPrimary: true },
      ],
    };
    const res = await POST(req(payload));
    expect(res.status).toBe(201);
    const callArgs = (prisma.vendor.create as any).mock.calls[0][0];
    const created = callArgs.data.bankAccounts.create;
    expect(created[0].isPrimary).toBe(true); // forced true regardless of input
    expect(created[1].isPrimary).toBe(false); // forced false even though client sent true
  });

  it("maps uploaded documents to VendorDocument rows with correct documentType", async () => {
    const payload = {
      ...basePayload,
      uploads: {
        registrationCertificate: { name: "rc.pdf", url: "https://blob/rc.pdf", size: 100, type: "application/pdf" },
        randomUnmappedKey: { name: "x.pdf", url: "https://blob/x.pdf", size: 100, type: "application/pdf" },
      },
    };
    const res = await POST(req(payload));
    expect(res.status).toBe(201);
    const calls = (prisma.vendorDocument.create as any).mock.calls;
    expect(calls[0][0].data.documentType).toBe("REGISTRATION_CERTIFICATE");
    expect(calls[1][0].data.documentType).toBe("OTHER"); // unmapped key falls back to OTHER
  });
});
