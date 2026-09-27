import React from "react";
import prisma from "../../../../lib/prisma";

type Props = { params: { slug: string } };

export default async function LivePage({ params }: Props) {
  const { slug } = params;

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

  // collect lectures that have a liveSessionUrl (treat these as scheduled live items)
  const liveLectures = course.modules.flatMap((m) => m.lectures.filter((l) => !!l.liveSessionUrl));

  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">Live sessions for {course.title}</h2>

      {liveLectures.length === 0 ? (
        <div className="text-sm text-slate-600">No scheduled live sessions found. Check upcoming batches below.</div>
      ) : (
        <div className="space-y-4">
          {liveLectures.map((lec) => (
            <div key={lec.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{lec.title}</div>
                  {lec.description ? <div className="text-xs text-slate-500">{lec.description}</div> : null}
                </div>
                <a href={lec.liveSessionUrl ?? "#"} target="_blank" rel="noreferrer" className="text-sm text-indigo-700 hover:underline">
                  Join Session
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Course Modules</h3>
        <div className="mt-3 space-y-4">
          {course.modules.map((m) => (
            <div key={m.id}>
              <div className="text-sm font-medium">{m.title}</div>
              <div className="mt-2 space-y-2">
                {m.lectures.map((lec) => (
                  <div key={lec.id} className="flex items-center justify-between rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-800">
                    <div>
                      <div className="text-sm">{lec.title}</div>
                      {lec.isPreview ? <div className="text-xs text-slate-500">Preview available</div> : null}
                    </div>
                    <div>
                      {lec.liveSessionUrl ? (
                        <a href={lec.liveSessionUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-700 hover:underline">
                          Live Link
                        </a>
                      ) : lec.hlsUrl ? (
                        <a href={lec.hlsUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-700 hover:underline">
                          Watch Recording
                        </a>
                      ) : (
                        <span className="text-sm text-slate-500">No media</span>
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
  );
}
