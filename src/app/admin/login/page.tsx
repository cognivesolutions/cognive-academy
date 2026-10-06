"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";

import { AuthMessage } from "@/components/auth-message";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const error = searchParams.get("error");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const userStatusResponse = await fetch("/api/auth-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const userStatus = await userStatusResponse.json();

      if (userStatus?.status === "inactive") {
        setFormError("This account is currently inactive. Please contact support.");
        return;
      }

      if (userStatus?.status === "missing") {
        setFormError("Invalid credentials. Please make sure you are using the correct admin email and password.");
        return;
      }

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        role: "ADMIN",
        redirect: false,
      });

      if (!result || result.error || result.ok === false) {
        setFormError("Invalid credentials. Please make sure you are using the correct admin email and password.");
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setFormError("Invalid credentials. Please make sure you are using the correct admin email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_26%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_40%,_#f8fafc_100%)] px-6 py-12 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.24),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(135deg,_#020817_0%,_#111827_35%,_#0f172a_100%)]">
      <div className="w-full max-w-md rounded-[30px] border border-indigo-200 bg-white/90 p-8 shadow-[0_28px_80px_rgba(79,70,229,0.18)] backdrop-blur-sm sm:p-9 dark:border-indigo-500/30 dark:bg-slate-900/90 dark:shadow-[0_28px_80px_rgba(79,70,229,0.22)]">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-lg font-black text-white shadow-lg shadow-indigo-200 dark:shadow-[0_16px_28px_rgba(99,102,241,0.35)]">
            A
          </div>
        </div>

        <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:text-indigo-300">Admin login</p>
        <h1 className="mt-3 text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white">Access admin dashboard</h1>
        <div className="mt-3 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200">
          Use admin credentials
        </div>

        <AuthMessage
          message={
            formError ??
            (error === "AccountInactive"
              ? "This account is currently inactive. Please contact support."
              : error === "CredentialsSignin"
                ? "Invalid credentials. Please make sure you are using the correct admin email and password."
                : null)
          }
        />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cognive.academy"
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-3 font-semibold text-white shadow-[0_16px_35px_rgba(79,70,229,0.3)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-[0_16px_35px_rgba(99,102,241,0.36)]"
          >
            {loading ? "Signing in..." : "Sign in as admin"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">
            Use student login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(135deg,_#f8fbff_0%,_#f5f3ff_45%,_#eef7ff_100%)] px-6 py-12 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(135deg,_#020817_0%,_#0f172a_35%,_#111827_100%)]">
        <div className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-9 dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-[0_28px_70px_rgba(2,6,23,0.52)]">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-lg font-black text-white shadow-lg shadow-indigo-200 dark:shadow-[0_16px_28px_rgba(99,102,241,0.35)]">
              A
            </div>
          </div>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">Admin login</p>
          <h1 className="mt-3 text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white">Loading...</h1>
        </div>
      </main>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
