"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type CourseSearchFieldProps = {
  defaultValue: string;
  activeType: "all" | "live" | "recorded";
  activeCategory: string;
  activeLang: string;
};

export function CourseSearchField({
  defaultValue,
  activeType,
  activeCategory,
  activeLang,
}: CourseSearchFieldProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const updateQuery = (nextValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = nextValue.trim();

    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }

    if (activeCategory !== "All") {
      params.set("category", activeCategory);
    } else {
      params.delete("category");
    }

    if (activeType !== "all") {
      params.set("type", activeType);
    } else {
      params.delete("type");
    }

    if (activeLang !== "en") {
      params.set("lang", activeLang);
    } else {
      params.delete("lang");
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
      </div>

      <input
        type="text"
        name="q"
        value={value}
        placeholder="Type to search courses..."
        aria-label="Search courses"
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          updateQuery(nextValue);
        }}
        className="h-10 w-[210px] appearance-none rounded-full border border-slate-200 bg-white/90 pl-8 pr-8 text-[13px] text-slate-800 shadow-[0_5px_18px_rgba(15,23,42,0.04)] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1),0_8px_20px_rgba(79,70,229,0.08)] dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:shadow-[0_0_0_3px_rgba(129,140,248,0.12),0_8px_20px_rgba(99,102,241,0.12)] [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
      />

      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            updateQuery("");
          }}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex items-center justify-center pr-3 text-slate-400 transition-colors duration-200 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
