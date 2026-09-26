import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { AnimatedValue } from "@/components/animated-stat-card";
import { BackToTopButton } from "@/components/back-to-top";

const formatCategory = (value?: string | null) => {
  const raw = value?.trim();
  if (!raw) return "General";

  const normalized = raw.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const key = normalized.toLowerCase();

  const overrides: Record<string, string> = {
    "powr bi": "Power BI",
    "power bi": "Power BI",
    python: "Python",
    sql: "SQL",
    excel: "Excel",
    react: "React",
    django: "Django",
    git: "Git",
    mysql: "MySQL",
  };

  if (overrides[key]) return overrides[key];

  return normalized
    .split(" ")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""))
    .join(" ");
};

export const revalidate = 300;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const activeType = typeof resolvedSearchParams.type === "string" ? resolvedSearchParams.type.toLowerCase() : "all";
  const activeCategory = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : "All";
  const rawQuery = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim() : "";

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      description: true,
      category: true,
      level: true,
      price: true,
      currency: true,
      featured: true,
      imageUrl: true,
      instructorName: true,
      previewLectureUrl: true,
      durationHours: true,
    },
  });

  const categoryFilters = ["All", ...Array.from(new Set(courses.map((course) => formatCategory(course.category))))];

  const filteredCourses = courses.filter((course) => {
    const courseCategory = formatCategory(course.category);
    const searchText = [
      course.title,
      course.shortDescription ?? "",
      course.description,
      courseCategory,
      course.level,
      course.instructorName,
    ]
      .join(" ")
      .toLowerCase();

    const matchesType = activeType === "all" || activeType === "live" || activeType === "recorded" || activeType === "all-programs";
    const matchesCategory = activeCategory === "All" || courseCategory === activeCategory;
    const matchesQuery = !rawQuery || searchText.includes(rawQuery.toLowerCase());

    return matchesType && matchesCategory && matchesQuery;
  });

  const stats = [
    { label: "Career-ready programs", value: 10, suffix: "+" },
    { label: "Projects built", value: 40, suffix: "+" },
    { label: "Mentor support", value: "Weekly" },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_32%,_#f8fafc_100%)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_26%),linear-gradient(180deg,_#020817_0%,_#0f172a_36%,_#111827_100%)] dark:text-slate-50">
      <BackToTopButton />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_24%),linear-gradient(135deg,_#f8fbff_0%,_#f5f3ff_48%,_#eef7ff_100%)] pb-12 pt-12 sm:pt-16 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(135deg,_#020817_0%,_#111827_48%,_#0f172a_100%)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-12">
            <div>
              <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                Course catalog
              </span>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] text-slate-900 dark:text-white sm:text-5xl lg:text-[4rem] lg:leading-[1.02]">
                Practice skills that move your career forward.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Explore structured programs built around real portfolio work, mentor feedback, and role-ready execution.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="#course-results" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(79,70,229,0.26)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(79,70,229,0.32)]">
                  Explore programs
                </Link>
                <Link href="/contact-us#contact-hero" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-[0_10px_20px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-indigo-500/40 dark:hover:bg-slate-800">
                  Talk to us
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[460px]">
              <div className="absolute -left-8 top-12 h-28 w-28 rounded-full bg-violet-200/70 blur-2xl dark:bg-violet-500/25" aria-hidden="true" />
              <div className="absolute -right-6 bottom-8 h-32 w-32 rounded-full bg-cyan-200/70 blur-2xl dark:bg-cyan-500/25" aria-hidden="true" />

              <div className="group relative rounded-[30px] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.56))] p-4 shadow-[0_28px_70px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-200/80 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(237,233,254,0.7))] hover:shadow-[0_42px_120px_rgba(99,102,241,0.2),0_18px_40px_rgba(15,23,42,0.12)] hover:ring-2 hover:ring-indigo-200/40 dark:border-slate-700/60 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(30,41,59,0.62))] dark:shadow-[0_28px_72px_rgba(15,23,42,0.44),inset_0_1px_0_rgba(148,163,184,0.12)] dark:hover:border-indigo-500/40 dark:hover:bg-[linear-gradient(135deg,rgba(15,23,42,0.84),rgba(49,46,129,0.3))] dark:hover:shadow-[0_42px_120px_rgba(79,70,229,0.18),0_18px_40px_rgba(15,23,42,0.2)] dark:hover:ring-indigo-500/30">
                <div className="rounded-[26px] bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.42),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.18),_transparent_30%),linear-gradient(145deg,_rgba(15,23,42,0.96)_0%,_rgba(17,24,39,0.98)_26%,_rgba(49,46,129,0.9)_100%)] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_28px_60px_rgba(15,23,42,0.38)] ring-1 ring-white/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_34px_72px_rgba(79,70,229,0.28)]">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100/80">
                    <span>Career outcomes</span>
                    <span className="rounded-full border border-white/20 bg-white/5 px-2 py-1">2026</span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {stats.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200/50 hover:bg-white/[0.09] hover:shadow-[0_12px_24px_rgba(99,102,241,0.14)] hover:ring-2 hover:ring-indigo-200/40 dark:hover:border-indigo-400/40 dark:hover:ring-indigo-500/35">
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-200">
                          <span>{item.label}</span>
                          <span className="text-lg font-black text-white">
                            {typeof item.value === "number" ? (
                              <AnimatedValue value={item.value} suffix={item.suffix ?? ""} />
                            ) : (
                              item.value
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(248,250,252,0.7))] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-indigo-200/80 group-hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(238,242,255,0.78))] group-hover:shadow-[0_20px_44px_rgba(99,102,241,0.12)] group-hover:ring-2 group-hover:ring-indigo-200/40 dark:border-slate-700/80 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.82))] dark:group-hover:border-indigo-500/40 dark:group-hover:bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(49,46,129,0.3))] dark:group-hover:shadow-[0_20px_44px_rgba(99,102,241,0.12)] dark:group-hover:ring-indigo-500/30">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">What you get</div>
                      <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">Real projects. Faster momentum.</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-700 shadow-[0_8px_18px_rgba(16,185,129,0.18)] transition-all duration-300 group-hover:scale-105 dark:bg-emerald-500/10 dark:text-emerald-300">✓</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="course-results" className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Featured programs</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Choose the path that fits your next career move.
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "All programs", value: "all" },
              { label: "Live", value: "live" },
              { label: "Recorded", value: "recorded" },
            ].map((tab) => {
              const isActive = activeType === tab.value;
              return (
                <Link
                  key={tab.value}
                  href={{ pathname: "/courses", query: { ...(activeCategory !== "All" ? { category: activeCategory } : {}), type: tab.value } }}
                  className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                    isActive
                      ? "border-indigo-200 bg-indigo-600 text-white shadow-[0_12px_24px_rgba(99,102,241,0.28)] ring-2 ring-indigo-200/50 dark:border-indigo-500/40 dark:bg-indigo-500 dark:text-white dark:ring-indigo-500/35"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-[0_12px_24px_rgba(99,102,241,0.12)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200 dark:hover:shadow-[0_12px_24px_rgba(99,102,241,0.12)]"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categoryFilters.map((category) => {
            const isActive = activeCategory === category;
            return (
              <Link
                key={category}
                href={{
                  pathname: "/courses",
                  query: {
                    ...(rawQuery ? { q: rawQuery } : {}),
                    ...(category === "All" ? {} : { category }),
                    type: activeType,
                  },
                }}
                className={`inline-flex items-center rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                  isActive
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-[0_10px_18px_rgba(79,70,229,0.12)] ring-2 ring-indigo-200/50 dark:border-indigo-500/40 dark:bg-slate-800 dark:text-indigo-200 dark:ring-indigo-500/25"
                    : "border-slate-200 bg-white/70 text-slate-600 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-[0_10px_18px_rgba(79,70,229,0.08)] dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200 dark:hover:shadow-[0_10px_18px_rgba(99,102,241,0.12)]"
                }`}
              >
                {category}
              </Link>
            );
          })}
        </div>

        {rawQuery ? (
          <div className="mb-6 text-sm text-slate-600 dark:text-slate-300">
            Showing results for <span className="font-semibold text-slate-900 dark:text-white">“{rawQuery}”</span>
          </div>
        ) : null}

        {filteredCourses.length > 0 ? (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <article
                key={course.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-2 hover:border-indigo-200/80 hover:shadow-[0_28px_60px_rgba(99,102,241,0.15),0_18px_40px_rgba(15,23,42,0.08)] hover:ring-2 hover:ring-indigo-200/60 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_42px_rgba(15,23,42,0.3)] dark:hover:border-indigo-500/40 dark:hover:shadow-[0_26px_52px_rgba(99,102,241,0.18),0_18px_36px_rgba(15,23,42,0.22)] dark:hover:ring-indigo-500/35"
              >
                <div className="mb-4 overflow-hidden rounded-[20px] bg-slate-100 ring-1 ring-slate-200 transition-all duration-300 group-hover:ring-indigo-200/60 dark:bg-slate-800 dark:ring-slate-700 dark:group-hover:ring-indigo-500/40">
                  {course.imageUrl ? (
                    <img src={course.imageUrl} alt={course.title} className="h-48 w-full object-cover transition-all duration-500 group-hover:scale-[1.04] group-hover:brightness-[1.02]" />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-indigo-100 via-violet-100 to-sky-100 text-sm font-semibold text-indigo-700 transition-all duration-300 group-hover:scale-[1.02] dark:from-indigo-500/20 dark:via-violet-500/15 dark:to-sky-500/15 dark:text-indigo-200">
                      {formatCategory(course.category)}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                    {formatCategory(course.category)}
                  </span>
                  {course.featured ? (
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-300">Featured</span>
                  ) : null}
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{course.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {course.shortDescription ?? course.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">{course.level}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">{course.durationHours ?? 0} hrs</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">{course.instructorName}</span>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 pt-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Price</div>
                    <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      ₹{Number(course.price).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(99,102,241,0.32)] hover:ring-2 hover:ring-indigo-200/60"
                  >
                    View course
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">No courses match your filters</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">Try another search term or reset the category filters.</p>
            <Link
              href="/courses"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(99,102,241,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(99,102,241,0.28)] hover:ring-2 hover:ring-indigo-200/50"
            >
              Reset filters
            </Link>
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_18px_40px_rgba(15,23,42,0.25)] md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">Need help choosing?</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-[2.2rem] lg:leading-tight">
                  Talk to an advisor and find the program that matches your next move.
                </h2>
              </div>

              <div className="flex flex-wrap justify-center gap-3 sm:justify-end">
                <Link href="/courses" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-[0_12px_28px_rgba(99,102,241,0.12)] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-indigo-500/40 dark:hover:text-indigo-200 dark:hover:shadow-[0_12px_28px_rgba(99,102,241,0.12)]">
                  Explore courses
                </Link>
                <Link href="/contact-us#contact-hero" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_12px_28px_rgba(15,23,42,0.16)] hover:ring-2 hover:ring-indigo-200/40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:hover:ring-indigo-500/30">
                  Talk to an advisor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
