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
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 p-1">
      <button
        onClick={setLeft}
        className={`rounded-full px-4 py-1 text-sm font-semibold ${value === leftValue ? "bg-white shadow" : "text-slate-600"}`}
        aria-pressed={value === leftValue}
        aria-label={`Show ${leftLabel} courses`}
      >
        {leftLabel}
      </button>

      <button
        onClick={setRight}
        className={`rounded-full px-4 py-1 text-sm font-semibold ${value === rightValue ? "bg-white shadow" : "text-slate-600"}`}
        aria-pressed={value === rightValue}
        aria-label={`Show ${rightLabel} courses`}
      >
        {rightLabel}
      </button>
    </div>
  );
}
