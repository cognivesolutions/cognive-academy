"use client";

import { useState } from "react";

import CourseAdminActions from "../components/course-admin-actions.client";
import CourseThumbnail from "../components/course-thumbnail.client";
import { CourseSelect } from "../components/course-select";
import ImageFileUploader from "../components/image-file-uploader.client";
import CoursesBulk from "../courses-bulk.client";

export type ManageCourse = {
  id: string;
  title: string;
  slug: string;
  category: string;
  level?: string | null;
  price: number;
  imageUrl?: string | null;
  isLive: boolean;
  language: string;
  durationHours?: number | null;
  previewLectureUrl?: string | null;
  instructorName?: string | null;
  instructorTitle?: string | null;
  shortDescription?: string | null;
  description?: string | null;
};

export default function ManageCourseGrid({ courses }: { courses: ManageCourse[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <div className="pt-2">
        <CoursesBulk
          courses={courses.map((course) => ({ id: course.id, title: course.title }))}
          selected={selected}
          onSelectionChange={setSelected}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <div key={course.id} className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.03)] transition duration-200 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800/80">
            <div className="mb-3 flex items-start justify-between gap-3 pt-0.5">
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 break-words text-[0.9rem] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">{course.title}</div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {course.category} • {course.level ?? "Beginner"} • {course.isLive ? "Live" : "Recorded"} • {course.language === "hi" ? "Hindi" : "English"}
                </div>
              </div>

              <input
                type="checkbox"
                checked={!!selected[course.id]}
                onChange={() => toggleCard(course.id)}
                className="h-5 w-5 cursor-pointer rounded-md border border-slate-300 bg-slate-50/90 accent-emerald-500 shadow-[0_1px_4px_rgba(15,23,42,0.06)] transition-all duration-200 hover:border-emerald-300 hover:shadow-[0_1px_6px_rgba(16,185,129,0.12)] checked:border-emerald-500 checked:bg-emerald-500 dark:border-slate-600 dark:bg-slate-900/80 dark:checked:border-emerald-400 dark:checked:bg-emerald-500"
                aria-label={`Select ${course.title}`}
              />
            </div>

            <div className="mb-3 overflow-hidden rounded-[16px] bg-slate-100 ring-1 ring-slate-200 transition-all duration-300 dark:bg-slate-800 dark:ring-slate-700">
              <CourseThumbnail
                src={course.imageUrl ?? undefined}
                alt={course.title}
                loading="lazy"
                className="block h-28 w-full object-cover transition-all duration-500"
                defaultImg="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80"
              />
            </div>

            <div className="mb-3 flex items-start justify-between gap-3">
              <span className={course.isLive ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200" : "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 dark:bg-slate-700 dark:text-slate-200"}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                {course.isLive ? "Live" : "Recorded"}
              </span>
              <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                ₹{Number(course.price).toLocaleString("en-IN")}
              </span>
            </div>

            <form id={`course-form-${course.id}`} action="/api/admin/courses" method="POST" encType="multipart/form-data" className="space-y-3">
              <input type="hidden" name="action" value="update" />
              <input type="hidden" name="id" value={course.id} />

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Title
                <input
                  name="title"
                  defaultValue={course.title}
                  className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 break-words placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Slug
                <input
                  name="slug"
                  defaultValue={course.slug}
                  className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 break-words placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <CourseSelect
                  name="category"
                  label="Category"
                  placeholder="Select a category"
                  defaultValue={course.category}
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
                  defaultValue={course.level ?? "Beginner"}
                  options={[
                    { value: "Beginner", label: "Beginner" },
                    { value: "Intermediate", label: "Intermediate" },
                    { value: "Advanced", label: "Advanced" },
                  ]}
                />
              </div>

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

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Price (INR)
                  <input
                    name="price"
                    type="number"
                    min="0"
                    defaultValue={Number(course.price)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:h-5 [&::-webkit-inner-spin-button]:h-5"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Duration (hours)
                  <input
                    name="durationHours"
                    type="number"
                    min="1"
                    defaultValue={course.durationHours ?? ""}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:h-5 [&::-webkit-inner-spin-button]:h-5"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Instructor name
                <input
                  name="instructorName"
                  defaultValue={course.instructorName ?? ""}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Instructor title
                <input
                  name="instructorTitle"
                  defaultValue={course.instructorTitle ?? ""}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Short description
                <textarea
                  name="shortDescription"
                  rows={3}
                  defaultValue={course.shortDescription ?? ""}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Full description
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={course.description ?? ""}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Thumbnail URL
                <input
                  name="imageUrl"
                  type="url"
                  defaultValue={course.imageUrl ?? ""}
                  className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 break-all placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Upload thumbnail
                <div className="mt-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <ImageFileUploader />
                </div>
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Preview lecture URL
                <input
                  name="previewLectureUrl"
                  type="url"
                  defaultValue={course.previewLectureUrl ?? ""}
                  className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 break-all placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>

              <CourseAdminActions courseId={course.id} />
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
