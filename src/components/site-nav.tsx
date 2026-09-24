"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const coursesMenu = [
  { label: "Data Analytics", href: "#courses" },
  { label: "Power BI", href: "#courses" },
  { label: "SQL", href: "#courses" },
  { label: "Python", href: "#courses" },
];

const servicesMenu = [
  { label: "1:1 Mentorship", href: "#pricing" },
  { label: "Mock Interviews", href: "#pricing" },
  { label: "Corporate Training", href: "#pricing" },
];

const navItems = [
  { label: "Courses", type: "dropdown", items: coursesMenu, href: "#courses" },
  { label: "Resources", href: "#courses" },
  { label: "Services", type: "dropdown", items: servicesMenu, href: "#pricing" },
  { label: "Success Stories", href: "#success-stories" },
  { label: "About Us", href: "#about-us" },
  { label: "Contact Us", href: "#contact-us" },
] as const;

export function SiteNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={navRef} className="hidden items-center gap-4 text-sm font-medium md:flex">
      <nav className="flex items-center gap-5 text-sm font-medium text-slate-700">
        {navItems.map((item) => {
          const hasDropdown = item.type === "dropdown";
          const isOpen = openMenu === item.label;

          return hasDropdown ? (
            <div key={item.label} className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(isOpen ? null : item.label)}
                className="flex items-center gap-1.5 rounded-full px-2 py-1.5 transition hover:text-indigo-700"
              >
                <span>{item.label}</span>
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-slate-500">
                  <path d="M5.25 7.5 10 12.25 14.75 7.5H5.25Z" />
                </svg>
              </button>

              {isOpen ? (
                <div className="absolute left-0 top-full z-50 mt-3 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                  {item.items?.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      className="block rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                      onClick={() => setOpenMenu(null)}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full px-2 py-1.5 transition hover:text-indigo-700"
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
