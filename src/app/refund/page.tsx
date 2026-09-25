import PageShell from "@/components/page-shell";

export default function RefundPage() {
  return (
    <PageShell eyebrow="Legal" title="Refund Policy">
      <ul className="space-y-4 list-disc pl-6 text-slate-300">
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
    </PageShell>
  );
}
