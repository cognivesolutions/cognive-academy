import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    include: { modules: true },
  });

  const featured = courses.find((course) => course.featured) ?? courses[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-sm font-black text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
                C
              </div>
              <div className="leading-none">
                <div className="text-base font-bold tracking-tight text-slate-900">Cognive Academy</div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-500">Learning studio</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
              <a href="#courses" className="transition hover:text-slate-900">Courses</a>
              <a href="#testimonials" className="transition hover:text-slate-900">Testimonials</a>
              <a href="#faqs" className="transition hover:text-slate-900">FAQs</a>
              <a href="#pricing" className="transition hover:text-slate-900">Pricing</a>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex">
                    Dashboard
                  </Link>
                  <Link href="/profile" className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex">
                    Profile
                  </Link>
                </>
              ) : (
                <Link href="/login" className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex">
                  Login
                </Link>
              )}
              <Link href="/signup" className="inline-flex rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-700">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700">
              Career-focused learning
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-[-0.05em] text-slate-900 sm:text-6xl">
              Build the skills that land real opportunities.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Learn practical data, product, and business skills through structured cohorts designed for career growth.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(15,23,42,0.18)] transition hover:bg-slate-700">
                {isLoggedIn ? "Go to dashboard" : "Get started"}
              </Link>
              <Link href="#courses" className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                Browse programs
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-600">
              <div>
                <div className="text-2xl font-black text-slate-900">10k+</div>
                <div className="mt-0.5">Students trained</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">4.9/5</div>
                <div className="mt-0.5">Average rating</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">96%</div>
                <div className="mt-0.5">Course completion</div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="rounded-[24px] bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-indigo-100">Featured cohort</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight">{featured?.title ?? "Analytics Bootcamp"}</h2>
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  Live
                </div>
              </div>

              <p className="mt-4 max-w-md text-sm leading-7 text-indigo-50">
                {featured?.shortDescription ?? "Hands-on SQL, Excel, and Power BI training for business-ready analysis careers."}
              </p>

              <div className="mt-6 flex items-end justify-between gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-indigo-100">Starting at</div>
                  <div className="mt-2 text-3xl font-black">₹{featured ? Number(featured.price).toLocaleString("en-IN") : 4999}</div>
                </div>
                <Link href={featured ? `/courses/${featured.slug}` : "/login"} className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50">
                  Enroll now
                </Link>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-semibold text-slate-800">{course.title}</div>
                    <div className="text-xs text-slate-500">{course.category}</div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Course catalog</p>
            <h2 className="mt-2 text-3xl font-bold">Explore certified learning tracks</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-500">
            {courses.slice(0, 5).map((course) => (
              <button key={course.id} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 hover:border-indigo-200 hover:text-indigo-700">
                {course.category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article key={course.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{course.category}</span>
                <span className="text-sm font-medium text-slate-500">{course.modules.length} modules</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{course.title}</h3>
              <p className="mt-3 text-slate-600">{course.shortDescription ?? course.description}</p>
              <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                <span>{course.level}</span>
                <span className="font-bold text-slate-900">₹{Number(course.price).toLocaleString("en-IN")}</span>
              </div>
              <Link href={`/courses/${course.slug}`} className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-700">
                View details
              </Link>
            </article>
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

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
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

      <section id="testimonials" className="mx-auto max-w-6xl px-6 py-20">
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

      <section id="faqs" className="mx-auto max-w-4xl px-6 pb-20">
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
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Programs</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li><Link href="/courses/analytics-bootcamp" className="hover:text-white">Analytics Bootcamp</Link></li>
                <li><Link href="/courses/sql-for-data-analysts" className="hover:text-white">SQL for Analysts</Link></li>
                <li><Link href="/courses/power-bi-mastery" className="hover:text-white">Power BI Mastery</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Company</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li><a href="#testimonials" className="hover:text-white">Testimonials</a></li>
                <li><a href="#faqs" className="hover:text-white">FAQs</a></li>
                <li><Link href="/signup" className="hover:text-white">Join now</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Cognive Academy. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link href="/" className="hover:text-white">Privacy</Link>
              <Link href="/" className="hover:text-white">Terms</Link>
              <Link href="/" className="hover:text-white">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
