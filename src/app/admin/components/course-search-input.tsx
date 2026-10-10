"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type CourseSearchInputProps = {
  defaultValue?: string;
  className?: string;
};

export function CourseSearchInput({ defaultValue = "", className = "w-[160px] min-w-[160px]" }: CourseSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const submitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        window.clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setValue(nextValue);

    if (submitTimerRef.current) {
      window.clearTimeout(submitTimerRef.current);
    }

    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (!nextValue.trim()) {
      params.delete("q");
      const targetUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      if (submitTimerRef.current) {
        window.clearTimeout(submitTimerRef.current);
      }
      router.replace(targetUrl, { scroll: false });
      return;
    }

    params.set("q", nextValue.trim());

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

    submitTimerRef.current = window.setTimeout(() => {
      router.replace(targetUrl, { scroll: false });
    }, 300);
  };

  const clearSearch = () => {
    setValue("");
    if (submitTimerRef.current) {
      window.clearTimeout(submitTimerRef.current);
    }

    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("q");
    const targetUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(targetUrl, { scroll: false });
  };

  return (
    <div className={`flex h-[38px] items-center gap-2 rounded-full border border-slate-200 bg-transparent px-3 py-0 text-[0.92rem] text-slate-900 shadow-none transition duration-200 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950/35 dark:text-slate-100 dark:focus-within:bg-slate-950/50 ${className}`}>
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
        name="q"
        value={value}
        onChange={handleChange}
        placeholder="Type to search..."
        className="w-full border-0 bg-transparent text-[0.92rem] text-slate-900 placeholder:text-slate-500 outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
      />

      {value ? (
        <button
          type="button"
          onClick={clearSearch}
          aria-label="Clear search"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
