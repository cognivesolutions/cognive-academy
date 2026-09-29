"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ConfirmDialog from "@/components/confirm-dialog";

export default function CourseAdminActions({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"update" | "delete" | null>(null);

  return (
    <>
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => setPendingAction("update")}
          className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50/80 px-3 py-2 text-[11px] font-semibold text-amber-700 shadow-[0_8px_20px_rgba(245,158,11,0.08)] backdrop-blur-sm transition duration-200 hover:border-amber-300 hover:bg-amber-100 hover:shadow-[0_10px_24px_rgba(245,158,11,0.12)] hover:brightness-105 active:scale-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:border-amber-400/50 dark:hover:bg-amber-500/15"
        >
          Update
        </button>

        <button
          type="button"
          onClick={() => setPendingAction("delete")}
          className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700 transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
        >
          Delete
        </button>

        <Link
          href={`/admin/courses/${courseId}/lectures?courseId=${courseId}`}
          className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-[11px] font-semibold text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
        >
          Manage lectures
        </Link>
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction === "delete" ? "Delete this course?" : "Update this course?"}
        description={
          pendingAction === "delete"
            ? "This course will be permanently removed. This action cannot be undone."
            : "This will save the current course details and update the catalog information."
        }
        confirmLabel={pendingAction === "delete" ? "Yes, delete" : "Yes, update"}
        onConfirm={async () => {
          if (!pendingAction) return;

          const form = document.getElementById(`course-form-${courseId}`) as HTMLFormElement | null;
          if (!form) {
            setPendingAction(null);
            return;
          }

          const formData = new FormData(form);
          formData.set("action", pendingAction);

          try {
            const response = await fetch("/api/admin/courses", {
              method: "POST",
              body: formData,
              credentials: "same-origin",
            });

            if (!response.ok) {
              const errorText = await response.text().catch(() => "");
              throw new Error(errorText || `Request failed with status ${response.status}`);
            }

            router.refresh();
          } catch (error) {
            console.error("Course action failed:", error);
            alert(error instanceof Error ? error.message : "Could not complete this action.");
          } finally {
            setPendingAction(null);
          }
        }}
        onCancel={() => setPendingAction(null)}
      />
    </>
  );
}
