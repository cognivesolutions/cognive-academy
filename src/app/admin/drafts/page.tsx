import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CoursesBulk from "@/app/admin/courses-bulk.client";
import CourseThumbnail from "@/app/admin/components/course-thumbnail.client";

export default async function DraftsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const successMessage = typeof resolvedSearchParams.success === "string" ? resolvedSearchParams.success : "";

  const courses = await prisma.course.findMany({
    where: { isPublished: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      isLive: true,
      language: true,
      price: true,
      imageUrl: true,
      previewLectureUrl: true,
      shortDescription: true,
      description: true,
      instructorName: true,
      instructorTitle: true,
      durationHours: true,
      level: true,
      isPublished: true,
      featured: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Draft courses</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
            >
              Back to admin
            </Link>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            {successMessage}
          </div>
        )}

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Drafts</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Saved but not published</h2>
            </div>
            <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              {courses.length} draft{courses.length === 1 ? "" : "s"}
            </div>
          </div>

          {courses.length > 0 && (
            <CoursesBulk
              variant="drafts"
              courses={courses.map((course) => ({ id: course.id, title: course.title }))}
            />
          )}

          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              No draft courses yet. Save a course and it will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="mb-4 overflow-hidden rounded-[18px] bg-slate-100 ring-1 ring-slate-200 transition-all duration-300 dark:bg-slate-800 dark:ring-slate-700">
                    <CourseThumbnail
                      src={course.imageUrl ?? undefined}
                      alt={course.title}
                      loading="lazy"
                      className="block h-44 w-full object-cover transition-all duration-500"
                      defaultImg="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80"
                    />
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{course.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {course.category} • {course.isLive ? "Live" : "Recorded"} • {course.language === "hi" ? "Hindi" : "English"}
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                      Draft
                    </span>
                  </div>

                  <form action="/api/admin/courses" method="POST" encType="multipart/form-data" className="mt-4 space-y-3">
                    <input type="hidden" name="action" value="update" />
                    <input type="hidden" name="id" value={course.id} />
                    <input type="hidden" name="slug" value={course.slug} />
                    <input type="hidden" name="isPublished" value="true" />

                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Title
                      <input
                        name="title"
                        defaultValue={course.title}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </label>

                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Short description
                      <textarea
                        name="shortDescription"
                        defaultValue={course.shortDescription ?? ""}
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                        Format
                        <select
                          name="isLive"
                          defaultValue={String(course.isLive)}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="false">Recorded</option>
                          <option value="true">Live</option>
                        </select>
                      </label>

                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                        Language
                        <select
                          name="language"
                          defaultValue={course.language}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                        </select>
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
                      >
                        Publish now
                      </button>

                      <button
                        type="submit"
                        formAction="/api/admin/courses"
                        name="action"
                        value="update"
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
                      >
                        Save changes
                      </button>
                    </div>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
