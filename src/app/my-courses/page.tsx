import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const tabs = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Live", value: "live" },
  { label: "Recorded", value: "recorded" },
] as const;

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const activeTab = typeof resolvedSearchParams.tab === "string" ? resolvedSearchParams.tab.toLowerCase() : "all";
  const rawQuery = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim() : "";

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  const normalizedCourses = enrollments.map((enrollment) => {
    const course = enrollment.course;
    const progress = enrollment.accessGranted ? 72 + (enrollment.createdAt.getTime() % 18) : 0;
    const type = course.isLive ? "Live" : "Recorded";
    const tag = course.isLive ? "Live" : "Recorded";

    return {
      ...enrollment,
      course,
      progress: Math.min(100, Math.max(0, progress)),
      type,
      tag,
    };
  });

  const filteredCourses = normalizedCourses.filter((item) => {
    const haystack = [
      item.course.title,
      item.course.shortDescription ?? "",
      item.course.category,
      item.course.level,
      item.course.instructorName,
      item.type,
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !rawQuery || haystack.includes(rawQuery.toLowerCase());

    switch (activeTab) {
      case "active":
        return matchesQuery && item.progress < 100;
      case "completed":
        return matchesQuery && item.progress >= 100;
      case "live":
        return matchesQuery && item.type === "Live";
      case "recorded":
        return matchesQuery && item.type === "Recorded";
      default:
        return matchesQuery;
    }
  });

  const activeCount = normalizedCourses.filter((item) => item.progress < 100).length;
  const completedCount = normalizedCourses.filter((item) => item.progress >= 100).length;
  const averageProgress = normalizedCourses.length
    ? Math.round(normalizedCourses.reduce((sum, item) => sum + item.progress, 0) / normalizedCourses.length)
    : 0;
  const nextLiveCourse = normalizedCourses.find((item) => item.type === "Live") ?? normalizedCourses[0];

  const buildHref = (tab: string) => {
    const params = new URLSearchParams();
    if (rawQuery) params.set("q", rawQuery);
    if (tab !== "all") params.set("tab", tab);
    const query = params.toString();
    return query ? `/my-courses?${query}` : "/my-courses";
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="mb-6 overflow-hidden rounded-[30px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_28%),linear-gradient(135deg,_#0f172a_0%,_#1e1b4b_52%,_#312e81_100%)] p-5 text-white shadow-[0_28px_70px_rgba(79,70,229,0.2)] dark:border-slate-700 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-indigo-200">Learning hub</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">My courses</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/courses#course-results" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">
                Browse catalog
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">Enrolled</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{normalizedCourses.length}</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Courses in your plan</div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">Active</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{activeCount}</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Still in progress</div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">Completed</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{completedCount}</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Finished this far</div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">Avg. progress</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{averageProgress}%</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{nextLiveCourse ? nextLiveCourse.course.title : "Keep going"}</div>
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <Link
                    key={tab.value}
                    href={buildHref(tab.value)}
                    scroll={false}
                    className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-[0_12px_24px_rgba(99,102,241,0.2)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            <div className="w-full max-w-md">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                <span className="sr-only">Search courses</span>
                <input
                  defaultValue={rawQuery}
                  name="q"
                  formAction={"/my-courses"}
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Search your courses"
                />
              </label>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">No courses match this view</div>
              <p className="mt-2 text-sm">Try a different filter or browse more courses in the catalog.</p>
              <Link href="/courses#course-results" className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                Explore catalog
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((item) => {
                const openCourseHref = item.course.isLive ? `/courses/${item.course.slug}/live` : `/courses/${item.course.slug}`;

                return (
                  <article key={item.id} className="group flex h-full flex-col rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.9),_rgba(241,245,249,0.96))] p-4 shadow-[0_12px_24px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_36px_rgba(99,102,241,0.08)] dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(30,41,59,0.8))] dark:hover:border-indigo-500/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                        {item.type}
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        {item.progress}%
                      </span>
                    </div>

                    <div className="mt-4 flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.course.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {item.course.shortDescription ?? "Continue your learning plan and build real-world outcomes."}
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <span>Progress</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span>{item.course.level}</span>
                      <span>{item.course.category}</span>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <Link
                        href={openCourseHref}
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                      >
                        Open course
                      </Link>
                      <Link
                        href={`/courses/${item.course.slug}#curriculum`}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
                      >
                        Syllabus
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
