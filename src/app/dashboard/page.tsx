import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [enrollments, orders] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lectures: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const courseIds = enrollments.map((enrollment) => enrollment.courseId);

  const [lectureProgressEntries, lectureCounts] = await Promise.all([
    prisma.lectureProgress.findMany({
      where: {
        userId: session.user.id,
        courseId: { in: courseIds },
      },
      select: {
        courseId: true,
        watchedPercent: true,
      },
    }),
    prisma.lecture.findMany({
      where: {
        module: {
          courseId: { in: courseIds },
        },
      },
      select: {
        id: true,
        module: {
          select: {
            courseId: true,
          },
        },
      },
    }),
  ]);

  const totalLecturesByCourse = new Map<string, number>();
  for (const lecture of lectureCounts) {
    totalLecturesByCourse.set(lecture.module.courseId, (totalLecturesByCourse.get(lecture.module.courseId) ?? 0) + 1);
  }

  const watchedPercentByCourse = new Map<string, number>();
  const watchedLectureTotals = new Map<string, number>();

  for (const entry of lectureProgressEntries) {
    const total = watchedLectureTotals.get(entry.courseId) ?? 0;
    watchedLectureTotals.set(entry.courseId, total + 1);
    const current = watchedPercentByCourse.get(entry.courseId) ?? 0;
    watchedPercentByCourse.set(entry.courseId, current + entry.watchedPercent);
  }

  const courseProgressById = new Map<string, number>();
  for (const enrollment of enrollments) {
    const totalLectures = totalLecturesByCourse.get(enrollment.courseId) ?? 0;
    const watchedLectureTotal = watchedLectureTotals.get(enrollment.courseId) ?? 0;
    const watchedPercentTotal = watchedPercentByCourse.get(enrollment.courseId) ?? 0;

    const progress = totalLectures > 0
      ? Math.min(100, Math.max(0, Math.round(watchedPercentTotal / totalLectures)))
      : watchedLectureTotal > 0
        ? Math.min(100, Math.max(0, Math.round(watchedPercentTotal / watchedLectureTotal)))
        : 0;

    courseProgressById.set(enrollment.courseId, progress);
  }

  const userName = session.user.name ?? "Student";
  const formatLiveSessionLabel = (offsetDays = 0) => {
    const date = new Date();
    date.setHours(19, 30, 0, 0);
    date.setDate(date.getDate() + offsetDays);

    const datePart = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(date);

    const timePart = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(date);

    return `${datePart} ${timePart} IST`;
  };
  const liveCourses = enrollments.filter((item) => item.course?.isLive).length;
  const recordedCourses = enrollments.filter((item) => !item.course?.isLive).length;
  // Guard: `prisma.savedCourse` may be undefined until `prisma generate` has been run
  // (Prisma client must be regenerated after schema changes). Fall back to an
  // empty list to avoid runtime exceptions in dev until the client is ready.
  let savedCourses: any[] = [];
  if (prisma.savedCourse && typeof prisma.savedCourse.findMany === "function") {
    savedCourses = await prisma.savedCourse.findMany({
      where: { userId: session.user.id },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // eslint-disable-next-line no-console
    console.warn("prisma.savedCourse is not available. Run `npx prisma generate` to regenerate the client.");
    savedCourses = [];
  }
  const liveSessions = enrollments.flatMap((enrollment, enrollmentIndex) => {
    const lectureSessions = (enrollment.course?.modules ?? []).flatMap((module, moduleIndex) =>
      (module.lectures ?? [])
        .filter((lecture) => Boolean(lecture.liveSessionUrl))
        .map((lecture, lectureIndex) => ({
          id: lecture.id,
          title: enrollment.course.title,
          sessionTitle: lecture.title,
          time: formatLiveSessionLabel((enrollmentIndex + moduleIndex + lectureIndex) % 4),
          type: "Live cohort",
          href: lecture.liveSessionUrl ?? `/courses/${enrollment.course.slug}/live`,
        }))
    );

    if (lectureSessions.length > 0) {
      return lectureSessions;
    }

    if (enrollment.course?.isLive) {
      return [{
        id: `course:${enrollment.course.id}`,
        title: enrollment.course.title,
        sessionTitle: "Live cohort",
        time: formatLiveSessionLabel(enrollmentIndex),
        type: "Live cohort",
        href: `/courses/${enrollment.course.slug}/live`,
      }];
    }

    return [];
  });

  const nextClass = liveSessions[0] ?? {
    title: "SQL Fundamentals",
    sessionTitle: "Live class",
    time: formatLiveSessionLabel(0),
    type: "Live cohort",
    href: "/courses",
  };
  const upcomingSessions = liveSessions.slice(1, 3);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="mb-6 rounded-[28px] border border-indigo-100 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_48%,_#e0e7ff_100%)] p-5 text-slate-900 shadow-[0_28px_70px_rgba(79,70,229,0.12)] sm:mb-8 sm:p-7 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.45),transparent_32%),linear-gradient(135deg,_#0f172a_0%,_#1e1b4b_45%,_#312e81_100%)] dark:text-white dark:shadow-[0_28px_70px_rgba(79,70,229,0.32)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-indigo-700 sm:text-xs dark:text-indigo-200">Student dashboard</p>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">Welcome back, {userName}</h1>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="rounded-2xl border border-indigo-200 bg-white/70 px-3 py-2.5 text-sm text-indigo-700 sm:px-4 sm:py-3 dark:border-white/15 dark:bg-white/5 dark:text-indigo-100">
                Next live session: <span className="font-semibold text-slate-900 dark:text-white">{nextClass.time}</span>
              </div>
            </div>
          </div>
        </section>

        <div id="overview" className="grid gap-4 sm:gap-5 md:grid-cols-3">
          <div className="group h-full rounded-[24px] border border-indigo-100 bg-[linear-gradient(180deg,_rgba(238,242,255,0.96),_rgba(248,250,252,0.94))] p-4 shadow-[0_12px_28px_rgba(79,70,229,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/80 hover:shadow-[0_18px_38px_rgba(79,70,229,0.12)] sm:p-5 dark:border-indigo-500/20 dark:bg-[linear-gradient(180deg,_rgba(30,41,59,0.95),_rgba(15,23,42,0.86))] dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/10 dark:hover:shadow-[0_18px_38px_rgba(99,102,241,0.18)]">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400" aria-hidden="true" />
              <span>Enrolled</span>
            </div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{enrollments.length}</div>
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Active learning tracks</div>
          </div>

          <div className="group h-full rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(236,253,245,0.96),_rgba(248,250,252,0.94))] p-4 shadow-[0_12px_28px_rgba(16,185,129,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/80 hover:shadow-[0_18px_38px_rgba(16,185,129,0.12)] sm:p-5 dark:border-emerald-500/20 dark:bg-[linear-gradient(180deg,_rgba(30,41,59,0.95),_rgba(15,23,42,0.86))] dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/10 dark:hover:shadow-[0_18px_38px_rgba(16,185,129,0.18)]">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" aria-hidden="true" />
              <span>Live</span>
            </div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{liveCourses}</div>
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Live cohort courses</div>
          </div>

          <div className="group h-full rounded-[24px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(245,243,255,0.96),_rgba(248,250,252,0.94))] p-4 shadow-[0_12px_28px_rgba(168,85,247,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/80 hover:shadow-[0_18px_38px_rgba(168,85,247,0.12)] sm:p-5 dark:border-violet-500/20 dark:bg-[linear-gradient(180deg,_rgba(30,41,59,0.95),_rgba(15,23,42,0.86))] dark:hover:border-violet-400/50 dark:hover:bg-violet-500/10 dark:hover:shadow-[0_18px_38px_rgba(168,85,247,0.18)]">
            <div className="flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-300">
              <span className="h-2 w-2 rounded-full bg-violet-500 dark:bg-violet-400" aria-hidden="true" />
              <span>Recorded</span>
            </div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{recordedCourses}</div>
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">On-demand courses</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:mt-10 sm:gap-8 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <section id="courses" className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(248,250,252,0.94))] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-colors duration-300 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.82))] dark:shadow-[0_20px_44px_rgba(2,6,23,0.35)] sm:p-6 lg:p-7">
              <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">Continue Learning</h2>
                <Link href="/courses" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(79,70,229,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(79,70,229,0.3)]">
                  Browse catalog
                </Link>
              </div>

              {enrollments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                  You are not enrolled in any course yet. Browse the catalog to get started.
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  {enrollments.slice(0, 4).map((enrollment) => {
                    const progress = courseProgressById.get(enrollment.courseId) ?? 0;
                    const isLiveCourse = Boolean(enrollment.course?.isLive);
                    const courseHref = enrollment.course?.slug
                      ? enrollment.accessGranted
                        ? isLiveCourse
                          ? `/courses/${enrollment.course.slug}/live`
                          : `/courses/${enrollment.course.slug}/self-paced`
                        : `/courses/${enrollment.course.slug}`
                      : "/courses";

                    return (
                      <div key={enrollment.id} className="group flex h-full flex-col rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(241,245,249,0.9))] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-[0_16px_28px_rgba(79,70,229,0.08)] dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(30,41,59,0.8))] dark:hover:border-indigo-500/40 dark:hover:bg-slate-800">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                              {enrollment.accessGranted ? "Active" : "Queued"}
                            </p>
                            <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{enrollment.course.title}</h3>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${isLiveCourse ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isLiveCourse ? "animate-pulse bg-emerald-500 dark:bg-emerald-400" : "bg-violet-500 dark:bg-violet-400"}`} aria-hidden="true" />
                            {isLiveCourse ? "Live" : "Recorded"}
                          </span>
                        </div>

                        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {enrollment.course.shortDescription ?? "Continue your learning path"}
                        </p>

                        <div className="mt-4">
                          <div className="mb-2 flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500" style={{ width: `${progress}%` }} />
                          </div>
                        </div>

                        <Link
                          href={courseHref}
                          className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(16,185,129,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-[1.02] hover:shadow-[0_18px_32px_rgba(16,185,129,0.28)]"
                        >
                          {enrollment.accessGranted ? "Resume" : "View details"}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.92))] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)] transition-colors duration-300 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.82))] dark:shadow-[0_20px_44px_rgba(2,6,23,0.35)] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Saved</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Wishlist</h2>
                </div>
              </div>

              <div className="space-y-3">
                {savedCourses.map((course) => (
                  <div key={course.title} className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-3 py-3 shadow-sm transition-colors hover:border-indigo-200 dark:border-slate-700 dark:from-slate-800/90 dark:to-slate-800/70 dark:hover:border-indigo-500/40">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{course.course.title}</div>
                    <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                      {course.course.isLive ? "Live" : "Recorded"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 sm:space-y-6 xl:space-y-8">
            <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.92))] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)] transition-colors duration-300 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.82))] dark:shadow-[0_20px_44px_rgba(2,6,23,0.35)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Next class</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Live session</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] dark:bg-emerald-400" aria-hidden="true" />
                  {nextClass.type}
                </span>
              </div>

              <div className="mt-5 rounded-[22px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-inner transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:bg-gradient-to-br hover:from-emerald-100 hover:to-green-100 hover:shadow-[0_18px_30px_rgba(16,185,129,0.12)] dark:border-emerald-500/20 dark:from-emerald-500/5 dark:to-green-500/5 dark:hover:border-emerald-400/50 dark:hover:from-emerald-500/10 dark:hover:to-green-500/10">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-slate-500 dark:text-slate-300">Upcoming</div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] dark:bg-emerald-400" aria-hidden="true" />
                    Live
                  </span>
                </div>
                <div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{nextClass.title}</div>
                {nextClass.sessionTitle ? (
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{nextClass.sessionTitle}</div>
                ) : null}
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>{nextClass.time}</span>
                  <a href={nextClass.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-500">
                    Join live
                  </a>
                </div>
              </div>

              {upcomingSessions.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="rounded-[18px] border border-slate-200 bg-white/80 p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:shadow-[0_12px_22px_rgba(16,185,129,0.12)] dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-emerald-400/50 dark:hover:from-emerald-500/10 dark:hover:to-green-500/10">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Upcoming</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] dark:bg-emerald-400" aria-hidden="true" />
                          Live
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{session.title}</div>
                      {session.sessionTitle ? (
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{session.sessionTitle}</div>
                      ) : null}
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{session.time}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </aside>
        </div>

      </div>
    </main>
  );
}
