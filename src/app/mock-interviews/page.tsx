import PageShell from "@/components/page-shell";

const points = [
  "Mock rounds designed around analytics, business intelligence, and data roles.",
  "Interview simulation with structured feedback on communication, clarity, and technical depth.",
  "Practice with real-world questions, case prompts, and role-specific expectations.",
  "Actionable coaching that helps you improve performance before the real interview.",
];

export default function MockInterviewsPage() {
  return (
    <PageShell eyebrow="Service" title="Mock Interviews">
      <ul className="space-y-4 list-disc pl-6 text-slate-300">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </PageShell>
  );
}
