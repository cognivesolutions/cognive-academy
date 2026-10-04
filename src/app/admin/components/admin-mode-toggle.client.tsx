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
    <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
      {modes.map((mode) => {
        const isActive =
          (mode.href === "/admin" && isCourseMode) ||
          (mode.href === "/admin/students" && isStudentMode);

        return (
          <Link
            key={mode.href}
            href={mode.href}
            className={[
              "relative overflow-hidden rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
              isActive
                ? mode.href === "/admin"
                  ? "bg-[linear-gradient(135deg,#4f46e5_0%,#6366f1_35%,#8b5cf6_100%)] text-white shadow-[0_12px_28px_rgba(99,102,241,0.32)] before:absolute before:inset-0 before:bg-[linear-gradient(120deg,rgba(255,255,255,0.32),rgba(255,255,255,0.08),rgba(255,255,255,0.2))] before:opacity-100 before:content-['']"
                  : "bg-[linear-gradient(135deg,#f43f5e_0%,#fb7185_38%,#f472b6_100%)] text-white shadow-[0_12px_28px_rgba(244,63,94,0.28)] before:absolute before:inset-0 before:bg-[linear-gradient(120deg,rgba(255,255,255,0.32),rgba(255,255,255,0.08),rgba(255,255,255,0.2))] before:opacity-100 before:content-['']"
                : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white",
            ].join(" ")}
          >
            {mode.label}
          </Link>
        );
      })}
    </div>
  );
}
