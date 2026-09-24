import Link from "next/link";

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
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    include: { modules: true },
  });

  const featured = courses.find((course) => course.featured) ?? courses[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black text-white shadow-lg shadow-indigo-200">
              C
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-slate-900">Cognive Academy</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-500">Learning studio</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#courses" className="transition hover:text-slate-900">Courses</a>
            <a href="#testimonials" className="transition hover:text-slate-900">Testimonials</a>
            <a href="#faqs" className="transition hover:text-slate-900">FAQs</a>
            <a href="#pricing" className="transition hover:text-slate-900">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex">
              Login
            </Link>
            <Link href="/profile" className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex">
              Profile
            </Link>
            <Link href="#courses" className="inline-flex rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700">
              Explore Courses
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
              Career-focused learning
            </span>
            <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-slate-900">
              Build job-ready skills in data, tech, and productivity.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Learn from industry experts through structured pathways in SQL, Python, Power BI, Git, MySQL, and Excel.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#courses" className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700">
                Browse programs
              </a>
              <Link href="/dashboard" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:bg-slate-100">
                Student dashboard
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-600">
              <div>
                <div className="text-2xl font-bold text-slate-900">10k+</div>
                <div>Students trained</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">4.9/5</div>
                <div>Average rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">96%</div>
                <div>Course completion</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-100">Featured cohort</p>
              <h2 className="mt-3 text-3xl font-bold">{featured?.title ?? "Analytics Bootcamp"}</h2>
              <p className="mt-3 text-indigo-100">
                {featured?.shortDescription ?? "Hands-on SQL, Excel, and Power BI training for business-ready analysis careers."}
              </p>
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-indigo-100">Starting at</div>
                  <div className="text-3xl font-black">₹{featured ? Number(featured.price).toLocaleString("en-IN") : 4999}</div>
                </div>
                <Link href={featured ? `/courses/${featured.slug}` : "/login"} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-700">
                  Enroll now
                </Link>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                  <span className="font-medium text-slate-700">{course.title}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Live</span>
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
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Instructor credibility</p>
              <h2 className="mt-3 text-3xl font-bold">Learn from active practitioners</h2>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-800 p-6">
              <div className="text-4xl font-black text-indigo-300">12+</div>
              <p className="mt-3 text-slate-300">Years of combined experience in product analytics, SQL, and business intelligence.</p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-800 p-6">
              <div className="text-4xl font-black text-indigo-300">200+</div>
              <p className="mt-3 text-slate-300">Live mentorship sessions and portfolio reviews delivered across career tracks.</p>
            </div>
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

      <section id="faqs" className="mx-auto max-w-4xl px-6 pb-24">
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
    </main>
  );
}
