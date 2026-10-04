"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export type StudentTableRowData = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
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
  const purchasedCourseCount = student.enrollments.length;
  const isActive = student.enrollments.some((enrollment) => enrollment.accessGranted);

  return (
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
      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {purchasedCourseCount}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{new Date(student.createdAt).toLocaleDateString()}</td>
      <td className="px-4 py-3">
        <span
          className={[
            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
            isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
              : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
          ].join(" ")}
        >
          {isActive ? "Active" : "New"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/students/${student.id}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
          >
            View
          </Link>
        </div>
      </td>
    </tr>
  );
}
