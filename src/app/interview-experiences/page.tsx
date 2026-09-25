import PageShell from "@/components/page-shell";

const points = [
  "Detailed interview stories from learners who went through real selection rounds.",
  "Breakdowns of questions, preparation strategy, and the experience behind each round.",
  "Insights into common challenges, strong responses, and how to present your work effectively.",
  "A practical learning resource for preparing with confidence and clarity.",
];

export default function InterviewExperiencesPage() {
  return (
    <PageShell eyebrow="Resource" title="Interview Experiences">
      <ul className="space-y-4 list-disc pl-6 text-slate-300">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </PageShell>
  );
}
