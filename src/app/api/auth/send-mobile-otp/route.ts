import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createOtpRecord, sendSmsOtp } from "@/lib/otp";

const phoneRegex = /^[0-9+()\-\s]{10,15}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

    if (!phone || !phoneRegex.test(phone) || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, message: "A valid mobile number is required." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        phone,
      },
    });

    const { code, otp } = await createOtpRecord({
      phone,
      userId: existingUser?.id,
      purpose: "MOBILE_VERIFICATION",
    });

    const sendResult = await sendSmsOtp(phone, code);

    return NextResponse.json({
      success: true,
      message: sendResult.sent ? "Verification SMS sent." : "Verification code generated in mock mode.",
      otpId: otp.id,
    });
  } catch (error) {
    console.error("Send mobile OTP failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send mobile verification code." },
      { status: 500 },
    );
  }
}
