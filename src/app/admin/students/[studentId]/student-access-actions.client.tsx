"use client";

import { CourseSelect } from "@/app/admin/components/course-select";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function StudentAccessActions({
  studentId,
  availableCourses,
}: {
  studentId: string;
  availableCourses: Array<{ id: string; title: string; category?: string | null }>;
}) {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGrantAccess = async () => {
    if (!selectedCourseId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/students/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          courseId: selectedCourseId,
          accessGranted: true,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to grant course access.");
      }

      router.refresh();
    } catch (error) {
      console.error("Unable to grant course access", error);
      alert(error instanceof Error ? error.message : "Unable to grant course access.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (availableCourses.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <CourseSelect
        name="student-access-course"
        label="Courses"
        placeholder="Courses"
        compact
        hideLabel
        syncUrl={false}
        defaultValue={selectedCourseId}
        options={availableCourses.map((course) => ({
          value: course.id,
          label: course.title,
        }))}
        onValueChange={(nextValue) => setSelectedCourseId(nextValue === "all" ? "" : nextValue)}
        triggerClassName="!relative !z-[100] !h-[38px] !min-h-[38px] !w-[220px] !rounded-full !border-slate-700 !bg-slate-950/85 !text-slate-100 !shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:!border-slate-600 dark:!bg-slate-950/85 dark:!text-slate-100"
        menuClassName="!z-[120] !min-w-[220px] !max-h-[320px] !overflow-y-auto !rounded-2xl !border-slate-700 !bg-slate-950/95 !text-slate-100 !shadow-[0_18px_40px_rgba(2,6,23,0.45)] ring-1 ring-slate-700/20 dark:!border-slate-600 dark:!bg-slate-950/95 dark:!text-slate-100"
      />

      <button
        type="button"
        onClick={handleGrantAccess}
        disabled={isSubmitting}
        className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/15"
      >
        {isSubmitting ? "Granting..." : "Add course access"}
      </button>
    </div>
  );
}
