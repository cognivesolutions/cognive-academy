import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Legal</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Refund Policy</h1>
          </div>
          <Link href="/" className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-200">
            Back to Home
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">
          <ul className="space-y-4 list-disc pl-6">
            <li>
              Refund requests are reviewed based on the timing of the purchase, the course access status, and the
              specific product or service purchased.
            </li>
            <li>
              For eligible digital courses, a refund may be available only if the learner has not materially accessed or
              completed the course content beyond the stated trial or access threshold.
            </li>
            <li>
              Live mentorship and coaching packages may be subject to prorated refunds depending on services already
              delivered and the agreed-upon engagement scope.
            </li>
            <li>
              Requests should be raised through our support process with the relevant order details. Our team will
              review the request and respond with a decision and next steps within a reasonable time.
            </li>
            <li>
              Cognive Academy may deny or partially deny refunds in cases of misuse, abuse of access, or if the user
              has received substantial value from the purchased offering.
            </li>
          </ul>
        </div>

      </div>
    </main>
  );
}
