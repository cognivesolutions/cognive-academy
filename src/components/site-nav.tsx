"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  { label: "Success Stories", href: "/success-stories" },
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
  { label: "Courses", type: "dropdown", items: coursesMenu, href: "#courses" },
  { label: "Resources", type: "dropdown", items: resourcesMenu, href: "#resources" },
  { label: "Services", type: "dropdown", items: servicesMenu, href: "#services" },
  { label: "Success Stories", type: "link", href: "/success-stories" },
  { label: "About Us", type: "link", href: "/about-us" },
  { label: "Contact Us", type: "link", href: "/contact-us" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const menuFirstRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  // Derive active nav item from pathname when available (more reliable than hash/click state)
  useEffect(() => {
    if (!pathname) return;

    // If the nav item hrefs are hashes, map pathname to sections if possible.
    // Prefer exact matches first, then try to match anchors by pathname+hash.
    const exactMatch = navItems.find((n) => n.href === pathname || n.href === `#${pathname.replace(/\/#?/, "")}`);
    if (exactMatch) {
      setActiveLabel(exactMatch.label);
      return;
    }

    // If current path includes a section anchor (e.g. /#courses), extract hash
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const match = navItems.find((n) => n.href === hash);
        if (match) {
          setActiveLabel(match.label);
          return;
        }
      }
    }

    // Fallback: clear active label when no match
    setActiveLabel(null);
  }, [pathname]);

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
      <nav className="flex items-center gap-5 text-sm font-medium text-slate-700">
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
                  setActiveLabel(item.label);
                }}
                onMouseLeave={() => {
                  closeTimeoutRef.current = window.setTimeout(() => {
                    setOpenMenu(null);
                    setActiveLabel(null);
                    closeTimeoutRef.current = null;
                  }, 250);
                }}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  onClick={() => {
                    setOpenMenu(isOpen ? null : item.label);
                    if (!isOpen) setActiveLabel(item.label);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenMenu(isOpen ? null : item.label);
                      if (!isOpen) setActiveLabel(item.label);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setOpenMenu(item.label);
                    } else if (e.key === "Escape") {
                      setOpenMenu(null);
                    }
                  }}
                  className={`group flex flex-col items-center rounded-full px-3 py-2 transition ${isOpen || activeLabel === item.label ? "text-indigo-700" : "hover:text-indigo-700"} focus-visible:text-indigo-700`}
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span className={`leading-none group-hover:font-bold group-active:font-bold group-focus-visible:font-bold group-active:text-indigo-700 group-focus-visible:text-indigo-700 active:font-bold active:text-indigo-700 ${isOpen || activeLabel === item.label ? "font-bold text-indigo-700" : ""}`}>{item.label}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-slate-500">
                      <path d="M5.25 7.5 10 12.25 14.75 7.5H5.25Z" />
                    </svg>
                  </div>
                  <span className={`mt-1 block h-[2px] w-full bg-indigo-600 transform ${isOpen || activeLabel === item.label ? "scale-x-100" : "scale-x-0"} origin-left transition-transform duration-200 group-hover:scale-x-100`} />
                </button>

                {isOpen ? (
                  <div
                    role="menu"
                    aria-label={item.label}
                    className="absolute left-0 top-full z-50 mt-3 w-52 rounded-2xl bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.12)] pointer-events-auto"
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
                        className="block w-full px-3 py-2 text-sm text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 rounded-none !border-0 bg-transparent focus:outline-none focus:ring-0"
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
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group inline-flex flex-col items-center rounded-full px-3 py-2 transition ${activeLabel === item.label ? "text-indigo-700" : "hover:text-indigo-700"} focus-visible:text-indigo-700`}
              onClick={() => setActiveLabel(item.label)}
            >
              <span className={`leading-none group-hover:font-bold group-active:font-bold group-focus-visible:font-bold group-active:text-indigo-700 group-focus-visible:text-indigo-700 active:font-bold active:text-indigo-700 ${activeLabel === item.label ? "font-bold" : ""}`}>{item.label}</span>
              <span className={`mt-1 block h-[2px] w-full bg-indigo-600 transform ${activeLabel === item.label ? "scale-x-100" : "scale-x-0"} origin-left transition-transform duration-200 group-hover:scale-x-100`} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
