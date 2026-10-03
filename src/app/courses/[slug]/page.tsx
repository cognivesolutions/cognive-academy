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

  const courseData = course as any;

  const basePrice = Number(courseData.price ?? 0);
  const promotionalOfferPrice =
    courseData.offerPrice !== null && courseData.offerPrice !== undefined ? Number(courseData.offerPrice) : null;
  const showPromotionalOffer = Boolean(
    courseData.isPromotional && promotionalOfferPrice !== null && promotionalOfferPrice > 0 && promotionalOfferPrice < basePrice,
  );
  const showBestValueBadge = Boolean(courseData.isBestValue || (courseData.isPromotional && showPromotionalOffer));
  const displayPrice = Number(showPromotionalOffer && promotionalOfferPrice !== null ? promotionalOfferPrice : basePrice);
  const discountPercent = showPromotionalOffer && basePrice > displayPrice
    ? Math.round(((basePrice - displayPrice) / basePrice) * 100)
    : 0;
  const formatPrice = (value: number) => new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  const summaryMetrics = getCourseMetricCards(course);
  const getLectureActionLinks = (lecture: { liveSessionUrl?: string | null; hlsUrl?: string | null; videoUrl?: string | null }) => {
    const liveLink = lecture.liveSessionUrl?.trim();
    const recordingLink = lecture.hlsUrl?.trim() || lecture.videoUrl?.trim();

    return {
      liveLink: liveLink || null,
      recordingLink: recordingLink || null,
    };
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_32%,_#f8fafc_100%)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#020817_0%,_#0f172a_38%,_#111827_100%)] dark:text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 sm:p-6 lg:p-8">
          <div className="mb-3 flex items-center justify-end gap-3">
            <span
              className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                course.isLive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-700/80 dark:text-slate-200"
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  course.isLive ? "animate-pulse bg-emerald-500 dark:bg-emerald-400" : "bg-slate-400"
                }`}
                aria-hidden="true"
              />
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
                    className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_22px_48px_rgba(79,70,229,0.10)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_18px_32px_rgba(2,6,23,0.35)] dark:hover:border-indigo-500/20"
                    open={index === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">
                          Module {index + 1}
                        </span>
                        <h3 className="mt-3 text-left text-xl font-bold text-slate-900 dark:text-white">{module.title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {module.lectures.length} sessions
                        </span>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700 shadow-sm transition-all duration-200 group-open:rotate-180 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                          ▾
                        </span>
                      </div>
                    </summary>

                    <div className="border-t border-slate-200 px-5 pb-5 pt-4 dark:border-slate-700">
                      {module.description ? (
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{module.description}</p>
                      ) : null}

                      <ul className="mt-4 space-y-2.5 text-slate-600 dark:text-slate-300">
                        {module.lectures.map((lecture) => {
                          const { liveLink, recordingLink } = getLectureActionLinks(lecture);
                          const hasLiveSession = Boolean(liveLink);
                          const hasRecording = Boolean(recordingLink);

                          return (
                            <li
                              key={lecture.id}
                              className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-3 py-2.5 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-[0_8px_18px_rgba(99,102,241,0.06)] dark:border-slate-700 dark:from-slate-800/80 dark:to-slate-900/80 dark:hover:border-indigo-500/20 dark:hover:bg-indigo-500/5"
                            >
                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600 ring-1 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-500/20">
                                ✓
                              </span>
                              <span className="flex-1 text-sm leading-6">{lecture.title}</span>

                              <div className="ml-auto flex shrink-0 items-center gap-2">
                                {!isEnrolled ? (
                                  <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                                    Enroll to unlock
                                  </span>
                                ) : hasLiveSession ? (
                                  <a
                                    href={liveLink!}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                                  >
                                    Join live
                                  </a>
                                ) : hasRecording ? (
                                  <a
                                    href={recordingLink!}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200"
                                  >
                                    Watch
                                  </a>
                                ) : (
                                  <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                                    Session not scheduled
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </details>
                ))}
              </div>
            </section>

            <aside className="lg:pt-10">
              <div className="sticky top-8 overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.98))] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-[0_32px_100px_rgba(79,70,229,0.12)] hover:ring-1 hover:ring-indigo-100/80 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(17,24,39,0.98))] dark:shadow-[0_22px_60px_rgba(2,6,23,0.35)] dark:hover:border-indigo-500/20 dark:hover:ring-indigo-500/10">
                {(showBestValueBadge || showPromotionalOffer) ? (
                  <div className="mb-4 flex items-center justify-between gap-2">
                    {courseData.isBestValue ? (
                      <span className="inline-flex items-center rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-200/80 via-yellow-100/75 to-orange-100/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-amber-900 shadow-[0_4px_12px_rgba(245,158,11,0.12)] transition-all duration-250 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_12px_18px_rgba(245,158,11,0.2)] dark:border-amber-500/30 dark:from-amber-500/15 dark:via-yellow-500/10 dark:to-orange-500/15 dark:text-amber-100">
                        Best value
                      </span>
                    ) : null}
                    {showPromotionalOffer ? (
                      <span className="group relative inline-flex items-center gap-1 overflow-hidden rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-200/70 via-yellow-100/60 to-orange-100/60 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-amber-900 shadow-[0_4px_12px_rgba(245,158,11,0.12)] transition-all duration-250 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_12px_18px_rgba(245,158,11,0.18)] dark:border-amber-500/30 dark:from-amber-500/20 dark:via-yellow-500/15 dark:to-orange-500/15 dark:text-yellow-50">
                        <span
                          className="pointer-events-none absolute inset-0 opacity-70 animate-[chipShimmer_4s_linear_infinite]"
                          style={{
                            backgroundImage:
                              "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.55) 24%, rgba(255,255,255,0.14) 38%, transparent 54%)",
                            backgroundSize: "240% 100%",
                          }}
                        />
                        <span className="relative z-10 inline-flex items-center gap-1">
                          <span aria-hidden="true">★</span>
                          Limited-time offer
                        </span>
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Course price</div>
                <div className="mt-2 flex items-end gap-3">
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 bg-clip-text text-4xl font-black tracking-tight text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-sky-300">₹{formatPrice(displayPrice)}</span>
                  {showPromotionalOffer ? (
                    <>
                      <span className="pb-1 text-lg text-slate-400 line-through decoration-slate-400/80">₹{formatPrice(basePrice)}</span>
                      <span className="mb-1 inline-flex items-center rounded-full border border-emerald-200/80 bg-gradient-to-r from-emerald-300/80 via-green-300/80 to-lime-200/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-950 shadow-[0_10px_18px_rgba(16,185,129,0.18)] backdrop-blur-sm dark:border-emerald-400/30 dark:from-emerald-500/30 dark:via-green-500/25 dark:to-lime-400/20 dark:text-emerald-50">
                        Save {discountPercent}%
                      </span>
                    </>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Learn from real-world product, architecture, and placement-focused mentorship with course-based access built for career growth.
                </p>

                <div className="mt-5 space-y-2.5">
                  {[
                    "Live mentorship + private doubt support",
                    "Project-driven learning with practical support",
                    "Course access for the selected learning path",
                    "Resume + LinkedIn profile making support",
                    "Career-ready guidance from day one",
                    "Interview prep + placement support",
                    "Certificate of completion",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-250 ease-out hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-[0_14px_22px_rgba(79,70,229,0.12),0_0_18px_rgba(99,102,241,0.12)] dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-indigo-500/25 dark:hover:bg-slate-900/80">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700 transition-transform duration-250 ease-out hover:scale-125 hover:shadow-[0_0_14px_rgba(16,185,129,0.35)] dark:bg-emerald-500/15 dark:text-emerald-300">✓</span>
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  {isEnrolled ? (
                    <a
                      href={courseData.isLive ? `/courses/${courseData.slug}/live` : `/courses/${courseData.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-3.5 text-base font-semibold text-white shadow-[0_16px_36px_rgba(16,185,129,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(16,185,129,0.32)]"
                    >
                      Continue learning
                    </a>
                  ) : (
                    <CheckoutButton
                      course={{
                        id: courseData.id,
                        slug: courseData.slug,
                        title: courseData.title,
                        price: Number(basePrice),
                        offerPrice: promotionalOfferPrice ?? null,
                        isPromotional: Boolean(courseData.isPromotional),
                        currency: courseData.currency,
                        promoCode: courseData.promoCode ?? "",
                      }}
                      userId={session?.user?.id ?? ""}
                      isAuthenticated={Boolean(session?.user?.id)}
                      buttonLabel="Enroll now"
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
