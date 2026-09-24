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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Password reset</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Forgot your password?</h1>

        {submitted ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Password reset instructions have been sent to {email || "your email"}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none ring-0 focus:border-indigo-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500"
            >
              Send reset link
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
