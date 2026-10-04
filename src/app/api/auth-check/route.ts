import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ status: "missing" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { isActive: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ status: "missing" });
    }

    if (user.isActive === false) {
      return NextResponse.json({ status: "inactive" });
    }

    return NextResponse.json({ status: "active" });
  } catch (error) {
    console.error("Login status check failed:", error);
    return NextResponse.json({ status: "missing" });
  }
}
