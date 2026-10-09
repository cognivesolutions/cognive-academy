"use client";

import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import ConfirmDialog from "@/components/confirm-dialog";

export type StudentTableRowData = {
  id: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  enrollments: {
    accessGranted: boolean;
    course: {
      id: string;
      title: string | null;
    };
  }[];
};

export function StudentTableRow({ student, query = "" }: { student: StudentTableRowData; query?: string }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(student.isActive);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const purchasedCourseCount = student.enrollments.length;

  const highlightText = (value: string | null | undefined, searchTerm: string): ReactNode => {
    const text = value ?? "";
    const trimmedTerm = searchTerm.trim();

    if (!trimmedTerm || !text) {
      return value ?? "";
    }

    const lowerText = text.toLowerCase();
    const lowerTerm = trimmedTerm.toLowerCase();
    const nodes: ReactNode[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const matchIndex = lowerText.indexOf(lowerTerm, startIndex);

      if (matchIndex === -1) {
        nodes.push(text.slice(startIndex));
        break;
      }

      if (matchIndex > startIndex) {
        nodes.push(text.slice(startIndex, matchIndex));
      }

      const matchText = text.slice(matchIndex, matchIndex + trimmedTerm.length);
      nodes.push(
        <mark
          key={`${matchIndex}-${startIndex}`}
          className="rounded-sm bg-yellow-200 px-0.5 py-0.5 font-semibold text-slate-900 shadow-[inset_0_0_0_1px_rgba(202,138,4,0.2)] dark:bg-yellow-300 dark:text-slate-900"
        >
          {matchText}
        </mark>,
      );

      startIndex = matchIndex + trimmedTerm.length;
    }

    return nodes.length > 0 ? nodes : value ?? "";
  };

  const handleToggleStatus = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/admin/students/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student.id,
          isActive: !isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update student status");
      }

      setIsActive(!isActive);
      router.refresh();
    } catch (error) {
      console.error("Unable to update student status", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatJoinedDate = (date: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

  const handleDeleteStudent = async () => {
    try {
      const response = await fetch("/api/admin/students/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId: student.id }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete student");
      }

      setIsDeleteConfirmOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Unable to delete student", error);
      alert(error instanceof Error ? error.message : "Unable to delete student.");
    }
  };

  return (
    <>
      <tr
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("a, button, input, select, textarea")) {
          return;
        }
        router.push(`/admin/students/${student.id}`);
      }}
      className="group cursor-pointer align-middle transition-colors duration-200 hover:bg-indigo-50/90 hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)] dark:hover:bg-slate-800/80"
    >
      <td className="px-3 py-2 align-middle text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(99,102,241,0.22)]">
            {(student.name ?? "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-slate-700 dark:text-slate-200">
              {highlightText(student.userId ?? student.id, query)}
            </span>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 align-middle text-left text-[12.5px] text-slate-700 dark:text-slate-200">
        {highlightText(student.name ?? "Unnamed", query)}
      </td>
      <td className="px-3 py-2 align-middle text-left text-[12.5px] text-slate-700 dark:text-slate-200">{highlightText(student.email ?? "No email", query)}</td>
      <td className="px-3 py-2 align-middle text-left text-[12.5px] text-slate-700 dark:text-slate-200">{highlightText(student.phone ?? "No phone", query)}</td>
      <td className="px-3 py-2 align-middle text-center text-[12.5px] font-medium text-slate-700 dark:text-slate-200">
        {highlightText(String(purchasedCourseCount), query)}
      </td>
      <td className="px-3 py-2 align-middle text-center text-[12.5px] text-slate-700 dark:text-slate-200">{highlightText(formatJoinedDate(new Date(student.createdAt)), query)}</td>
      <td className="px-3 py-2 align-middle text-center leading-[1.35]">
        <span className={`text-[12.5px] font-semibold ${isActive ? "text-emerald-600 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>
          {highlightText(isActive ? "Active" : "Inactive", query)}
        </span>
      </td>
      <td className="px-2 py-2 align-middle text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleStatus}
            className={[
              "inline-flex items-center justify-center rounded-full px-2 py-1 text-[10px] font-semibold shadow-[0_6px_14px_rgba(15,23,42,0.06)] transition duration-200 active:scale-100",
              isActive
                ? "border border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15",
            ].join(" ")}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : isActive ? "Deactivate" : "Activate"}
          </button>

          <Link
            href={`/admin/students/${student.id}`}
            onClick={(event) => event.stopPropagation()}
            aria-label={`View ${student.name ?? "student"}`}
            className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 p-1.5 text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDeleteConfirmOpen(true);
            }}
            aria-label={`Delete ${student.name ?? "student"}`}
            className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50/80 p-1.5 text-rose-700 shadow-[0_8px_20px_rgba(244,63,94,0.08)] transition duration-200 hover:border-rose-300 hover:bg-rose-100 hover:shadow-[0_10px_24px_rgba(244,63,94,0.12)] hover:brightness-105 active:scale-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:border-rose-400/50 dark:hover:bg-rose-500/15"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        title="Delete this student?"
        description="This will permanently remove the student record and related account data. This action cannot be undone."
        confirmLabel="Yes, delete"
        onConfirm={handleDeleteStudent}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </>
  );
}
