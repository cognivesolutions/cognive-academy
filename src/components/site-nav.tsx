"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

type CourseChild = { label: string; href: string };
type CourseMenuItem = { label: string; href?: string; children?: CourseChild[] };

const coursesMenu: CourseMenuItem[] = [
  { label: "Software Development", children: [{ label: "Live", href: "/courses/software-development/live" }, { label: "Self Paced", href: "/courses/software-development/recorded" }] },
  { label: "AI Engineering", children: [{ label: "Live", href: "/courses/ai-engineering/live" }, { label: "Self Paced", href: "/courses/ai-engineering/recorded" }] },
  { label: "Data Engineering", children: [{ label: "Live", href: "/courses/data-engineering/live" }, { label: "Self Paced", href: "/courses/data-engineering/recorded" }] },
  { label: "Data Analytics", children: [{ label: "Live", href: "/courses/data-analytics/live" }, { label: "Self Paced", href: "/courses/data-analytics/recorded" }] },
  { label: "Data Structures and Algorithms (DSA)", children: [{ label: "Live", href: "/courses/data-structures-algorithms/live" }, { label: "Self Paced", href: "/courses/data-structures-algorithms/recorded" }] },
];

const resourcesMenu = [
  { label: "Resume Analyzer", href: "/resources/resume-analyzer" },
  { label: "Tech Blog", href: "/resources/tech-blog" },
  { label: "Interview Experiences", href: "/resources/interview-experiences" },
];

const servicesMenu = [
  { label: "1:1 Mentorship", href: "/services/mentorship" },
  { label: "Mock Interviews", href: "/services/mock-interviews" },
  { label: "Corporate Training", href: "/services/corporate-training" },
];

