import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Legal</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Terms &amp; Conditions</h1>
          </div>
          <Link href="/" className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-200">
            Back to Home
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">
          <ul className="space-y-4 list-disc pl-6">
            <li>
              By accessing and using Cognive Academy, you agree to comply with these Terms &amp; Conditions. We reserve
              the right to update these terms at any time without prior notice.
            </li>
            <li>
              Users are responsible for the accuracy of the information they provide while registering, enrolling, or
              interacting with our learning platform, programs, and support services.
            </li>
            <li>
              Courses, content, and learning resources are for educational use only. They do not constitute
              financial, legal, or professional advice, and outcomes depend on the learner&apos;s effort,
              engagement, and prior experience.
            </li>
            <li>
              We may suspend or terminate access when a user violates our policies, attempts unauthorized access, or
              engages in harmful or fraudulent activity on the platform.
            </li>
            <li>
              All intellectual property rights in course materials, branding, and platform content remain with Cognive
              Academy unless otherwise stated. Duplication or distribution without permission is prohibited.
            </li>
          </ul>
        </div>

      </div>
    </main>
  );
}
