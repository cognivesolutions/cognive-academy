"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const displayName = session?.user?.name?.trim() || session?.user?.email?.split("@")[0] || "Student";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative flex items-center justify-end">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Account menu"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-sm font-black text-white shadow-[0_10px_25px_rgba(79,70,229,0.25)] ring-4 ring-indigo-50 transition hover:scale-[1.02]"
      >
        {initials}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
          <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Signed in</div>
            <div className="mt-1 font-semibold text-slate-900">{displayName}</div>
            <div className="text-xs text-slate-500">{session?.user?.email || "student@cognive.academy"}</div>
          </div>

          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
