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
          <div key={faq.q} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">
              <span className="text-indigo-300">{index + 1}.</span> {faq.q}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{faq.a}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
