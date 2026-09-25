import Link from "next/link";

import { FAQS } from "@/data/faqs";

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Support</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Frequently asked questions</h1>
            <p className="mt-3 text-slate-300">Answers to common questions about courses, access, payments, and getting help.</p>
          </div>
          <Link href="/" className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-200">
            Back to Home
          </Link>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={faq.q} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <h2 className="text-lg font-semibold text-white">
                <span className="text-indigo-300">{index + 1}.</span> {faq.q}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{faq.a}</p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
