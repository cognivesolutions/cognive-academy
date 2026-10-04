"use client";

import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ConfirmDialog from "@/components/confirm-dialog";

export type StudentTableRowData = {
  id: string;
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

export function StudentTableRow({ student }: { student: StudentTableRowData }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(student.isActive);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const purchasedCourseCount = student.enrollments.length;

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
      className="group cursor-pointer align-middle transition-all duration-200 hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-indigo-50/80 hover:via-white hover:to-violet-50/80 hover:shadow-[0_12px_24px_rgba(99,102,241,0.08)] dark:hover:from-slate-800/70 dark:hover:via-slate-800/70 dark:hover:to-indigo-950/30 dark:hover:shadow-[0_12px_24px_rgba(15,23,42,0.30)]"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-[0_10px_25px_rgba(99,102,241,0.25)]">
            {(student.name ?? "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{student.name ?? "Unnamed"}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{student.id.slice(0, 8)}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-700 dark:text-slate-200">{student.email}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{student.phone ?? "No phone"}</div>
      </td>
      <td className="px-4 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-200">
        {purchasedCourseCount}
      </td>
      <td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-200">{new Date(student.createdAt).toLocaleDateString()}</td>
      <td className="px-4 py-3 text-center">
        <span
          className={[
            "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
            isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
              : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200",
          ].join(" ")}
        >
          {isActive ? "Active" : "Deactive"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleToggleStatus}
            className={[
              "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition duration-200 active:scale-100",
              isActive
                ? "border border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15",
            ].join(" ")}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : isActive ? "Deactivate" : "Activate"}
          </button>

          {/* <Link
            href={`/admin/students/${student.id}`}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Edit ${student.name ?? "student"}`}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link> */}

          <Link
            href={`/admin/students/${student.id}`}
            onClick={(event) => event.stopPropagation()}
            aria-label={`View ${student.name ?? "student"}`}
            className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 p-2 text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
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
            className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50/80 p-2 text-rose-700 shadow-[0_8px_20px_rgba(244,63,94,0.08)] transition duration-200 hover:border-rose-300 hover:bg-rose-100 hover:shadow-[0_10px_24px_rgba(244,63,94,0.12)] hover:brightness-105 active:scale-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:border-rose-400/50 dark:hover:bg-rose-500/15"
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
