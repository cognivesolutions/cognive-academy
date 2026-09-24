import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CheckoutButton from "@/components/checkout-button";

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
  const price = Number(course.price);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <section>
          <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
            {course.category} course
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">{course.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">{course.description}</p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{course.level}</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{course.durationHours ?? 0} hours</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{course.modules.length} modules</span>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Preview lecture</h2>
              <span className="text-sm text-slate-500">Starter lesson</span>
            </div>
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-700 text-lg font-semibold text-white">
              {course.previewLectureUrl ? "Watch the intro walkthrough" : "Preview is unavailable yet"}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-slate-900">Syllabus breakdown</h2>
            <div className="mt-6 space-y-5">
              {course.modules.map((module, index) => (
                <div key={module.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Module {index + 1}</span>
                    <span className="text-sm text-slate-500">{module.lectures.length} lessons</span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-slate-900">{module.title}</h3>
                  {module.description ? <p className="mt-2 text-slate-600">{module.description}</p> : null}
                  <ul className="mt-3 space-y-2 text-slate-600">
                    {module.lectures.map((lecture) => (
                      <li key={lecture.id} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600" />
                        <span>{lecture.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="lg:pt-8">
          <div className="sticky top-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-500">Course price</div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-4xl font-black text-slate-900">₹{price.toLocaleString("en-IN")}</span>
              <span className="text-lg text-slate-400 line-through">₹{(price * 1.35).toLocaleString("en-IN")}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">Includes lifetime access, recorded sessions, and downloadable resources.</p>

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

            <a href={course.previewLectureUrl ?? "#"} className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50">
              Preview course
            </a>

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm text-slate-600">
              <div className="flex justify-between"><span>Access</span><span className="font-medium text-slate-900">Lifetime</span></div>
              <div className="flex justify-between"><span>Format</span><span className="font-medium text-slate-900">{course.level} track</span></div>
              <div className="flex justify-between"><span>Support</span><span className="font-medium text-slate-900">Mentor Q&A</span></div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
