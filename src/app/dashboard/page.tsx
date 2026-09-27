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

  const userName = session.user.name ?? "Student";
  const totalProgress = enrollments.length ? Math.min(100, 72 + enrollments.length * 8) : 0;
  const weeklyProgress = [42, 68, 58, 82, 76, 91, 86];
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
  const nextClass = enrollments[0]
    ? {
        title: enrollments[0].course.title,
        time: "7:30 PM IST",
        type: "Live cohort",
      }
    : {
        title: "SQL Fundamentals",
        time: "7:30 PM IST",
        type: "Live cohort",
      };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="mb-6 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.45),transparent_32%),linear-gradient(135deg,_#0f172a_0%,_#1e1b4b_45%,_#312e81_100%)] p-5 text-white shadow-[0_28px_70px_rgba(79,70,229,0.32)] sm:mb-8 sm:p-7 dark:border-slate-700">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-indigo-200 sm:text-xs">Student dashboard</p>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">Welcome back, {userName}</h1>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Link href="/profile" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">
                Profile
              </Link>
              <div className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-indigo-100 sm:px-4 sm:py-3">
                Next live session: <span className="font-semibold text-white">7:30 PM IST</span>
              </div>
            </div>
          </div>
        </section>

        <div id="overview" className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="h-full rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.92))] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(79,70,229,0.08)] sm:p-5 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.8))] dark:shadow-[0_18px_40px_rgba(2,6,23,0.35)]">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Profile completion</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{Math.min(100, 78 + enrollments.length * 6)}%</div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500" style={{ width: `${Math.min(100, 78 + enrollments.length * 6)}%` }} />
            </div>
          </div>
          <div className="h-full rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.92))] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(79,70,229,0.08)] sm:p-5 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.8))] dark:shadow-[0_18px_40px_rgba(2,6,23,0.35)]">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Enrolled courses</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{enrollments.length}</div>
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">{enrollments.filter((item) => item.accessGranted).length} active learning tracks</div>
          </div>
          <div className="h-full rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.92))] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(79,70,229,0.08)] sm:p-5 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.8))] dark:shadow-[0_18px_40px_rgba(2,6,23,0.35)]">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Learning momentum</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{totalProgress}%</div>
            <div className="mt-3 text-sm text-indigo-700 dark:text-indigo-300">Keep going — you are on track</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:mt-10 sm:gap-8 xl:grid-cols-[1.5fr_1fr]">
          <section id="courses" className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(248,250,252,0.94))] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-colors duration-300 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.82))] dark:shadow-[0_20px_44px_rgba(2,6,23,0.35)] sm:p-6 lg:p-7">
            <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">Continue Learning</h2>
              <Link href="/courses" className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">Browse catalog</Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                You are not enrolled in any course yet. Browse the catalog to get started.
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                {enrollments.slice(0, 4).map((enrollment) => {
                  const progress = enrollment.accessGranted ? 72 : 0;
                  return (
                    <div key={enrollment.id} className="group rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(241,245,249,0.9))] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-[0_16px_28px_rgba(79,70,229,0.08)] dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(30,41,59,0.8))] dark:hover:border-indigo-500/40 dark:hover:bg-slate-800">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                            {enrollment.accessGranted ? "Active" : "Queued"}
                          </p>
                          <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{enrollment.course.title}</h3>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          {progress}%
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
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

                      <button
                        type="button"
                        className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                      >
                        {enrollment.accessGranted ? "Resume" : "View details"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="space-y-5 sm:space-y-6 xl:space-y-8">
            <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.92))] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)] transition-colors duration-300 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.82))] dark:shadow-[0_20px_44px_rgba(2,6,23,0.35)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Next class</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Live session</h2>
                </div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                  {nextClass.type}
                </span>
              </div>

                <div className="mt-5 rounded-[22px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 shadow-inner dark:border-indigo-500/20 dark:from-indigo-500/5 dark:to-violet-500/5">
                <div className="text-sm text-slate-500 dark:text-slate-300">Upcoming</div>
                <div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{nextClass.title}</div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>{nextClass.time}</span>
                  {enrollments[0] && enrollments[0].course.modules && enrollments[0].course.modules.length > 0 && enrollments[0].course.modules[0].lectures ? (
                    (() => {
                      // look for a lecture with a liveSessionUrl
                      const lectureWithLive = enrollments[0].course.modules.flatMap((m: any) => m.lectures).find((l: any) => l.liveSessionUrl);
                      const joinHref = lectureWithLive ? lectureWithLive.liveSessionUrl : `/live/${enrollments[0].id}`;
                      return (
                        <a href={joinHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
                          Join live
                        </a>
                      );
                    })()
                  ) : (
                    <a href={`/live/${enrollments[0]?.id ?? ""}`} className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
                      Join live
                    </a>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.92))] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)] transition-colors duration-300 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.82))] dark:shadow-[0_20px_44px_rgba(2,6,23,0.35)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Momentum</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Learning streak</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-xl text-amber-700 shadow-sm dark:from-amber-500/15 dark:to-orange-500/10 dark:text-amber-300">
                  🔥
                </div>
              </div>
              <div className="mt-5 text-3xl font-black tracking-tight text-slate-900 dark:text-white">7 days</div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">You are ahead of your weekly target by 2 sessions.</p>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.92))] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)] transition-colors duration-300 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.82))] dark:shadow-[0_20px_44px_rgba(2,6,23,0.35)] sm:p-6">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Progress</p>
                <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">This week</h2>
              </div>

              <div className="flex h-28 items-end gap-2 rounded-[20px] bg-slate-50 p-3 dark:bg-slate-800/70">
                {weeklyProgress.map((value, index) => (
                  <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 via-violet-600 to-sky-500 shadow-[0_8px_16px_rgba(99,102,241,0.25)]" style={{ height: `${value}%` }} />
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                    </span>
                  </div>
                ))}
              </div>
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
          </aside>
        </div>

      </div>
    </main>
  );
}
