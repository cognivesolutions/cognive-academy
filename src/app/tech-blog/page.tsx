import PageShell from "@/components/page-shell";

const points = [
  "Practical insights on data skills, career growth, and industry trends.",
  "Short reads designed to help learners stay current with the tools and workflows employers care about.",
  "Career-focused content covering analytics, AI, SQL, Power BI, and everyday learning decisions.",
  "Useful guidance to make your learning path more strategic and outcome-oriented.",
];

export default function TechBlogPage() {
  return (
    <PageShell eyebrow="Resource" title="Tech Blog">
      <ul className="space-y-4 list-disc pl-6 text-slate-300">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </PageShell>
  );
}
