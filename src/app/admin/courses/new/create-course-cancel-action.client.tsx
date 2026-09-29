"use client";

export function CreateCourseCancelButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("course-cancel-confirm-request"));
      }}
      className="inline-flex h-[34px] items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-4 py-1.5 text-sm font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
    >
      Cancel
    </button>
  );
}
