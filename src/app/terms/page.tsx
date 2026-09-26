import PageShell from "@/components/page-shell";

export default function TermsPage() {
  return (
    <PageShell eyebrow="Legal" title="Terms & Conditions">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-[0_16px_34px_rgba(2,6,23,0.24)]">
        <ul className="space-y-4 pl-6 text-sm leading-7 text-slate-600 list-disc dark:text-slate-300">
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
    </PageShell>
  );
}
