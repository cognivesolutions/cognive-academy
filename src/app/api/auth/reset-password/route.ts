import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and reset code are required." },
        { status: 400 },
      );
    }

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { success: false, message: "Use a password with at least 8 characters and a mix of letters, numbers, and symbols." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "We could not find an account for this email." },
        { status: 404 },
      );
    }

    const isValidCode = await verifyOtp({
      email,
      code,
      purpose: "PASSWORD_RESET",
    });

    if (!isValidCode) {
      return NextResponse.json(
        { success: false, message: "The reset code is invalid or expired." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const recentPasswordHashes = [user.passwordHash, ...(user.recentPasswordHashes ?? [])].filter((hash): hash is string => Boolean(hash)).slice(0, 3);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        recentPasswordHashes,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Password reset failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to reset password." },
      { status: 500 },
    );
  }
}
