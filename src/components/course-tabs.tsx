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
      <ul className="flex gap-4">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname?.startsWith(t.href + "/");
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`inline-block pb-3 px-2 text-sm ${
                  active ? "text-indigo-700 font-semibold border-b-2 border-indigo-600" : "text-slate-600 hover:text-indigo-700"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
