import PageShell from "@/components/page-shell";

export default function TermsPage() {
  return (
    <PageShell eyebrow="Legal" title="Terms & Conditions">
      <ul className="space-y-4 list-disc pl-6 text-slate-300">
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
    </PageShell>
  );
}
