"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CourseSelect } from "@/app/admin/components/course-select";
import ImageCropWrapper from "@/app/admin/components/image-crop-wrapper.client";
import ImageFileUploader from "@/app/admin/components/image-file-uploader.client";
import ConfirmDialog from "@/components/confirm-dialog";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function CreateCourseForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slugValue = useMemo(() => slugify(title), [title]);

  const hasDirtyForm = () => {
    const form = document.getElementById("create-course-form") as HTMLFormElement | null;
    if (!form) return false;

    return Array.from(form.elements).some((element) => {
      if (!(element instanceof HTMLElement)) return false;

      const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const { name, type } = input;

      if (name === "action" || name === "isPublished") return false;
      if (type === "hidden") return false;

      if (input instanceof HTMLInputElement && input.type === "file") {
        return (input.files?.length ?? 0) > 0;
      }

      if (input instanceof HTMLInputElement && (input.type === "checkbox" || input.type === "radio")) {
        return input.checked;
      }

      return input.value.trim().length > 0;
    });
  };

  useEffect(() => {
    const handleRequest = () => {
      const form = document.getElementById("create-course-form") as HTMLFormElement | null;
      if (!form) return;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      setShowConfirmDialog(true);
    };

    const handleCancelRequest = () => {
      if (hasDirtyForm()) {
        setShowCancelDialog(true);
        return;
      }

      router.push("/admin");
    };

    window.addEventListener("course-create-confirm-request", handleRequest);
    window.addEventListener("course-cancel-confirm-request", handleCancelRequest);
    return () => {
      window.removeEventListener("course-create-confirm-request", handleRequest);
      window.removeEventListener("course-cancel-confirm-request", handleCancelRequest);
    };
  }, [router]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isSlugManual) {
      setSlug(slugify(value));
    }
  };

  async function handleSubmit() {
    const form = document.getElementById("create-course-form") as HTMLFormElement | null;
    if (!form) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      if (!response.ok && response.status !== 303) {
        let bodyText: string | null = null;
        try {
          const data = await response.json().catch(() => null);
          bodyText = data?.message || JSON.stringify(data);
        } catch {
          try {
            bodyText = await response.text();
          } catch {
            bodyText = null;
          }
        }

        const message = bodyText ? `HTTP ${response.status}: ${bodyText}` : `Failed to save course (status ${response.status})`;
        window.dispatchEvent(new CustomEvent("course-create-error", { detail: message }));
        return;
      }

      const destination = response.redirected && response.url ? response.url : "/admin?success=Course%20saved%20successfully.%20This%20course%20will%20appear%20under%20Unpublished%20until%20you%20publish%20it.";
      router.push(destination.replace(window.location.origin, ""));
      form.reset();
      setTitle("");
      setSlug("");
      setIsSlugManual(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save course.";
      window.dispatchEvent(new CustomEvent("course-create-error", { detail: message }));
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  }

  return (
    <>
    <form id="create-course-form" className="space-y-2.5">
      <ImageFileUploader />
      <input type="hidden" name="action" value="create" />
      <input type="hidden" name="isPublished" value="false" />

      <div className="grid gap-2 md:grid-cols-2 md:gap-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          <span className="inline-flex items-center gap-1">
            Course title
            <span className="text-red-500">*</span>
          </span>
          <input
            name="title"
            required
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="e.g. Data Analytics Bootcamp"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Slug (optional)
          <input
            name="slug"
            value={slug}
            onChange={(event) => {
              const value = event.target.value;
              setSlug(value);
              setIsSlugManual(value.trim().length > 0);
            }}
            onBlur={() => {
              if (!slug.trim()) {
                setSlug(slugValue);
                setIsSlugManual(false);
              }
            }}
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
          <span className="inline-flex items-center gap-1">
            Price (INR)
            <span className="text-red-500">*</span>
          </span>
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

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          <span className="inline-flex items-center gap-1">
            Instructor name
            <span className="text-red-500">*</span>
          </span>
          <input
            name="instructorName"
            required
            placeholder="e.g. John Doe"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Instructor title
          <input
            name="instructorTitle"
            placeholder="e.g. Senior Data Instructor"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Short description
          <textarea
            name="shortDescription"
            rows={3}
            placeholder="Add a short summary for the course card"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          <span className="inline-flex items-center gap-1">
            Full description
            <span className="text-red-500">*</span>
          </span>
          <textarea
            name="description"
            rows={3}
            required
            placeholder="Describe the learning outcomes, modules, and target audience"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <label className="-mt-2 block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
          Course thumbnail
          <div className="mt-1 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800/60">
            <ImageCropWrapper width={1200} height={800} />
          </div>
        </label>

        <label className="-mt-1 block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
          Or use image URL
          <input
            name="imageUrl"
            type="text"
            placeholder="https://example.com/course-image.jpg or /uploads/course-thumbnails/your-image.jpg"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
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

    <ConfirmDialog
      open={showConfirmDialog}
      title="Create this course?"
      description="This will save the course immediately and redirect you to the admin dashboard."
      confirmLabel={isSubmitting ? "Creating..." : "Yes, create"}
      cancelLabel="Cancel"
      onConfirm={() => {
        void handleSubmit();
      }}
      onCancel={() => setShowConfirmDialog(false)}
    />

    <ConfirmDialog
      open={showCancelDialog}
      title="Discard this form?"
      description="You have started filling out this course. Leaving now will discard your changes."
      confirmLabel="Yes, discard"
      cancelLabel="Keep editing"
      onConfirm={() => {
        setShowCancelDialog(false);
        router.push("/admin");
      }}
      onCancel={() => setShowCancelDialog(false)}
    />
    </>
  );
}
