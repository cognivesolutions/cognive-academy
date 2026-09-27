import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
          <Link href="/admin" className="text-sm text-indigo-600">Back</Link>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border bg-white p-4 dark:bg-slate-900">
            <h2 className="font-semibold">Bulk edit lectures</h2>
            <div className="mt-3">
              <BulkEditor courseId={course.id} modules={course.modules.map((m) => ({ id: m.id, title: m.title, lectures: m.lectures.map((l) => ({ id: l.id, title: l.title, position: l.position, liveSessionUrl: l.liveSessionUrl })) }))} />
            </div>
          </section>
          <section className="rounded-xl border bg-white p-4 dark:bg-slate-900">
            <h2 className="font-semibold">Bulk edit lectures</h2>
            <div className="mt-3">
              <BulkEditor courseId={course.id} modules={course.modules.map((m) => ({ id: m.id, title: m.title, lectures: m.lectures.map((l) => ({ id: l.id, title: l.title, position: l.position, liveSessionUrl: l.liveSessionUrl })) }))} />
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4 dark:bg-slate-900">
            <h2 className="font-semibold">Module management</h2>
            <div className="mt-3">
              <ModuleManagement courseId={course.id} modules={course.modules.map((m) => ({ id: m.id, title: m.title, position: m.position }))} />
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4 dark:bg-slate-900">
            <h2 className="font-semibold">Create lecture</h2>
            <form action="/api/admin/lectures" method="POST" className="mt-3 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="action" value="create" />
              <input type="hidden" name="courseId" value={course.id} />
              <label className="block text-sm">
                Title
                <input name="title" required className="mt-1 w-full rounded-md border px-3 py-2" />
              </label>
              <label className="block text-sm">
                Position
                <input name="position" type="number" defaultValue={1} className="mt-1 w-full rounded-md border px-3 py-2" />
              </label>
              <label className="block text-sm sm:col-span-2">
                Live session URL (optional)
                <input name="liveSessionUrl" placeholder="https://..." className="mt-1 w-full rounded-md border px-3 py-2" />
              </label>
              <label className="block text-sm sm:col-span-2">
                Is preview
                <select name="isPreview" defaultValue="false" className="mt-1 w-full rounded-md border px-3 py-2">
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>
              <div className="sm:col-span-2">
                <button type="submit" className="rounded-full bg-indigo-600 px-4 py-2 text-white">Create lecture</button>
              </div>
            </form>
          </section>
          {course.modules.map((mod) => (
            <section key={mod.id} className="rounded-xl border bg-white p-4 dark:bg-slate-900">
              <h2 className="font-semibold">Module: {mod.title}</h2>
              <div className="mt-3 space-y-3">
                {mod.lectures.length === 0 ? (
                  <div className="text-sm text-slate-500">No lectures yet.</div>
                ) : (
                  mod.lectures.map((lec) => (
                    <div key={lec.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{lec.title}</div>
                        <div className="text-xs text-slate-500">Live URL: {lec.liveSessionUrl ?? "—"}</div>
                      </div>
                      <Link href={`/admin/courses/${course.id}/lectures/${lec.id}`} className="text-sm text-indigo-600">
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
