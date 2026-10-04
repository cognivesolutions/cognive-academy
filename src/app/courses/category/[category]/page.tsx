import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
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

  const session = await auth();
  const purchasedCourseIds = session?.user?.id
    ? new Set(
        (await prisma.enrollment.findMany({
          where: { userId: session.user.id },
          select: { courseId: true },
        })).map((enrollment) => enrollment.courseId),
      )
    : new Set<string>();

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
      offerPrice: true,
      isPromotional: true,
      isBestValue: true,
      promoCode: true,
      currency: true,
      featured: true,
      isNew: true,
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
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-indigo-100/80 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.95),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(216,180,254,0.7),_transparent_30%),linear-gradient(135deg,_rgba(255,255,255,0.94),_rgba(241,245,249,0.92),_rgba(224,231,255,0.88))] p-5 shadow-[0_28px_70px_rgba(15,23,42,0.08)] ring-1 ring-white/60 dark:border-indigo-400/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.94),_rgba(11,18,35,0.96),_rgba(15,23,42,0.92))] dark:shadow-[0_28px_70px_rgba(15,23,42,0.28)] dark:ring-1 dark:ring-white/5 sm:p-6 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.12),_transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.16),_transparent_30%)]" />
          <div className="absolute -right-14 -top-12 h-52 w-52 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/20" />
          <div className="absolute -bottom-16 left-12 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/15" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-12">
            <div>
              <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                Course track
              </span>

              <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] text-slate-900 dark:text-white sm:text-5xl lg:text-[4rem] lg:leading-[1.02]">
                {categoryLabel}
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Learn with structured, expert-led programs designed for real-world outcomes. Choose between high-impact live cohorts and flexible recorded learning paths.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/courses#course-results"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(79,70,229,0.26)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(79,70,229,0.32)]"
                >
                  Browse all courses
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[460px]">
              <div className="absolute -left-8 top-12 h-28 w-28 rounded-full bg-violet-200/70 blur-2xl dark:bg-violet-500/25" aria-hidden="true" />
              <div className="absolute -right-6 bottom-8 h-32 w-32 rounded-full bg-cyan-200/70 blur-2xl dark:bg-cyan-500/25" aria-hidden="true" />

              <div className="group relative rounded-[30px] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.56))] p-4 shadow-[0_28px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-200/80 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(237,233,254,0.7))] hover:shadow-[0_42px_120px_rgba(99,102,241,0.2),0_18px_40px_rgba(15,23,42,0.12)] hover:ring-2 hover:ring-indigo-200/40 dark:border-slate-700/60 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(30,41,59,0.62))] dark:shadow-[0_28px_72px_rgba(15,23,42,0.44)] dark:hover:border-indigo-500/40 dark:hover:bg-[linear-gradient(135deg,rgba(15,23,42,0.84),rgba(49,46,129,0.3))] dark:hover:shadow-[0_42px_120px_rgba(79,70,229,0.18),0_18px_40px_rgba(15,23,42,0.2)] dark:hover:ring-indigo-500/30">
                <div className="rounded-[26px] bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.42),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.18),_transparent_30%),linear-gradient(145deg,_rgba(15,23,42,0.96)_0%,_rgba(17,24,39,0.98)_26%,_rgba(49,46,129,0.9)_100%)] p-5 text-white shadow-[0_28px_60px_rgba(15,23,42,0.38)] ring-1 ring-white/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_34px_72px_rgba(79,70,229,0.28)]">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100/80">
                    <span>Course outcomes</span>
                    <span className="rounded-full border border-white/20 bg-white/5 px-2 py-1">2026</span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {heroStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200/50 hover:bg-white/[0.09] hover:shadow-[0_12px_24px_rgba(99,102,241,0.14)] hover:ring-2 hover:ring-indigo-200/40"
                      >
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-200">
                          <span>{stat.label}</span>
                          <span className="text-lg font-black text-white">{stat.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(248,250,252,0.7))] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-indigo-200/80 group-hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(238,242,255,0.78))] group-hover:shadow-[0_20px_44px_rgba(99,102,241,0.12)] group-hover:ring-2 group-hover:ring-indigo-200/40 dark:border-slate-700/80 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.82))] dark:group-hover:border-indigo-500/40 dark:group-hover:bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(49,46,129,0.3))] dark:group-hover:shadow-[0_20px_44px_rgba(99,102,241,0.12)] dark:group-hover:ring-indigo-500/30">
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

        </section>

        <CategoryResultControls
          liveCourses={liveCourses}
          recordedCourses={recordedCourses}
          pageSize={pageSize}
          currentPage={safePage}
          totalPages={totalPages}
          purchasedCourseIds={purchasedCourseIds}
        />
      </div>
    </main>
  );
}
