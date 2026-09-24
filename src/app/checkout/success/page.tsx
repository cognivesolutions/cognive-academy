"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <div className="text-5xl">✅</div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Payment successful</h1>
        <p className="mt-3 text-slate-600">
          {paymentId
            ? `Your payment reference is ${paymentId}. Your enrollment has been confirmed.`
            : "Your course enrollment has been confirmed and access has been granted."}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
          <div className="text-5xl">✅</div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Payment successful</h1>
          <p className="mt-3 text-slate-600">Loading payment details...</p>
        </div>
      </main>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
