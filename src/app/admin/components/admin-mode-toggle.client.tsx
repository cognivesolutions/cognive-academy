"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const modes = [
  { href: "/admin", label: "Course management" },
  { href: "/admin/students", label: "Student management" },
];

export function AdminModeToggle() {
  const pathname = usePathname();

  const isCourseMode =
    pathname === "/admin" ||
    pathname.startsWith("/admin/courses") ||
    pathname.startsWith("/admin/unpublished") ||
    pathname.startsWith("/admin/lectures") ||
    pathname.startsWith("/admin/courses/new");

  const isStudentMode = pathname.startsWith("/admin/students");

  return (
    <div className="inline-flex items-center justify-end rounded-full border border-slate-200 bg-slate-100/80 p-1 shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-800/80 dark:shadow-[0_10px_24px_rgba(15,23,42,0.25)]">
      {modes.map((mode) => {
        const isActive =
          (mode.href === "/admin" && isCourseMode) ||
          (mode.href === "/admin/students" && isStudentMode);

        return (
          <Link
            key={mode.href}
            href={mode.href}
            className={[
              "relative inline-flex h-[42px] min-w-[170px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-transparent px-4 py-2 text-[15px] font-semibold tracking-[-0.02em] whitespace-nowrap transition-all duration-200 box-border",
              isActive
                ? mode.href === "/admin"
                  ? "border border-emerald-300/80 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(255,255,255,0.96),rgba(16,185,129,0.12))] text-emerald-800 shadow-[0_12px_24px_rgba(16,185,129,0.18)] dark:border-emerald-400/70 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(15,23,42,0.8),rgba(16,185,129,0.12))] dark:text-emerald-100"
                  : "border border-red-200/80 bg-[linear-gradient(135deg,rgba(248,113,113,0.12),rgba(255,255,255,0.96),rgba(239,68,68,0.08))] text-red-700 shadow-[0_12px_24px_rgba(239,68,68,0.16)] dark:border-red-500/60 dark:bg-[linear-gradient(135deg,rgba(239,68,68,0.18),rgba(15,23,42,0.8),rgba(239,68,68,0.12))] dark:text-red-100"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800/80 dark:hover:text-slate-200",
            ].join(" ")}
          >
            {mode.label}
          </Link>
        );
      })}
    </div>
  );
}
