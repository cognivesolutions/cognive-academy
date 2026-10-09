"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type DateRangeFilterFieldProps = {
  name: "startDate" | "endDate";
  defaultValue?: string;
  label: string;
};

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatIstDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

export function TransactionsDateRangeFilterField({ name, defaultValue = "", label }: DateRangeFilterFieldProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(defaultValue);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (defaultValue) {
      return parseLocalDate(defaultValue);
    }
    return new Date();
  });

  useEffect(() => {
    setSelectedDate(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (selectedDate) {
      setCalendarMonth(parseLocalDate(selectedDate));
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateFilter = (nextValue: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (!nextValue) {
      params.delete(name);
    } else {
      params.set(name, nextValue);
    }

    params.set("page", "1");

    const targetUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(targetUrl, { scroll: false });
  };

  const labelText = selectedDate ? formatIstDate(parseLocalDate(selectedDate)) : label;
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarMonth);
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const monthStartOffset = (monthStart.getDay() + 6) % 7;
  const firstGridDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1 - monthStartOffset);
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDate);
    date.setDate(firstGridDate.getDate() + index);
    return date;
  });

  const selectCalendarDate = (date: Date) => {
    const isoDate = formatLocalDate(date);
    setSelectedDate(isoDate);
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    updateFilter(isoDate);
    setIsCalendarOpen(false);
  };

  return (
    <div className="relative z-30 min-w-[120px] shrink-0" ref={calendarRef}>
      <button
        type="button"
        onClick={() => setIsCalendarOpen((open) => !open)}
        className="relative flex h-[38px] w-[120px] cursor-pointer items-center justify-between gap-2 rounded-full border border-slate-200 bg-white/90 px-2 text-sm text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition duration-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        aria-label={label}
      >
        <span className="pointer-events-none flex-1 truncate text-left text-slate-700 dark:text-slate-100">
          {labelText}
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
      </button>

      {isCalendarOpen && (
        <div className="absolute left-0 top-full z-[80] mt-2 w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_16px_40px_rgba(2,6,23,0.5)]">
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
              const isSelected = selectedDate && formatLocalDate(date) === selectedDate;
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
                setSelectedDate("");
                setIsCalendarOpen(false);
                updateFilter("");
              }}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/15"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                selectCalendarDate(today);
              }}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-medium text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.10)] backdrop-blur-sm transition hover:border-indigo-300 hover:bg-indigo-100/70 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
