"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 transition-colors duration-300 dark:bg-slate-950">
      <div className="w-full max-w-2xl rounded-[32px] border border-emerald-200 bg-white p-8 shadow-[0_30px_80px_rgba(16,185,129,0.12)] transition-colors duration-300 sm:p-10 dark:border-emerald-500/30 dark:bg-slate-900/90 dark:shadow-[0_30px_80px_rgba(16,185,129,0.18)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl shadow-inner shadow-emerald-200 dark:bg-emerald-500/15 dark:shadow-emerald-900/40">
          ✓
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-600 dark:text-emerald-300">Payment confirmed</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white">You’re all set.</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            {paymentId
              ? `Your payment reference is ${paymentId}. Your enrollment has been confirmed.`
              : "Your course enrollment has been confirmed and access has been granted."}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800/80">
          <div className="flex items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-300">
            <span>Access status</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Active</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-300">
            <span>Enrollment</span>
            <span className="font-semibold text-slate-900 dark:text-white">Confirmed</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(15,23,42,0.18)] transition hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Continue learning
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 transition-colors duration-300 dark:bg-slate-950">
        <div className="w-full max-w-2xl rounded-[32px] border border-emerald-200 bg-white p-8 shadow-[0_30px_80px_rgba(16,185,129,0.12)] transition-colors duration-300 dark:border-emerald-500/30 dark:bg-slate-900/90 dark:shadow-[0_30px_80px_rgba(16,185,129,0.18)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl shadow-inner shadow-emerald-200 dark:bg-emerald-500/15 dark:shadow-emerald-900/40">
            ✓
          </div>
          <h1 className="mt-6 text-center text-4xl font-black tracking-tight text-slate-900 dark:text-white">You’re all set.</h1>
          <p className="mt-4 text-center text-lg text-slate-600 dark:text-slate-300">Loading payment details...</p>
        </div>
      </main>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
