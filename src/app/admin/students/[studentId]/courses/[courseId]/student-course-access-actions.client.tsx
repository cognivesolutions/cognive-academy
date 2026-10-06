"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StudentCourseAccessActions({
  studentId,
  courseId,
  initialAccessGranted,
}: {
  studentId: string;
  courseId: string;
  initialAccessGranted: boolean;
}) {
  const router = useRouter();
  const [isAccessGranted, setIsAccessGranted] = useState(initialAccessGranted);
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);

  const handleToggleAccess = async () => {
    if (isUpdatingAccess) {
      return;
    }

    setIsUpdatingAccess(true);

    try {
      const response = await fetch("/api/admin/students/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          courseId,
          accessGranted: !isAccessGranted,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update access.");
      }

      setIsAccessGranted(!isAccessGranted);
      router.refresh();
    } catch (error) {
      console.error("Unable to update course access", error);
      alert(error instanceof Error ? error.message : "Unable to update course access.");
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleAccess}
      disabled={isUpdatingAccess}
      className={[
        "inline-flex items-center justify-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition duration-200 active:scale-100 disabled:cursor-not-allowed disabled:opacity-60",
        isAccessGranted
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:border-rose-400/50 dark:hover:bg-rose-500/15"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15",
      ].join(" ")}
    >
      {isUpdatingAccess ? "Saving..." : isAccessGranted ? "Revoke access" : "Grant access"}
    </button>
  );
}
