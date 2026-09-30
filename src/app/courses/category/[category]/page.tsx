import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

const slugifyCategory = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getCategorySlugVariants = (value: string) => {
  const normalized = value.trim();
  const variants = new Set<string>();

  const candidates = [
    normalized,
    normalized.replace(/&/g, "and"),
    normalized.replace(/\s+and\s+/gi, " "),
    normalized.replace(/\s*\([^)]*\)/g, "").trim(),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    variants.add(slugifyCategory(candidate));
  }

  if (/data\s+structure.*algorithm|data\s+structures.*algorithm/i.test(normalized)) {
    variants.add("data-structure-algorithms");
    variants.add("data-structure-and-algorithms");
    variants.add("data-structures-and-algorithms");
    variants.add("data-structures-and-algorithms-dsa");
  }

  return variants;
};

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

export default async function CategoryCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }> | { category: string };
  searchParams?: Promise<{ type?: string; lang?: string }> | { type?: string; lang?: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const categorySlug = decodeURIComponent(resolvedParams.category ?? "");
  const requestedType = resolvedSearchParams.type === "recorded" ? "recorded" : "live";
  const requestedLang = resolvedSearchParams.lang === "hi" ? "hi" : "en";

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
      durationHours: true,
      isLive: true,
      language: true,
      createdAt: true,
    },
  });

  const categoryOptions = Array.from(new Set(courses.map((course) => formatCategory(course.category))));

  const categoryLabel =
    categoryOptions.find((category) => {
      const slugVariants = getCategorySlugVariants(category);
      return slugVariants.has(categorySlug);
    }) ?? null;

  if (!categoryLabel) {
    notFound();
  }

  const normalizeLanguage = (value?: string | null) => {
    const raw = (value ?? "").trim().toLowerCase();
    if (!raw) return "en";
    if (raw.startsWith("hi")) return "hi";
    return "en";
  };

  const categoryCourses = courses
    .filter((course) => formatCategory(course.category) === categoryLabel)
    .filter((course) => {
      const language = normalizeLanguage((course as any).language ?? (course as any).lang ?? (course as any).locale);
      const hasExplicitLanguage = Boolean((course as any).language ?? (course as any).lang ?? (course as any).locale);
      if (!hasExplicitLanguage) return requestedLang === "en";
      return requestedLang === "hi" ? language === "hi" : language === "en";
    })
    .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || Number(new Date(b.createdAt ?? 0)) - Number(new Date(a.createdAt ?? 0)));

  const liveCourses = categoryCourses.filter((course) => Boolean(course.isLive));
  const recordedCourses = categoryCourses.filter((course) => !course.isLive);
  const visibleCourses = requestedType === "recorded" ? recordedCourses : liveCourses;

  const tabs = [
    { label: "Live", value: "live", href: `/courses/category/${categorySlug}?type=live&lang=${requestedLang}` },
    { label: "Recorded", value: "recorded", href: `/courses/category/${categorySlug}?type=recorded&lang=${requestedLang}` },
  ];

  const languageTabs = [
    { label: "English", value: "en" },
    { label: "Hindi", value: "hi" },
  ];

  const heroStats = [
    { label: "Courses", value: String(categoryCourses.length) },
    { label: "Live", value: String(liveCourses.length) },
    { label: "Recorded", value: String(recordedCourses.length) },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_32%,_#f8fafc_100%)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_26%),linear-gradient(180deg,_#020817_0%,_#0f172a_36%,_#111827_100%)] dark:text-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-indigo-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(239,246,255,0.96),rgba(224,231,255,0.94))] p-6 shadow-[0_28px_90px_rgba(79,70,229,0.12)] dark:border-slate-700 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.98),rgba(30,41,59,0.92))] sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.16),_transparent_30%)]" />
          <div className="absolute -right-14 -top-12 h-52 w-52 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/20" />
          <div className="absolute -bottom-16 left-12 h-56 w-56 rounded-full bg-sky-300/15 blur-3xl dark:bg-sky-500/15" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-700 shadow-sm backdrop-blur-sm dark:border-indigo-500/30 dark:bg-slate-900/60 dark:text-indigo-200">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Course track
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-[-0.06em] text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                {categoryLabel}
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                Learn with structured, expert-led programs designed for real-world outcomes. Choose between high-impact live cohorts and flexible recorded learning paths.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(79,70,229,0.26)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(79,70,229,0.32)]"
              >
                Browse all courses
              </Link>
            </div>
          </div>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/55">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{stat.label}</div>
                <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200/80 bg-white/70 p-3 shadow-[0_16px_44px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/55">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {tabs.map((tab) => {
                const active = tab.value === requestedType;
                return (
                  <Link
                    key={tab.value}
                    href={tab.href}
                    className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out ${
                      active
                        ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 text-white shadow-[0_12px_24px_rgba(99,102,241,0.28)] ring-2 ring-indigo-200/50 dark:ring-indigo-500/35"
                        : "bg-white/70 text-slate-600 hover:text-slate-900 hover:bg-white dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/85 p-1 backdrop-blur-sm dark:bg-slate-900/70">
              {languageTabs.map((option) => {
                const active = requestedLang === option.value;
                return (
                  <Link
                    key={option.value}
                    href={`/courses/category/${categorySlug}?type=${requestedType}&lang=${option.value}`}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ease-out ${
                      active
                        ? "bg-white/80 text-slate-900 shadow-[0_8px_22px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/80 backdrop-blur-md dark:bg-slate-800/80 dark:text-white dark:shadow-[0_10px_26px_rgba(15,23,42,0.42)] dark:ring-slate-700/90"
                        : "text-slate-600 hover:-translate-y-0.5 hover:bg-white/70 hover:text-slate-900 hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)] hover:ring-1 hover:ring-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white dark:hover:shadow-[0_8px_22px_rgba(15,23,42,0.3)] dark:hover:ring-slate-700/70"
                    }`}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {visibleCourses.length === 0 ? (
          <div className="mt-8 rounded-[26px] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            No {requestedType} courses available in this track yet.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course) => {
              const imgSrc = course.imageUrl ?? "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80";
              const detailHref = course.isLive ? `/courses/${course.slug}/live` : `/courses/${course.slug}`;

              return (
                <article
                  key={course.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.96))] p-4 shadow-[0_18px_44px_rgba(15,23,42,0.06)] transition-all duration-500 ease-out will-change-transform hover:-translate-y-3 hover:border-indigo-200/80 hover:shadow-[0_32px_80px_rgba(79,70,229,0.18)] dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(17,24,39,0.98))] dark:shadow-[0_18px_48px_rgba(15,23,42,0.34)]"
                >
                  <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:via-indigo-400/80" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.42),_transparent_35%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.2),_transparent_35%)]" />

                  <div className="relative mb-4 overflow-hidden rounded-[22px] bg-slate-100 ring-1 ring-slate-200 transition-all duration-500 group-hover:ring-indigo-200/80 dark:bg-slate-800 dark:ring-slate-700 dark:group-hover:ring-indigo-500/30">
                    <img
                      src={imgSrc}
                      alt={course.title}
                      className="block h-52 w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:brightness-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-white/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200">
                      {formatCategory(course.category)}
                    </div>
                    {course.featured ? (
                      <div className="absolute right-3 top-3 rounded-full border border-amber-200 bg-amber-100 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-amber-700 shadow-[0_8px_18px_rgba(245,158,11,0.18)] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                        Featured
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.17em] ${course.isLive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                        <span className={`h-2 w-2 shrink-0 rounded-full ${course.isLive ? "animate-pulse bg-emerald-500 dark:bg-emerald-400" : "bg-slate-500 dark:bg-slate-400"}`} />
                        {course.isLive ? "Live" : "Recorded"}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{course.level ?? "Beginner"}</span>
                    </div>

                    <h2 className="mt-3 min-h-[66px] text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">{course.title}</h2>
                    <p className="mt-2 min-h-[82px] flex-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                      {course.shortDescription ?? course.description}
                    </p>

                    <div className="mt-2 flex min-h-[26px] flex-wrap items-center gap-1 text-[10px] leading-none text-slate-600 dark:text-slate-300">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-[2px] dark:border-slate-700 dark:bg-slate-800">{course.durationHours ?? 0} hrs</span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-[2px] dark:border-slate-700 dark:bg-slate-800">{course.instructorName ?? "Expert-led"}</span>
                    </div>

                    <div className="mt-auto pt-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Price</div>
                            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">₹{Number(course.price).toLocaleString("en-IN")}</div>
                          </div>

                          <Link
                            href={detailHref}
                            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(99,102,241,0.32)]"
                          >
                            View course
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
