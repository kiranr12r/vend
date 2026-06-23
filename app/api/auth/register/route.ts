import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PHONE_REGEX = /^[6-9][0-9]{9}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, email, password,
      dateOfBirth, phoneNumber, panCard, address, gstNumber,
    } = body;

    if (
      !firstName || !lastName || !email || !password ||
      !dateOfBirth || !phoneNumber || !panCard || !address || !gstNumber
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPan = typeof panCard === "string" ? panCard.trim().toUpperCase() : "";
    const normalizedGst = typeof gstNumber === "string" ? gstNumber.trim().toUpperCase() : "";
    const normalizedPhone = typeof phoneNumber === "string" ? phoneNumber.trim() : "";

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!PAN_REGEX.test(normalizedPan)) {
      return NextResponse.json(
        { success: false, error: "Invalid PAN format" },
        { status: 400 }
      );
    }

    if (!GST_REGEX.test(normalizedGst)) {
      return NextResponse.json(
        { success: false, error: "Invalid GST number format" },
        { status: 400 }
      );
    }

    if (!PHONE_REGEX.test(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
      );
    }

    const parsedDob = new Date(dateOfBirth);
    if (isNaN(parsedDob.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date of birth" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: `${firstName.trim()} ${lastName.trim()}`,
        password: hashedPassword,
        role: "INITIATOR",
        dateOfBirth: parsedDob,
        phoneNumber: normalizedPhone,
        panCard: normalizedPan,
        address: typeof address === "string" ? address.trim() : address,
        gstNumber: normalizedGst,
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}