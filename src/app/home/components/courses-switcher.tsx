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
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 p-1 dark:bg-slate-800/90 dark:shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]">
      <button
        onClick={setLeft}
        className={`rounded-full px-4 py-1 text-sm font-semibold transition-colors duration-200 ${value === leftValue ? "bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
        aria-pressed={value === leftValue}
        aria-label={`Show ${leftLabel} courses`}
      >
        {leftLabel}
      </button>

      <button
        onClick={setRight}
        className={`rounded-full px-4 py-1 text-sm font-semibold transition-colors duration-200 ${value === rightValue ? "bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
        aria-pressed={value === rightValue}
        aria-label={`Show ${rightLabel} courses`}
      >
        {rightLabel}
      </button>
    </div>
  );
}
