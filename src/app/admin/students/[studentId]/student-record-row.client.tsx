"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export type StudentRecordRowData = {
  id: string;
  courseId: string | null;
  title: string;
  category: string;
  type: string;
  amount: string;
  numericAmount: number;
  status: string;
  isActive: boolean;
  isOrder: boolean;
};

export function StudentRecordTableRow({ record }: { record: StudentRecordRowData }) {
  const router = useRouter();
  const detailHref = record.courseId
    ? `/admin/courses/${record.courseId}/lectures?courseId=${record.courseId}`
    : "/admin/courses";

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
      <td className="px-4 py-4 align-middle leading-[1.35]">
        <div className="font-semibold text-slate-900 dark:text-white">{record.title}</div>
      </td>
      <td className="px-4 py-4 align-middle text-sm leading-[1.35] text-slate-700 dark:text-slate-200">{record.category}</td>
      <td className="px-4 py-4 align-middle leading-[1.35]">
        <span className={[
          "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
          record.isActive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
            : record.isOrder
              ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
        ].join(" ")}>{record.type}</span>
      </td>
      <td className="px-4 py-4 align-middle text-sm leading-[1.35] text-slate-700 dark:text-slate-200">{record.amount}</td>
      <td className="px-4 py-4 align-middle text-sm leading-[1.35] text-slate-700 dark:text-slate-200">{record.status}</td>
      <td className="px-4 py-4 align-middle leading-[1.35]">
        <div className="flex items-center justify-start">
          <Link
            href={detailHref}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
          >
            View detail
          </Link>
        </div>
      </td>
    </tr>
  );
}