type NavItem =
  | { label: string; type: "dropdown"; items: CourseMenuItem[]; href: string }
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
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const leftMenuRef = useRef<HTMLDivElement | null>(null);
  const [leftMenuRect, setLeftMenuRect] = useState<DOMRect | null>(null);
  const [hoveredItemRect, setHoveredItemRect] = useState<DOMRect | null>(null);
  const [hoveredItemHref, setHoveredItemHref] = useState<string | null>(null);
  const popoverHoverRef = useRef<boolean>(false);
  const menuFirstRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // Track the left menu DOMRect so the right popover can be positioned outside
  useEffect(() => {
    if (typeof window === "undefined") return;

    function updateRect() {
      if (leftMenuRef.current) {
        try {
          setLeftMenuRect(leftMenuRef.current.getBoundingClientRect());
        } catch (e) {
          setLeftMenuRect(null);
        }
      } else {
        setLeftMenuRect(null);
      }
    }

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [openMenu]);

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

  // When the Courses menu opens, default the hovered course to the first item so
  // Clear hoveredCourse when menu closes. Do NOT default to the first item —
  // we only want the right popover to show after the user hovers/focuses an item.
  useEffect(() => {
    if (openMenu !== "Courses") {
      setHoveredCourse(null);
      setHoveredItemRect(null);
    }
  }, [openMenu]);

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
                    if (!popoverHoverRef.current) {
                      setOpenMenu(null);
                    }
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
                        className={`text-sm tracking-normal transition-all duration-200 whitespace-nowrap ${
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
                    className="absolute left-0 top-full z-50 mt-3 flex items-start gap-0 pointer-events-auto"
                    onMouseEnter={() => {
                      if (closeTimeoutRef.current) {
                        window.clearTimeout(closeTimeoutRef.current);
                        closeTimeoutRef.current = null;
                      }
                      popoverHoverRef.current = false;
                      setOpenMenu(item.label);
                    }}
                    onMouseLeave={() => {
                      closeTimeoutRef.current = window.setTimeout(() => {
                        if (!popoverHoverRef.current) {
                          setOpenMenu(null);
                        }
                        closeTimeoutRef.current = null;
                      }, 250);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setOpenMenu(null);
                      }
                    }}
                  >
                    <div className="w-auto min-w-[190px] rounded-2xl border border-white bg-white p-3 shadow-[0_14px_36px_rgba(15,23,42,0.16),0_0_0_1px_rgba(255,255,255,0.38)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_14px_36px_rgba(2,6,23,0.7),0_0_0_1px_rgba(148,163,184,0.12)]">
                      <div className="w-auto space-y-1">
                        {item.items.map((subItem, idx) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href ?? '#'}
                            role="menuitem"
                            tabIndex={0}
                            onMouseEnter={(e) => {
                              setHoveredCourse(subItem.label);
                              setHoveredItemHref(subItem.href ?? null);
                              const target = e.currentTarget as HTMLElement;
                              try {
                                setHoveredItemRect(target.getBoundingClientRect());
                              } catch (err) {
                                setHoveredItemRect(null);
                              }
                            }}
                            onFocus={(e) => {
                              setHoveredCourse(subItem.label);
                              setHoveredItemHref(subItem.href ?? null);
                              const target = e.currentTarget as HTMLElement;
                              try {
                                setHoveredItemRect(target.getBoundingClientRect());
                              } catch (err) {
                                setHoveredItemRect(null);
                              }
                            }}
                            onClick={() => setOpenMenu(null)}
                            className={`block w-full text-left rounded-lg px-3 py-2.5 text-sm transition cursor-pointer ${
                              hoveredCourse === subItem.label
                                ? "bg-slate-100 text-indigo-700 font-bold dark:bg-slate-800/60 dark:text-indigo-300"
                                : "text-slate-600 hover:bg-white/70 hover:text-indigo-700 hover:font-bold focus:font-bold dark:text-slate-200"
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>

                      {/* right popover is rendered into document.body via portal (keeps it separate) */}
                      {item.label === "Courses" && hoveredCourse && hoveredItemRect && (function renderRightPopover() {
                        const active = hoveredCourse;
                        if (!active || !hoveredItemRect) return null;
                          // prefer explicit href-based slug if available (keeps nav linked to real DB slugs)
                          const hrefBase = hoveredItemHref ? hoveredItemHref.split("/")[2] : null;
                          const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                          const base = hrefBase ?? toSlug(active);

                        const style: React.CSSProperties = {
                          position: "absolute",
                          // anchor the right popover to the left menu's right edge (no gap)
                          left: Math.round(((leftMenuRect?.right ?? hoveredItemRect.right) ?? 0) + window.scrollX),
                          // align vertically with the hovered item; nudge further down
                          top: Math.round((hoveredItemRect.top ?? 0) + 8 + window.scrollY),
                          minWidth: 160,
                          zIndex: 120,
                        };

                        return createPortal(
                          <div
                            role="menu"
                            aria-label={`${active} course options`}
                            onMouseEnter={() => {
                              popoverHoverRef.current = true;
                              if (closeTimeoutRef.current) {
                                window.clearTimeout(closeTimeoutRef.current);
                                closeTimeoutRef.current = null;
                              }
                            }}
                            onMouseLeave={() => {
                              popoverHoverRef.current = false;
                              closeTimeoutRef.current = window.setTimeout(() => {
                                setOpenMenu(null);
                                closeTimeoutRef.current = null;
                              }, 250);
                            }}
                            style={style}
                            className="rounded-2xl border border-white bg-white p-3 shadow-[0_14px_36px_rgba(15,23,42,0.16),0_0_0_1px_rgba(255,255,255,0.38)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_14px_36px_rgba(2,6,23,0.7),0_0_0_1px_rgba(148,163,184,0.12)]"
                          >
                            <ul className="space-y-2" onKeyDown={(e) => { if (e.key === 'Escape') setOpenMenu(null); }}>
                              <li>
                                <Link href={`/courses/${base}/live`} role="menuitem" tabIndex={0} onMouseEnter={() => setHoveredCourse(active)} onFocus={() => setHoveredCourse(active)} className="block w-full rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-indigo-700 hover:font-bold focus:font-bold dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-indigo-300 transition-colors duration-150 cursor-pointer">Live Courses</Link>
                              </li>
                              <li>
                                <Link href={`/courses/${base}/self-paced`} role="menuitem" tabIndex={0} onMouseEnter={() => setHoveredCourse(active)} onFocus={() => setHoveredCourse(active)} className="block w-full rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-indigo-700 hover:font-bold focus:font-bold dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-indigo-300 transition-colors duration-150 cursor-pointer">Self Paced Courses</Link>
                              </li>
                            </ul>
                          </div>,
                          document.body,
                        );
                      })()}
                    </div>
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
                className={`text-sm leading-none tracking-normal translate-y-0.5 whitespace-nowrap group-hover:font-bold group-active:font-bold group-focus-visible:font-bold group-active:text-indigo-700 group-focus-visible:text-indigo-700 active:font-bold active:text-indigo-700 ${
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
