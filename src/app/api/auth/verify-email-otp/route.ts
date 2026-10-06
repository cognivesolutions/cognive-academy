import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and OTP code are required." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    const isVerified = await verifyOtp({
      email,
      purpose: "EMAIL_VERIFICATION",
      code,
    });

    if (!isVerified) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired email verification code." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Verify email OTP failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to verify email code." },
      { status: 500 },
    );
  }
}
