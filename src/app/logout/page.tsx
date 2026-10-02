"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/login", redirect: true });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(135deg,_#f8fbff_0%,_#f5f3ff_45%,_#eef7ff_100%)] px-6 py-12 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(135deg,_#020817_0%,_#0f172a_35%,_#111827_100%)]">
      <div className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white/90 p-8 text-center shadow-[0_28px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-[0_28px_70px_rgba(2,6,23,0.52)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-lg font-black text-white shadow-lg shadow-indigo-200 dark:shadow-[0_16px_28px_rgba(99,102,241,0.35)]">
          C
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">Signing out</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Please wait</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          We are signing you out and redirecting you to the login page.
        </p>
      </div>
    </main>
  );
}
