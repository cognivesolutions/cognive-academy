import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CourseSelect } from "../../components/course-select";
import ImageCropWrapper from "../../components/image-crop-wrapper.client";
import ImageFileUploader from "../../components/image-file-uploader.client";

export default async function NewCoursePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Create course</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/courses"
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
            >
              Manage courses
            </Link>
            <Link
              href="/admin/unpublished"
              className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
            >
              Unpublished
            </Link>
          </div>
        </div>

        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">New course</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">Add a course</h2>
            </div>
          </div>

          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            Create an unpublished course and publish it when ready.
          </p>

          <form id="create-course-form" action="/api/admin/courses" method="POST" encType="multipart/form-data" className="space-y-3">
            <ImageFileUploader />
            <input type="hidden" name="action" value="create" />
            <input type="hidden" name="isPublished" value="false" />

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Course title
                <input
                  name="title"
                  required
                  placeholder="e.g. Data Analytics Bootcamp"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Slug (optional)
                <input
                  name="slug"
                  placeholder="e.g. data-analytics-bootcamp"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
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
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:h-5 [&::-webkit-inner-spin-button]:h-5"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Duration (hours)
                <input
                  name="durationHours"
                  type="number"
                  min="1"
                  placeholder="e.g. 16"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:h-5 [&::-webkit-inner-spin-button]:h-5"
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
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                Instructor title
                <input
                  name="instructorTitle"
                  placeholder="e.g. Senior Data Instructor"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                Short description
                <textarea
                  name="shortDescription"
                  rows={3}
                  placeholder="Add a short summary for the course card"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                Full description
                <textarea
                  name="description"
                  rows={4}
                  required
                  placeholder="Describe the learning outcomes, modules, and target audience"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                Course thumbnail
                <div className="mt-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <ImageCropWrapper width={1200} height={800} />
                </div>
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                Or use image URL
                <input
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/course-image.jpg"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
                Preview lecture URL
                <input
                  name="previewLectureUrl"
                  type="url"
                  placeholder="https://youtube.com/watch?v=example"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>
            </div>

          </form>
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="create-course-form"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(99,102,241,0.28)] transition hover:-translate-y-0.5"
          >
            Save
          </button>
        </div>
      </div>
    </main>
  );
}
