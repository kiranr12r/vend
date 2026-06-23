import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRole, UserRole } from "@/lib/rbac";
import bcrypt from "bcryptjs";

const VALID_ROLES: UserRole[] = ["ADMIN", "INITIATOR", "APPROVER", "IC_TEAM", "ACCOUNTS"];

function normalizeRole(role: unknown): UserRole {
  return typeof role === "string" && VALID_ROLES.includes(role as UserRole)
    ? (role as UserRole)
    : "INITIATOR";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = requireRole(session, ["ADMIN"]);
  if (guard) return guard;

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, users });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !password || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, error: "email, password and name are required" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, name, password: hashedPassword, role: "INITIATOR" },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { status: 201 });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 });
  }
}