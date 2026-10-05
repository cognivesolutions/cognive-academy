"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StudentAdminQuickActions({
  studentId,
  studentEmail,
  studentName,
  isActive: initialIsActive,
}: {
  studentId: string;
  studentEmail: string | null;
  studentName: string | null;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(initialIsActive);
  const [busyAction, setBusyAction] = useState<"status" | "message" | "reminder" | null>(null);

  const handleStudentMessage = async (type: "message" | "reminder") => {
    if (busyAction) {
      return;
    }

    setBusyAction(type);

    try {
      const response = await fetch("/api/admin/students/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          type,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to prepare the message.");
      }

      if (payload?.mailtoUrl) {
        window.location.href = payload.mailtoUrl;
      }
    } catch (error) {
      console.error("Unable to prepare student message", error);
      alert(error instanceof Error ? error.message : "Unable to prepare student message.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleFreezeToggle = async () => {
    if (busyAction) {
      return;
    }

    setBusyAction("status");

    try {
      const response = await fetch("/api/admin/students/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          isActive: !isActive,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update student status.");
      }

      setIsActive(Boolean(payload?.isActive ?? !isActive));
      router.refresh();
    } catch (error) {
      console.error("Unable to update student status", error);
      alert(error instanceof Error ? error.message : "Unable to update student status.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => handleStudentMessage("reminder")}
        disabled={Boolean(busyAction)}
        className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {busyAction === "reminder" ? "Sending..." : "Send reminder"}
      </button>

      <button
        type="button"
        onClick={() => handleStudentMessage("message")}
        disabled={Boolean(busyAction) || !studentEmail}
        className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {busyAction === "message" ? "Opening..." : "Message student"}
      </button>

      <button
        type="button"
        onClick={handleFreezeToggle}
        disabled={Boolean(busyAction)}
        className="inline-flex h-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/15"
      >
        {busyAction === "status" ? "Updating..." : isActive ? "Freeze account" : "Unfreeze account"}
      </button>
    </div>
  );
}
