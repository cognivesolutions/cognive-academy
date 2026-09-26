import PageShell from "@/components/page-shell";

import { FAQS } from "@/data/faqs";

export default function FAQPage() {
  return (
    <PageShell
      eyebrow="Support"
      title="Frequently asked questions"
      description="Answers to common questions about courses, access, payments, and getting help."
    >
      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <div
            key={faq.q}
            className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_16px_34px_rgba(99,102,241,0.08)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-[0_16px_34px_rgba(2,6,23,0.24)] dark:hover:border-indigo-500/40"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              <span className="mr-2 text-indigo-600 dark:text-indigo-300">{index + 1}.</span>
              {faq.q}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.a}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
