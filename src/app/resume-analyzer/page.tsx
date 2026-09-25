import PageShell from "@/components/page-shell";

const points = [
  "Submit your resume for quick evaluation against role expectations and clarity.",
  "Identify missing highlights, weak sections, and opportunities to improve presentation.",
  "Get practical guidance on structure, keywords, and stronger achievement statements.",
  "Use the feedback to make your resume more relevant and confident for target roles.",
];

export default function ResumeAnalyzerPage() {
  return (
    <PageShell eyebrow="Resource" title="Resume Analyzer">
      <ul className="space-y-4 list-disc pl-6 text-slate-300">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </PageShell>
  );
}
