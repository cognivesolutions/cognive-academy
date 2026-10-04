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

    if (!studentId) {
      return NextResponse.json({ success: false, message: "Student id is required." }, { status: 400 });
    }

    const user = await prisma.user.delete({
      where: { id: studentId },
      select: { id: true },
    });

    return NextResponse.json({ success: true, studentId: user.id });
  } catch (error) {
    console.error("[api/admin/students/delete] Failed to delete student", error);
    return NextResponse.json({ success: false, message: "Unable to delete student." }, { status: 500 });
  }
}
