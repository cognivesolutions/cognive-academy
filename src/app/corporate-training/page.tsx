import PageShell from "@/components/page-shell";

const points = [
  "Custom training programs for teams looking to build real-world analytics capability.",
  "Hands-on learning paths covering Python, SQL, Power BI, and business storytelling.",
  "Designed for upskilling employees with measurable skill progression and outcomes.",
  "Flexible delivery for employee learning, project teams, and organizational upskilling goals.",
];

export default function CorporateTrainingPage() {
  return (
    <PageShell eyebrow="Service" title="Corporate Training">
      <ul className="space-y-4 list-disc pl-6 text-slate-300">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </PageShell>
  );
}
