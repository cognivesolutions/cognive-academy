import React from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "../../../../lib/prisma";
import { SelfPacedContinueLearningCard } from "@/components/self-paced-continue-learning-card";
import { SelfPacedLectureActions } from "@/components/self-paced-lecture-actions";

type Props = { params: Promise<{ slug: string }> | { slug: string } };

export default async function SelfPacedPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;

  if (!slug) {
    return notFound();
  }

  const session = await auth();
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: { lectures: { orderBy: { position: "asc" } } },
      },
    },
  });

  if (!course) return <div>Course not found</div>;

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

  if (!isEnrolled) {
    redirect(`/courses/${slug}`);
  }

  return (
    <>
      <section className="mx-auto max-w-6xl bg-[#f3f5f7] px-4 pb-10 pt-6 text-slate-900 dark:bg-[#020817] dark:text-slate-100 sm:px-6 lg:px-8">
        <SelfPacedContinueLearningCard
          courseId={course.id}
          modules={course.modules.map((module) => ({
            id: module.id,
            title: module.title,
            lectures: module.lectures.map((lecture) => ({
              id: lecture.id,
              title: lecture.title,
              hlsUrl: lecture.hlsUrl,
            })),
          }))}
        />

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-[clamp(1.8rem,2.2vw,2.5rem)] font-black leading-[1.1] tracking-[-0.05em] text-slate-900 dark:text-white">Course modules</h3>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-[#101827] dark:text-slate-200 dark:shadow-[0_8px_22px_rgba(15,23,42,0.32)]">
              {course.modules.length} modules
            </span>
          </div>

          <div className="space-y-5">
            {course.modules.map((m, index) => (
              <details key={m.id} open={index === 0} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-[#edf1f5] shadow-[0_16px_28px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_30px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0f172a] dark:shadow-[0_18px_40px_rgba(15,23,42,0.25)] dark:hover:border-slate-600 dark:hover:shadow-[0_20px_36px_rgba(15,23,42,0.3)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-600 shadow-[0_8px_20px_rgba(148,163,184,0.12)] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:shadow-none">Module {index + 1}</div>
                    <div className="mt-3 text-[clamp(2rem,2.5vw,2.8rem)] font-black leading-[1.08] tracking-[-0.06em] text-slate-900 dark:text-white">Module {index + 1}: {m.title}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-[0_8px_20px_rgba(148,163,184,0.12)] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:shadow-none">
                      {m.lectures.length} lectures
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-lg font-semibold text-slate-700 shadow-[0_8px_20px_rgba(148,163,184,0.12)] transition-transform duration-200 group-open:rotate-180 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:shadow-none">
                      ▾
                    </span>
                  </div>
                </summary>

                <div className="border-t border-slate-200 px-5 pb-5 pt-4 dark:border-slate-700 sm:px-6">
                  {m.description ? (
                    <p className="mb-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{m.description}</p>
                  ) : null}

                  <div className="space-y-3">
                    {m.lectures.map((lec, lectureIndex) => (
                      <div key={lec.id} className="flex items-center justify-between gap-4 rounded-[18px] border border-slate-200 bg-[#f8fafc] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_12px_22px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-[inset_0_1px_0_rgba(148,163,184,0.12)] dark:hover:border-slate-600 dark:hover:bg-slate-900/80">
                        <div className="min-w-0">
                          <div className="text-base font-medium text-slate-900 dark:text-white">Lecture {lectureIndex + 1}: {lec.title}</div>
                          {lec.isPreview ? <div className="mt-1 text-xs text-violet-600 dark:text-violet-300">Preview available</div> : null}
                        </div>

                        <div>
                          <SelfPacedLectureActions
                            courseId={course.id}
                            lecture={{
                              id: lec.id,
                              title: lec.title,
                              hlsUrl: lec.hlsUrl,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
