"use client";

export function CreateCourseActionButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("course-create-confirm-request"));
      }}
      className="inline-flex h-[34px] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50/80 px-5 py-1.5 text-sm font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)] backdrop-blur-sm transition duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] hover:brightness-105 active:scale-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15"
    >
      Create
    </button>
  );
}
