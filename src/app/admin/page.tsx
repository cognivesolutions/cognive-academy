import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage({
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
  const successMessage =
    typeof resolvedSearchParams.success === "string" ? resolvedSearchParams.success : "";

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      isLive: true,
      language: true,
      price: true,
      slug: true,
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
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Course management</h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
          >
            Back to site
          </Link>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            {successMessage}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Add a new course</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Use this form to add a course directly in the app. The course will become available to the catalog immediately.
              </p>
            </div>

            <form action="/api/admin/courses" method="POST" encType="multipart/form-data" className="space-y-5">
              <input type="hidden" name="action" value="create" />
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Course title
                  <input
                    name="title"
                    required
                    placeholder="Power BI for Teams"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Slug (optional)
                  <input
                    name="slug"
                    placeholder="power-bi-for-teams"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Category
                  <input
                    name="category"
                    required
                    defaultValue="Power BI"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Level
                  <select
                    name="level"
                    defaultValue="Beginner"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Price (INR)
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    required
                    defaultValue="4999"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Duration (hours)
                  <input
                    name="durationHours"
                    type="number"
                    min="1"
                    defaultValue="16"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Language
                  <select
                    name="language"
                    defaultValue="en"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Format
                  <select
                    name="isLive"
                    defaultValue="false"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="false">Recorded</option>
                    <option value="true">Live</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Instructor name
                  <input
                    name="instructorName"
                    required
                    defaultValue="Vishwajeet Singh"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Instructor title
                  <input
                    name="instructorTitle"
                    placeholder="Senior Data Instructor"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Short description
                  <textarea
                    name="shortDescription"
                    rows={3}
                    placeholder="A short summary that appears on the course card."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Full description
                  <textarea
                    name="description"
                    rows={5}
                    required
                    placeholder="Describe the course outcomes, lessons, and audience."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Course thumbnail
                  <input
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    className="mt-2 w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Or use image URL
                  <input
                    name="imageUrl"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Preview lecture URL
                  <input
                    name="previewLectureUrl"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(99,102,241,0.28)] transition hover:-translate-y-0.5"
                >
                  Save course
                </button>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
                >
                  View course catalog
                </Link>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin access</h2>
              <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                Use the seeded admin account:
                <div className="mt-2 font-semibold">admin@cognive.academy</div>
                <div>password123</div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Manage courses</h2>
              <div className="mt-4 space-y-4">
                {courses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    No courses added yet.
                  </div>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/80">
                      <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700">
                        <img
                          src={course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"}
                          alt={course.title}
                          className="h-28 w-full object-cover"
                        />
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{course.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {course.category} • {course.isLive ? "Live" : "Recorded"} • {course.language === "hi" ? "Hindi" : "English"}
                          </div>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                          ₹{Number(course.price).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <form action="/api/admin/courses" method="POST" encType="multipart/form-data" className="mt-4 space-y-3">
                        <input type="hidden" name="action" value="update" />
                        <input type="hidden" name="id" value={course.id} />
                        <input type="hidden" name="slug" value={course.slug} />

                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                          Title
                          <input
                            name="title"
                            defaultValue={course.title}
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

                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                          Price
                          <input
                            name="price"
                            type="number"
                            min="0"
                            defaultValue={Number(course.price)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          />
                        </label>

                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                          Thumbnail URL
                          <input
                            name="imageUrl"
                            type="url"
                            defaultValue={course.imageUrl ?? ""}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          />
                        </label>

                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                          Upload thumbnail
                          <input
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            className="mt-1 w-full rounded-lg border border-dashed border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          />
                        </label>

                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                          Preview lecture URL
                          <input
                            name="previewLectureUrl"
                            type="url"
                            defaultValue={course.previewLectureUrl ?? ""}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          />
                        </label>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
                          >
                            Update
                          </button>

                          <button
                            type="submit"
                            formAction="/api/admin/courses"
                            name="action"
                            value="delete"
                            className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </form>

                      <div className="mt-3">
                        <Link
                          href={`/admin/courses/${course.id}/lectures?courseId=${course.id}`}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
                        >
                          Manage lectures
                        </Link>
                        </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
