"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function CourseTabs({ slug }: { slug: string }) {
  const pathname = usePathname() ?? "";
  const base = `/courses/${slug}`;
  const tabs = [
    { label: "Live", href: `${base}/live` },
    { label: "Self Paced", href: `${base}/self-paced` },
  ];

  return (
    <nav className="mt-4 border-b border-slate-200 dark:border-slate-700">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="flex gap-3">
          {tabs.map((t) => {
            const active = pathname === t.href || pathname?.startsWith(t.href + "/");
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className={`inline-flex min-w-[128px] items-center justify-center pb-3 px-3 text-sm font-medium transition-colors ${
                    active ? "border-b-2 border-indigo-600 text-indigo-700 font-semibold" : "text-slate-600 hover:text-indigo-700"
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
