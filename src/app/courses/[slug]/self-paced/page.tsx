import React from "react";
import { notFound } from "next/navigation";
import prisma from "../../../../lib/prisma";

type Props = { params: Promise<{ slug: string }> | { slug: string } };

export default async function SelfPacedPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;

  if (!slug) {
    return notFound();
  }

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

  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">Self Paced: {course.title}</h2>

      <div className="space-y-4">
        {course.modules.map((m) => (
          <div key={m.id} className="rounded-lg border p-3">
            <div className="text-sm font-medium">{m.title}</div>
            <div className="mt-2 space-y-2">
              {m.lectures.map((lec) => (
                <div key={lec.id} className="flex items-center justify-between rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-800">
                  <div>
                    <div className="text-sm">{lec.title}</div>
                    {lec.isPreview ? <div className="text-xs text-slate-500">Preview available</div> : null}
                  </div>
                  <div>
                    {lec.hlsUrl ? (
                      <a href={lec.hlsUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-700 hover:underline">
                        Watch Recording
                      </a>
                    ) : (
                      <span className="text-sm text-slate-500">No recording</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
