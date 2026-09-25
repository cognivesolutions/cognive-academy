import Link from "next/link";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Help</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Support</h1>
          </div>
          <Link href="/" className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-200">
            Back to Home
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">
          <ul className="space-y-4 list-disc pl-6">
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
        </div>

      </div>
    </main>
  );
}
