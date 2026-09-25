import PageShell from "@/components/page-shell";

export default function SupportPage() {
  return (
    <PageShell eyebrow="Help" title="Support">
      <ul className="space-y-4 list-disc pl-6 text-slate-300">
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

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">Email</p>
          <a href="mailto:cogniveacademy@gmail.com" className="mt-1 inline-block text-indigo-300 hover:text-white">
            cogniveacademy@gmail.com
          </a>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">Phone</p>
          <a href="tel:+917839649747" className="mt-1 inline-block text-indigo-300 hover:text-white">
            +91-78396 49747
          </a>
        </div>
      </div>
    </PageShell>
  );
}
