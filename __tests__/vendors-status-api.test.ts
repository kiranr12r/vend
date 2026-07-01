import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    vendor: { findUnique: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

import { PATCH } from "@/app/api/vendors/[id]/status/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const mockSession = (role: string | null) =>
  role ? { user: { id: "u1", email: "approver@kotak.com", name: "U", role } } : null;

function req(status: string) {
  return new NextRequest("http://localhost/api/vendors/v1/status", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

const ctx = { params: Promise.resolve({ id: "v1" }) };

describe("PATCH /api/vendors/[id]/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession("APPROVER"));
    (prisma.vendor.findUnique as any).mockResolvedValue({ id: "v1", status: "PENDING_APPROVAL" });
    (prisma.vendor.update as any).mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "v1", status: data.status })
    );
  });

  it("rejects INITIATOR from changing status (no self-approval)", async () => {
    (getServerSession as any).mockResolvedValue(mockSession("INITIATOR"));
    const res = await PATCH(req("APPROVED"), ctx);
    expect(res.status).toBe(403);
  });

  it("rejects an invalid status string", async () => {
    const res = await PATCH(req("FOOBAR"), ctx);
    expect(res.status).toBe(400);
  });

  it("returns 404 when the vendor does not exist", async () => {
    (prisma.vendor.findUnique as any).mockResolvedValue(null);
    const res = await PATCH(req("APPROVED"), ctx);
    expect(res.status).toBe(404);
  });

  it("APPROVER can move PENDING_APPROVAL -> APPROVED and logs oldValue/newValue", async () => {
    const res = await PATCH(req("APPROVED"), ctx);
    expect(res.status).toBe(200);
    const logCall = (prisma.auditLog.create as any).mock.calls[0][0];
    expect(logCall.data.action).toBe("STATUS_CHANGED");
    expect(logCall.data.oldValue).toBe("PENDING_APPROVAL");
    expect(logCall.data.newValue).toBe("APPROVED");
    expect(logCall.data.changedBy).toBe("approver@kotak.com");
  });

  it("STATE-MACHINE GAP: allows an illegal/out-of-order transition (REJECTED -> APPROVED) with no checks", async () => {
    (prisma.vendor.findUnique as any).mockResolvedValue({ id: "v1", status: "REJECTED" });
    const res = await PATCH(req("APPROVED"), ctx);
    // The route only validates that the target string is a known enum value -
    // it never checks the current status, so this "illegal" jump succeeds.
    expect(res.status).toBe(200);
  });

  it("WORKFLOW GAP: IC_TEAM can set status directly to APPROVED, bypassing Approver/Accounts review", async () => {
    (getServerSession as any).mockResolvedValue(mockSession("IC_TEAM"));
    const res = await PATCH(req("APPROVED"), ctx);
    expect(res.status).toBe(200);
  });
});
