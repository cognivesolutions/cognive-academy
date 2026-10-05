import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const studentId = typeof body?.studentId === "string" ? body.studentId.trim() : "";
    const type = body?.type === "reminder" ? "reminder" : "message";

    if (!studentId) {
      return NextResponse.json({ success: false, message: "Student id is required." }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true },
    });

    if (!student?.email) {
      return NextResponse.json({ success: false, message: "Student email not found." }, { status: 404 });
    }

    const studentName = student.name?.trim() || "student";
    const subject = type === "reminder"
      ? "Reminder: your Cognive Academy course access"
      : "Message from Cognive Academy";

    const bodyText = type === "reminder"
      ? `Hello ${studentName},\n\nThis is a quick reminder from Cognive Academy. Please check your course access and continue learning with us.\n\nIf you have any questions, reply to this email and our team will support you.\n\nWarm regards,\nCognive Academy team`
      : `Hello ${studentName},\n\nA member of the Cognive Academy team has sent you a message. Please reply to this email or reach out to us through your student dashboard for assistance.\n\nWarm regards,\nCognive Academy team`;

    const mailtoUrl = `mailto:${encodeURIComponent(student.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

    return NextResponse.json({
      success: true,
      studentId: student.id,
      type,
      email: student.email,
      mailtoUrl,
    });
  } catch (error) {
    console.error("[api/admin/students/message] Failed to prepare student message", error);
    return NextResponse.json({ success: false, message: "Unable to prepare student message." }, { status: 500 });
  }
}
