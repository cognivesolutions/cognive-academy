import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const studentId = typeof body?.studentId === "string" ? body.studentId.trim() : "";
    const isActive = body?.isActive === true || body?.isActive === false ? Boolean(body.isActive) : true;

    if (!studentId) {
      return NextResponse.json({ success: false, message: "Student id is required." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: studentId },
      data: { isActive },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({ success: true, studentId: user.id, isActive: user.isActive });
  } catch (error) {
    console.error("[api/admin/students/status] Failed to update student status", error);
    return NextResponse.json({ success: false, message: "Unable to update student status." }, { status: 500 });
  }
}
