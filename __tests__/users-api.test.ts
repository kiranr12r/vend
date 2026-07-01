import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() } },
}));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn().mockResolvedValue("hashed") } }));

import { GET, POST } from "@/app/api/users/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const mockSession = (role: string | null) =>
  role ? { user: { id: "u1", email: "u@test.com", name: "U", role } } : null;

function postReq(body: Record<string, any>) {
  return new NextRequest("http://localhost/api/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
function getReq() {
  return new NextRequest("http://localhost/api/users");
}

describe("GET /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.user.findMany as any).mockResolvedValue([]);
  });

  it("allows ADMIN", async () => {
    (getServerSession as any).mockResolvedValue(mockSession("ADMIN"));
    const res = await GET(getReq());
    expect(res.status).toBe(200);
  });

  it("blocks non-ADMIN roles with 403", async () => {
    (getServerSession as any).mockResolvedValue(mockSession("ACCOUNTS"));
    const res = await GET(getReq());
    expect(res.status).toBe(403);
  });

  it("blocks unauthenticated requests with 401", async () => {
    (getServerSession as any).mockResolvedValue(null);
    const res = await GET(getReq());
    expect(res.status).toBe(401);
  });
});

describe("POST /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "new1", ...data })
    );
  });

  it("SECURITY FINDING: succeeds with no session/authentication at all (no guard on POST)", async () => {
    (getServerSession as any).mockResolvedValue(null);
    const res = await POST(
      postReq({ email: "new@x.com", password: "Passw0rd!", name: "New User" })
    );
    // Unlike GET (ADMIN-gated), this handler never calls requireAuth/requireRole.
    expect(res.status).toBe(201);
  });

  it("ignores a 'role' field in the body and always assigns INITIATOR", async () => {
    const res = await POST(
      postReq({ email: "new@x.com", password: "Passw0rd!", name: "New User", role: "ADMIN" })
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.role).toBe("INITIATOR");
  });

  it("returns 409 for a duplicate email", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: "existing" });
    const res = await POST(
      postReq({ email: "existing@x.com", password: "Passw0rd!", name: "X" })
    );
    expect(res.status).toBe(409);
  });

  it("returns 400 for a password under 8 characters", async () => {
    const res = await POST(
      postReq({ email: "new@x.com", password: "short", name: "New User" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(
      postReq({ email: "new@x.com", password: "Passw0rd!" })
    );
    expect(res.status).toBe(400);
  });
});
