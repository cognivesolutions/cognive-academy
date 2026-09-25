import PageShell from "@/components/page-shell";

export default function PrivacyPage() {
  return (
    <PageShell eyebrow="Legal" title="Privacy Policy">
      <ul className="space-y-4 list-disc pl-6 text-slate-300">
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
    </PageShell>
  );
}
