import Link from "next/link";

const points = [
  "Detailed interview stories from learners who went through real selection rounds.",
  "Breakdowns of questions, preparation strategy, and the experience behind each round.",
  "Insights into common challenges, strong responses, and how to present your work effectively.",
  "A practical learning resource for preparing with confidence and clarity.",
];

export default function InterviewExperiencesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Resource</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Interview Experiences</h1>
          </div>
          <Link href="/" className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-200">
            Back to Home
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">
          <ul className="space-y-4 list-disc pl-6">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
