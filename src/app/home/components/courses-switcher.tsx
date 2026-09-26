"use client"

import React, { useState } from "react";

type Props = {
  leftLabel?: string;
  rightLabel?: string;
  leftValue?: string;
  rightValue?: string;
  onChange?: (value: string) => void;
};

export default function CoursesSwitcher({
  leftLabel = "Live",
  rightLabel = "Recorded",
  leftValue = "live",
  rightValue = "recorded",
  onChange,
}: Props) {
  const [value, setValue] = useState<string>(leftValue);

  const setLeft = () => {
    setValue(leftValue);
    onChange?.(leftValue);
  };

  const setRight = () => {
    setValue(rightValue);
    onChange?.(rightValue);
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/85 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm dark:bg-slate-900/70 dark:shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]">
      <button
        onClick={setLeft}
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ease-out ${value === leftValue ? "bg-white/80 text-slate-900 shadow-[0_8px_22px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-slate-200/80 backdrop-blur-md dark:bg-slate-800/80 dark:text-white dark:shadow-[0_10px_26px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] dark:ring-slate-700/90" : "text-slate-600 hover:-translate-y-0.5 hover:bg-white/70 hover:text-slate-900 hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)] hover:ring-1 hover:ring-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white dark:hover:shadow-[0_8px_22px_rgba(15,23,42,0.3)] dark:hover:ring-slate-700/70"}`}
        aria-pressed={value === leftValue}
        aria-label={`Show ${leftLabel} courses`}
      >
        {leftLabel}
      </button>

      <button
        onClick={setRight}
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ease-out ${value === rightValue ? "bg-white/80 text-slate-900 shadow-[0_8px_22px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-slate-200/80 backdrop-blur-md dark:bg-slate-800/80 dark:text-white dark:shadow-[0_10px_26px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] dark:ring-slate-700/90" : "text-slate-600 hover:-translate-y-0.5 hover:bg-white/70 hover:text-slate-900 hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)] hover:ring-1 hover:ring-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white dark:hover:shadow-[0_8px_22px_rgba(15,23,42,0.3)] dark:hover:ring-slate-700/70"}`}
        aria-pressed={value === rightValue}
        aria-label={`Show ${rightLabel} courses`}
      >
        {rightLabel}
      </button>
    </div>
  );
}
