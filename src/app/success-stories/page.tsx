"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import TestimonialsCarousel from "@/app/home/components/testimonials-carousel";
import { TESTIMONIALS } from "@/data/testimonials";

const careerPaths = [
  "All",
  "Data Analytics",
  "Product Design",
  "Business Analysis",
  "Product Management",
  "Software Engineering",
];

const successStories = [
  {
    id: "aisha",
    name: "Aisha Shah",
    role: "Product Designer",
    path: "Product Design",
    location: "Bengaluru",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    outcome: "Moved from freelance work to a full-time design role",
    metrics: "3 months to offer",
    highlight:
      "Improved portfolio, interview confidence, and product thinking through mentor-guided feedback.",
    story:
      "Aisha wanted a more stable, strategic product design role. By restructuring her case stories and reworking her portfolio around outcomes, she went from ambiguous freelance work to a confident final-round interview and a strong offer.",
    tags: ["Portfolio review", "Interview prep", "Career switch"],
    interview: {
      rounds: "4 rounds",
      prep: "Portfolio + product case + stakeholder discussion",
      outcome: "Offer from a B2B SaaS company",
    },
  },
  {
    id: "ravi",
    name: "Ravi Patel",
    role: "Data Analyst",
    path: "Data Analytics",
    location: "Hyderabad",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    outcome: "Joined a product-led analytics team in Bangalore",
    metrics: "2.5x faster reporting",
    highlight:
      "Built SQL and dashboarding projects that translated directly into client-facing business problem solving.",
    story:
      "Ravi needed a way to turn technical analysis into business clarity. With guided project feedback and a sharper storytelling framework, he redesigned how he presented insights and landed a role focused on product outcomes.",
    tags: ["SQL", "Power BI", "Business impact"],
    interview: {
      rounds: "3 rounds",
      prep: "SQL exercises + business case + dashboard walkthrough",
      outcome: "Analytics role with product reporting",
    },
  },
  {
    id: "sneha",
    name: "Sneha Iyer",
    role: "Business Analyst",
    path: "Business Analysis",
    location: "Delhi",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    outcome: "Transitioned into analytics with a stronger business narrative",
    metrics: "4 rounds cleared",
    highlight:
      "The structured roadmap helped her connect technical execution to stakeholder communication and decision-making.",
    story:
      "Sneha had the technical skills but struggled to explain business value in interviews. A clearer narrative around problem framing, metrics, and stakeholder impact made her confidence and communication click.",
    tags: ["Analytics", "Storytelling", "Mentorship"],
    interview: {
      rounds: "4 rounds",
      prep: "Business case + stakeholder communication + outcome framing",
      outcome: "Analytics role in a growth company",
    },
  },
  {
    id: "kiran",
    name: "Kiran Menon",
    role: "Product Manager",
    path: "Product Management",
    location: "Pune",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    outcome: "Landed a PM role after building a stronger execution story",
    metrics: "92% interview lift",
    highlight:
      "Focused feedback on prioritization, product sense, and live case practice helped him sharpen decision quality.",
    story:
      "Kiran had strong domain knowledge but needed a better structure for product discussions. Through case-based learning and mock interviews, he built a more compelling story around trade-offs and customer outcomes.",
    tags: ["Product sense", "Case prep", "Leadership"],
    interview: {
      rounds: "5 rounds",
      prep: "Product strategy case + prioritization + stakeholder management",
      outcome: "Role with ownership across growth and operations",
    },
  },
  {
    id: "meher",
    name: "Meher Nair",
    role: "Frontend Engineer",
    path: "Software Engineering",
    location: "Coimbatore",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    outcome: "Moved into a higher-paying engineering team with stronger portfolio proof",
    metrics: "2 offers in 6 weeks",
    highlight:
      "Practical coding guidance, portfolio refinement, and interview drills made her final rounds much more focused and confident.",
    story:
      "Meher needed a sharper balance between system design confidence and project clarity. The learning structure helped her package experience into better technical narratives and faster rounds.",
    tags: ["Coding practice", "System design", "Portfolio"],
    interview: {
      rounds: "3 rounds",
      prep: "DSA review + frontend architecture + behavioral storytelling",
      outcome: "Two engineering offers in a single cycle",
    },
  },
];

