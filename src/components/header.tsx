"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { SiteNav } from "./site-nav";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import MobileMenu from "./mobile-menu";

export default function Header() {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user?.id);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 self-center leading-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-sm font-black text-white shadow-[0_8px_16px_rgba(99,102,241,0.25)] ring-2 ring-indigo-100/80 dark:shadow-[0_0_0_rgba(0,0,0,0)] dark:ring-0">C</div>
            <div className="text-xl font-black tracking-tight text-slate-900 leading-none dark:text-slate-50">Cognive Academy</div>
          </Link>

          <div className="hidden flex-1 items-center justify-center md:flex md:translate-y-1">
            <SiteNav />
          </div>

          <div className="flex items-center gap-3 self-center translate-y-1 sm:gap-5">
            <ThemeToggle />
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 md:inline-flex dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200"
              >
                Admin
              </Link>
            )}
            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <div className="hidden md:block">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(99,102,241,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(99,102,241,0.32)] hover:brightness-110 focus-visible:ring-4 focus-visible:ring-indigo-200 leading-none"
                >
                  LMS Login
                </Link>
              </div>
            )}
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
