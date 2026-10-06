import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createOtpRecord, sendEmailOtp } from "@/lib/otp";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists for this email, a reset code has been sent.",
      });
    }

    const { code } = await createOtpRecord({
      email,
      userId: user.id,
      purpose: "PASSWORD_RESET",
    });

    const sendResult = await sendEmailOtp(email, code);

    return NextResponse.json({
      success: true,
      message: sendResult.sent
        ? "A password reset code has been sent to your email."
        : "Password reset code generated in mock mode.",
    });
  } catch (error) {
    console.error("Password reset request failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send password reset code." },
      { status: 500 },
    );
  }
}
