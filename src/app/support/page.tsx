import PageShell from "@/components/page-shell";

export default function SupportPage() {
  return (
    <PageShell eyebrow="Help" title="Support">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-[0_16px_34px_rgba(2,6,23,0.24)]">
        <ul className="space-y-4 pl-6 text-sm leading-7 text-slate-600 list-disc dark:text-slate-300">
          <li>
            Need help with a course, key access, payment, or your learning plan? Our support team is here to assist.
          </li>
          <li>
            You can contact us via email for billing questions, enrollment support, content access issues, account
            help, and general guidance.
          </li>
          <li>
            We aim to respond to support inquiries as quickly as possible and help you resolve technical,
            enrollment, or platform issues with minimal delay.
          </li>
        </ul>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200">
            <p className="font-semibold text-slate-900 dark:text-white">Email</p>
            <a href="mailto:cogniveacademy@gmail.com" className="mt-1 inline-block text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">
              cogniveacademy@gmail.com
            </a>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200">
            <p className="font-semibold text-slate-900 dark:text-white">Phone</p>
            <a href="tel:+917839649747" className="mt-1 inline-block text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">
              +91-78396 49747
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
