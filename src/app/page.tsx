import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GlobalCourseSearch } from "@/components/global-course-search";
import { SiteNav } from "@/components/site-nav";
import { UserMenu } from "@/components/user-menu";
import HeroShowcase from "@/components/hero-showcase";
import AnimatedTyping from "@/components/animated-typing";
import MobileMenu from "@/components/mobile-menu";
// `BigDataWheel` is a client component; import it inside a client wrapper below.

const faqs = [
  {
    q: "Do I get lifetime access?",
    a: "Yes. All enrolled students keep access to recorded lectures and project files for the lifetime of their learning plan.",
  },
  {
    q: "Are the classes beginner-friendly?",
    a: "Absolutely. Each program starts with fundamentals and advances through guided, project-based assignments.",
  },
  {
    q: "Can I join live mentoring sessions?",
    a: "Students on enrolled tracks can join live sessions, ask questions, and access recorded classroom content in their dashboard.",
  },
];

const testimonials = [
  {
    name: "Aarav S.",
    role: "Data Analyst",
    quote:
      "Cognive Academy helped me move from spreadsheets to SQL and Power BI in under two months. The project-based teaching was incredibly practical.",
  },
  {
    name: "Meera K.",
    role: "Product Analyst",
    quote:
      "The Git and MySQL track gave me the exact workflow confidence I needed for my first analytics job.",
  },
];

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

  const desiredCourseOrder = [
    "python-for-data-tasks",
    "sql-for-analytics",
    "django-for-backend-development",
    "react-for-frontend-development",
    "power-bi-dashboarding",
    "excel-for-business-analysis",
  ];

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
    <main className="min-h-screen bg-white text-slate-900">
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

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(147,197,253,0.35),_transparent_36%),linear-gradient(135deg,_#dfeffc_0%,_#f2ebff_100%)] min-h-[calc(100vh-5rem)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20 lg:pt-16">
          <div className="max-w-2xl h-full flex flex-col justify-center gap-6">
            <span className="inline-flex whitespace-nowrap rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700">
              <span className="mr-2">✦</span> Learn practical skills that drive real growth
            </span>

            <h1 className="mt-6 mb-6 text-5xl whitespace-nowrap font-black leading-[1.02] tracking-[-0.03em] text-slate-900 sm:text-6xl max-w-[36ch] whitespace-normal">
              Build Real Skills and
              <span className="block">Launch Your Career</span>
              <span className="mt-2 block text-slate-800">With <AnimatedTyping text={"Cognive Academy"} className={"bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500"} cursorClassName={"text-indigo-600"} /></span>
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
                Explore Courses
              </Link>
              <Link href="/signup" className="rounded-xl border border-indigo-200 bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50">
                Request a Callback
              </Link>
            </div>
          </div>

          {/* Replaced heavy decorative wheel with a compact BigDataWheel component */}
          <div>
            <HeroShowcase />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-white/80 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm md:grid-cols-4">
            {[
              { value: "100+", label: "Learners across the countries" },
              { value: "10+", label: "Courses" },
              { value: "4.9/5", label: "Average course rating" },
              { value: "25+", label: "Active Learners" },
            ].map((item) => (
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

      <section id="courses" className="scroll-mt-28 mx-auto max-w-6xl px-6 py-20">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Course catalog</p>
            <h2 className="mt-2 text-3xl font-bold">Explore certified learning tracks</h2>
          </div>

          <div className="w-full max-w-md">
            <form action="/#courses" method="get" className="relative block">
              <label className="relative block">
                <span className="sr-only">Search courses</span>
                <div className="relative overflow-hidden rounded-full border border-slate-200 bg-white/85 shadow-[0_8px_20px_rgba(15,23,42,0.04)] ring-1 ring-slate-100 transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_10px_25px_rgba(79,70,229,0.07)] focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100/70">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="6" />
                    <path d="M16 16L21 21" />
                  </svg>
                  <input
                    type="text"
                    name="q"
                    defaultValue={activeQuery}
                    placeholder="Search courses or skills"
                    className="w-full rounded-full bg-transparent py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </label>
            </form>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3 text-sm text-slate-500">
          <span>{filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"}</span>
          {activeCategory !== "All" || activeQuery ? (
            <Link href="/#courses" className="font-medium text-indigo-600 hover:text-indigo-700">
              Clear filters
            </Link>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <article
              key={course.id}
              className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_38px_rgba(79,70,229,0.08)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{formatCategory(course.category)}</span>
                <span className="text-sm font-medium text-slate-500">{course.modules.length} modules</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 transition-colors duration-200 group-hover:text-indigo-700">{course.title}</h3>
              <p className="mt-3 text-slate-600">{course.shortDescription ?? course.description}</p>

              <div className="mt-auto pt-6">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{course.level}</span>
                  <span className="font-bold text-slate-900">₹{Number(course.price).toLocaleString("en-IN")}</span>
                </div>
                <Link href={`/courses/${course.slug}`} className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-slate-700">
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="scroll-mt-28 mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Simple pricing</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Choose a learning plan that fits your goals.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Starter</div>
            <div className="mt-4 text-4xl font-black text-slate-900">₹2,499</div>
            <p className="mt-2 text-slate-600">For self-paced learning and fundamentals.</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li>• Access to 1 core course</li>
              <li>• Practice exercises</li>
              <li>• Lifetime access</li>
            </ul>
            <Link href="/signup" className="mt-8 inline-flex w-full justify-center rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50">
              Get started
            </Link>
          </div>

          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-600 to-violet-600 p-[1px] shadow-[0_20px_40px_rgba(79,70,229,0.25)]">
            <div className="h-full rounded-[calc(1.5rem-1px)] bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">Most popular</div>
                <div className="rounded-full bg-indigo-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-100">Popular</div>
              </div>
              <div className="mt-4 text-4xl font-black">₹7,999</div>
              <p className="mt-2 text-indigo-100">For structured learning with guided mentoring.</p>
              <ul className="mt-6 space-y-3 text-sm text-indigo-100">
                <li>• Full course access</li>
                <li>• Live Q&A sessions</li>
                <li>• Certification support</li>
              </ul>
              <Link href="/signup" className="mt-8 inline-flex w-full justify-center rounded-full bg-white px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-50">
                Start learning
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Career track</div>
            <div className="mt-4 text-4xl font-black text-slate-900">₹14,999</div>
            <p className="mt-2 text-slate-600">For deep upskilling and portfolio-building programs.</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li>• Multiple tracked programs</li>
              <li>• Mentor feedback</li>
              <li>• Capstone projects</li>
            </ul>
            <Link href="/signup" className="mt-8 inline-flex w-full justify-center rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50">
                Join career track
            </Link>
          </div>
        </div>
      </section>

      <section id="testimonials" className="scroll-mt-28 mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold">What learners say</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {testimonials.map((item) => (
            <blockquote key={item.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-lg leading-8 text-slate-700">“{item.quote}”</p>
              <footer className="mt-6">
                <div className="font-bold text-slate-900">{item.name}</div>
                <div className="text-sm text-slate-500">{item.role}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section id="faqs" className="scroll-mt-28 mx-auto max-w-4xl px-6 pb-20">
        <h2 className="text-3xl font-bold">Frequently asked questions</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">{faq.q}</h3>
              <p className="mt-2 text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Why learners choose us</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">A learning experience built for momentum.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-700 bg-slate-800 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">📘</div>
              <div className="text-4xl font-black text-indigo-300">12+</div>
              <p className="mt-3 text-slate-300">Years of combined experience in product analytics, SQL, and business intelligence.</p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-800 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">🎯</div>
              <div className="text-4xl font-black text-indigo-300">200+</div>
              <p className="mt-3 text-slate-300">Portfolio reviews, mentor sessions, and guided project feedback across our career tracks.</p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-800 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">🚀</div>
              <div className="text-4xl font-black text-indigo-300">7x</div>
              <p className="mt-3 text-slate-300">Faster progress through structured lessons, live support, and hands-on exercises.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Ready to start?</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Turn learning into career momentum.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-700">
              Create account
            </Link>
            <Link href="/courses/analytics-bootcamp" className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              View course
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-sm font-black text-white shadow-lg shadow-indigo-900/40 ring-4 ring-indigo-500/20">
                  C
                </div>
                <div className="leading-none">
                  <div className="text-base font-bold tracking-tight text-white">Cognive Academy</div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">Learning studio</div>
                </div>
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
                Career-focused learning for analysts, builders, and business professionals who want practical skills that translate into real work.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Platform</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li><Link href="#courses" className="hover:text-white">Courses</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                <li>
                  <Link href="#courses" className="group inline-flex items-center transition text-slate-300 hover:text-white focus-visible:text-white group-hover:font-bold group-active:font-bold active:text-white">
                    <span className="leading-none">Courses</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="group inline-flex items-center transition text-slate-300 hover:text-white focus-visible:text-white group-hover:font-bold group-active:font-bold active:text-white">
                    <span className="leading-none">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="group inline-flex items-center transition text-slate-300 hover:text-white focus-visible:text-white group-hover:font-bold group-active:font-bold active:text-white">
                    <span className="leading-none">Login</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Programs</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li><Link href="/courses/analytics-bootcamp" className="hover:text-white">Analytics Bootcamp</Link></li>
                <li><Link href="/courses/sql-for-data-analysts" className="hover:text-white">SQL for Analysts</Link></li>
                <li><Link href="/courses/power-bi-mastery" className="hover:text-white">Power BI Mastery</Link></li>
                <li>
                  <Link href="/courses/analytics-bootcamp" className="group inline-flex items-center transition text-slate-300 hover:text-white focus-visible:text-white group-hover:font-bold group-active:font-bold active:text-white">
                    <span className="leading-none">Analytics Bootcamp</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses/sql-for-data-analysts" className="group inline-flex items-center transition text-slate-300 hover:text-white focus-visible:text-white group-hover:font-bold group-active:font-bold active:text-white">
                    <span className="leading-none">SQL for Analysts</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses/power-bi-mastery" className="group inline-flex items-center transition text-slate-300 hover:text-white focus-visible:text-white group-hover:font-bold group-active:font-bold active:text-white">
                    <span className="leading-none">Power BI Mastery</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Company</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li><a href="#testimonials" className="hover:text-white">Testimonials</a></li>
                <li><a href="#faqs" className="hover:text-white">FAQs</a></li>
                <li><Link href="/signup" className="hover:text-white">Join now</Link></li>
                <li>
                  <a href="#testimonials" className="group inline-flex items-center transition text-slate-300 hover:text-white focus-visible:text-white group-hover:font-bold group-active:font-bold active:text-white">
                    <span className="leading-none">Testimonials</span>
                  </a>
                </li>
                <li>
                  <a href="#faqs" className="group inline-flex items-center transition text-slate-300 hover:text-white focus-visible:text-white group-hover:font-bold group-active:font-bold active:text-white">
                    <span className="leading-none">FAQs</span>
                  </a>
                </li>
                <li>
                  <Link href="/signup" className="group inline-flex items-center transition text-slate-300 hover:text-white focus-visible:text-white group-hover:font-bold group-active:font-bold active:text-white">
                    <span className="leading-none">Join now</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Cognive Academy. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link href="/" className="hover:text-white">Privacy</Link>
              <Link href="/" className="hover:text-white">Terms</Link>
              <Link href="/" className="hover:text-white">Support</Link>
              <Link href="/" className="group inline-flex items-center transition text-slate-300 hover:text-white focus-visible:text-white group-hover:font-bold group-active:font-bold active:text-white">Privacy</Link>
              <Link href="/" className="group inline-flex items-center transition text-slate-300 hover:text-white focus-visible:text-white group-hover:font-bold group-active:font-bold active:text-white">Terms</Link>
              <Link href="/" className="group inline-flex items-center transition text-slate-300 hover:text-white focus-visible:text-white group-hover:font-bold group-active:font-bold active:text-white">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
