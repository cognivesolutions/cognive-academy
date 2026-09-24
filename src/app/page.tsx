import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FAQS } from "@/data/faqs";
import { TESTIMONIALS } from "@/data/testimonials";
import { SITE } from "@/config/site";
import { GlobalCourseSearch } from "@/components/global-course-search";
import { SiteNav } from "@/components/site-nav";
import { UserMenu } from "@/components/user-menu";
import HeroShowcase from "@/components/hero-showcase";
import AnimatedTyping from "@/components/animated-typing";
import MobileMenu from "@/components/mobile-menu";


export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const activeQuery = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim().toLowerCase() : "";
  const activeCategory = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : "All";

  const desiredCourseOrder = SITE.desiredCourseOrder;

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: { modules: true },
  });

  const orderedCourses = [...courses].sort((a, b) => {
    const indexA = desiredCourseOrder.indexOf(a.slug);
    const indexB = desiredCourseOrder.indexOf(b.slug);
    const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
    return safeIndexA - safeIndexB;
  });

  const displayedCourses = orderedCourses;
  const featured = displayedCourses[0];
  const heroSequence = displayedCourses.slice(0, 5);

  const formatCategory = (value?: string | null) => {
    const raw = value?.trim();
    if (!raw) return "General";

    const normalized = raw.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    const key = normalized.toLowerCase();

    const overrides: Record<string, string> = {
      "powr bi": "Power BI",
      "power bi": "Power BI",
      "python": "Python",
      "sql": "SQL",
      "excel": "Excel",
      "react": "React",
      "django": "Django",
      "git": "Git",
      "mysql": "MySQL",
    };

    if (overrides[key]) return overrides[key];

    return normalized
      .split(" ")
      .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""))
      .join(" ");
  };

  const categoryFilters = Array.from(
    new Set(displayedCourses.map((course) => formatCategory(course.category)))
  );

  const filteredCourses = displayedCourses.filter((course) => {
    const courseCategory = formatCategory(course.category);
    const searchableText = [
      course.title,
      course.shortDescription ?? "",
      course.description ?? "",
      courseCategory,
      course.level,
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !activeQuery || searchableText.includes(activeQuery);
    const matchesCategory = activeCategory === "All" || courseCategory === activeCategory;

    return matchesQuery && matchesCategory;
  });

  return (
    <main id="main" className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-sm font-black text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
                C
              </div>
              <div className="text-xl font-black tracking-tight text-slate-900">Cognive Academy</div>
            </Link>

            <div className="hidden md:block">
              <SiteNav />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isLoggedIn ? (
                <UserMenu />
              ) : (
                <div className="hidden md:block">
                  <Link
                    href="/login"
                    className="inline-flex rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(99,102,241,0.25)] transition hover:opacity-95 hover:shadow-lg hover:scale-[1.02] focus-visible:ring-4 focus-visible:ring-indigo-200"
                  >
                    LMS Login
                  </Link>
                </div>
              )}
              {/* mobile menu placed to left of avatar/login */}
              <div className="md:hidden">
                <MobileMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section with animated skill badges and hero text */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(147,197,253,0.35),_transparent_36%),linear-gradient(135deg,_#dfeffc_0%,_#f2ebff_100%)] min-h-[calc(100vh-5rem)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20 lg:pt-16">
          <div className="max-w-2xl h-full flex flex-col justify-center gap-6">
            <span className="inline-flex whitespace-nowrap rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700">
              {SITE.heroBadgeText}
            </span>

              <h1 className="mt-6 mb-6 text-5xl whitespace-nowrap font-black leading-[1.02] tracking-[-0.03em] text-slate-900 sm:text-6xl max-w-[36ch] whitespace-normal">
              Build Real Skills and
              <span className="block">Launch Your Career</span>
              <span className="mt-2 block text-slate-800">With <AnimatedTyping text={SITE.animatedTyping} className={"bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500"} cursorClassName={"text-indigo-600"} /></span>
            </h1>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["A", "K", "S", "J"].map((letter, index) => (
                  <div
                    key={letter}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${
                      ["bg-cyan-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500"][index]
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div className="text-slate-700">
                <div className="text-lg font-bold text-slate-900">Join our learner community</div>
                <div className="text-sm text-slate-600">Students building practical skills and landing stronger roles</div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="#courses" className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.25)] transition hover:opacity-95">
                {SITE.ctas.exploreCourses}
              </Link>
              <Link href="/signup" className="rounded-xl border border-indigo-200 bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50">
                {SITE.ctas.requestCallback}
              </Link>
            </div>
          </div>

          <div>
            <HeroShowcase />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-white/80 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm md:grid-cols-4">
            {SITE.learnerStats.map((item) => (
              <div
                key={item.value}
                className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-center md:text-left transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-indigo-200 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600"
              >
                <div className="text-3xl font-black tracking-tight text-slate-900 group-hover:text-white">
                  {item.value}
                </div>
                <div className="mt-2 text-sm text-slate-600 group-hover:text-indigo-100">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Live Classroom Courses section */}
      <section id="live-courses" className="scroll-mt-28 mx-auto max-w-6xl px-6 py-12">
          <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Live Classroom</p>
            <h2 className="mt-2 text-3xl font-bold">Join Live Classroom Courses</h2>
          </div>
          <div>
            <Link href="/courses?type=live" className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95">
              {SITE.ctas.viewAllLive}
            </Link>
          </div>
        </div>
        <div>
          {(() => {
            const liveCourses = filteredCourses.filter((c) => (c as any).isLive);
            const toShow = liveCourses.length ? liveCourses : filteredCourses.slice(0, 6);
            
            const LiveSection = require("@/components/live-section").default;
            return <LiveSection courses={toShow} />;
          })()}
        </div>
      </section>

      {/* Recorded / Self-Paced Courses Section */}
      <section id="recorded-courses" className="scroll-mt-28 mx-auto max-w-6xl px-6 py-12">
          <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Recorded</p>
            <h2 className="mt-2 text-3xl font-bold">Recorded & Self-Paced Courses</h2>
          </div>
          <div>
            <Link href="/courses?type=recorded" className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95">
              {SITE.ctas.viewAllRecorded}
            </Link>
          </div>
        </div>

        <div>
          {(() => {
            const recorded = filteredCourses.filter((c) => !(c as any).isLive);
            const toShow = recorded.length ? recorded.slice(0, 6) : filteredCourses.slice(0, 6);

            const RecordedSection = require("@/components/recorded-section").default;
            return <RecordedSection courses={toShow} />;
          })()}
        </div>
      </section>

      {/* testimonials section */}
      <section id="testimonials" className="scroll-mt-28 mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-3xl font-bold">What learners say</h2>
          <div className="mt-8">
          {/* client carousel auto-scrolling right-to-left */}
          {(() => {
            const TestimonialsCarousel = require("@/components/testimonials-carousel").default;
            return <TestimonialsCarousel items={TESTIMONIALS} />;
          })()}
        </div>
      </section>

      {/* FAQs section */}
      <section id="faqs" className="scroll-mt-28 mx-auto max-w-4xl px-6 pb-20">
        <h2 className="text-3xl font-bold">Frequently asked questions</h2>
        <p className="mt-2 text-sm text-slate-600">Answers to common questions about courses, access, payments, and getting help.</p>
        <div className="mt-6">
          {/* Client-side accordion */}
          {(() => {
            const FAQAccordion = require("@/components/faq-accordion").default;
            return <FAQAccordion items={FAQS} />;
          })()}
        </div>
      </section>

      {/* Why choose us section */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Why learners choose us</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">A learning experience built for momentum.</h2>
          </div>
          <div className="rounded-2xl bg-slate-800/80 p-4 md:p-6">
            <div className="grid gap-6 md:grid-cols-3">
            <article className="group flex flex-col h-full rounded-3xl border border-slate-700 bg-slate-800 p-6 hover:shadow-2xl hover:border-indigo-400 transition-shadow" aria-label="Expert instructors and curriculum">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-white">Industry-led curriculum</h3>
              <p className="mt-3 text-slate-300">Courses designed and taught by practitioners — focused on projects you can show employers.</p>
              <div className="mt-auto">
                <a href="/programs" className="inline-flex items-center text-sm font-semibold text-indigo-300 hover:text-white">Browse programs →</a>
              </div>
            </article>

            <article className="group flex flex-col h-full rounded-3xl border border-slate-700 bg-slate-800 p-6 hover:shadow-2xl hover:border-indigo-400 transition-shadow" aria-label="Mentoring and portfolio support">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20H4v-2a4 4 0 014-4h1" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-white">Mentors & practical feedback</h3>
              <p className="mt-3 text-slate-300">Weekly mentor office hours, portfolio reviews, and actionable feedback on your projects.</p>
              <div className="mt-auto">
                <a href="/mentors" className="inline-flex items-center text-sm font-semibold text-indigo-300 hover:text-white">Meet the mentors →</a>
              </div>
            </article>

            <article className="group flex flex-col h-full rounded-3xl border border-slate-700 bg-slate-800 p-6 hover:shadow-2xl hover:border-indigo-400 transition-shadow" aria-label="Fast skill progress and outcomes">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v6h6" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21v-6h-6" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-4 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-white">Fast, measurable progress</h3>
              <p className="mt-3 text-slate-300">Structured lessons, hands-on work, and clear milestones to keep you progressing quickly.</p>
              <div className="mt-auto">
                <a href="/success-stories" className="inline-flex items-center text-sm font-semibold text-indigo-300 hover:text-white">See outcomes →</a>
              </div>
            </article>
          </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 p-6 shadow-2xl" role="region" aria-label="Get started call to action">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">Ready to start?</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Turn learning into a career — start today.</h2>
                <p className="mt-2 text-sm text-indigo-100/90">Skip the forms — chat with our team or create an account to get started quickly.</p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-600 hover:scale-[1.02] transition-transform">
                  Create account
                </Link>
                <Link href="/courses/analytics-bootcamp" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20">
                  View course
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-sm font-black text-white shadow-lg shadow-indigo-900/40 ring-4 ring-indigo-500/20">
                  C
                </div>
                <div className="leading-none">
                    <div className="text-base font-bold tracking-tight text-white">{SITE.name}</div>
                    <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">Learning studio</div>
                  </div>
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
                Career-focused learning for analysts, builders, and business professionals who want practical skills that translate into real work.
              </p>
            </div>

            <nav aria-label="Platform links">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Platform</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li><Link href="#courses" className="hover:text-white">Courses</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/signup" className="hover:text-white">Join</Link></li>
              </ul>
            </nav>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Programs</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                {SITE.programs.map((p) => (
                  <li key={p}><Link href="#" className="hover:text-white">{p}</Link></li>
                ))}
              </ul>
            </div>

            <nav aria-label="Company links">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Company</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li><Link href="#testimonials" className="hover:text-white">Testimonials</Link></li>
                <li><Link href="#faqs" className="hover:text-white">FAQs</Link></li>
                <li><Link href="/support" className="hover:text-white">Support</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
              </ul>
            </nav>
          </div>

            <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex sm:items-center sm:justify-between">
            <p className="mb-3 sm:mb-0">© {SITE.footerYear} {SITE.name}. All rights reserved.</p>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-slate-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 7.5v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>

                <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.3c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 10.3h-3v-4.5c0-1.07-.93-1.5-1.5-1.5-.577 0-1.5.43-1.5 1.5v4.5h-3v-9h3v1.2c.464-.7 1.5-1.2 2.5-1.2 1.96 0 4 1.17 4 4.8v4z" />
                  </svg>
                </a>

                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.4A4.6 4.6 0 1016.6 13 4.6 4.6 0 0012 8.4zm6.5-3.6a1.1 1.1 0 11-1.1-1.1 1.1 1.1 0 011.1 1.1z" />
                  </svg>
                </a>

                <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-slate-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M23.5 6.2s-.2-1.6-.8-2.3c-.8-.9-1.7-.9-2.1-1C16.8 2.5 12 2.5 12 2.5h-.1s-4.8 0-8.6.4c-.4 0-1.3 0-2.1 1C.7 4.6.5 6.2.5 6.2S.2 8 .2 9.8v2.4c0 1.8.3 3.6.3 3.6s.2 1.6.8 2.3c.8.9 1.8.9 2.3 1 1.7.2 7.5.4 7.5.4s4.8 0 8.6-.4c.4 0 1.3 0 2.1-1 .6-.7.8-2.3.8-2.3s.3-1.8.3-3.6V9.8c0-1.8-.3-3.6-.3-3.6zM9.8 15.6V8.4l6.2 3.6-6.2 3.6z" />
                  </svg>
                </a>
              </div>

              <div className="flex items-center gap-5">
                <Link href="/privacy" className="hover:text-white">Privacy</Link>
                <Link href="/terms" className="hover:text-white">Terms</Link>
                <Link href="/support" className="hover:text-white">Support</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
