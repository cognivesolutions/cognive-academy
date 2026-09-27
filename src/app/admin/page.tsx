import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CoursesBulk from "./courses-bulk.client";
import ImageCropWrapper from "./components/image-crop-wrapper.client";
import ImageFileUploader from "./components/image-file-uploader.client";
import CourseThumbnail from "./components/course-thumbnail.client";
import AdminCoursesInfinite from "@/components/admin-courses-infinite.client";

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

  // Parse common query params
  const q = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : resolvedSearchParams.q ?? "";
  const categoryParam = Array.isArray(resolvedSearchParams.category) ? resolvedSearchParams.category[0] : resolvedSearchParams.category ?? "";
  const publishedParam = Array.isArray(resolvedSearchParams.published) ? resolvedSearchParams.published[0] : resolvedSearchParams.published;

  const page = Math.max(Number(Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page ?? 1) || 1, 1);
  const pageSize = Math.max(Number(Array.isArray(resolvedSearchParams.pageSize) ? resolvedSearchParams.pageSize[0] : resolvedSearchParams.pageSize ?? 10) || 10, 1);

  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (categoryParam) {
    where.category = categoryParam;
  }

  if (publishedParam !== undefined) {
    if (publishedParam === "true" || publishedParam === "1") {
      where.isPublished = true;
    } else if (publishedParam === "false" || publishedParam === "0") {
      where.isPublished = false;
    }
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
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
    }),
    prisma.course.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  // AdminCoursesInfinite is a client component ("use client") and can be imported directly.

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
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
                <ImageFileUploader />
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
                    <div className="mt-2">
                      <ImageCropWrapper width={1200} height={800} />
                    </div>
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
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Manage courses</h2>
                <div className="mt-4 space-y-4">
                <form method="GET" className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search title or description"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
                      />
                      <select
                        name="published"
                        defaultValue={publishedParam ?? ""}
                        className="hidden md:inline-block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
                      >
                        <option value="">Any</option>
                        <option value="true">Published</option>
                        <option value="false">Unpublished</option>
                      </select>
                      <select
                        name="pageSize"
                        defaultValue={String(pageSize)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
                      >
                        <option value="1">1</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                      <button className="ml-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">Search</button>
                    </div>
                    <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <input name="category" defaultValue={categoryParam} placeholder="Category (optional)" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100" />
                    </div>
                  </form>

                  <CoursesBulk courses={courses.map((c) => ({ id: c.id, title: c.title }))} />

                  {/* If user requests infinite mode, mount client infinite list */}
                  {String(resolvedSearchParams.infinite ?? "") === "1" ? (
                    <div>
                      <AdminCoursesInfinite initialItems={courses} initialCursor={courses.length ? courses[courses.length - 1].id : null} pageSize={pageSize} />
                    </div>
                  ) : null}
                {courses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    No courses added yet.
                  </div>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/80">
                      <div className="mb-4 overflow-hidden rounded-[20px] bg-slate-100 ring-1 ring-slate-200 transition-all duration-300 dark:bg-slate-800 dark:ring-slate-700">
                        <CourseThumbnail
                          src={course.imageUrl ?? undefined}
                          alt={course.title}
                          loading="lazy"
                          className="h-48 w-full object-cover block transition-all duration-500"
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
                          <div className="mt-1">
                            <ImageFileUploader />
                            <ImageCropWrapper width={1200} height={800} />
                          </div>
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
              {/* pager */}
              <div className="mt-6 flex items-center justify-between text-sm">
                <div className="text-slate-600 dark:text-slate-300">Page {page} of {totalPages} • {total} courses</div>
                <div className="flex items-center gap-2">
                  <a
                    href={`?page=${Math.max(page - 1, 1)}&pageSize=${pageSize}&q=${encodeURIComponent(q || "")}&category=${encodeURIComponent(categoryParam || "")}&published=${encodeURIComponent(publishedParam ?? "")}`}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    Prev
                  </a>

                  {/* page numbers: show up to 5 pages centered on current */}
                  {(() => {
                    const start = Math.max(1, page - 2);
                    const end = Math.min(totalPages, page + 2);
                    const items = [] as any[];
                    for (let p = start; p <= end; p++) {
                      items.push(
                        <a
                          key={p}
                          href={`?page=${p}&pageSize=${pageSize}&q=${encodeURIComponent(q || "")}&category=${encodeURIComponent(categoryParam || "")}&published=${encodeURIComponent(publishedParam ?? "")}`}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs border ${p === page ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 dark:bg-slate-900/80 dark:text-slate-200'}`}
                        >
                          {p}
                        </a>
                      );
                    }
                    return items;
                  })()}

                  <a
                    href={`?page=${Math.min(page + 1, totalPages)}&pageSize=${pageSize}&q=${encodeURIComponent(q || "")}&category=${encodeURIComponent(categoryParam || "")}&published=${encodeURIComponent(publishedParam ?? "")}`}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    Next
                  </a>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
