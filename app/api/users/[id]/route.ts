import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRole, UserRole } from "@/lib/rbac";

const VALID_ROLES: UserRole[] = ["ADMIN", "INITIATOR", "APPROVER", "IC_TEAM", "ACCOUNTS"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const guard = requireRole(session, ["ADMIN"]);
  if (guard) return guard;

  try {
    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
    }
    if (id === (session as any)?.user?.id) {
      return NextResponse.json({ success: false, error: "You cannot change your own role" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const guard = requireRole(session, ["ADMIN"]);
  if (guard) return guard;

  try {
    const { id } = await params;
    if (id === (session as any)?.user?.id) {
      return NextResponse.json({ success: false, error: "You cannot delete your own account" }, { status: 400 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
  }
}