import Link from "next/link";
import { auth } from "@/auth";
import { SiteNav } from "./site-nav";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import MobileMenu from "./mobile-menu";

export default async function Header() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-sm font-black text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">C</div>
            <div className="text-xl font-black tracking-tight text-slate-900">Cognive Academy</div>
          </Link>

          <div className="hidden md:block">
            <SiteNav />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <div className="hidden md:block">
                <Link
                  href="/login"
                  className="inline-flex rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(99,102,241,0.25)] transition hover:opacity-95 hover:shadow-lg hover:scale-[1.02] focus-visible:ring-4 focus-visible:ring-indigo-200"
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
