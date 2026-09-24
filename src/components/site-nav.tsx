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

const resourcesMenu = [
  { label: "Interview Experiences", href: "#resources" },
  { label: "Tech Blog", href: "#resources" },
  { label: "Resume Analyzer", href: "#resources" },
];

const navItems = [
  { label: "Courses", type: "dropdown", items: coursesMenu, href: "#courses" },
  { label: "Resources", type: "dropdown", items: resourcesMenu, href: "#resources" },
  { label: "Services", type: "dropdown", items: servicesMenu, href: "#pricing" },
  { label: "Success Stories", href: "#success-stories" },
  { label: "About Us", href: "#about-us" },
  { label: "Contact Us", href: "#contact-us" },
] as const;

export function SiteNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
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

  // Sync active nav item with URL hash and hash changes
  useEffect(() => {
    function setFromHash() {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      if (!hash) return;
      const match = navItems.find((n) => n.href === hash);
      if (match) setActiveLabel(match.label);
    }

    setFromHash();
    window.addEventListener("hashchange", setFromHash);
    return () => window.removeEventListener("hashchange", setFromHash);
  }, []);

  return (
    <div ref={navRef} className="hidden items-center gap-4 text-sm font-medium md:flex">
      <nav className="flex items-center gap-5 text-sm font-medium text-slate-700">
        {navItems.map((item) => {
          const hasDropdown = item.type === "dropdown";
          const isOpen = openMenu === item.label;

          return hasDropdown ? (
            <div
              key={item.label}
              className="relative"
                      onMouseEnter={() => {
                        if (closeTimeoutRef.current) {
                          window.clearTimeout(closeTimeoutRef.current);
                          closeTimeoutRef.current = null;
                        }
                        setOpenMenu(item.label);
                        setActiveLabel(item.label);
                      }}
                      onMouseLeave={() => {
                        // delay closing slightly to let mouse travel to submenu
                        closeTimeoutRef.current = window.setTimeout(() => {
                          setOpenMenu(null);
                          setActiveLabel(null);
                          closeTimeoutRef.current = null;
                        }, 150);
                      }}
            >
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(isOpen ? null : item.label);
                  if (!isOpen) setActiveLabel(item.label);
                }}
                className={`group flex flex-col items-center rounded-full px-2 py-1.5 transition ${isOpen || activeLabel === item.label ? "text-indigo-700" : "hover:text-indigo-700"} focus-visible:text-indigo-700`}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span className={`leading-none group-hover:font-bold group-active:font-bold group-focus-visible:font-bold group-active:text-indigo-700 group-focus-visible:text-indigo-700 active:font-bold active:text-indigo-700 ${isOpen || activeLabel === item.label ? "font-bold text-indigo-700" : ""}`}>{item.label}</span>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-slate-500">
                    <path d="M5.25 7.5 10 12.25 14.75 7.5H5.25Z" />
                  </svg>
                </div>
                <span className={`mt-1 block h-[2px] w-full bg-indigo-600 transform ${isOpen || activeLabel === item.label ? 'scale-x-100' : 'scale-x-0'} origin-left transition-transform duration-200 group-hover:scale-x-100`} />
              </button>

              {isOpen ? (
                <div
                  className="absolute left-0 top-full z-50 mt-3 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
                  onMouseEnter={() => {
                    if (closeTimeoutRef.current) {
                      window.clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = null;
                    }
                    setOpenMenu(item.label);
                  }}
                  onMouseLeave={() => {
                    closeTimeoutRef.current = window.setTimeout(() => {
                      setOpenMenu(null);
                      setActiveLabel(null);
                      closeTimeoutRef.current = null;
                    }, 150);
                  }}
                >
                  {item.items?.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      className="block rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                      onClick={() => {
                        setOpenMenu(null);
                        setActiveLabel(item.label);
                      }}
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
              className={`group inline-flex flex-col items-center rounded-full px-2 py-1.5 transition ${activeLabel === item.label ? 'text-indigo-700' : 'hover:text-indigo-700'} focus-visible:text-indigo-700`}
              onClick={() => setActiveLabel(item.label)}
            >
              <span className={`leading-none group-hover:font-bold group-active:font-bold group-focus-visible:font-bold group-active:text-indigo-700 group-focus-visible:text-indigo-700 active:font-bold active:text-indigo-700 ${activeLabel === item.label ? 'font-bold' : ''}`}>{item.label}</span>
              <span className={`mt-1 block h-[2px] w-full bg-indigo-600 transform ${activeLabel === item.label ? 'scale-x-100' : 'scale-x-0'} origin-left transition-transform duration-200 group-hover:scale-x-100`} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
