import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+()\-\s]{10,15}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, mobile number, and password are required." },
        { status: 400 },
      );
    }

    if (name.trim().length < 2 || !/[A-Za-z]/.test(name)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid full name with at least 2 characters and letters." },
        { status: 400 },
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (!phoneRegex.test(phone) || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid mobile number with at least 10 digits." },
        { status: 400 },
      );
    }

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character." },
        { status: 400 },
      );
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const existingUserByPhone = await prisma.user.findFirst({
      where: {
        phone,
      },
    });

    if (existingUserByPhone) {
      return NextResponse.json(
        { success: false, message: "An account with this mobile number already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "STUDENT",
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong while creating your account." },
      { status: 500 },
    );
  }
}
