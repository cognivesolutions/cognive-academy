"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, type ReactNode } from "react";

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
  offerPrice?: number | string | null;
  isPromotional?: boolean | null;
  isBestValue?: boolean | null;
  isNew?: boolean | null;
  featured?: boolean | null;
  imageUrl?: string | null;
  coverImage?: string | null;
  isLive?: boolean | null;
  instructorName?: string | null;
  durationHours?: number | null;
  weeks?: number | null;
  projectCount?: number | null;
  sessionCount?: number | null;
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
  savedCourseIds?: Set<string> | string[];
  searchQuery?: string;
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
  savedCourseIds,
  searchQuery = "",
}: CourseCardProps) {
  const DEFAULT_IMG = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80";
  const imgSrc = course.coverImage ?? course.imageUrl ?? DEFAULT_IMG;
  const resolvedStatus = statusLabel ?? (statusTone === "live" ? "Live" : "Recorded");
  const numericPrice = Number(course.price ?? 0);
  const numericOfferPrice = course.offerPrice !== null && course.offerPrice !== undefined
    ? Number(course.offerPrice)
    : null;
  const showPromotionalOffer = Boolean(
    course.isPromotional && numericOfferPrice !== null && numericOfferPrice > 0 && numericOfferPrice < numericPrice,
  );
  const displayPrice = Number(showPromotionalOffer && numericOfferPrice !== null ? numericOfferPrice : numericPrice);
  const discountPercent = showPromotionalOffer && numericPrice > displayPrice
    ? Math.round(((numericPrice - displayPrice) / numericPrice) * 100)
    : 0;
  const formatPrice = (value: number) => new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  const limitedOfferBadge = showPromotionalOffer ? { label: "Limited-time offer", tone: "limited-offer" } : null;
  const featuredBadge = showFeaturedBadge && course.featured ? { label: "Featured", tone: "featured" } : null;
  const showNewStarBadge = Boolean(course.isNew);
  const highlightText = (value: string | null | undefined, searchTerm: string): ReactNode => {
    const text = value ?? "";
    const trimmedTerm = searchTerm.trim();

    if (!trimmedTerm || !text) {
      return value ?? "";
    }

    const lowerText = text.toLowerCase();
    const lowerTerm = trimmedTerm.toLowerCase();
    const nodes: ReactNode[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const matchIndex = lowerText.indexOf(lowerTerm, startIndex);

      if (matchIndex === -1) {
        nodes.push(text.slice(startIndex));
        break;
      }

      if (matchIndex > startIndex) {
        nodes.push(text.slice(startIndex, matchIndex));
      }

      const matchText = text.slice(matchIndex, matchIndex + trimmedTerm.length);
      nodes.push(
        <mark
          key={`${matchIndex}-${startIndex}`}
          className="rounded-sm bg-amber-100 px-0.5 py-0.5 font-semibold text-slate-900 shadow-[inset_0_0_0_1px_rgba(202,138,4,0.18)] dark:bg-yellow-200 dark:text-slate-900"
        >
          {matchText}
        </mark>,
      );

      startIndex = matchIndex + trimmedTerm.length;
    }

    return nodes.length > 0 ? nodes : value ?? "";
  };
  const { data: session, status } = useSession();
  const [isSaved, setIsSaved] = useState(() => {
    if (!savedCourseIds) return false;
    return (savedCourseIds instanceof Set ? savedCourseIds : new Set(savedCourseIds)).has(course.id);
  });
  const [isHoveringSave, setIsHoveringSave] = useState(false);

  useEffect(() => {
    if (!savedCourseIds) {
      setIsSaved(false);
      return;
    }

    const savedSet = savedCourseIds instanceof Set ? savedCourseIds : new Set(savedCourseIds);
    setIsSaved(savedSet.has(course.id));
  }, [course.id, savedCourseIds]);

  const handleSaveToggle = async () => {
    if (status === "loading") return;

    if (!session?.user?.id) {
      const redirectUrl = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
      window.location.href = `/login?callbackUrl=${redirectUrl}`;
      return;
    }

    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);

    try {
      const response = await fetch("/api/saved-courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          action: nextSavedState ? "save" : "unsave",
        }),
      });

      if (!response.ok) {
        setIsSaved(!nextSavedState);
      }
    } catch (error) {
      setIsSaved(!nextSavedState);
      console.error("Failed to update saved course", error);
    }
  };

  return (
    <article
      key={course.id}
      role="listitem"
      className={`group relative flex h-full min-h-[500px] flex-shrink-0 snap-center flex-col rounded-[18px] border border-slate-200 bg-white p-2.5 shadow-[0_18px_42px_rgba(15,23,42,0.08),0_8px_18px_rgba(59,130,246,0.05)] transition-all duration-300 hover:-translate-y-2 hover:border-indigo-300 hover:shadow-[0_30px_72px_rgba(59,130,246,0.15),0_18px_36px_rgba(15,23,42,0.12)] hover:ring-1 hover:ring-blue-200/60 dark:border-slate-700/75 dark:bg-[linear-gradient(180deg,_rgba(10,15,28,0.96),_rgba(13,19,33,0.96))] dark:shadow-[0_20px_48px_rgba(2,6,23,0.28),0_8px_22px_rgba(59,130,246,0.10)] dark:hover:border-indigo-400/25 ${cardClassName}`}
      style={{ flex: "0 0 calc((100% - 2rem) / 3)", overflow: "visible" }}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-indigo-500/0 via-indigo-400/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_50%_10%,rgba(96,165,250,0.16),transparent_30%)] opacity-0 blur-[2px] transition-all duration-300 group-hover:opacity-100" />

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

          {showNewStarBadge ? (
            <div className="pointer-events-none absolute left-2 top-5 z-30">
              <div className="relative flex items-center">
                <span
                  aria-label="New course"
                  title="New"
                  className="relative block h-9 w-28 overflow-hidden border border-red-50/90 bg-gradient-to-r from-red-700 via-red-500 to-orange-400 shadow-[0_14px_24px_rgba(239,68,68,0.35)]"
                  style={{
                    clipPath: "polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%, 10% 50%)",
                    transform: "translate(-8px, 5px) rotate(-45deg)",
                  }}
                >
                  <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.7),transparent_28%,rgba(255,255,255,0.12))]" />
                  <span className="absolute inset-y-0 left-0 w-[2px] bg-white/80" />
                  <span className="absolute inset-x-0 top-0 h-[2px] bg-white/50" />
                  <span className="relative flex h-full items-center justify-center text-[20px] font-black uppercase tracking-[0.32em] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                    NEW
                  </span>
                </span>
              </div>
            </div>
          ) : null}

          {featuredBadge ? (
            <div className="absolute right-12 top-2.5 z-10">
              <span className="rounded-full border border-amber-300/60 bg-gradient-to-r from-yellow-100 via-amber-50 to-orange-100 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-800 shadow-[0_0_0_1px_rgba(251,191,36,0.12)] dark:border-amber-400/30 dark:from-amber-500/15 dark:via-yellow-500/10 dark:to-orange-500/15 dark:text-amber-200">
                {featuredBadge.label}
              </span>
            </div>
          ) : null}

          <button
            type="button"
            aria-label={isSaved ? "Remove course from saved list" : "Save this course"}
            aria-pressed={isSaved}
            onMouseEnter={() => setIsHoveringSave(true)}
            onMouseLeave={() => setIsHoveringSave(false)}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void handleSaveToggle();
            }}
            className={`absolute right-2.5 top-2.5 z-20 inline-flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
              isSaved || isHoveringSave ? "text-red-500" : "text-slate-700 dark:text-slate-200"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isSaved || isHoveringSave ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6 drop-shadow-[0_2px_8px_rgba(15,23,42,0.25)] transition-all duration-200"
              aria-hidden="true"
            >
              <path d="M12 20.25s-7.5-4.35-9.33-8.29C1.35 9.28 3.03 5.25 7.2 5.25c2.08 0 3.27 1.1 4.08 2.1.81-1 .99-2.1 4.08-2.1 4.17 0 5.85 4.03 4.53 6.71C19.5 15.9 12 20.25 12 20.25Z" />
            </svg>
          </button>

          {limitedOfferBadge ? (
            <div className="absolute bottom-2.5 right-2.5 z-10">
              <span className="group relative inline-flex items-center gap-1 overflow-hidden rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-200/70 via-yellow-100/60 to-orange-100/60 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-900 shadow-[0_4px_12px_rgba(245,158,11,0.12)] dark:border-amber-500/30 dark:from-amber-500/20 dark:via-yellow-500/15 dark:to-orange-500/15 dark:text-yellow-50">
                <span
                  className="pointer-events-none absolute inset-0 opacity-70 animate-[chipShimmer_4s_linear_infinite]"
                  style={{
                    backgroundImage:
                      "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.55) 24%, rgba(255,255,255,0.14) 38%, transparent 54%)",
                    backgroundSize: "240% 100%",
                  }}
                />
                <span className="relative z-10 inline-flex items-center gap-1">
                  <span aria-hidden="true">★</span>
                  {limitedOfferBadge.label}
                </span>
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                statusTone === "live"
                  ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-700/80 dark:text-slate-200"
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  statusTone === "live" ? "animate-pulse bg-emerald-500 dark:bg-emerald-400" : "bg-slate-500 dark:bg-slate-300"
                }`}
              />
              {resolvedStatus}
            </span>

            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200">
              {course.level || "Beginner"}
            </span>
          </div>

          <h2 className="mt-2 min-h-[56px] text-[1.7rem] font-black leading-[1.08] tracking-[-0.04em] text-slate-900 dark:text-slate-50">
            {highlightText(course.title, searchQuery)}
          </h2>
          <p className="mt-1 min-h-[62px] flex-1 pb-3 text-[0.9rem] leading-5 text-slate-600 dark:text-slate-300">
            {highlightText(course.shortDescription ?? course.description, searchQuery)}
          </p>

          <div className="mt-0 grid grid-cols-2 gap-1.5 text-[10px] leading-none text-slate-700 dark:text-slate-200">
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
                <span className="text-[9px] font-semibold tracking-[0.08em] text-slate-500 dark:text-slate-300">
                  {metric.label}
                </span>
              </span>
            ))}
          </div>

          {showPrice || action ? (
            <div className="mt-auto pt-2">
              <div className="rounded-[14px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] p-2.5 dark:border-slate-700/80 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.8),rgba(30,41,59,0.72))]">
                <div className="flex items-center justify-between gap-2">
                  {showPrice ? (
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.522 flex items-center justify-between gap-1.52">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Price</div>
                        {showPromotionalOffer ? (
                          <span className="inline-flex translate-y-0.5 items-center rounded-full border border-emerald-200/80 bg-gradient-to-r from-emerald-300/80 via-green-300/80 to-lime-200/80 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-emerald-950 shadow-[0_8px_16px_rgba(16,185,129,0.18)] backdrop-blur-sm dark:border-emerald-400/30 dark:from-emerald-500/30 dark:via-green-500/25 dark:to-lime-400/20 dark:text-emerald-50">
                            Save {discountPercent}%
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xl font-black tracking-[-0.04em] text-slate-900 dark:text-slate-50 sm:text-2xl">
                          ₹{formatPrice(displayPrice)}
                        </span>
                        {showPromotionalOffer ? (
                          <span className="text-xs text-slate-400 line-through decoration-slate-400/80">
                            ₹{formatPrice(numericPrice)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {action ? <div className="ml-auto shrink-0">{action}</div> : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
