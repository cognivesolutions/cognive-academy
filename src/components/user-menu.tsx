"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const displayName = session?.user?.name?.trim() || session?.user?.email?.split("@")[0] || "Student";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideMenu = menuRef.current?.contains(target);
      const isInsideButton = buttonRef.current?.contains(target);

      if (!isInsideMenu && !isInsideButton) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative flex items-center justify-end">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Account menu"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-sm font-black text-white shadow-[0_10px_25px_rgba(79,70,229,0.25)] ring-2 ring-indigo-100/70 transition hover:scale-[1.02] dark:ring-slate-700/80"
      >
        {initials}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_40px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_20px_40px_rgba(2,6,23,0.65)]">
          <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/90">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-400">Signed in</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{displayName}</div>
            <div className="text-xs text-slate-500 dark:text-slate-300">{session?.user?.email || "student@cognive.academy"}</div>
          </div>

          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
