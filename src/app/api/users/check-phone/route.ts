import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const phoneRegex = /^[0-9+()\-\s]{10,15}$/;

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get("phone") ?? "";
    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      return NextResponse.json({ exists: false, valid: false }, { status: 400 });
    }

    if (!phoneRegex.test(trimmedPhone) || trimmedPhone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ exists: false, valid: false }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { phone: trimmedPhone },
    });

    return NextResponse.json({ exists: !!existingUser, valid: true });
  } catch (error) {
    console.error("Phone availability check failed:", error);
    return NextResponse.json({ exists: false, valid: false }, { status: 500 });
  }
}
