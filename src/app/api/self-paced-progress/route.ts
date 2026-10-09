import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getNextLectureProgressBusinessId } from "@/lib/id-generator";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = new Set(["not_started", "inprogress", "completed"]);
export const COMPLETION_THRESHOLD_PERCENT = 90;
export const COMPLETION_FINAL_SECONDS = 10;

export function normalizeStatus(status: string | undefined, watchedPercent: number) {
  const value = typeof status === "string" ? status.toLowerCase() : "not_started";

  if (VALID_STATUSES.has(value)) {
    if (value === "completed" || watchedPercent >= COMPLETION_THRESHOLD_PERCENT) {
      return "completed";
    }

    if (value === "inprogress" || watchedPercent > 0) {
      return "inprogress";
    }
  }

  return "not_started";
}

export function normalizeWatchedPercent(value: unknown) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.min(100, parsed));
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ progress: {} });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const slug = searchParams.get("slug");

    if (!courseId && !slug) {
      return NextResponse.json({ progress: {} });
    }

    const course = await prisma.course.findUnique({
      where: courseId ? { id: courseId } : { slug: slug ?? "" },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ progress: {} });
    }

    const progressEntries = await prisma.lectureProgress.findMany({
      where: {
        userId: session.user.id,
        courseId: course.id,
      },
      select: {
        lectureId: true,
        status: true,
        watchedPercent: true,
      },
    });

    const progress = Object.fromEntries(
      progressEntries.map((entry) => [
        entry.lectureId,
        {
          status: entry.status,
          watchedPercent: entry.watchedPercent,
        },
      ])
    );

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Fetch lecture progress error:", error);
    return NextResponse.json({ progress: {} }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const courseId = typeof body?.courseId === "string" ? body.courseId : "";
    const lectureId = typeof body?.lectureId === "string" ? body.lectureId : "";
    const watchedPercent = normalizeWatchedPercent(body?.watchedPercent);
    const status = normalizeStatus(body?.status, watchedPercent);

    if (!courseId || !lectureId) {
      return NextResponse.json({ error: "courseId and lectureId are required" }, { status: 400 });
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      select: {
        id: true,
        module: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!lecture || lecture.module.courseId !== courseId) {
      return NextResponse.json({ error: "Lecture does not belong to the selected course" }, { status: 400 });
    }

    const existingRecord = await prisma.lectureProgress.findUnique({
      where: {
        userId_lectureId: {
          userId: session.user.id,
          lectureId,
        },
      },
      select: {
        watchedPercent: true,
        status: true,
      },
    });

    const maxWatchedPercent = Math.max(existingRecord?.watchedPercent ?? 0, watchedPercent);
    const normalizedStatus = normalizeStatus(existingRecord?.status ?? body?.status, maxWatchedPercent);
    const finalStatus = normalizedStatus === "completed" || status === "completed" ? "completed" : normalizedStatus;

    const lectureProgressId = await getNextLectureProgressBusinessId(prisma);

    const record = await prisma.lectureProgress.upsert({
      where: {
        userId_lectureId: {
          userId: session.user.id,
          lectureId,
        },
      },
      update: {
        status: finalStatus,
        watchedPercent: maxWatchedPercent,
      },
      create: {
        lectureProgressId,
        userId: session.user.id,
        courseId,
        lectureId,
        status: finalStatus,
        watchedPercent: maxWatchedPercent,
      },
      select: {
        lectureId: true,
        status: true,
        watchedPercent: true,
      },
    });

    return NextResponse.json({
      progress: {
        [record.lectureId]: {
          status: record.status,
          watchedPercent: record.watchedPercent,
        },
      },
    });
  } catch (error) {
    console.error("Save lecture progress error:", error);
    return NextResponse.json({ error: "Unable to save progress" }, { status: 500 });
  }
}
