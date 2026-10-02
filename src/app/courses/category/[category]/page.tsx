import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import CategoryResultControls from "./category-result-controls";

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
  searchParams?: Promise<{ type?: string; lang?: string; page?: string }> | { type?: string; lang?: string; page?: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const categorySlug = decodeURIComponent(resolvedParams.category ?? "");
  const requestedType = resolvedSearchParams.type === "recorded" ? "recorded" : "live";
  const requestedLang = resolvedSearchParams.lang === "hi" ? "hi" : "en";
  const requestedPage = (() => {
    const rawValue = typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : "1";
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  })();

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
      modules: {
        select: {
          lectures: {
            select: {
              durationSeconds: true,
            },
          },
        },
      },
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

  const visibleCourses = (requestedType === "recorded" ? recordedCourses : liveCourses).filter((course) => {
    const language = normalizeLanguage((course as any).language ?? (course as any).lang ?? (course as any).locale);
    return requestedLang === "hi" ? language === "hi" : language === "en";
  });
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(visibleCourses.length / pageSize));
  const safePage = Math.min(Math.max(1, requestedPage), totalPages);

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
                href="/courses#course-results"
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

        <CategoryResultControls
          liveCourses={liveCourses}
          recordedCourses={recordedCourses}
          pageSize={pageSize}
          currentPage={safePage}
          totalPages={totalPages}
        />
      </div>
    </main>
  );
}
