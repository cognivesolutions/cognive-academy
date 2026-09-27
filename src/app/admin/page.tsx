import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CoursesBulk from "./courses-bulk.client";
import ImageCropWrapper from "./components/image-crop-wrapper.client";
import ImageFileUploader from "./components/image-file-uploader.client";
import CourseThumbnail from "./components/course-thumbnail.client";
import AdminCoursesInfinite from "@/components/admin-courses-infinite.client";
import { CourseSelect } from "./components/course-select";
import CourseAdminActions from "./components/course-admin-actions.client";

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
          <div className="flex items-center gap-2">
            <Link
              href="/admin/drafts"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
            >
              Drafts
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
            >
              Back to site
            </Link>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            {successMessage}
          </div>
        )}

        <div className="grid items-start gap-8 xl:grid-cols-2">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">New course</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Add a course</h2>
              </div>
            </div>

            <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">
              Create a new course and publish it directly to the catalog.
            </p>

            <form action="/api/admin/courses" method="POST" encType="multipart/form-data" className="space-y-4">
              <ImageFileUploader />
              <input type="hidden" name="action" value="create" />
              <input type="hidden" name="isPublished" value="false" />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Course title
                  <input
                    name="title"
                    required
                    placeholder="e.g. Data Analytics Bootcamp"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Slug (optional)
                  <input
                    name="slug"
                    placeholder="e.g. data-analytics-bootcamp"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </label>

                <CourseSelect
                  name="category"
                  label="Category"
                  placeholder="Select a category"
                  required
                  options={[
                    { value: "Software Development", label: "Software Development" },
                    { value: "AI Engineering", label: "AI Engineering" },
                    { value: "Data Engineering", label: "Data Engineering" },
                    { value: "Data Analytics", label: "Data Analytics" },
                    { value: "Data Structure & Algorithms", label: "Data Structure & Algorithms (DSA)" },
                  ]}
                />

                <CourseSelect
                  name="level"
                  label="Level"
                  placeholder="Select level"
                  options={[
                    { value: "Beginner", label: "Beginner" },
                    { value: "Intermediate", label: "Intermediate" },
                    { value: "Advanced", label: "Advanced" },
                  ]}
                />

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Price (INR)
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="e.g. 4999"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:h-5 [&::-webkit-inner-spin-button]:h-5"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Duration (hours)
                  <input
                    name="durationHours"
                    type="number"
                    min="1"
                    placeholder="e.g. 16"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:h-5 [&::-webkit-inner-spin-button]:h-5"
                  />
                </label>

                <CourseSelect
                  name="language"
                  label="Language"
                  placeholder="Select language"
                  options={[
                    { value: "en", label: "English" },
                    { value: "hi", label: "Hindi" },
                  ]}
                />

                <CourseSelect
                  name="isLive"
                  label="Format"
                  placeholder="Select format"
                  options={[
                    { value: "true", label: "Live" },
                    { value: "false", label: "Recorded" },
                  ]}
                />

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Instructor name
                  <input
                    name="instructorName"
                    required
                    placeholder="e.g. John Doe"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Instructor title
                  <input
                    name="instructorTitle"
                    placeholder="e.g. Senior Data Instructor"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Short description
                  <textarea
                    name="shortDescription"
                    rows={3}
                    placeholder="Add a short summary for the course card"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Full description
                  <textarea
                    name="description"
                    rows={4}
                    required
                    placeholder="Describe the learning outcomes, modules, and target audience"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Course thumbnail
                  <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                    <ImageCropWrapper width={1200} height={800} />
                  </div>
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Or use image URL
                  <input
                    name="imageUrl"
                    type="url"
                    placeholder="https://example.com/course-image.jpg"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                  Preview lecture URL
                  <input
                    name="previewLectureUrl"
                    type="url"
                    placeholder="https://youtube.com/watch?v=example"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
                >
                  View catalog
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(99,102,241,0.28)] transition hover:-translate-y-0.5"
                >
                  Save draft
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Manage</p>
                  <h2 className="mt-2 text-[1.65rem] font-black tracking-[-0.04em] text-slate-900 dark:text-white">Manage courses</h2>
                </div>
              </div>

              <div className="space-y-3">
                <form method="GET" className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      name="q"
                      defaultValue={q}
                      placeholder="Search title or description"
                      className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-[0.92rem] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                    <div className="w-[84px]">
                      <CourseSelect
                        name="pageSize"
                        label=""
                        hideLabel
                        compact
                        placeholder="10"
                        defaultValue={String(pageSize)}
                        options={[
                          { value: "5", label: "5" },
                          { value: "10", label: "10" },
                          { value: "20", label: "20" },
                          { value: "50", label: "50" },
                        ]}
                        triggerClassName="min-h-[38px] !bg-slate-50 dark:!bg-slate-800"
                        menuClassName="min-w-[84px]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(99,102,241,0.22)] transition hover:brightness-110"
                    >
                      Search
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="min-w-[148px]">
                      <CourseSelect
                        name="published"
                        label=""
                        hideLabel
                        compact
                        placeholder="Any status"
                        defaultValue={publishedParam ?? ""}
                        options={[
                          { value: "", label: "Any status" },
                          { value: "true", label: "Published" },
                          { value: "false", label: "Unpublished" },
                        ]}
                        triggerClassName="min-h-[38px] !bg-slate-50 dark:!bg-slate-800"
                        menuClassName="min-w-[148px]"
                      />
                    </div>
                    <input
                      name="category"
                      defaultValue={categoryParam}
                      placeholder="Category"
                      className="min-w-[140px] flex-1 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-[0.92rem] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>
                </form>

                <div className="pt-1">
                  <CoursesBulk courses={courses.map((c) => ({ id: c.id, title: c.title }))} />
                </div>

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
                    <div key={course.id} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800/80">
                      <div className="mb-4 overflow-hidden rounded-[20px] bg-slate-100 ring-1 ring-slate-200 transition-all duration-300 dark:bg-slate-800 dark:ring-slate-700">
                        <CourseThumbnail
                          src={course.imageUrl ?? undefined}
                          alt={course.title}
                          loading="lazy"
                          className="block h-36 w-full object-cover transition-all duration-500"
                          defaultImg="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80"
                        />
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[0.95rem] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">{course.title}</div>
                        </div>
                        <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                          ₹{Number(course.price).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <form id={`course-form-${course.id}`} action="/api/admin/courses" method="POST" encType="multipart/form-data" className="mt-4 space-y-3">
                        <input type="hidden" name="action" value="update" />
                        <input type="hidden" name="id" value={course.id} />
                        <input type="hidden" name="slug" value={course.slug} />

                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                          Title
                          <input
                            name="title"
                            defaultValue={course.title}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                          />
                        </label>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <CourseSelect
                            name="isLive"
                            label="Format"
                            placeholder="Select format"
                            defaultValue={String(course.isLive)}
                            options={[
                              { value: "true", label: "Live" },
                              { value: "false", label: "Recorded" },
                            ]}
                          />

                          <CourseSelect
                            name="language"
                            label="Language"
                            placeholder="Select language"
                            defaultValue={course.language}
                            options={[
                              { value: "en", label: "English" },
                              { value: "hi", label: "Hindi" },
                            ]}
                          />
                        </div>

                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                          Price (INR)
                          <input
                            name="price"
                            type="number"
                            min="0"
                            defaultValue={Number(course.price)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:h-5 [&::-webkit-inner-spin-button]:h-5"
                          />
                        </label>

                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                          Thumbnail URL
                          <input
                            name="imageUrl"
                            type="url"
                            defaultValue={course.imageUrl ?? ""}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                          />
                        </label>

                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                          Upload thumbnail
                          <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                            <ImageFileUploader />
                            <ImageCropWrapper width={1200} height={800} />
                          </div>
                        </label>

                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                          Preview lecture URL
                          <input
                            name="previewLectureUrl"
                            type="url"
                            defaultValue={course.previewLectureUrl ?? ""}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                          />
                        </label>

                        <CourseAdminActions courseId={course.id} />
                      </form>
                    </div>
                  ))
                )}
              </div>
              {/* pager */}
              <div className="mt-6 flex items-center justify-between gap-3 text-sm">
                <div className="text-xs text-slate-600 dark:text-slate-300">Page {page} of {totalPages} • {total} courses</div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`?page=${Math.max(page - 1, 1)}&pageSize=${pageSize}&q=${encodeURIComponent(q || "")}&category=${encodeURIComponent(categoryParam || "")}&published=${encodeURIComponent(publishedParam ?? "")}`}
                    aria-label="Previous page"
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs transition ${page === 1 ? 'pointer-events-none border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500' : 'border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200'}`}
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
                      <path d="M12.5 5.5L7.5 10l5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-semibold ${p === page ? 'border-indigo-600 bg-indigo-600 text-white shadow-[0_6px_18px_rgba(99,102,241,0.22)]' : 'border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200'}`}
                        >
                          {p}
                        </a>
                      );
                    }
                    return items;
                  })()}

                  <a
                    href={`?page=${Math.min(page + 1, totalPages)}&pageSize=${pageSize}&q=${encodeURIComponent(q || "")}&category=${encodeURIComponent(categoryParam || "")}&published=${encodeURIComponent(publishedParam ?? "")}`}
                    aria-label="Next page"
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs transition ${page === totalPages ? 'pointer-events-none border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500' : 'border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200'}`}
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
                      <path d="M7.5 5.5L12.5 10l-5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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
