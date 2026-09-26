"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(135deg,_#f8fbff_0%,_#f5f3ff_45%,_#eef7ff_100%)] px-6 py-12 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(135deg,_#020817_0%,_#0f172a_35%,_#111827_100%)]">
      <div className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-9 dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-[0_28px_70px_rgba(2,6,23,0.52)]">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-lg font-black text-white shadow-lg shadow-indigo-200 dark:shadow-[0_16px_28px_rgba(99,102,241,0.35)]">
            C
          </div>
        </div>

        <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">Password reset</p>
        <h1 className="mt-3 text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white">Forgot your password?</h1>

        {submitted ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
            Password reset instructions have been sent to {email || "your email"}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-3 font-semibold text-white shadow-[0_16px_35px_rgba(79,70,229,0.3)] transition hover:brightness-110 dark:shadow-[0_16px_35px_rgba(99,102,241,0.36)]"
            >
              Send reset link
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
