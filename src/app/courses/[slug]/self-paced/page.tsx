import React from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "../../../../lib/prisma";
import CourseTabs from "../../../../components/course-tabs";

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
      <CourseTabs slug={course.slug} />
      <section className="pb-10 text-slate-100">
        <div className="mb-6 rounded-[28px] border border-slate-700 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.9),rgba(79,70,229,0.62))] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">Self-paced learning</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Self Paced: {course.title}</h2>
        </div>

        <div className="space-y-5">
        {course.modules.map((m) => (
          <div key={m.id} className="rounded-[24px] border border-slate-700 bg-slate-900/70 p-4 shadow-[0_16px_36px_rgba(2,6,23,0.28)] sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-lg font-bold text-white">{m.title}</div>
              <span className="rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                {m.lectures.length} lessons
              </span>
            </div>

            <div className="space-y-3">
              {m.lectures.map((lec) => (
                <div key={lec.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(30,41,59,0.75))] px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-base font-medium text-white">{lec.title}</div>
                    {lec.isPreview ? <div className="mt-1 text-xs text-violet-300">Preview available</div> : null}
                  </div>

                  <div>
                    {lec.hlsUrl ? (
                      <a
                        href={lec.hlsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/10 px-3.5 py-2 text-sm font-semibold text-violet-200 transition hover:border-violet-300 hover:bg-violet-500/20"
                      >
                        Watch recording
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">No recording</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </section>
    </>
  );
}
