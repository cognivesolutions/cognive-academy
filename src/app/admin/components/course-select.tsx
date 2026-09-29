"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type CourseSelectProps = {
  name: string;
  label?: string;
  placeholder: string;
  required?: boolean;
  options: Option[];
  defaultValue?: string;
  compact?: boolean;
  hideLabel?: boolean;
  triggerClassName?: string;
  menuClassName?: string;
  syncUrl?: boolean;
  onValueChange?: (nextValue: string) => void;
};

export function CourseSelect({
  name,
  label,
  placeholder,
  required = false,
  options,
  defaultValue = "",
  compact = false,
  hideLabel = false,
  triggerClassName = "",
  menuClassName = "",
  syncUrl = true,
  onValueChange,
}: CourseSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const normalizedDefaultValue = defaultValue === "all" ? "" : defaultValue || "10";
  const [value, setValue] = useState(normalizedDefaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setValue(normalizedDefaultValue);
  }, [normalizedDefaultValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value);
  const currentLabel = selectedOption?.label ?? placeholder;
  const hasExplicitDefaultOption = options.some((option) => option.value === "" || option.value === "all");
  const effectiveHideLabel = hideLabel || compact;
  const visibleValue = value && value !== "" && value !== "all" ? currentLabel : label ?? placeholder;

  const submitCurrentForm = (nextValue: string) => {
    const normalizedValue = nextValue === "all" ? "" : nextValue;
    setValue(normalizedValue);
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = normalizedValue;
    }

    onValueChange?.(normalizedValue);

    if (!syncUrl) {
      return;
    }

    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (!normalizedValue) {
      params.delete(name);
    } else {
      params.set(name, normalizedValue);
    }

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(targetUrl, { scroll: false });
  };

  return (
    <label className={effectiveHideLabel ? "block" : "block text-sm font-medium text-slate-700 dark:text-slate-200"}>
      <div ref={containerRef} className={`relative ${effectiveHideLabel ? "" : "mt-2"}`}>
        <input ref={hiddenInputRef} type="hidden" name={name} value={value} required={required} />

        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className={`flex h-[38px] w-full items-center gap-2 rounded-xl border bg-slate-50 pr-3 text-left text-sm transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:bg-slate-800 ${
            compact ? "px-2.5 py-1.5" : "px-3 py-2.5"
          } ${
            value
              ? "border-slate-200 text-slate-900 dark:border-slate-700 dark:text-slate-100"
              : "border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-400"
          } ${triggerClassName}`}
        >
          <span className={`flex-1 text-left ${value ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-400"}`}>
            {visibleValue}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className={`ml-auto h-4 w-4 text-slate-500 transition-transform duration-200 dark:text-slate-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {isOpen && (
          <div
            className={`absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900 ${menuClassName}`}
            onMouseLeave={() => setIsOpen(false)}
          >
            {!hasExplicitDefaultOption && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  submitCurrentForm("");
                }}
                className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  value
                    ? "text-slate-600 dark:text-slate-300"
                    : "bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {placeholder}
              </button>
            )}

            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  submitCurrentForm(option.value);
                }}
                className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition ${
                  value === option.value
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}
