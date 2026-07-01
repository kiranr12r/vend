import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn(), create: vi.fn() } },
}));
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn().mockResolvedValue("hashed") } }));

import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/prisma";

function req(body: Record<string, any>) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  firstName: "John",
  lastName: "Doe",
  email: "john@kotak.com",
  password: "Passw0rd!",
  dateOfBirth: "1990-01-01",
  phoneNumber: "9876543210",
  panCard: "ABCDE1234F",
  address: "MG Road, Bengaluru",
  gstNumber: "27ABCDE1234F1Z5",
};

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "u1", ...data })
    );
  });

  it("registers successfully and always assigns role INITIATOR", async () => {
    const res = await POST(req(validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.role).toBe("INITIATOR");
    expect(body.user).not.toHaveProperty("password");
  });

  it("returns 400 when a required field is missing", async () => {
    const { gstNumber, ...rest } = validBody;
    const res = await POST(req(rest));
    expect(res.status).toBe(400);
  });

  it("returns 400 for a password under 8 characters", async () => {
    const res = await POST(req({ ...validBody, password: "Pass12!" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid PAN format", async () => {
    const res = await POST(req({ ...validBody, panCard: "ABCDE12345" }));
    expect(res.status).toBe(400);
  });

  it("normalizes a lowercase-but-valid PAN to uppercase and accepts it", async () => {
    const res = await POST(req({ ...validBody, panCard: "abcde1234f" }));
    expect(res.status).toBe(201);
    const createCall = (prisma.user.create as any).mock.calls[0][0];
    expect(createCall.data.panCard).toBe("ABCDE1234F");
  });

  it("returns 400 for an invalid GST format", async () => {
    const res = await POST(req({ ...validBody, gstNumber: "1234567890123" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for a phone number starting with a digit below 6", async () => {
    const res = await POST(req({ ...validBody, phoneNumber: "5876543210" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an unparseable date of birth", async () => {
    const res = await POST(req({ ...validBody, dateOfBirth: "not-a-date" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 for a duplicate (case-normalized) email", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: "existing" });
    const res = await POST(req({ ...validBody, email: "John@Kotak.com" }));
    expect(res.status).toBe(409);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "john@kotak.com" },
    });
  });
});