const journeySteps = [
  { title: "Learn with clarity", description: "Learners follow a practical roadmap built around real business tasks, not abstract theory." },
  { title: "Practice with feedback", description: "Mentors review projects, resumes, and interview performance to sharpen real-world execution." },
  { title: "Apply with confidence", description: "Every story ends in stronger positioning, clearer communication, and better outcomes in interviews and jobs." },
];

const stats = [
  { label: "Learners placed", value: 280, suffix: "+" },
  { label: "Career transitions", value: 94, suffix: "%" },
  { label: "Confidence boost", value: 68, suffix: "%" },
];

function AnimatedCounter({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1200;

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const nextValue = value * progress;
      setCount(Number(nextValue.toFixed(decimals)));

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, decimals]);

  return <span>{count}{suffix}</span>;
}

export default function SuccessStoriesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedStory, setSelectedStory] = useState<(typeof successStories)[number] | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const filteredStories = useMemo(() => {
    if (activeFilter === "All") return successStories;
    return successStories.filter((story) => story.path === activeFilter);
  }, [activeFilter]);

  const featuredInterviewStory = filteredStories[0] ?? successStories[0];

  const rootClasses = isDark
    ? "min-h-screen bg-slate-950 text-slate-50"
    : "min-h-screen bg-white text-slate-900";

  const surfaceClasses = isDark
    ? "bg-slate-900 text-slate-50 border-slate-800"
    : "bg-white text-slate-900 border-slate-200";

  const mutedText = isDark ? "text-slate-300" : "text-slate-600";
  const subtleCard = isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200";
  const pillClasses = isDark
    ? "border-slate-700 bg-slate-900 text-slate-200 shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
    : "border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.04)]";
  const ghostBtn = isDark ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700";
  const heroBackground = isDark
    ? "bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_28%),linear-gradient(135deg,_#020817_0%,_#111827_50%,_#0f172a_100%)]"
    : "bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(135deg,_#f8fbff_0%,_#f5f3ff_50%,_#eef7ff_100%)]";

  return (
    <main className={`${rootClasses} pt-0`}>
      <section className={`relative overflow-hidden ${heroBackground} pt-4 pb-10 md:pt-6 md:pb-12 lg:min-h-[calc(100vh-5.5rem)] lg:pt-8 lg:pb-10`}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-8 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">
            <div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-200" : "border-indigo-200 bg-indigo-50 text-indigo-700"}`}>
                Success stories
              </span>
              <h1 className={`mt-6 text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-[4rem] lg:leading-[1.02] ${isDark ? "text-white" : "text-slate-900"}`}>
                Real learners. Real momentum. Real career growth.
              </h1>
              <p className={`mt-5 max-w-xl text-lg leading-8 md:text-xl ${mutedText}`}>
                These stories reflect the kind of progress learners make when strategy, mentorship, and practical projects come together.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/courses" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(79,70,229,0.26)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(79,70,229,0.32)]">
                  Explore programs
                </Link>
                <Link href="/contact-us#contact-hero" className={`inline-flex items-center justify-center rounded-full border px-6 py-3.5 text-sm font-semibold shadow-[0_10px_20px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 ${isDark ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-indigo-500/40 hover:bg-indigo-500/10" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"}`}>
                  Talk to us
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[440px]">
              <div className={`absolute -left-8 top-10 h-28 w-28 rounded-full blur-2xl ${isDark ? "bg-violet-500/30" : "bg-violet-200/70"}`} aria-hidden="true" />
              <div className={`absolute -right-8 bottom-8 h-32 w-32 rounded-full blur-2xl ${isDark ? "bg-cyan-500/30" : "bg-cyan-200/70"}`} aria-hidden="true" />

              <div className={`relative rounded-[32px] border p-4 pb-5 shadow-[0_30px_70px_rgba(15,23,42,0.12)] backdrop-blur-sm ${isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-white/80"}`}>
                <div className="rounded-[28px] bg-slate-900 p-5 text-white shadow-[0_28px_60px_rgba(15,23,42,0.24)]">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100/80">
                    <span>Outcome tracker</span>
                    <span className="rounded-full border border-white/20 bg-white/5 px-2 py-1">
                      +<AnimatedCounter value={1.8} suffix="k" decimals={1} />
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {stats.map((item) => (
                      <div key={item.label} className="rounded-2xl bg-white/6 p-3 ring-1 ring-white/10">
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-200">
                          <span>{item.label}</span>
                          <span className="text-lg font-black text-white"><AnimatedCounter value={item.value} suffix={item.suffix} /></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`relative z-10 mt-4 rounded-[24px] border p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className={`text-[11px] uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Career win</div>
                      <div className={`mt-1 text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>Better jobs. Better clarity.</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-700">✓</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`mx-auto max-w-6xl px-6 py-16 md:py-20 ${isDark ? "text-slate-50" : "text-slate-900"}`}>
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Featured journeys</p>
            <h2 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>
              Some learners started with uncertainty. They left with traction.
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {careerPaths.map((path) => {
              const active = activeFilter === path;
              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => setActiveFilter(path)}
                  className={`inline-flex min-w-[140px] items-center justify-center rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-[0_10px_18px_rgba(79,70,229,0.12)]"
                      : pillClasses
                  }`}
                >
                  {path}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {filteredStories.map((story) => (
            <article
              key={story.id}
              className={`group flex h-full flex-col overflow-hidden rounded-[28px] border shadow-[0_18px_40px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(99,102,241,0.12)] ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}
            >
              <div className="relative h-64 overflow-hidden">
                <img src={story.image} alt={story.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-slate-900/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                  {story.path}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>{story.name}</div>
                    <div className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-500"}>{story.role}</div>
                  </div>
                  <div className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isDark ? "bg-indigo-500/10 text-indigo-200" : "bg-indigo-50 text-indigo-700"}`}>
                    {story.metrics}
                  </div>
                </div>

                <div className={`mt-5 rounded-2xl p-4 ${isDark ? "bg-slate-800/80" : "bg-slate-50"}`}>
                  <div className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Outcome</div>
                  <p className={`mt-2 text-base font-bold leading-7 ${isDark ? "text-slate-100" : "text-slate-800"}`}>{story.outcome}</p>
                </div>

                <p className={`mt-5 text-base leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{story.highlight}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {story.tags.map((tag) => (
                    <span key={tag} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${isDark ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedStory(story)}
                    className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                  >
                    View case study
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={isDark ? "bg-slate-900 py-16 md:py-20" : "bg-slate-50 py-16 md:py-20"}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Interview spotlight</p>
            <h2 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>
              A dedicated story from the final interview journey.
            </h2>
          </div>

          <div className={`grid overflow-hidden rounded-[32px] border shadow-[0_30px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[0.96fr_1.04fr] ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
            <div className="relative min-h-[420px]">
              <img src={featuredInterviewStory.image} alt={featuredInterviewStory.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/15 to-transparent" />
              <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                {featuredInterviewStory.path}
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600">Interview success story</div>
              <h3 className={`mt-4 text-3xl font-black tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>
                {featuredInterviewStory.name}
              </h3>
              <p className={isDark ? "mt-2 text-base font-medium text-slate-400" : "mt-2 text-base font-medium text-slate-500"}>
                {featuredInterviewStory.role} • {featuredInterviewStory.location}
              </p>

              <p className={`mt-5 text-lg leading-8 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {featuredInterviewStory.story}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Interview rounds", value: featuredInterviewStory.interview.rounds },
                  { label: "Prep focus", value: featuredInterviewStory.interview.prep },
                  { label: "Final outcome", value: featuredInterviewStory.interview.outcome },
                ].map((item) => (
                  <div key={item.label} className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-slate-50"}`}>
                    <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.label}</div>
                    <div className={`mt-2 text-sm font-bold leading-6 ${isDark ? "text-slate-100" : "text-slate-800"}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className={`mt-6 rounded-2xl border p-4 ${isDark ? "border-indigo-500/30 bg-indigo-500/10" : "border-indigo-100 bg-indigo-50"}`}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">What changed</div>
                <ul className={`mt-3 space-y-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <li>• Framed outcomes around business impact instead of personal effort alone.</li>
                  <li>• Refined mock interview structure to match real role expectations.</li>
                  <li>• Built confidence in live problem-solving and stakeholder communication.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={isDark ? "bg-slate-950 py-16 md:py-20" : "bg-slate-50 py-16 md:py-20"}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">How it happens</p>
            <h2 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>
              A structured path from learning to lasting career momentum.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {journeySteps.map((step, index) => (
              <div key={step.title} className={`rounded-[28px] border p-6 shadow-sm ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-black text-white shadow-[0_12px_24px_rgba(99,102,241,0.2)]">
                  0{index + 1}
                </div>
                <h3 className={`mt-5 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{step.title}</h3>
                <p className={`mt-3 text-base leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`mx-auto max-w-6xl px-6 py-16 md:py-20 ${isDark ? "text-slate-50" : "text-slate-900"}`}>
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">What learners say</p>
          <h2 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>
            More confidence, sharper skills, and clearer next steps.
          </h2>
        </div>
        <TestimonialsCarousel items={TESTIMONIALS} />
      </section>

      <section className={`border-t ${isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"}`}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-[32px] bg-gradient-to-r from-[#4b35d7] via-[#6f46d8] to-[#39a9ea] p-8 shadow-[0_24px_60px_rgba(89,66,214,0.28)] md:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-100">Ready for your next move?</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                  Build a stronger profile with a roadmap designed for real outcomes.
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(79,70,229,0.26)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(79,70,229,0.32)]"
                >
                  Explore courses
                </Link>
                <Link
                  href="/contact-us#contact-hero"
                  className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedStory ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className={`relative w-full max-w-3xl overflow-hidden rounded-[30px] border ${isDark ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
            <button
              type="button"
              onClick={() => setSelectedStory(null)}
              className={`absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border text-lg transition ${isDark ? "border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}
              aria-label="Close case study"
            >
              ×
            </button>

            <div className="grid md:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-[280px] md:min-h-full">
                <img src={selectedStory.image} alt={selectedStory.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />
              </div>

              <div className="p-6 md:p-8">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">Featured case study</div>
                <h3 className={`mt-3 text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{selectedStory.name}</h3>
                <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{selectedStory.role} • {selectedStory.location}</p>

                <div className={`mt-5 rounded-2xl p-4 ${isDark ? "bg-slate-800/80" : "bg-slate-50"}`}>
                  <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Client result</div>
                  <p className={`mt-2 text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{selectedStory.outcome}</p>
                </div>

                <p className={`mt-5 text-base leading-7 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{selectedStory.story}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Interview rounds", value: selectedStory.interview.rounds },
                    { label: "Prep focus", value: selectedStory.interview.prep },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-2xl border p-3 ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}>
                      <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.label}</div>
                      <div className={`mt-2 text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className={`mt-6 rounded-2xl border p-4 ${isDark ? "border-indigo-500/30 bg-indigo-500/10" : "border-indigo-100 bg-indigo-50"}`}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">Final outcome</div>
                  <div className={`mt-2 text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{selectedStory.interview.outcome}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
