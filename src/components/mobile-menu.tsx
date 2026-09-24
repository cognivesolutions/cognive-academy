"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Courses", href: "#courses" },
  { label: "Resources", href: "#courses" },
  { label: "Services", href: "#pricing" },
  { label: "Success Stories", href: "#success-stories" },
  { label: "About Us", href: "#about-us" },
  { label: "Contact Us", href: "#contact-us" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  // prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/90 text-slate-700 shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50"
      >
        <svg className={`h-5 w-5 transition-transform ${open ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {open ? (
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </g>
          )}
        </svg>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-50 bg-white border-b border-slate-200 shadow-lg">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group block rounded-md px-3 py-3 text-base text-slate-800 transition hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <span className="leading-none group-hover:font-bold group-active:font-bold">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-3 border-t border-slate-100 pt-4">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                LMS Login
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
