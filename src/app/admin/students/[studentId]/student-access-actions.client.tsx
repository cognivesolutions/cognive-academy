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
        triggerClassName="!relative !z-[100] !h-[38px] !min-h-[38px] !w-[220px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-none dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100"
        menuClassName="!z-[120] !min-w-[220px] !max-h-[320px] !overflow-y-auto !rounded-2xl !border-slate-200 !bg-white !text-slate-700 !shadow-[0_16px_40px_rgba(15,23,42,0.12)] dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
      />

      <button
        type="button"
        onClick={handleGrantAccess}
        disabled={isSubmitting}
        className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-200/80 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(255,255,255,0.72),rgba(16,185,129,0.08))] px-3 text-xs font-semibold text-emerald-700 shadow-[0_10px_22px_rgba(16,185,129,0.08)] backdrop-blur-sm transition hover:border-emerald-300 hover:bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(255,255,255,0.76),rgba(16,185,129,0.1))] disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500/30 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(15,23,42,0.72),rgba(16,185,129,0.08))] dark:text-emerald-100 dark:hover:border-emerald-400/50 dark:hover:bg-[linear-gradient(135deg,rgba(16,185,129,0.24),rgba(15,23,42,0.8),rgba(16,185,129,0.12))]"
      >
        {isSubmitting ? "Granting..." : "Add course access"}
      </button>
    </div>
  );
}
