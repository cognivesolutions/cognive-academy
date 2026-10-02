import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCourseMetricCards } from "@/lib/course-metrics";
import CheckoutButton from "@/components/checkout-button";
import CoursePreviewDialog from "@/components/course-preview-dialog";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const course = await prisma.course.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lectures: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const session = await auth();
  const isEnrolled = !!session?.user?.id
    ? !!(await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: course.id,
          },
        },
      }))
    : false;
  const price = Number(course.price);
  const summaryMetrics = getCourseMetricCards(course);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_32%,_#f8fafc_100%)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#020817_0%,_#0f172a_38%,_#111827_100%)] dark:text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 sm:p-6 lg:p-8">
          <div className="mb-3 flex items-center justify-end gap-3">
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
              {course.isLive ? "Live learning" : "Recorded learning"}
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                  {course.category} course
                </span>
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {course.level}
                </span>
              </div>

              <div>
                <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-900 dark:text-white sm:text-5xl">{course.title}</h1>
                <p className="mt-2 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{course.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {summaryMetrics.map((item) => (
                  <div
                    key={item.label}
                    className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-[0_10px_26px_rgba(15,23,42,0.04)] transition-all duration-250 ease-out hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-[0_18px_30px_rgba(15,23,42,0.09)] dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-[0_10px_22px_rgba(2,6,23,0.18)] dark:hover:border-slate-600 dark:hover:bg-slate-800/80"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.label}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900 transition-colors duration-200 group-hover:text-slate-700 dark:text-white dark:group-hover:text-slate-100">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(30,41,59,0.92),_rgba(79,70,229,0.82))] p-3 shadow-[0_18px_42px_rgba(15,23,42,0.14)] dark:border-slate-700">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-100">Preview lecture</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-indigo-100">
                    Starter lesson
                  </span>
                </div>
                {course.previewLectureUrl ? (
                  <CoursePreviewDialog
                    videoUrl={course.previewLectureUrl}
                    title={course.title}
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-[18px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.45),_transparent_30%),linear-gradient(135deg,_#0f172a_0%,_#1e1b4b_40%,_#111827_100%)] text-sm font-medium text-white/90 shadow-inner sm:text-base">
                    Preview is unavailable yet
                  </div>
                )}
              </div>

              <div id="curriculum" className="space-y-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">Curriculum</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">What you’ll learn</h2>
                  </div>
                  <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:block">
                    {course.modules.length} modules
                  </div>
                </div>

                {course.modules.map((module, index) => (
                  <details
                    key={module.id}
                    className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(79,70,229,0.08)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_18px_32px_rgba(2,6,23,0.35)]"
                    open={index === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">
                            Module {index + 1}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {module.lectures.length} lessons
                          </span>
                        </div>
                        <h3 className="mt-3 text-left text-xl font-bold text-slate-900 dark:text-white">{module.title}</h3>
                      </div>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700 transition-transform duration-200 group-open:rotate-180 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                        ▾
                      </span>
                    </summary>

                    <div className="border-t border-slate-200 px-5 pb-5 pt-4 dark:border-slate-700">
                      {module.description ? (
                        <p className="text-slate-600 dark:text-slate-300">{module.description}</p>
                      ) : null}

                      <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-300">
                        {module.lectures.map((lecture) => (
                          <li key={lecture.id} className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                            <span>{lecture.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                ))}
              </div>
            </section>

            <aside className="lg:pt-10">
              <div className="sticky top-8 overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.98))] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_30px_90px_rgba(15,23,42,0.12)] hover:ring-1 hover:ring-indigo-100/80 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(17,24,39,0.98))] dark:shadow-[0_22px_60px_rgba(2,6,23,0.35)] dark:hover:border-slate-600 dark:hover:ring-indigo-500/20">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Limited access
                  </span>
                  <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-slate-100 dark:text-slate-900">
                    Best value
                  </span>
                </div>

                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Course price</div>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">₹{price.toLocaleString("en-IN")}</span>
                  <span className="pb-1 text-lg text-slate-400 line-through">₹{(price * 1.35).toLocaleString("en-IN")}</span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Learn from real-world product, architecture, and experimentation patterns with lifetime access and mentor support.
                </p>

                <div className="mt-5 space-y-2.5">
                  {[
                    "Lifetime access",
                    "Recorded + live learning support",
                    "Downloadable resources",
                    "Mentor Q&A support",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">✓</span>
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  {isEnrolled ? (
                    <a
                      href={course.isLive ? `/courses/${course.slug}/live` : `/courses/${course.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-3.5 text-base font-semibold text-white shadow-[0_16px_36px_rgba(16,185,129,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(16,185,129,0.32)]"
                    >
                      Continue learning
                    </a>
                  ) : (
                    <CheckoutButton
                      course={{
                        id: course.id,
                        slug: course.slug,
                        title: course.title,
                        price,
                        currency: course.currency,
                      }}
                      userId={session?.user?.id ?? ""}
                      isAuthenticated={Boolean(session?.user?.id)}
                    />
                  )}
                </div>

                <div className="mt-5 flex items-center justify-center gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <span>Secure checkout</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span>Instant access</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span>7-day refund</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
