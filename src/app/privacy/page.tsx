import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Legal</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Privacy Policy</h1>
          </div>
          <Link href="/" className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-200">
            Back to Home
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">
          <ul className="space-y-4 list-disc pl-6">
            <li>
              Cognive Academy respects your privacy and is committed to protecting the information you share with us.
              We collect personal data such as your name, email, learning preferences, and support interactions to
              provide a better learning experience.
            </li>
            <li>
              Your data may be used for account management, course access, communication, support, billing, and
              improving the platform and services we offer.
            </li>
            <li>
              We do not sell or rent your personal information to third parties. Information may be shared only with
              trusted service providers who assist in operating our platform, processing payments, or delivering
              support when necessary and under appropriate confidentiality obligations.
            </li>
            <li>
              You may request access to, correction of, or deletion of your personal data by contacting us through our
              support channels. We retain certain information as required for legal, security, and operational reasons.
            </li>
            <li>
              We use reasonable administrative, technical, and physical safeguards to protect your information. Please
              avoid sharing sensitive passwords or confidential data with anyone.
            </li>
          </ul>
        </div>

      </div>
    </main>
  );
}
