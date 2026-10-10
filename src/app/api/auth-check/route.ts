import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const requestedRole = typeof body?.role === "string" ? body.role.trim().toUpperCase() : "";

    if (!email) {
      return NextResponse.json({ status: "missing" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        isActive: true,
        email: true,
        role: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ status: "missing" });
    }

    const isInternalAdmin = user.role?.toUpperCase?.() === "ADMIN";

    if (requestedRole === "ADMIN" && !isInternalAdmin) {
      return NextResponse.json({ status: "not_admin" });
    }

    if (user.isActive === false) {
      return NextResponse.json({ status: "inactive" });
    }

    if (!isInternalAdmin && (!user.emailVerifiedAt || !user.phoneVerifiedAt)) {
      return NextResponse.json({ status: "verification_required" });
    }

    return NextResponse.json({ status: "active" });
  } catch (error) {
    console.error("Login status check failed:", error);
    return NextResponse.json({ status: "missing" });
  }
}
