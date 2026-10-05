"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function StudentProfileToggle({ studentId }: { studentId: string }) {
  const pathname = usePathname();
  const isCourses = pathname === `/admin/students/${studentId}`;
  const isPurchaseHistory = pathname === `/admin/students/${studentId}/orders`;

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/80">
      <Link
        href={`/admin/students/${studentId}`}
        className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
          isCourses
            ? "border border-emerald-300 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(255,255,255,0.95),rgba(16,185,129,0.12))] text-emerald-800 shadow-[0_12px_24px_rgba(16,185,129,0.18)] dark:border-emerald-400/60 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(15,23,42,0.78),rgba(16,185,129,0.12))] dark:text-emerald-100"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800/80 dark:hover:text-slate-200"
        }`}
      >
        Courses Access
      </Link>

      <Link
        href={`/admin/students/${studentId}/orders`}
        className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
          isPurchaseHistory
            ? "border border-emerald-300 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(255,255,255,0.95),rgba(16,185,129,0.12))] text-emerald-800 shadow-[0_12px_24px_rgba(16,185,129,0.18)] dark:border-emerald-400/60 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(15,23,42,0.78),rgba(16,185,129,0.12))] dark:text-emerald-100"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800/80 dark:hover:text-slate-200"
        }`}
      >
        Orders
      </Link>
    </div>
  );
}
