"use client";

import { useRouter } from "next/navigation";

import { CourseSelect } from "@/app/admin/components/course-select";
import ImageCropWrapper from "@/app/admin/components/image-crop-wrapper.client";
import ImageFileUploader from "@/app/admin/components/image-file-uploader.client";

export function CreateCourseForm() {
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      const formData = new FormData(form);
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      if (!response.ok && response.status !== 303) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Failed to save course.");
      }

      const destination = response.redirected && response.url ? response.url : "/admin?success=Course saved successfully";
      router.push(destination.replace(window.location.origin, ""));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save course.";
      alert(message);
    }
  }

  return (
    <form id="create-course-form" onSubmit={handleSubmit} className="space-y-3">
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
  );
}
