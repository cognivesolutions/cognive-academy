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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    const { code, otp } = await createOtpRecord({
      email,
      userId: existingUser?.id,
      purpose: "EMAIL_VERIFICATION",
    });

    const sendResult = await sendEmailOtp(email, code);

    return NextResponse.json({
      success: true,
      message: sendResult.sent ? "Verification email sent." : "Verification code generated in mock mode.",
      otpId: otp.id,
    });
  } catch (error) {
    console.error("Send email OTP failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send email verification code." },
      { status: 500 },
    );
  }
}
