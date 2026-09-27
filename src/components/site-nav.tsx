"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const coursesMenu = [
  { label: "Data Analytics", href: "/courses/sql-for-analytics" },
  { label: "Python", href: "/courses/python-for-data-tasks" },
  { label: "SQL", href: "/courses/sql-for-analytics" },
  { label: "Power BI", href: "/courses/power-bi-dashboarding" },
];

const resourcesMenu = [
  { label: "Resume Analyzer", href: "/resume-analyzer" },
  { label: "Tech Blog", href: "/tech-blog" },
  { label: "Interview Experiences", href: "/interview-experiences" },
];

const servicesMenu = [
  { label: "1:1 Mentorship", href: "/mentorship" },
  { label: "Mock Interviews", href: "/mock-interviews" },
  { label: "Corporate Training", href: "/corporate-training" },
];

type NavItem =
  | { label: string; type: "dropdown"; items: typeof coursesMenu; href: string }
  | { label: string; type: "link"; href: string };

const navItems: NavItem[] = [
  { label: "Courses", type: "dropdown", items: coursesMenu, href: "/courses" },
  { label: "Resources", type: "dropdown", items: resourcesMenu, href: "/resources" },
  { label: "Services", type: "dropdown", items: servicesMenu, href: "/services" },
  { label: "Success Stories", type: "link", href: "/success-stories" },
  { label: "About Us", type: "link", href: "/about-us" },
  { label: "Contact Us", type: "link", href: "/contact-us" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const menuFirstRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const routeActiveLabel = useMemo(() => {
    if (!pathname) return null;

    const normalizedPath = pathname.split("#")[0];
    const childRouteParent = navItems.find(
      (item) =>
        item.type === "dropdown" &&
        item.items.some(
          (subItem) => normalizedPath === subItem.href || normalizedPath.startsWith(`${subItem.href}/`),
        ),
    );

    if (childRouteParent) return childRouteParent.label;

    const exactMatch = navItems.find((n) => n.href === normalizedPath || n.href === `#${normalizedPath.replace(/^\/+/, "")}`);
    if (exactMatch) return exactMatch.label;

    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const match = navItems.find((n) => n.href === hash);
        if (match) return match.label;
      }
    }

    return null;
  }, [pathname]);

  const resolvedActiveLabel = routeActiveLabel;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  // When a menu opens, focus its first item for keyboard users
  useEffect(() => {
    if (!openMenu) return;
    const first = menuFirstRefs.current[openMenu];
    if (first) {
      // focus in next tick
      setTimeout(() => first.focus(), 0);
    }
  }, [openMenu]);

  return (
    <div ref={navRef} className="hidden items-center gap-4 text-sm font-medium md:flex">
      <nav className="flex items-center justify-center gap-5 text-sm font-medium text-slate-700 leading-none dark:text-slate-200">
        {navItems.map((item) => {
          const isDropdown = item.type === "dropdown";
          const isOpen = openMenu === item.label;

          if (isDropdown) {
            return (
              <div
                key={item.label}
                className="relative"
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
                    closeTimeoutRef.current = null;
                  }, 250);
                }}
              >
                <div className="flex items-center justify-center gap-1 rounded-full px-3 py-2 transition focus-within:text-indigo-700 dark:focus-within:text-indigo-300">
                  <Link
                    href={item.href}
                    className={`group flex flex-col items-center justify-center leading-none transition ${
                      isOpen || resolvedActiveLabel === item.label
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-slate-700 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-100"
                    }`}
                  >
                    <span className="inline-flex translate-y-0.5 items-center gap-1.5">
                      <span
                        className={`text-sm tracking-normal transition-all duration-200 ${
                          isOpen || resolvedActiveLabel === item.label
                            ? "text-indigo-700 dark:text-indigo-300"
                            : "text-slate-700 dark:text-slate-200"
                        } group-hover:font-bold`}>
                        {item.label}
                      </span>
                    </span>
                    <span className={`mt-1 block h-[2px] w-full bg-indigo-600 transform origin-left transition-all duration-200 ${isOpen || resolvedActiveLabel === item.label ? "scale-x-100" : "scale-x-0 group-hover:scale-x-30"}`} />
                  </Link>

                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    aria-label={`Open ${item.label} menu`}
                    onClick={() => {
                      setOpenMenu(isOpen ? null : item.label);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenMenu(isOpen ? null : item.label);
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setOpenMenu(item.label);
                      } else if (e.key === "Escape") {
                        setOpenMenu(null);
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-full p-1 text-slate-500 transition hover:text-slate-700 focus-visible:text-indigo-700 dark:text-slate-400 dark:hover:text-slate-200 dark:focus-visible:text-indigo-300"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className={`h-3.5 w-3.5 transition-colors duration-200 ${isOpen || resolvedActiveLabel === item.label ? "text-indigo-600 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"}`}>
                      <path d="M5.25 7.5 10 12.25 14.75 7.5H5.25Z" />
                    </svg>
                  </button>
                </div>

                {isOpen ? (
                  <div
                    role="menu"
                    aria-label={item.label}
                    className="absolute left-0 top-full z-50 mt-3 w-56 rounded-2xl border border-white/60 bg-white/75 p-2 shadow-[0_18px_42px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.32)] backdrop-blur-xl pointer-events-auto dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-[0_18px_40px_rgba(2,6,23,0.58),0_0_0_1px_rgba(148,163,184,0.08)]"
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
                        closeTimeoutRef.current = null;
                      }, 250);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setOpenMenu(null);
                      }
                    }}
                  >
                    {item.items.map((subItem, idx) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        role="menuitem"
                        ref={(el) => {
                          if (idx === 0) menuFirstRefs.current[item.label] = el;
                        }}
                        className="block w-full rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-all duration-200 hover:bg-white/70 hover:text-indigo-700 hover:font-bold focus:outline-none focus:ring-0 dark:text-slate-200 dark:hover:bg-slate-800/75 dark:hover:text-indigo-300"
                        onClick={() => {
                          setOpenMenu(null);
                        }}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group inline-flex flex-col items-center justify-center rounded-full px-3 py-2 transition ${resolvedActiveLabel === item.label ? "text-indigo-700 dark:text-indigo-300" : "hover:text-indigo-700 dark:hover:text-indigo-300"} focus-visible:text-indigo-700 dark:focus-visible:text-indigo-300`}
            >
              <span
                className={`text-sm leading-none tracking-normal translate-y-0.5 group-hover:font-bold group-active:font-bold group-focus-visible:font-bold group-active:text-indigo-700 group-focus-visible:text-indigo-700 active:font-bold active:text-indigo-700 ${
                  resolvedActiveLabel === item.label
                    ? "font-bold text-indigo-700 dark:text-indigo-300"
                    : "text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300"
                }`}
              >
                {item.label}
              </span>
              <span className={`mt-1 block h-[2px] w-full bg-indigo-600 transform ${resolvedActiveLabel === item.label ? "scale-x-100" : "scale-x-0"} origin-left transition-transform duration-200 group-hover:scale-x-100`} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
