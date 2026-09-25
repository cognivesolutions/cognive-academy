import Link from "next/link";

const points = [
  "Personalized learning roadmap aligned with your role and goals.",
  "Live 1:1 sessions with feedback on projects, resume, and interview preparation.",
  "Focused support on analytics, SQL, Python, Power BI, and career strategy.",
  "Practical action plan so you can learn faster and apply it confidently.",
];

export default function MentorshipPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Service</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">1:1 Mentorship</h1>
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
