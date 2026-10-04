"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", badge: "Home", tone: "indigo" },
  { href: "/admin/courses/new", label: "Create course", badge: "New", tone: "sky" },
  { href: "/admin/unpublished", label: "Unpublished", badge: "Open", tone: "amber" },
  { href: "/admin/lectures", label: "Manage lectures", badge: "Live", tone: "emerald" },
  { href: "/admin/courses", label: "Manage courses", badge: "Open", tone: "violet" },
];

const studentNavItems = [
  { href: "/admin/students", label: "Dashboard", badge: "Home", tone: "indigo" },
  { href: "/admin/students/manage", label: "Manage students", badge: "Users", tone: "rose" },
  { href: "/admin/students/access", label: "Student access", badge: "Open", tone: "violet" },
];

const toneStyles = {
  indigo: {
    base: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15",
    active: "border-indigo-200 bg-indigo-100 text-indigo-800 shadow-[0_8px_20px_rgba(99,102,241,0.12)] dark:border-indigo-300/60 dark:bg-indigo-500/15 dark:text-indigo-100",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100",
  },
  sky: {
    base: "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:bg-sky-100 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100 dark:hover:border-sky-400/50 dark:hover:bg-sky-500/15",
    active: "border-sky-200 bg-sky-100 text-sky-800 shadow-[0_8px_20px_rgba(14,165,233,0.12)] dark:border-sky-300/60 dark:bg-sky-500/15 dark:text-sky-50",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-100",
  },
  amber: {
    base: "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:border-amber-400/50 dark:hover:bg-amber-500/15",
    active: "border-amber-200 bg-amber-100 text-amber-800 shadow-[0_8px_20px_rgba(245,158,11,0.12)] dark:border-amber-300/60 dark:bg-amber-500/15 dark:text-amber-50",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100",
  },
  emerald: {
    base: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15",
    active: "border-emerald-200 bg-emerald-100 text-emerald-800 shadow-[0_8px_20px_rgba(16,185,129,0.12)] dark:border-emerald-300/60 dark:bg-emerald-500/15 dark:text-emerald-50",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100",
  },
  violet: {
    base: "border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300 hover:bg-violet-100 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-100 dark:hover:border-violet-400/50 dark:hover:bg-violet-500/15",
    active: "border-violet-200 bg-violet-100 text-violet-800 shadow-[0_8px_20px_rgba(139,92,246,0.12)] dark:border-violet-300/60 dark:bg-violet-500/15 dark:text-violet-50",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-100",
  },
  rose: {
    base: "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:border-rose-400/50 dark:hover:bg-rose-500/15",
    active: "border-rose-200 bg-rose-100 text-rose-800 shadow-[0_8px_20px_rgba(244,63,94,0.12)] dark:border-rose-300/60 dark:bg-rose-500/15 dark:text-rose-50",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-100",
  },
} as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const visibleNavItems = pathname.startsWith("/admin/students") ? studentNavItems : navItems;

  return (
    <aside className="mx-auto w-full max-w-6xl">
      <div className="sticky top-6 rounded-[24px] border border-slate-200 bg-white/80 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.04)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80">
        <nav className="flex flex-wrap items-center gap-2">
          {visibleNavItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            const tone = toneStyles[item.tone as keyof typeof toneStyles];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "inline-flex items-center justify-between rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive ? tone.active : tone.base,
                ].join(" ")}
              >
                <span>{item.label}</span>
                <span className={[
                  "ml-3 rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em]",
                  tone.badge,
                ].join(" ")}>
                  {item.badge}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
