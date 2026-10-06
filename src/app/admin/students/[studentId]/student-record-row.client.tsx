"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";

export type StudentRecordRowData = {
  id: string;
  courseId: string | null;
  title: string;
  category: string;
  joinedAt: Date;
  expiryLabel?: string;
  type: string;
  amount: string;
  numericAmount: number;
  status: string;
  isActive: boolean;
  isOrder: boolean;
};

export function StudentRecordTableRow({ record, studentId }: { record: StudentRecordRowData; studentId: string }) {
  const router = useRouter();
  const [isAccessGranted, setIsAccessGranted] = useState(record.isActive);
  const formatJoinedDate = (date: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);
  const detailHref = record.courseId ? `/admin/students/${studentId}/courses/${record.courseId}` : `/admin/students/${studentId}`;

  const handleAccessToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!record.courseId || isUpdatingAccess) {
      return;
    }

    setIsUpdatingAccess(true);

    try {
      const response = await fetch("/api/admin/students/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          courseId: record.courseId,
          accessGranted: !isAccessGranted,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update access.");
      }

      setIsAccessGranted(!isAccessGranted);
    } catch (error) {
      console.error("Unable to update course access", error);
      alert(error instanceof Error ? error.message : "Unable to update course access.");
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  const statusText = record.isActive ? "Access granted" : record.isOrder ? "Purchased" : "Awaiting access";
  const statusTone = record.isActive
    ? "text-emerald-600 dark:text-emerald-300"
    : record.isOrder
      ? "text-slate-600 dark:text-slate-300"
      : "text-amber-600 dark:text-amber-300";

  return (
    <tr
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("a, button, input, select, textarea")) {
          return;
        }
        router.push(detailHref);
      }}
      className="group cursor-pointer align-middle transition-all duration-200 hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-indigo-50/80 hover:via-white hover:to-violet-50/80 hover:shadow-[0_12px_24px_rgba(99,102,241,0.08)] dark:hover:from-slate-800/70 dark:hover:via-slate-800/70 dark:hover:to-indigo-950/30 dark:hover:shadow-[0_12px_24px_rgba(15,23,42,0.30)]"
    >
      <td className="px-4 py-4 align-middle text-left leading-[1.35]">
        <div className="font-semibold text-slate-900 dark:text-white">{record.title}</div>
      </td>
      <td className="px-4 py-4 align-middle text-left text-sm leading-[1.35] text-slate-700 dark:text-slate-200">{record.category}</td>
      <td className="px-4 py-4 align-middle text-center text-sm leading-[1.35] text-slate-700 dark:text-slate-200">{formatJoinedDate(record.joinedAt)}</td>
      <td className="px-4 py-4 align-middle text-center text-sm leading-[1.35] text-slate-700 dark:text-slate-200">{record.expiryLabel ?? "—"}</td>
      <td className="px-4 py-4 align-middle text-left leading-[1.35]">
        <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] leading-none ${statusTone}`}>
          {statusText}
        </span>
      </td>
      <td className="px-4 py-4 align-middle text-center leading-[1.35]">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {!record.isOrder && (
            <button
              type="button"
              onClick={handleAccessToggle}
              disabled={isUpdatingAccess}
              className={[
                "inline-flex items-center justify-center rounded-full border px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] shadow-[0_8px_20px_rgba(16,185,129,0.08)] backdrop-blur-sm transition duration-200 hover:brightness-105 active:scale-100 disabled:cursor-not-allowed disabled:opacity-60",
                isAccessGranted
                  ? "border-rose-200 bg-rose-50/80 text-rose-700 hover:border-rose-300 hover:bg-rose-100 hover:shadow-[0_10px_24px_rgba(244,63,94,0.12)] dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:border-rose-400/50 dark:hover:bg-rose-500/15"
                  : "border-emerald-200 bg-emerald-50/80 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15",
              ].join(" ")}
            >
              {isUpdatingAccess ? "Saving..." : isAccessGranted ? "Revoke access" : "Grant access"}
            </button>
          )}

          <Link
            href={detailHref}
            onClick={(event) => event.stopPropagation()}
            aria-label="View course details"
            className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 p-2 text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            aria-label="Delete course record"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50/80 p-2 text-rose-700 shadow-[0_8px_20px_rgba(244,63,94,0.08)] transition duration-200 hover:border-rose-300 hover:bg-rose-100 hover:shadow-[0_10px_24px_rgba(244,63,94,0.12)] hover:brightness-105 active:scale-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:border-rose-400/50 dark:hover:bg-rose-500/15"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
