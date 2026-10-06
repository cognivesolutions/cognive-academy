import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email") ?? "";
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return NextResponse.json({ exists: false, valid: false }, { status: 400 });
    }

    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ exists: false, valid: false }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    return NextResponse.json({ exists: !!existingUser, valid: true });
  } catch (error) {
    console.error("Email availability check failed:", error);
    return NextResponse.json({ exists: false, valid: false }, { status: 500 });
  }
}
