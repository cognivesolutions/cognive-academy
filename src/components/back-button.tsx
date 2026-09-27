"use client";

export default function BackButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      aria-label="Go back"
      className={
        (className ?? "") +
        " mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(79,70,229,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(79,70,229,0.35)]"
      }
    >
      <span aria-hidden>←</span>
      <span>Back</span>
    </button>
  );
}
