import PageShell from "@/components/page-shell";

export default function RefundPage() {
  return (
    <PageShell eyebrow="Legal" title="Refund Policy">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-[0_16px_34px_rgba(2,6,23,0.24)]">
        <ul className="space-y-4 pl-6 text-sm leading-7 text-slate-600 list-disc dark:text-slate-300">
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
    </PageShell>
  );
}
