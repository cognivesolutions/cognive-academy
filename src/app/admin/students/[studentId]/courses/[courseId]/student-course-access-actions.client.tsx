"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StudentCourseAccessActions({
  studentId,
  courseId,
  initialAccessGranted,
  initialTypeLabel,
  initialStatusLabel,
  hasOrder,
}: {
  studentId: string;
  courseId: string;
  initialAccessGranted: boolean;
  initialTypeLabel: string;
  initialStatusLabel: string;
  hasOrder: boolean;
}) {
  const router = useRouter();
  const [isAccessGranted, setIsAccessGranted] = useState(initialAccessGranted);
  const [typeLabel, setTypeLabel] = useState(initialTypeLabel);
  const [statusLabel, setStatusLabel] = useState(initialStatusLabel);
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);

  const handleToggleAccess = async () => {
    if (isUpdatingAccess) {
      return;
    }

    setIsUpdatingAccess(true);

    try {
      const nextAccessGranted = !isAccessGranted;
      const response = await fetch("/api/admin/students/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          courseId,
          accessGranted: nextAccessGranted,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update access.");
      }

      const nextTypeLabel = hasOrder ? "Purchased" : nextAccessGranted ? "Manual access" : "Not assigned";
      const nextStatusLabel = nextAccessGranted ? "Access granted" : hasOrder ? "Access revoked" : "Awaiting access";

      setIsAccessGranted(nextAccessGranted);
      setTypeLabel(nextTypeLabel);
      setStatusLabel(nextStatusLabel);
      router.refresh();
    } catch (error) {
      console.error("Unable to update course access", error);
      alert(error instanceof Error ? error.message : "Unable to update course access.");
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Access controls</p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900 dark:text-white">Course access</h3>
        </div>

        <button
          type="button"
          onClick={handleToggleAccess}
          disabled={isUpdatingAccess}
          className={[
            "inline-flex items-center justify-center rounded-full border px-4 py-2 text-[11px] font-semibold normal-case tracking-[0.02em] shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition duration-200 active:scale-100 disabled:cursor-not-allowed disabled:opacity-60",
            isAccessGranted
              ? "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:border-rose-400/50 dark:hover:bg-rose-500/15"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15",
          ].join(" ")}
        >
          {isUpdatingAccess ? "Saving..." : isAccessGranted ? "Revoke access" : "Grant access"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span className="font-medium text-slate-900 dark:text-white">Type:</span> {typeLabel}
        </div>
        <div className="rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span className="font-medium text-slate-900 dark:text-white">Status:</span> {statusLabel}
        </div>
      </div>
    </div>
  );
}
