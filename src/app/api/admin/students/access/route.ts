import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getNextEnrollmentBusinessId } from "@/lib/id-generator";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const studentId = typeof body?.studentId === "string" ? body.studentId.trim() : "";
    const courseId = typeof body?.courseId === "string" ? body.courseId.trim() : "";
    const accessGranted = body?.accessGranted === true || body?.accessGranted === false ? Boolean(body.accessGranted) : true;

    if (!studentId || !courseId) {
      return NextResponse.json({ success: false, message: "Student id and course id are required." }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const enrollmentId = await getNextEnrollmentBusinessId(prisma);

    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId,
        },
      },
      update: {
        accessGranted,
        grantedAt: accessGranted ? new Date() : undefined,
      },
      create: {
        enrollmentId,
        userId: studentId,
        courseId,
        accessGranted,
        grantedAt: accessGranted ? new Date() : new Date(),
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        accessGranted: true,
      },
    });

    return NextResponse.json({
      success: true,
      studentId: enrollment.userId,
      courseId: enrollment.courseId,
      accessGranted: enrollment.accessGranted,
    });
  } catch (error) {
    console.error("[api/admin/students/access] Failed to update course access", error);
    return NextResponse.json({ success: false, message: "Unable to update course access." }, { status: 500 });
  }
}
