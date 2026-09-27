import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CourseSelect } from "@/app/admin/components/course-select";
import BackButton from "@/components/back-button";
import BulkEditor from "..\/bulk-editor.client";
import ModuleManagement from "..\/modules.client";

type Props = {
  params: { courseId?: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LecturesPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/admin/login");
  // `params` and `searchParams` can be Promises in some Next.js runtimes — resolve them safely
  const resolvedParams = await Promise.resolve(params ?? {} as any);
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {} as any);

  // prefer dynamic route segment, fall back to ?courseId= query parameter
  let courseId = resolvedParams?.courseId as string | undefined;
  if (!courseId) {
    const sp = resolvedSearchParams?.courseId;
    if (typeof sp === "string") courseId = sp;
    else if (Array.isArray(sp) && sp.length > 0) courseId = sp[0];
  }

  if (!courseId) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-xl border bg-white p-6 dark:bg-slate-900">
            <h1 className="text-2xl font-black">Missing course id</h1>
            <p className="mt-2 text-sm text-slate-600">This page expects a course id in the URL. Go back to the <a href="/admin" className="text-indigo-600">admin list</a>.</p>
          </div>
        </div>
      </main>
    );
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { include: { lectures: true }, orderBy: { position: "asc" } } },
  });

  if (!course) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-xl border bg-white p-6 dark:bg-slate-900">
            <h1 className="text-2xl font-black">Course not found</h1>
            <p className="mt-2 text-sm text-slate-600">No course matches the requested id. Return to the <a href="/admin" className="text-indigo-600">admin list</a> to try another course.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Manage lectures — {course.title}</h1>
            <p className="text-sm text-slate-600">Add or edit lectures and set a live session URL for each lecture.</p>
          </div>
          <BackButton href="/admin" />
        </div>

        <div className="space-y-6">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Bulk edit</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Lecture bulk editor</h2>
              </div>
            </div>
            <div>
              <BulkEditor courseId={course.id} modules={course.modules.map((m) => ({ id: m.id, title: m.title, lectures: m.lectures.map((l) => ({ id: l.id, title: l.title, position: l.position, liveSessionUrl: l.liveSessionUrl })) }))} />
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Structure</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Module management</h2>
              </div>
            </div>
            <div>
              <ModuleManagement courseId={course.id} modules={course.modules.map((m) => ({ id: m.id, title: m.title, position: m.position }))} />
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">New lecture</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Create lecture</h2>
              </div>
            </div>

            <form action="/api/admin/lectures" method="POST" className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="action" value="create" />
              <input type="hidden" name="courseId" value={course.id} />

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
                Title
                <input
                  name="title"
                  required
                  placeholder="e.g. Intro to the course"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Position
                <input
                  name="position"
                  type="number"
                  defaultValue={1}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <div className="sm:col-span-2">
                <CourseSelect
                  name="isPreview"
                  label="Preview"
                  placeholder="Select preview status"
                  defaultValue="false"
                  options={[
                    { value: "false", label: "No" },
                    { value: "true", label: "Yes" },
                  ]}
                />
              </div>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
                Live session URL (optional)
                <input
                  name="liveSessionUrl"
                  placeholder="https://zoom.us/j/123456789"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(99,102,241,0.28)] transition hover:-translate-y-0.5">
                  Create lecture
                </button>
              </div>
            </form>
          </section>
          {course.modules.map((mod) => (
            <section key={mod.id} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.03)] dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
                <h2 className="text-sm font-semibold tracking-[-0.01em] text-slate-900 dark:text-white">Module: {mod.title}</h2>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {mod.lectures.length} lecture{mod.lectures.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="space-y-2.5">
                {mod.lectures.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400">No lectures yet.</div>
                ) : (
                  mod.lectures.map((lec) => (
                    <div key={lec.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/70">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold tracking-[-0.01em] text-slate-900 dark:text-white">{lec.title}</div>
                        <div className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">{lec.liveSessionUrl ?? "No live URL"}</div>
                      </div>
                      <Link href={`/admin/courses/${course.id}/lectures/${lec.id}`} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200">
                        Edit
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
