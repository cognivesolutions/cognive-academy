import React from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "../../../../lib/prisma";
import CourseTabs from "../../../../components/course-tabs";

type Props = { params: Promise<{ slug: string }> | { slug: string } };

export default async function LivePage({ params }: Props) {
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

  const liveLectures = course.modules.flatMap((m) => m.lectures.filter((l) => !!l.liveSessionUrl));

  return (
    <>
      <CourseTabs slug={course.slug} />
      <section className="pb-10 text-slate-100">
        <div className="mb-6 rounded-[28px] border border-slate-700 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.9),rgba(49,46,129,0.7))] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">Live learning</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Live sessions for {course.title}</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {liveLectures.length} scheduled
          </span>
        </div>

        {liveLectures.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-600 bg-slate-950/20 px-4 py-4 text-sm text-slate-300">
            No scheduled live sessions found. Check upcoming batches below.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {liveLectures.map((lec) => (
              <div key={lec.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3">
                <div>
                  <div className="text-base font-semibold text-white">{lec.title}</div>
                  {lec.description ? <div className="mt-1 text-sm text-slate-300">{lec.description}</div> : null}
                </div>
                <a
                  href={lec.liveSessionUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5"
                >
                  Join Session
                </a>
              </div>
            ))}
          </div>
        )}
        </div>

        <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-2xl font-black tracking-tight text-white">Course modules</h3>
          <span className="text-sm text-slate-400">{course.modules.length} chapters</span>
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
                      {lec.isPreview ? <div className="mt-1 text-xs text-indigo-300">Preview available</div> : null}
                    </div>

                    <div>
                      {lec.liveSessionUrl ? (
                        <a
                          href={lec.liveSessionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3.5 py-2 text-sm font-semibold text-indigo-200 transition hover:border-indigo-300 hover:bg-indigo-500/20"
                        >
                          Live link
                        </a>
                      ) : lec.hlsUrl ? (
                        <a
                          href={lec.hlsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3.5 py-2 text-sm font-semibold text-indigo-200 transition hover:border-indigo-300 hover:bg-indigo-500/20"
                        >
                          Watch recording
                        </a>
                      ) : (
                        <span className="text-sm text-slate-400">No media</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>
    </>
  );
}
