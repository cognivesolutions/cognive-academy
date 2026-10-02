"use client";

import type { ReactNode } from "react";

import { getCourseMetricCards } from "@/lib/course-metrics";

export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  category?: string | null;
  level?: string | null;
  price?: number | string | null;
  featured?: boolean | null;
  imageUrl?: string | null;
  coverImage?: string | null;
  isLive?: boolean | null;
  instructorName?: string | null;
  durationHours?: number | null;
  language?: string | null;
  modules?: Array<{
    lectures?: Array<{
      durationSeconds?: number | null;
    } | null> | null;
  } | null>;
};

type CourseCardProps = {
  course: CourseCardData;
  statusLabel?: string;
  statusTone?: "live" | "recorded";
  showCategoryBadge?: boolean;
  showFeaturedBadge?: boolean;
  cardClassName?: string;
  action?: ReactNode;
  showPrice?: boolean;
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

export function CourseCard({
  course,
  statusLabel,
  statusTone = "live",
  showCategoryBadge = true,
  showFeaturedBadge = true,
  cardClassName = "",
  action,
  showPrice = true,
}: CourseCardProps) {
  const DEFAULT_IMG = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80";
  const imgSrc = course.coverImage ?? course.imageUrl ?? DEFAULT_IMG;
  const resolvedStatus = statusLabel ?? (statusTone === "live" ? "Live" : "Recorded");

  return (
    <article
      key={course.id}
      role="listitem"
      className={`group relative flex h-full min-h-[500px] flex-shrink-0 snap-center flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white p-2.5 shadow-[0_18px_42px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_18px_34px_rgba(59,130,246,0.08),0_12px_24px_rgba(15,23,42,0.12)] hover:ring-1 hover:ring-indigo-400/10 dark:border-slate-700/75 dark:bg-[linear-gradient(180deg,_rgba(10,15,28,0.96),_rgba(13,19,33,0.96))] dark:shadow-[0_18px_42px_rgba(2,6,23,0.28)] dark:hover:border-indigo-400/25 ${cardClassName}`}
      style={{ flex: "0 0 calc((100% - 2rem) / 3)" }}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-indigo-500/0 via-indigo-400/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(129,140,248,0.06),transparent_30%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="relative mb-2 overflow-hidden rounded-[15px] border border-slate-200 bg-slate-100 transition-all duration-300 group-hover:border-indigo-300 dark:border-slate-700/70 dark:bg-slate-800/80 dark:group-hover:border-indigo-400/35">
          <img
            src={imgSrc}
            alt={course.title}
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (target.src !== DEFAULT_IMG) target.src = DEFAULT_IMG;
            }}
            className="block h-[188px] w-full object-cover transition-all duration-500 group-hover:scale-[1.04] group-hover:brightness-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

          {showCategoryBadge ? (
            <div className="absolute left-2.5 top-2.5">
              <span className="rounded-full border border-slate-200/70 bg-white/80 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100">
                {formatCategory(course.category)}
              </span>
            </div>
          ) : null}

          {showFeaturedBadge && course.featured ? (
            <div className="absolute right-2.5 top-2.5">
              <span className="rounded-full border border-amber-300/40 bg-amber-100 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-800 shadow-sm dark:border-amber-300/30 dark:bg-amber-500/10 dark:text-amber-200">
                Featured
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                statusTone === "live"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-700/80 dark:text-slate-200"
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  statusTone === "live" ? "animate-pulse bg-emerald-500 dark:bg-emerald-400" : "bg-slate-400"
                }`}
              />
              {resolvedStatus}
            </span>

            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{course.level || "Beginner"}</span>
          </div>

          <h2 className="mt-2 min-h-[56px] text-[1.7rem] font-black leading-[1.08] tracking-[-0.04em] text-slate-900 dark:text-slate-50">
            {course.title}
          </h2>
          <p className="mt-1 min-h-[62px] flex-1 text-[0.9rem] leading-5 text-slate-600 dark:text-slate-300">
            {course.shortDescription ?? course.description}
          </p>

          <div className="-mt-1 grid grid-cols-2 gap-1.5 text-[10px] leading-none text-slate-700 dark:text-slate-200">
            {getCourseMetricCards(course).map((metric) => (
              <span
                key={`${course.id}-${metric.label}`}
                className="inline-flex w-fit max-w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-[5px] shadow-[0_4px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 dark:border-slate-700/80 dark:bg-slate-900/55 dark:ring-slate-800/90 dark:shadow-[0_4px_12px_rgba(15,23,42,0.12)] dark:hover:border-indigo-400/35"
              >
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 p-0 text-[10px] font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                  {metric.icon}
                </span>
                <span className="font-black leading-none text-slate-900 dark:text-slate-50" style={{ fontSize: "11px", lineHeight: 1 }}>
                  {metric.value}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                  {metric.label}
                </span>
              </span>
            ))}
          </div>

          {showPrice || action ? (
            <div className="mt-auto pt-2.5">
              <div className="rounded-[14px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] p-2.5 dark:border-slate-700/80 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.8),rgba(30,41,59,0.72))]">
                <div className="flex items-center justify-between gap-2">
                  {showPrice ? (
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Price</div>
                      <div className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-50">
                        ₹{Number(course.price).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ) : null}

                  {action ? <div className="ml-auto">{action}</div> : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
