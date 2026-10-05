"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CourseSelect } from "@/app/admin/components/course-select";

type StudentRecordsFilterBarProps = {
  defaultQ?: string;
  defaultStatus?: string;
  defaultCourse?: string;
  defaultType?: string;
  defaultPrice?: string;
  pageSize?: string | number;
  hasActiveFilters?: boolean;
  courseOptions?: Array<{ value: string; label: string }>;
  priceOptions?: Array<{ value: string; label: string }>;
};

export function StudentRecordsFilterBar({
  defaultQ = "",
  defaultStatus = "all",
  defaultCourse = "",
  defaultType = "all",
  defaultPrice = "all",
  pageSize = "10",
  hasActiveFilters = false,
  courseOptions = [],
  priceOptions = [{ value: "all", label: "All" }],
}: StudentRecordsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(defaultQ);
  const [status, setStatus] = useState(defaultStatus);
  const [course, setCourse] = useState(defaultCourse);
  const [type, setType] = useState(defaultType);
  const [price, setPrice] = useState(defaultPrice);
  const submitTimerRef = useRef<number | null>(null);

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
    setType(defaultType);
  }, [defaultType]);

  useEffect(() => {
    setPrice(defaultPrice);
  }, [defaultPrice]);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        window.clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  const updateFilters = (nextQ: string, nextStatus: string, nextCourse: string, nextType: string, nextPrice: string) => {
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

    if (nextType === "all") {
      params.delete("type");
    } else {
      params.set("type", nextType);
    }

    if (nextPrice === "all") {
      params.delete("price");
    } else {
      params.set("price", nextPrice);
    }

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
      updateFilters(nextQ, status, course, type, price);
    }, 250);
  };

  return (
    <div className="mb-4 flex w-full flex-nowrap items-center justify-between gap-2 overflow-visible rounded-full border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.10),_rgba(255,255,255,0.98)_38%,_rgba(241,245,249,1)_100%)] p-1.5 shadow-[0_18px_32px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_rgba(10,18,31,0.96)_38%,_rgba(2,6,23,1)_100%)] dark:shadow-[0_18px_32px_rgba(15,23,42,0.28)]">
      <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-start gap-2 overflow-visible pr-2">
        {hasActiveFilters ? (
          <Link
            href={{ pathname, query: { page: "1", pageSize: String(pageSize) } }}
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
              updateFilters(q, status, normalizedValue, type, price);
            }}
            triggerClassName="!min-h-[38px] !w-[142px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            menuClassName="!min-w-[142px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
            options={[{ value: "", label: "All" }, ...courseOptions]}
          />
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
              updateFilters(q, normalizedValue, course, type, price);
            }}
            triggerClassName="!min-h-[38px] !w-[120px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            menuClassName="!min-w-[120px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
            ]}
          />
        </div>

        <div className="min-w-[120px] shrink-0">
          <CourseSelect
            name="type"
            label="Type"
            placeholder="Type"
            defaultValue={type}
            compact
            syncUrl={false}
            onValueChange={(nextValue) => {
              const normalizedValue = nextValue === "all" ? "all" : nextValue;
              setType(normalizedValue);
              updateFilters(q, status, course, normalizedValue, price);
            }}
            triggerClassName="!min-h-[38px] !w-[120px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            menuClassName="!min-w-[120px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
            options={[
              { value: "all", label: "All" },
              { value: "enrollment", label: "Enrollment" },
              { value: "order", label: "Order" },
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
            ]}
          />
        </div>

        <div className="min-w-[128px] shrink-0">
          <CourseSelect
            name="price"
            label="Price"
            placeholder="Price"
            defaultValue={price}
            compact
            syncUrl={false}
            onValueChange={(nextValue) => {
              const normalizedValue = nextValue === "all" ? "all" : nextValue;
              setPrice(normalizedValue);
              updateFilters(q, status, course, type, normalizedValue);
            }}
            triggerClassName="!min-h-[38px] !w-[128px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            menuClassName="!min-w-[128px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
            options={priceOptions}
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
