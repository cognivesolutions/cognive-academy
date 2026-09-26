import Link from "next/link";

import { BackToTopButton } from "@/components/back-to-top";
import ScrollToTopOnMount from "@/components/scroll-to-top-on-mount";

const resourceCards = [
  {
    title: "Resume Analyzer",
    description:
      "Get ATS-friendly resume feedback, role-specific suggestions, and a clearer story for your next application.",
    href: "/resume-analyzer",
    badge: "Career readiness",
    accent: "from-indigo-600 via-violet-600 to-sky-500",
  },
  {
    title: "Tech Blog",
    description:
      "Read practical lessons on SQL, Python, analytics workflows, and the habits that improve real-world output.",
    href: "/tech-blog",
    badge: "Insights",
    accent: "from-cyan-500 via-sky-500 to-indigo-500",
  },
  {
    title: "Interview Experiences",
    description:
      "Explore real interview stories, preparation patterns, and examples from successful career transitions.",
    href: "/interview-experiences",
    badge: "Preparation",
    accent: "from-fuchsia-600 via-violet-600 to-indigo-500",
  },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <ScrollToTopOnMount />
      <BackToTopButton />

      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_24%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_35%,_#f8fafc_100%)] py-14 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.2),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(135deg,_#020817_0%,_#0f172a_40%,_#111827_100%)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
              Resources
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] text-slate-900 dark:text-white sm:text-5xl">
              Tools and learning resources to keep your momentum going.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Build confidence with practical resources that help you prepare, apply, and improve your work across the job search and learning journey.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {resourceCards.map((resource) => (
            <article
              key={resource.title}
              className="group flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-2 hover:border-indigo-200 hover:shadow-[0_24px_50px_rgba(99,102,241,0.12)] dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_18px_40px_rgba(15,23,42,0.28)] dark:hover:border-indigo-500/40"
            >
              <div className={`mb-5 inline-flex w-fit rounded-full bg-gradient-to-r ${resource.accent} px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white`}>
                {resource.badge}
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{resource.title}</h2>
              <p className="mt-4 flex-1 text-base leading-7 text-slate-600 dark:text-slate-300">{resource.description}</p>

              <Link
                href={resource.href}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-white"
              >
                Explore {resource.title}
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
