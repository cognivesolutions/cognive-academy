"use client";

import { useState } from "react";
import Link from "next/link";

import ConfirmDialog from "@/components/confirm-dialog";

export default function CourseAdminActions({ courseId }: { courseId: string }) {
  const [pendingAction, setPendingAction] = useState<"update" | "delete" | null>(null);

  return (
    <>
      <div className="flex items-center justify-end gap-2 pt-2">
        <Link
          href={`/admin/courses/${courseId}/lectures?courseId=${courseId}`}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-[11px] text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
        >
          Manage lectures
        </Link>

        <button
          type="button"
          onClick={() => setPendingAction("delete")}
          className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
        >
          Delete
        </button>

        <button
          type="button"
          onClick={() => setPendingAction("update")}
          className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white shadow-[0_10px_24px_rgba(99,102,241,0.24)] transition hover:bg-indigo-500"
        >
          Update
        </button>
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
        onConfirm={() => {
          if (!pendingAction) return;
          const form = document.getElementById(`course-form-${courseId}`) as HTMLFormElement | null;
          if (form) {
            const actionInput = document.createElement("input");
            actionInput.type = "hidden";
            actionInput.name = "action";
            actionInput.value = pendingAction;
            form.appendChild(actionInput);
            form.submit();
          }
          setPendingAction(null);
        }}
        onCancel={() => setPendingAction(null)}
      />
    </>
  );
}
