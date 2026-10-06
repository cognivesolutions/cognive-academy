"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CourseSelect } from "@/app/admin/components/course-select";

type StudentRecordsFilterBarProps = {
  defaultQ?: string;
  defaultStatus?: string;
  defaultCourse?: string;
  defaultCategory?: string;
  defaultJoined?: string;
  pageSize?: string | number;
  hasActiveFilters?: boolean;
  courseOptions?: Array<{ value: string; label: string }>;
  categoryOptions?: Array<{ value: string; label: string }>;
  joinedOptions?: Array<{ value: string; label: string }>;
};

export function StudentRecordsFilterBar({
  defaultQ = "",
  defaultStatus = "all",
  defaultCourse = "",
  defaultCategory = "all",
  defaultJoined = "all",
  pageSize = "10",
  hasActiveFilters = false,
  courseOptions = [],
  categoryOptions = [],
  joinedOptions = [],
}: StudentRecordsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(defaultQ);
  const [status, setStatus] = useState(defaultStatus);
  const [course, setCourse] = useState(defaultCourse);
  const [category, setCategory] = useState(defaultCategory);
  const [joined, setJoined] = useState(defaultJoined);
  const submitTimerRef = useRef<number | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const parseLocalDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (defaultJoined && defaultJoined !== "all") {
      return parseLocalDate(defaultJoined);
    }
    return new Date();
  });

  useEffect(() => {
    setQ(defaultQ);
  }, [defaultQ]);

  useEffect(() => {
    setStatus(defaultStatus);
  }, [defaultStatus]);

  useEffect(() => {
    setCourse(defaultCourse);
  }, [defaultCourse]);

  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  useEffect(() => {
    setJoined(defaultJoined);
  }, [defaultJoined]);

  useEffect(() => {
    if (joined !== "all") {
      setCalendarMonth(parseLocalDate(joined));
    }
  }, [joined]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        window.clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  const updateFilters = (nextQ: string, nextStatus: string, nextCourse: string, nextCategory: string, nextJoined: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (!nextQ.trim()) {
      params.delete("q");
    } else {
      params.set("q", nextQ.trim());
    }

    if (nextStatus === "all") {
      params.delete("status");
    } else {
      params.set("status", nextStatus);
    }

    if (!nextCourse) {
      params.delete("course");
    } else {
      params.set("course", nextCourse);
    }

    if (nextCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }

    if (nextJoined === "all") {
      params.delete("joined");
    } else {
      params.set("joined", nextJoined);
    }

    params.delete("type");
    params.delete("price");
    params.set("page", "1");
    params.set("pageSize", String(pageSize));

    const targetUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(targetUrl, { scroll: false });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextQ = event.target.value;
    setQ(nextQ);

    if (submitTimerRef.current) {
      window.clearTimeout(submitTimerRef.current);
    }

    submitTimerRef.current = window.setTimeout(() => {
      updateFilters(nextQ, status, course, category, joined);
    }, 250);
  };

  const joinedDateValue = joined === "all" ? "" : joined;
  const formatIstDate = (date: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  const joinedDateLabel = joinedDateValue ? formatIstDate(parseLocalDate(joinedDateValue)) : "Start date";

  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarMonth);
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const monthStartOffset = (monthStart.getDay() + 6) % 7;
  const firstGridDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1 - monthStartOffset);
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDate);
    date.setDate(firstGridDate.getDate() + index);
    return date;
  });

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const selectCalendarDate = (date: Date) => {
    const isoDate = formatLocalDate(date);
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    setJoined(isoDate);
    updateFilters(q, status, course, category, isoDate);
    setIsCalendarOpen(false);
  };

  return (
    <div className="mb-4 flex w-full flex-nowrap items-center justify-between gap-2 overflow-visible rounded-full border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.10),_rgba(255,255,255,0.98)_38%,_rgba(241,245,249,1)_100%)] p-1.5 shadow-[0_18px_32px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_rgba(10,18,31,0.96)_38%,_rgba(2,6,23,1)_100%)] dark:shadow-[0_18px_32px_rgba(15,23,42,0.28)]">
      <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-start gap-2 overflow-visible pr-2">
        {hasActiveFilters ? (
          <Link
            href={{ pathname, query: { page: "1", pageSize: String(pageSize) } }}
            scroll={false}
            className="inline-flex h-[38px] shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-4 py-0 text-sm font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
          >
            Remove filter
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex h-[38px] shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-0 text-sm font-semibold text-slate-400 shadow-[0_6px_16px_rgba(15,23,42,0.04)] opacity-70 transition duration-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
          >
            Remove filter
          </button>
        )}

        <div className="min-w-[142px] shrink-0">
          <CourseSelect
            name="course"
            label="Course"
            placeholder="Course"
            defaultValue={course}
            compact
            syncUrl={false}
            onValueChange={(nextValue) => {
              const normalizedValue = nextValue === "all" ? "" : nextValue;
              setCourse(normalizedValue);
              updateFilters(q, status, normalizedValue, category, joined);
            }}
            triggerClassName="!min-h-[38px] !w-[142px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            menuClassName="!min-w-[142px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
            options={[{ value: "", label: "All" }, ...courseOptions]}
          />
        </div>

        <div className="min-w-[150px] shrink-0">
          <CourseSelect
            name="category"
            label="Category"
            placeholder="Category"
            defaultValue={category}
            compact
            syncUrl={false}
            onValueChange={(nextValue) => {
              const normalizedValue = nextValue === "all" ? "all" : nextValue;
              setCategory(normalizedValue);
              updateFilters(q, status, course, normalizedValue, joined);
            }}
            triggerClassName="!min-h-[38px] !w-[150px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            menuClassName="!min-w-[150px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
            options={[{ value: "all", label: "All" }, ...categoryOptions]}
          />
        </div>

        <div className="relative min-w-[150px] shrink-0" ref={calendarRef}>
          <label className="sr-only" htmlFor="joined-date-filter">Start date</label>
          <div
            className="relative flex h-[38px] w-[150px] cursor-pointer items-center justify-between gap-2 rounded-full border border-slate-200 bg-white/90 px-3 text-sm text-slate-700 transition duration-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
            onClick={() => setIsCalendarOpen((open) => !open)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setIsCalendarOpen((open) => !open);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Start date filter"
          >
            <span className="pointer-events-none flex-1 truncate text-left text-slate-700 dark:text-slate-100">
              {joinedDateLabel}
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="pointer-events-none h-4 w-4 shrink-0 text-slate-500 dark:text-slate-300"
            >
              <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 2.5V6M14 2.5V6M3 8.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {isCalendarOpen && (
            <div className="absolute left-0 top-full z-[60] mt-2 w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_16px_40px_rgba(2,6,23,0.5)]">
              <div className="mb-3 flex items-center justify-between gap-3 text-slate-700 dark:text-slate-200">
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-lg text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  aria-label="Previous month"
                >
                  ←
                </button>
                <div className="text-sm font-semibold tracking-[0.12em] uppercase text-slate-700 dark:text-slate-200">{monthLabel}</div>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-lg text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  aria-label="Next month"
                >
                  →
                </button>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                  <div key={day} className="py-1">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date) => {
                  const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
                  const isSelected = joinedDateValue && formatLocalDate(date) === joinedDateValue;
                  const isToday = formatLocalDate(date) === formatLocalDate(new Date());

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => selectCalendarDate(date)}
                      className={[
                        "flex h-8 items-center justify-center rounded-md text-sm font-medium transition duration-150",
                        isCurrentMonth ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500",
                        isSelected ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200" : "hover:bg-slate-100 dark:hover:bg-slate-800",
                        isToday && !isSelected ? "ring-1 ring-indigo-200 dark:ring-indigo-500/40" : "",
                      ].join(" ")}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsCalendarOpen(false);
                    setJoined("all");
                    updateFilters(q, status, course, category, "all");
                  }}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    selectCalendarDate(today);
                  }}
                  className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  Today
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-[120px] shrink-0">
          <CourseSelect
            name="status"
            label="Status"
            placeholder="All"
            defaultValue={status}
            compact
            syncUrl={false}
            onValueChange={(nextValue) => {
              const normalizedValue = nextValue === "all" ? "all" : nextValue;
              setStatus(normalizedValue);
              updateFilters(q, normalizedValue, course, category, joined);
            }}
            triggerClassName="!min-h-[38px] !w-[120px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            menuClassName="!min-w-[120px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>
      </div>

      <div className="ml-auto flex-shrink-0">
        <div className="flex h-[38px] min-w-[220px] items-center gap-2 rounded-full border border-slate-200 bg-transparent px-3 py-0 text-[0.92rem] text-slate-900 shadow-none transition duration-200 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950/35 dark:text-slate-100 dark:focus-within:bg-slate-950/50">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-400"
          >
            <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12.8 12.8L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={handleSearchChange}
            placeholder="Type to search..."
            className="w-full border-0 bg-transparent text-[0.92rem] text-slate-900 placeholder:text-slate-500 outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>
  );
}
