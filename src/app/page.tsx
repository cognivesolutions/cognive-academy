import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TESTIMONIALS } from "@/data/testimonials";
import { SITE } from "@/config/site";
import { GlobalCourseSearch } from "@/components/global-course-search";
import { SiteNav } from "@/components/site-nav";
import { UserMenu } from "@/components/user-menu";
import HeroShowcase from "@/components/hero-showcase";
import AnimatedTyping from "@/components/animated-typing";
import MobileMenu from "@/components/mobile-menu";
import { BackToTopButton } from "@/components/back-to-top";


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
      <BackToTopButton />

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
              <Link href="#courses" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_18px_34px_rgba(99,102,241,0.32)]">
                Explore programs
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 1 0-1.06L10.94 8H6.5a.75.75 0 0 1 0-1.5h7.25a.75.75 0 0 1 .75.75v7.25a.75.75 0 0 1-1.5 0V9.06l-5.72 5.72a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-md">
                Book a free call
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 1 0-1.06L10.94 8H6.5a.75.75 0 0 1 0-1.5h7.25a.75.75 0 0 1 .75.75v7.25a.75.75 0 0 1-1.5 0V9.06l-5.72 5.72a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
                </svg>
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
      
      <div id="courses">
        {/* Live Classroom Courses section */}
      <section id="live-courses" className="scroll-mt-28 mx-auto max-w-6xl px-6 py-12">
          <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Live Classroom</p>
            <h2 className="mt-2 text-3xl font-bold">Join Live Classroom Courses</h2>
          </div>
          <div>
            <Link href="/courses?type=live" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(99,102,241,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_16px_28px_rgba(99,102,241,0.28)]">
              Browse all live programs
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 1 0-1.06L10.94 8H6.5a.75.75 0 0 1 0-1.5h7.25a.75.75 0 0 1 .75.75v7.25a.75.75 0 0 1-1.5 0V9.06l-5.72 5.72a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
              </svg>
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
            <Link href="/courses?type=recorded" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(99,102,241,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_16px_28px_rgba(99,102,241,0.28)]">
              Browse all recorded courses
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 1 0-1.06L10.94 8H6.5a.75.75 0 0 1 0-1.5h7.25a.75.75 0 0 1 .75.75v7.25a.75.75 0 0 1-1.5 0V9.06l-5.72 5.72a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
              </svg>
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
      </div>

      {/* How it works section */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">A simple path from learning to career momentum.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-700 bg-slate-800/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400 hover:shadow-[0_20px_50px_rgba(99,102,241,0.18)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-black text-white">01</div>
              <h3 className="text-xl font-bold text-white">Choose your track</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">Start with a guided course path in data analytics, Python, SQL, or Power BI that fits your goals.</p>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-800/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400 hover:shadow-[0_20px_50px_rgba(99,102,241,0.18)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-sm font-black text-white">02</div>
              <h3 className="text-xl font-bold text-white">Learn with support</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">Follow structured lessons, get practical feedback, and stay on track with the right mentor guidance.</p>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-800/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400 hover:shadow-[0_20px_50px_rgba(99,102,241,0.18)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-black text-white">03</div>
              <h3 className="text-xl font-bold text-white">Practice & grow</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">Build confidence with mock interviews, portfolio support, and career-focused resources that translate into outcomes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* services section */}
      <section id="services" className="scroll-mt-28 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Services</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Support designed around your growth.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Link href="/mentorship" className="group block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-[0_18px_40px_rgba(99,102,241,0.12)] hover:bg-gradient-to-br hover:from-white hover:to-indigo-50">
              <h3 className="text-xl font-bold text-slate-900">1:1 Mentorship</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Personal guidance for your career path, learning plan, and technical bottlenecks.</p>
            </Link>
            <Link href="/mock-interviews" className="group block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-[0_18px_40px_rgba(99,102,241,0.12)] hover:bg-gradient-to-br hover:from-white hover:to-indigo-50">
              <h3 className="text-xl font-bold text-slate-900">Mock Interviews</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Practice the exact interview flow for data, analytics, and product-focused roles.</p>
            </Link>
            <Link href="/corporate-training" className="group block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-[0_18px_40px_rgba(99,102,241,0.12)] hover:bg-gradient-to-br hover:from-white hover:to-indigo-50">
              <h3 className="text-xl font-bold text-slate-900">Corporate Training</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Upskill teams with practical learning paths built for business and technical growth.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* resources section */}
      <section id="resources" className="scroll-mt-28 mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Resources</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Career-ready learning resources.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/interview-experiences" className="group block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-[0_18px_40px_rgba(99,102,241,0.12)] hover:bg-gradient-to-br hover:from-white hover:to-indigo-50">
            <h3 className="text-xl font-bold text-slate-900">Interview Experiences</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Real stories, questions, and breakdowns from successful learner interview journeys.</p>
          </Link>
          <Link href="/tech-blog" className="group block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-[0_18px_40px_rgba(99,102,241,0.12)] hover:bg-gradient-to-br hover:from-white hover:to-indigo-50">
            <h3 className="text-xl font-bold text-slate-900">Tech Blog</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Insights on data careers, tools, learning strategy, and practical industry trends.</p>
          </Link>
          <Link href="/resume-analyzer" className="group block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-[0_18px_40px_rgba(99,102,241,0.12)] hover:bg-gradient-to-br hover:from-white hover:to-indigo-50">
            <h3 className="text-xl font-bold text-slate-900">Resume Analyzer</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Check your resume for clarity, relevance, and stronger role-specific positioning.</p>
          </Link>
        </div>
      </section>

      {/* testimonials section */}
      <section id="success-stories" className="scroll-mt-28 mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-3xl font-bold">What learners say</h2>
          <div className="mt-8">
          {/* client carousel auto-scrolling right-to-left */}
          {(() => {
            const TestimonialsCarousel = require("@/components/testimonials-carousel").default;
            return <TestimonialsCarousel items={TESTIMONIALS} />;
          })()}
        </div>
      </section>

      {/* Why choose us section */}
      <section id="about-us" className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Why learners choose us</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">A learning experience built for momentum.</h2>
          </div>
          <div className="rounded-2xl bg-slate-800/80 p-4 md:p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <article className="group flex h-full flex-col rounded-3xl border border-slate-700 bg-slate-800 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400 hover:bg-slate-800/90 hover:shadow-[0_18px_40px_rgba(99,102,241,0.18)]" aria-label="Expert instructors and curriculum">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white" aria-hidden>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extrabold text-white">Industry-led curriculum</h3>
                <p className="mt-3 text-slate-300">Courses designed and taught by practitioners — focused on projects you can show employers.</p>
                <div className="mt-auto">
                  <Link href="/courses" className="inline-flex items-center text-sm font-semibold text-indigo-300 hover:text-white">Browse programs →</Link>
                </div>
              </article>

              <article className="group flex h-full flex-col rounded-3xl border border-slate-700 bg-slate-800 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400 hover:bg-slate-800/90 hover:shadow-[0_18px_40px_rgba(99,102,241,0.18)]" aria-label="Mentoring and portfolio support">
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
                  <Link href="/mentorship" className="inline-flex items-center text-sm font-semibold text-indigo-300 hover:text-white">Meet the mentors →</Link>
                </div>
              </article>

              <article className="group flex h-full flex-col rounded-3xl border border-slate-700 bg-slate-800 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-400 hover:bg-slate-800/90 hover:shadow-[0_18px_40px_rgba(99,102,241,0.18)]" aria-label="Fast skill progress and outcomes">
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
                  <Link href="#success-stories" className="inline-flex items-center text-sm font-semibold text-indigo-300 hover:text-white">See outcomes →</Link>
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
                <Link href="/signup" className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,0.32)] bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(99,102,241,0.34)]">
                  Start learning now
                </Link>
                <Link href="/courses" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20">
                  Explore courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact-us" className="bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-sm font-black text-white shadow-lg shadow-indigo-900/40 ring-4 ring-indigo-500/20">
                  C
                </div>
                <div className="leading-none">
                    <div className="text-base font-bold tracking-tight text-white">{SITE.name}</div>
                  </div>
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
                Career-focused learning for analysts, builders, and business professionals who want practical skills that translate into real work.
              </p>
              <div className="mt-6 flex items-center gap-3.5">
                <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 transition-transform duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-slate-900">
                  <Image src={require("@/../assets/images/icons/youtube.png")} alt="YouTube" width={36} height={36} className="h-full w-full rounded-full object-cover" />
                </a>

                <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 transition-transform duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-slate-900">
                  <Image src={require("@/../assets/images/icons/linkedin.png")} alt="LinkedIn" width={36} height={36} className="h-full w-full rounded-full object-cover" />
                </a>

                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 transition-transform duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-slate-900">
                  <Image src={require("@/../assets/images/icons/instagram.png")} alt="Instagram" width={36} height={36} className="h-full w-full rounded-full object-cover scale-[1.25]" />
                </a>

                <a href="https://t.me/" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 transition-transform duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-slate-900">
                  <Image src={require("@/../assets/images/icons/telegram.png")} alt="Telegram" width={36} height={36} className="h-full w-full rounded-full object-cover" />
                </a>

                <a href="https://discord.com/" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 transition-transform duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-slate-900">
                  <Image src={require("@/../assets/images/icons/discord.png")} alt="Discord" width={36} height={36} className="h-full w-full rounded-full object-cover scale-[1.28]" />
                </a>

                <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X" className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 transition-transform duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-slate-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 24 24" aria-hidden>
                    <rect width="24" height="24" rx="12" fill="#000000" />
                    <path d="M17.2 4h2.4l-5.3 6.1L20 20h-4.8l-3.8-5.6L7.2 20H4.8l5.7-6.5L4 4h4.9l3.4 5.1L17.2 4Zm-.9 14.2h1.3L8.1 5.7H6.7l9.6 12.5Z" fill="#fff" />
                  </svg>
                </a>
              </div>
            </div>

            <nav aria-label="Courses links">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Courses</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li><Link href="/courses/sql-for-analytics" className="hover:text-white">Data Analytics</Link></li>
                <li><Link href="/courses/python-for-data-tasks" className="hover:text-white">Python</Link></li>
                <li><Link href="/courses/sql-for-analytics" className="hover:text-white">SQL</Link></li>
                <li><Link href="/courses/power-bi-dashboarding" className="hover:text-white">Power BI</Link></li>
              </ul>
            </nav>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Services</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li><Link href="/mentorship" className="hover:text-white">1:1 Mentorship</Link></li>
                <li><Link href="/mock-interviews" className="hover:text-white">Mock Interviews</Link></li>
                <li><Link href="/corporate-training" className="hover:text-white">Corporate Training</Link></li>
              </ul>
            </div>

            <nav aria-label="Resources links">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Resources</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li><Link href="/interview-experiences" className="hover:text-white">Interview Experiences</Link></li>
                <li><Link href="/tech-blog" className="hover:text-white">Tech Blog</Link></li>
                <li><Link href="/resume-analyzer" className="hover:text-white">Resume Analyzer</Link></li>
              </ul>
            </nav>

            <nav aria-label="Contact us links">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Contact Us</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-slate-400" aria-hidden>
                    <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.36 2.3.55 3.5.55a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C11.3 21 3 12.7 3 2a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.19 2.4.55 3.5a1 1 0 0 1-.24 1l-2.2 2.2Z"/>
                  </svg>
                  <a href="tel:+917839649747" className="hover:text-white">+91-78396 49747</a>
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-slate-400" aria-hidden>
                    <path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm2.45-.5 6.3 5.08a1 1 0 0 0 1.25 0l6.3-5.08H5.45Z"/>
                  </svg>
                  <a href="mailto:cogniveacademy@gmail.com" className="hover:text-white">cogniveacademy@gmail.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-slate-400" aria-hidden>
                    <path d="M12 2.75a7.25 7.25 0 0 1 7.25 7.25c0 4.48-5.13 10.77-6.17 11.93a1 1 0 0 1-1.58 0C9.88 20.77 4.75 14.48 4.75 10A7.25 7.25 0 0 1 12 2.75Zm0 4.25a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>
                  </svg>
                  <a href="https://maps.google.com/?q=New+Delhi+India" target="_blank" rel="noopener noreferrer" className="hover:text-white">New Delhi, India</a>
                </li>
              </ul>
            </nav>
          </div>

            <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex sm:items-center sm:justify-between">
            <p className="mb-3 sm:mb-0">© {SITE.footerYear} {SITE.name}. All rights reserved.</p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/terms" className="transition-colors hover:text-white">Terms &amp; Conditions</Link>
              <Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
              <Link href="/refund" className="transition-colors hover:text-white">Refund Policy</Link>
              <Link href="/faq" className="transition-colors hover:text-white">FAQ&apos;s</Link>
              <Link href="/support" className="transition-colors hover:text-white">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
