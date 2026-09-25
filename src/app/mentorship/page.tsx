import PageShell from "@/components/page-shell";

const points = [
  "Personalized learning roadmap aligned with your role and goals.",
  "Live 1:1 sessions with feedback on projects, resume, and interview preparation.",
  "Focused support on analytics, SQL, Python, Power BI, and career strategy.",
  "Practical action plan so you can learn faster and apply it confidently.",
];

export default function MentorshipPage() {
  return (
    <PageShell eyebrow="Service" title="1:1 Mentorship">
      <ul className="space-y-4 list-disc pl-6 text-slate-300">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </PageShell>
  );
}
