'use client';

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type MyCoursesSearchInputProps = {
  defaultValue?: string;
  className?: string;
};

export function MyCoursesSearchInput({
  defaultValue = "",
  className = "w-[220px] min-w-[220px] sm:w-[240px] sm:min-w-[240px]",
}: MyCoursesSearchInputProps) {
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
      params.set("page", "1");
      const targetUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(targetUrl, { scroll: false });
      return;
    }

    params.set("q", nextValue.trim());
    params.set("page", "1");

    const targetUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    submitTimerRef.current = window.setTimeout(() => {
      router.replace(targetUrl, { scroll: false });
    }, 250);
  };

  return (
    <div
      className={`relative flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white/90 pl-3 pr-3 text-sm text-slate-700 shadow-[0_5px_18px_rgba(15,23,42,0.04)] transition-all duration-200 focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1),0_8px_20px_rgba(79,70,229,0.08)] dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100 dark:focus-within:border-indigo-500 dark:focus-within:bg-slate-900 dark:focus-within:shadow-[0_0_0_3px_rgba(129,140,248,0.12),0_8px_20px_rgba(99,102,241,0.12)] ${className}`}
    >
      <Search className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
      <input
        name="q"
        value={value}
        onChange={handleChange}
        className="w-full border-0 bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
        placeholder="Type to search..."
        aria-label="Search courses"
      />
    </div>
  );
}
