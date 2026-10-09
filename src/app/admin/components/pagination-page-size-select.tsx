"use client";

import { CourseSelect } from "./course-select";

type PaginationPageSizeSelectProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
};

export function PaginationPageSizeSelect({
  name = "pageSize",
  value,
  defaultValue = "6",
}: PaginationPageSizeSelectProps) {
  return (
    <CourseSelect
      name={name}
      label=""
      hideLabel
      compact
      placeholder="6"
      defaultValue={value ?? defaultValue}
      options={[
        { value: "all", label: "All" },
        { value: "5", label: "5" },
        { value: "6", label: "6" },
        { value: "9", label: "9" },
        { value: "10", label: "10" },
        { value: "20", label: "20" },
        { value: "50", label: "50" },
        { value: "100", label: "100" },
      ]}
      triggerClassName="!min-h-[38px] !w-[88px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      menuClassName="!min-w-[88px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
    />
  );
}
