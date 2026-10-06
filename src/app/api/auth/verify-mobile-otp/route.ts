import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: "Mobile number and OTP code are required." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    const isVerified = await verifyOtp({
      phone,
      purpose: "MOBILE_VERIFICATION",
      code,
    });

    if (!isVerified) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired mobile verification code." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mobile number verified successfully.",
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Verify mobile OTP failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to verify mobile code." },
      { status: 500 },
    );
  }
}
