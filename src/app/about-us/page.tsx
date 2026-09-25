import Link from "next/link";

import AboutHeroVisual from "./components/about-hero-visual";
import AboutHighlights from "./components/about-highlights";
import AboutValues from "./components/about-values";

export const revalidate = 300;

export const metadata = {
  title: "About Us",
  description: "Learn how Cognive Academy helps learners build practical data and tech skills for real career growth.",
};

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(135deg,_#f8fbff_0%,_#f5f3ff_50%,_#eef7ff_100%)] py-12 md:py-16 lg:min-h-[calc(100vh-88px)] lg:py-16">
        <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-6xl items-center px-6">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-700 shadow-sm">
                About Cognive Academy
              </span>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-[4rem] lg:leading-[1.02]">
                Learn with clarity. Build confidence. Grow with purpose.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                We help professionals and career switchers build job-ready skills in data, analytics, and digital execution through learning that is practical, structured, and directly relevant to real work.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(79,70,229,0.26)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(79,70,229,0.32)]"
                >
                  Explore programs
                </Link>
                <Link
                  href="/contact-us#contact-hero"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-[0_10px_20px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  Talk to us
                </Link>
              </div>
            </div>

            <AboutHeroVisual />

            <div className="mt-12 lg:mt-16 lg:col-span-2">
              <AboutHighlights />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20 lg:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Our story</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-[2.7rem] lg:leading-tight">
              Built for people who need skills that actually move careers forward.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-slate-600 md:text-lg">
              <p>
                Cognive Academy was created to close the gap between classroom theory and real-world career performance. We saw too many learners stuck with information, but not enough clarity on how to apply it in projects, interviews, and daily work.
              </p>
              <p>
                Our promise is simple: practical learning, guided mentorship, and a clear path to confidence. We design every program to help learners build proof of work and make meaningful progress, one step at a time.
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-6 shadow-[0_24px_54px_rgba(15,23,42,0.06)] md:p-7">
            <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white shadow-[0_12px_24px_rgba(99,102,241,0.25)]">
                ✓
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">What we focus on</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Career-ready skills, not just course completion.</h3>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {[
                "Applied learning with real business scenarios",
                "Structured progress from beginner to confident practitioner",
                "Mentor-led clarity for projects, portfolios, and interviews",
                "Support designed for working professionals and career switchers",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-700 shadow-sm">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    •
                  </span>
                  <span className="text-[0.98rem] leading-7">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">What drives us</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              A learning model built for real-world momentum.
            </h2>
          </div>
          <AboutValues />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20 lg:py-24">
        <div className="rounded-[32px] bg-gradient-to-r from-[#4b35d7] via-[#6f46d8] to-[#39a9ea] p-8 shadow-[0_24px_60px_rgba(89,66,214,0.28)] md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-100">Ready to begin?</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                Start learning with a roadmap designed for your next move.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3.5 text-sm font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15"
              >
                Explore courses
              </Link>
              <Link
                href="/contact-us#contact-hero"
                className="inline-flex items-center justify-center rounded-full border border-white/35 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
