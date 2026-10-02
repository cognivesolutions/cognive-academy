"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import CourseThumbnail from "../components/course-thumbnail.client";
import { CourseSelect } from "../components/course-select";
import ImageCropWrapper from "../components/image-crop-wrapper.client";
import CoursesBulk from "../courses-bulk.client";
import ConfirmDialog from "@/components/confirm-dialog";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export type ManageCourse = {
  id: string;
  title: string;
  slug: string;
  category: string;
  level?: string | null;
  price: number;
  offerPrice?: number | null;
  isPromotional?: boolean | null;
  isBestValue?: boolean | null;
  isNew?: boolean | null;
  featured?: boolean | null;
  promoCode?: string | null;
  imageUrl?: string | null;
  isLive: boolean;
  isPublished?: boolean;
  language: string;
  durationHours?: number | null;
  previewLectureUrl?: string | null;
  instructorName?: string | null;
  instructorTitle?: string | null;
  shortDescription?: string | null;
  description?: string | null;
};

function ManageCourseCard({ course, isSelected, onToggle }: { course: ManageCourse; isSelected: boolean; onToggle: (id: string) => void }) {
  const router = useRouter();
  const [titleValue, setTitleValue] = useState(course.title);
  const [slugValue, setSlugValue] = useState(course.slug);
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [badgeWarning, setBadgeWarning] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; tone: "amber" | "red" | "green" } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState<"update" | "delete" | "publish" | "unpublish" | null>(null);
  const [pendingConfirmAction, setPendingConfirmAction] = useState<"update" | "delete" | "publish" | "unpublish" | null>(null);
  const getCourseBadgeValue = (name: string) => {
    const value = (course as unknown as Record<string, unknown>)[name];
    return Boolean(value);
  };

  const getResolvedBadgeValue = (name: string) => {
    if (Object.prototype.hasOwnProperty.call(badgeSelection, name)) {
      return Boolean(badgeSelection[name]);
    }

    return getCourseBadgeValue(name);
  };

  const [badgeSelection, setBadgeSelection] = useState<Record<string, boolean>>({
    isNew: getCourseBadgeValue("isNew"),
    isPromotional: getCourseBadgeValue("isPromotional"),
    isBestValue: getCourseBadgeValue("isBestValue"),
    featured: getCourseBadgeValue("featured"),
  });

  useEffect(() => {
    setBadgeSelection({
      isNew: getCourseBadgeValue("isNew"),
      isPromotional: getCourseBadgeValue("isPromotional"),
      isBestValue: getCourseBadgeValue("isBestValue"),
      featured: getCourseBadgeValue("featured"),
    });
  }, [course.id, course.isNew, course.isPromotional, course.isBestValue, course.featured]);

  useEffect(() => {
    if (!warning) return;
    const timeout = window.setTimeout(() => setWarning(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [warning]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (!badgeWarning) return;
    const timeout = window.setTimeout(() => setBadgeWarning(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [badgeWarning]);

  const slugPreview = useMemo(() => slugify(titleValue), [titleValue]);

  const hasBadgeChanges = () => {
    const originalValues = {
      isNew: getCourseBadgeValue("isNew"),
      isPromotional: getCourseBadgeValue("isPromotional"),
      isBestValue: getCourseBadgeValue("isBestValue"),
      featured: getCourseBadgeValue("featured"),
    };

    return Object.entries(originalValues).some(([key, value]) => getResolvedBadgeValue(key) !== value);
  };

  const persistBadgeUpdate = async (name: string, nextValue: boolean) => {
    const form = document.getElementById(`course-form-${course.id}`) as HTMLFormElement | null;
    if (!form) return;

    const nextBadgeSelection = {
      ...badgeSelection,
      [name]: nextValue,
    };

    setBadgeWarning(null);

    try {
      const formData = new FormData(form);
      formData.set("action", "update");
      formData.set("isPublished", String(course.isPublished ?? false));
      formData.set("isNew", String(Boolean(nextBadgeSelection.isNew)));
      formData.set("isPromotional", String(Boolean(nextBadgeSelection.isPromotional)));
      formData.set("isBestValue", String(Boolean(nextBadgeSelection.isBestValue)));
      formData.set("featured", String(Boolean(nextBadgeSelection.featured)));

      const response = await fetch("/api/admin/courses", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }

      setFeedback({ message: "Badge updated successfully.", tone: "green" });
      setIsDirty(false);
      form.dataset.dirty = "false";
      router.refresh();
    } catch (error) {
      console.error("Badge update failed:", error);
      setFeedback({
        message: error instanceof Error ? error.message : "Could not save badge update.",
        tone: "red",
      });
      setBadgeSelection((previous) => ({
        ...previous,
        [name]: !nextValue,
      }));
    }
  };

  const toggleBadge = (name: string) => {
    const nextValue = !getResolvedBadgeValue(name);
    setBadgeSelection((previous) => ({
      ...previous,
      [name]: nextValue,
    }));

    if (course.isPublished) {
      void persistBadgeUpdate(name, nextValue);
      return;
    }

    markDirty();
  };

  const markDirty = () => {
    setIsDirty(true);
    setWarning(null);
    const form = document.getElementById(`course-form-${course.id}`) as HTMLFormElement | null;
    if (form) form.dataset.dirty = "true";
  };

  const hasFormChanges = () => {
    const form = document.getElementById(`course-form-${course.id}`) as HTMLFormElement | null;
    if (!form) return false;

    if (form.dataset.dirty === "true" || isDirty) {
      return true;
    }

    const snapshot: Record<string, string> = {
      title: course.title,
      slug: course.slug,
      category: course.category,
      level: course.level ?? "Beginner",
      price: String(course.price ?? ""),
      offerPrice: course.offerPrice !== null && course.offerPrice !== undefined ? String(course.offerPrice) : "",
      isPromotional: String(Boolean(course.isPromotional)),
      isBestValue: String(Boolean(course.isBestValue)),
      isNew: String(Boolean(course.isNew)),
      featured: String(Boolean(course.featured)),
      promoCode: course.promoCode ?? "",
      durationHours: course.durationHours ? String(course.durationHours) : "",
      language: course.language,
      isLive: String(course.isLive),
      instructorName: course.instructorName ?? "",
      instructorTitle: course.instructorTitle ?? "",
      shortDescription: course.shortDescription ?? "",
      description: course.description ?? "",
      imageUrl: course.imageUrl ?? "",
      previewLectureUrl: course.previewLectureUrl ?? "",
    };

    const formData = new FormData(form);

    for (const [name, originalValue] of Object.entries(snapshot)) {
      const currentValue = String(formData.get(name) ?? "").trim();
      if (currentValue !== String(originalValue ?? "").trim()) {
        return true;
      }
    }

    return false;
  };

  const handleTitleChange = (value: string) => {
    markDirty();
    setTitleValue(value);
    if (!isSlugManual) {
      setSlugValue(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    markDirty();
    setSlugValue(value);
    setIsSlugManual(value.trim().length > 0);
  };

  const handleSlugBlur = () => {
    if (!slugValue.trim()) {
      setSlugValue(slugPreview);
      setIsSlugManual(false);
    }
  };

  const handleAction = async (action: "update" | "delete" | "publish" | "unpublish") => {
    const form = document.getElementById(`course-form-${course.id}`) as HTMLFormElement | null;
    if (!form) return;

    if (action === "update" && !hasFormChanges()) {
      setWarning("Please make at least one change before updating this course.");
      setBadgeWarning(null);
      setPendingConfirmAction(null);
      return;
    }

    setWarning(null);
    setBadgeWarning(null);
    setPendingAction(action);
    setPendingConfirmAction(null);

    try {
      const formData = new FormData(form);
      formData.set("action", action);
      formData.set("isPublished", action === "publish" ? "true" : action === "unpublish" ? "false" : String(course.isPublished ?? false));

      const response = await fetch("/api/admin/courses", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }

      const successMessage =
        action === "update"
          ? "Course updated successfully."
          : action === "delete"
            ? "Course deleted successfully."
            : action === "publish"
              ? "Course published successfully."
              : "Course unpublished successfully.";

      if (action === "delete" || action === "publish" || action === "unpublish") {
        setWarning(null);
        setFeedback(null);
        window.location.assign(`/admin/courses?success=${encodeURIComponent(successMessage)}`);
        return;
      }

      setFeedback({ message: successMessage, tone: "green" });
      setIsDirty(false);
      form.dataset.dirty = "false";
      router.refresh();
    } catch (error) {
      console.error("Course action failed:", error);
      setFeedback({
        message: error instanceof Error ? error.message : "Could not complete this action.",
        tone: "red",
      });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.03)] transition duration-200 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800/80">
      <div className="mb-3 flex items-start justify-between gap-3 pt-0.5">
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 break-words text-[0.9rem] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">{course.title}</div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {course.category} • {course.level ?? "Beginner"} • {course.isLive ? "Live" : "Recorded"} • {course.language === "hi" ? "Hindi" : "English"}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <input
            id={`course-select-${course.id}`}
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(course.id)}
            className="peer sr-only"
            aria-label={`Select ${course.title}`}
          />
          <label
            htmlFor={`course-select-${course.id}`}
            className={`relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200 ${
              isSelected
                ? "border-emerald-500 bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)] dark:border-emerald-400 dark:bg-emerald-400"
                : "border-slate-300 bg-white hover:border-emerald-300 hover:shadow-[0_1px_6px_rgba(16,185,129,0.12)] dark:border-slate-600 dark:bg-slate-900/80 dark:hover:border-emerald-400"
            }`}
          >
            {isSelected ? (
              <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 text-white" aria-hidden="true">
                <path d="M5.5 10.5L8.5 13.5L14.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </label>
        </div>
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

      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={(course.isPublished ?? false) ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200" : "inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-800 dark:bg-amber-500/10 dark:text-amber-200"}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {(course.isPublished ?? false) ? "Published" : "Unpublished"}
          </span>
          <span className={course.isLive ? "inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-700 dark:bg-blue-500/10 dark:text-blue-200" : "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 dark:bg-slate-700 dark:text-slate-200"}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {course.isLive ? "Live" : "Recorded"}
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
          ₹{Number(course.price).toLocaleString("en-IN")}
        </span>
      </div>

      <form id={`course-form-${course.id}`} action="/api/admin/courses" method="POST" encType="multipart/form-data" className="space-y-3">
        <input type="hidden" name="action" value="update" />
        <input type="hidden" name="id" value={course.id} />
        <input type="hidden" name="isNew" value={String(Boolean(getResolvedBadgeValue("isNew")))} />
        <input type="hidden" name="isPromotional" value={String(Boolean(getResolvedBadgeValue("isPromotional")))} />
        <input type="hidden" name="isBestValue" value={String(Boolean(getResolvedBadgeValue("isBestValue")))} />
        <input type="hidden" name="featured" value={String(Boolean(getResolvedBadgeValue("featured")))} />

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          <span className="inline-flex items-center gap-1">
            Course title
            <span className="text-red-500">*</span>
          </span>
          <input
            name="title"
            required
            value={titleValue}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="e.g. Data Analytics Bootcamp"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Slug (optional)
          <input
            name="slug"
            value={slugValue}
            onChange={(event) => handleSlugChange(event.target.value)}
            onBlur={handleSlugBlur}
            placeholder="e.g. data-analytics-bootcamp"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <CourseSelect
            name="category"
            label="Category"
            placeholder="Select a category"
            defaultValue={course.category}
            syncUrl={false}
            onValueChange={markDirty}
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
            syncUrl={false}
            onValueChange={markDirty}
            options={[
              { value: "Beginner", label: "Beginner" },
              { value: "Intermediate", label: "Intermediate" },
              { value: "Advanced", label: "Advanced" },
            ]}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="inline-flex items-center gap-1">
              Price (INR)
              <span className="text-red-500">*</span>
            </span>
            <input
              name="price"
              type="number"
              min="0"
              defaultValue={Number(course.price)}
              onChange={markDirty}
              placeholder="e.g. 4999"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:h-5 [&::-webkit-inner-spin-button]:h-5"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Offer price (INR)
            <input
              name="offerPrice"
              type="number"
              min="0"
              defaultValue={course.offerPrice ?? ""}
              onChange={markDirty}
              placeholder="e.g. 3499"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:h-5 [&::-webkit-inner-spin-button]:h-5"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Promo code
            <input
              name="promoCode"
              defaultValue={course.promoCode ?? ""}
              onChange={markDirty}
              placeholder="e.g. SPRING30"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Duration (hours)
            <input
              name="durationHours"
              type="number"
              min="1"
              defaultValue={course.durationHours ?? ""}
              onChange={markDirty}
              placeholder="e.g. 16"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:h-5 [&::-webkit-inner-spin-button]:h-5"
            />
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/80">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Featured badges</p>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">Course spotlight</span>
            </div>
            <span className="rounded-full border border-amber-200/80 bg-gradient-to-r from-amber-100/80 via-yellow-50/80 to-amber-200/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-700 shadow-[0_0_0_1px_rgba(251,191,36,0.12)] backdrop-blur-sm dark:border-amber-400/30 dark:from-amber-500/15 dark:via-yellow-400/10 dark:to-amber-500/15 dark:text-amber-200">Optional</span>
          </div>

          {badgeWarning ? (
            <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 px-2.5 py-2 text-[10px] font-medium text-amber-800 shadow-[0_8px_18px_rgba(251,191,36,0.12)] dark:border-amber-500/30 dark:from-amber-500/10 dark:via-yellow-500/10 dark:to-orange-500/10 dark:text-amber-200">
              {badgeWarning}
            </div>
          ) : null}

          <div className="grid gap-2 grid-cols-2">
            {[
              {
                name: "isNew",
                label: "New",
                icon: "✦",
                description: "Fresh course",
                accent: "emerald",
              },
              {
                name: "isPromotional",
                label: "Limited Offer",
                icon: "⏳",
                description: "Promo pricing",
                accent: "amber",
              },
              {
                name: "isBestValue",
                label: "Best Value",
                icon: "★",
                description: "Strong value pick",
                accent: "violet",
              },
              {
                name: "featured",
                label: "Featured",
                icon: "✦",
                description: "Hero course spotlight",
                accent: "gold",
              },
            ].map(({ name, label, icon, description, accent }) => {
              const inputId = `${course.id}-${name}`;
              const isSelected = getResolvedBadgeValue(name);

              let pillClassName = "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200";

              if (accent === "amber") {
                pillClassName = "border-amber-300 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-200 text-amber-800 shadow-[0_0_0_1px_rgba(251,191,36,0.12)] dark:border-amber-400/40 dark:from-amber-500/20 dark:via-yellow-500/10 dark:to-amber-500/20 dark:text-amber-200";
              } else if (accent === "violet") {
                pillClassName = "border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200";
              } else if (accent === "gold") {
                pillClassName = "border-amber-200 bg-gradient-to-r from-yellow-100 via-amber-50 to-orange-100 text-amber-800 shadow-[0_0_0_1px_rgba(251,191,36,0.12)] dark:border-amber-400/40 dark:from-amber-500/15 dark:via-yellow-500/10 dark:to-orange-500/15 dark:text-amber-200";
              }

              const indicatorClassName = isSelected
                ? "border-emerald-500 bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)] dark:border-emerald-400 dark:bg-emerald-400"
                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900";

              const cardClassName = isSelected
                ? "border-emerald-300 bg-gradient-to-br from-emerald-50 via-emerald-50 to-green-100 text-emerald-900 shadow-[0_18px_30px_rgba(16,185,129,0.16)] dark:border-emerald-500/40 dark:from-emerald-500/15 dark:via-emerald-500/10 dark:to-emerald-500/15 dark:text-emerald-100"
                : "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

              return (
                <div key={name} className="relative">
                  <input
                    id={inputId}
                    type="checkbox"
                    value="true"
                    checked={isSelected}
                    onChange={() => toggleBadge(name)}
                    className="sr-only"
                    data-badge-name={name}
                  />

                  <label
                    htmlFor={inputId}
                    className={`relative flex cursor-pointer flex-col rounded-2xl border p-3 text-left transition-all duration-200 ${cardClassName}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] ${pillClassName}`}>
                        <span aria-hidden="true" className="text-[10px]">{icon}</span>
                        {label}
                      </span>

                      <span className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${indicatorClassName}`}>
                        {isSelected ? (
                          <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5 text-white" aria-hidden="true">
                            <path d="M5.5 10.5L8.5 13.5L14.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-slate-600 dark:text-slate-300">{description}</p>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <CourseSelect
            name="language"
            label="Language"
            placeholder="Select language"
            defaultValue={course.language}
            syncUrl={false}
            onValueChange={markDirty}
            options={[
              { value: "en", label: "English" },
              { value: "hi", label: "Hindi" },
            ]}
          />

          <CourseSelect
            name="isLive"
            label="Format"
            placeholder="Select format"
            defaultValue={String(course.isLive)}
            syncUrl={false}
            onValueChange={markDirty}
            options={[
              { value: "true", label: "Live" },
              { value: "false", label: "Recorded" },
            ]}
          />
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          <span className="inline-flex items-center gap-1">
            Instructor name
            <span className="text-red-500">*</span>
          </span>
          <input
            name="instructorName"
            required
            defaultValue={course.instructorName ?? ""}
            onChange={markDirty}
            placeholder="e.g. John Doe"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Instructor title
          <input
            name="instructorTitle"
            defaultValue={course.instructorTitle ?? ""}
            onChange={markDirty}
            placeholder="e.g. Senior Data Instructor"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Short description
          <textarea
            name="shortDescription"
            rows={3}
            defaultValue={course.shortDescription ?? ""}
            onChange={markDirty}
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
            rows={4}
            required
            defaultValue={course.description ?? ""}
            onChange={markDirty}
            placeholder="Describe the learning outcomes, modules, and target audience"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Course thumbnail
          <div className="mt-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
            <ImageCropWrapper initialSrc={course.imageUrl ?? undefined} width={1200} height={800} />
          </div>
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Or use image URL
          <input
            name="imageUrl"
            type="text"
            defaultValue={course.imageUrl ?? ""}
            onChange={markDirty}
            placeholder="https://example.com/course-image.jpg or /uploads/course-thumbnails/your-image.jpg"
            className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 break-all placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Preview lecture URL
          <input
            name="previewLectureUrl"
            type="url"
            defaultValue={course.previewLectureUrl ?? ""}
            onChange={markDirty}
            placeholder="https://youtube.com/watch?v=example"
            className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 break-all placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </label>

        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="min-w-0 flex-1">
            {warning || feedback ? (
              <div
                className={[
                  "rounded-xl border px-3 py-2 text-left text-[11px] font-medium",
                  warning
                    ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                    : feedback?.tone === "red"
                      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                      : feedback?.tone === "green"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                        : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
                ].join(" ")}
              >
                {warning ?? feedback?.message}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={pendingAction !== null}
              onClick={() => {
                if (!hasFormChanges()) {
                  setWarning("Please make at least one change before updating this course.");
                  return;
                }
                setWarning(null);
                setPendingConfirmAction("update");
              }}
              className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50/80 px-3 py-2 text-[11px] font-semibold text-amber-700 shadow-[0_8px_20px_rgba(245,158,11,0.08)] backdrop-blur-sm transition duration-200 hover:border-amber-300 hover:bg-amber-100 hover:shadow-[0_10px_24px_rgba(245,158,11,0.12)] hover:brightness-105 active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:border-amber-400/50 dark:hover:bg-amber-500/15"
            >
              {pendingAction === "update" ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              disabled={pendingAction !== null}
              onClick={() => {
                if (course.isPublished) {
                  setWarning("Please unpublish this course before deleting it.");
                  return;
                }
                setPendingConfirmAction("delete");
              }}
              className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-3 py-2 text-[11px] font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
            >
              {pendingAction === "delete" ? "Deleting..." : "Delete"}
            </button>
            <button
              type="button"
              disabled={pendingAction !== null}
              onClick={() => {
                if (course.isPublished) {
                  setPendingConfirmAction("unpublish");
                  return;
                }

                setPendingConfirmAction("publish");
              }}
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-[11px] font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)] backdrop-blur-sm transition duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] hover:brightness-105 active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15"
            >
              {pendingAction === "publish" || pendingAction === "unpublish" ? (course.isPublished ? "Unpublishing..." : "Publishing...") : course.isPublished ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={pendingConfirmAction !== null}
        title={
          pendingConfirmAction === "delete"
            ? "Delete this course?"
            : pendingConfirmAction === "publish"
              ? "Publish this course?"
              : pendingConfirmAction === "unpublish"
                ? "Unpublish this course?"
                : "Update this course?"
        }
        description={
          pendingConfirmAction === "delete"
            ? "This course will be permanently removed. This action cannot be undone."
            : pendingConfirmAction === "publish"
              ? "This will publish this course and make it live."
              : pendingConfirmAction === "unpublish"
                ? "This will move the course back to unpublished state."
                : "This will save the current course details and update the catalog information."
        }
        confirmLabel={
          pendingConfirmAction === "delete"
            ? "Yes, delete"
            : pendingConfirmAction === "publish"
              ? "Yes, publish"
              : pendingConfirmAction === "unpublish"
                ? "Yes, unpublish"
                : "Yes, update"
        }
        onConfirm={() => {
          if (!pendingConfirmAction) return;
          void handleAction(pendingConfirmAction);
        }}
        onCancel={() => setPendingConfirmAction(null)}
      />
    </div>
  );
}

export default function ManageCourseGrid({ courses }: { courses: ManageCourse[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <div className="pt-2">
        <CoursesBulk
          courses={courses.map((course) => ({
            id: course.id,
            title: course.title,
            isPublished: course.isPublished,
          }))}
          selected={selected}
          onSelectionChange={setSelected}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <ManageCourseCard
            key={course.id}
            course={course}
            isSelected={!!selected[course.id]}
            onToggle={toggleCard}
          />
        ))}
      </div>
    </>
  );
}
