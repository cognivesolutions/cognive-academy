import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getNextSavedCourseBusinessId } from "@/lib/id-generator";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ savedCourseIds: [] });
  }

  const savedCourses = await prisma.savedCourse.findMany({
    where: { userId: session.user.id },
    select: { courseId: true },
  });

  return NextResponse.json({
    savedCourseIds: savedCourses.map((savedCourse) => savedCourse.courseId),
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const courseId = typeof payload?.courseId === "string" ? payload.courseId : "";
  const action = payload?.action === "save" ? "save" : payload?.action === "unsave" ? "unsave" : null;

  if (!courseId || !action) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (action === "save") {
    const existingSavedCourse = await prisma.savedCourse.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existingSavedCourse) {
      if (!existingSavedCourse.savedCourseId) {
        const nextSavedCourseId = await getNextSavedCourseBusinessId(prisma);
        await prisma.savedCourse.update({
          where: { id: existingSavedCourse.id },
          data: { savedCourseId: nextSavedCourseId },
        });
      }
    } else {
      const nextSavedCourseId = await getNextSavedCourseBusinessId(prisma);
      await prisma.savedCourse.create({
        data: {
          userId: session.user.id,
          courseId,
          savedCourseId: nextSavedCourseId,
        },
      });
    }
  } else {
    await prisma.savedCourse.deleteMany({
      where: {
        userId: session.user.id,
        courseId,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    saved: action === "save",
  });
}
