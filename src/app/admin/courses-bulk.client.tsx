"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ConfirmDialog from "@/components/confirm-dialog";

export default function CoursesBulk({
  courses,
  variant = "default",
  selected,
  onSelectionChange,
}: {
  courses: { id: string; title: string }[];
  variant?: "default" | "unpublished";
  selected?: Record<string, boolean>;
  onSelectionChange?: (next: Record<string, boolean>) => void;
}) {
  const router = useRouter();
  const [internalSelected, setInternalSelected] = useState<Record<string, boolean>>({});
  const currentSelected = selected ?? internalSelected;
  const [pendingAction, setPendingAction] = useState<{ type: "publish" | "unpublish" | "delete" | "update"; ids: string[] } | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; tone: "amber" | "red" | "green" } | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const clearFeedback = () => setFeedback(null);

  const setActionFeedback = (type: "publish" | "unpublish" | "delete" | "update", message: string, toneOverride?: "amber" | "red" | "green") => {
    const tone = toneOverride ?? "amber";
    setFeedback({ message, tone });
  };

  const updateSelected = (next: Record<string, boolean>) => {
    if (selected !== undefined && onSelectionChange) {
      onSelectionChange(next);
      return;
    }
    setInternalSelected(next);
  };

  const selectAll = () => {
    const all: Record<string, boolean> = {};
    for (const c of courses) all[c.id] = true;
    updateSelected(all);
    clearFeedback();
  };
  const clearAll = () => {
    updateSelected({});
    clearFeedback();
  };

  async function executeAction(type: "publish" | "unpublish" | "delete" | "update") {
    const ids = Object.keys(currentSelected).filter((id) => currentSelected[id]);
    if (ids.length === 0) {
      setActionFeedback(type, "Select at least one course to continue.");
      return;
    }

    let res: Response;

    if (type === "update") {
      const updates = ids
        .map((id) => {
          const form = document.getElementById(`course-form-${id}`) as HTMLFormElement | null;
          if (!form) return null;

          const formData = new FormData(form);
          return {
            id,
            title: String(formData.get("title") ?? "").trim(),
            slug: String(formData.get("slug") ?? "").trim(),
            category: String(formData.get("category") ?? "").trim(),
            level: String(formData.get("level") ?? "Beginner").trim(),
            price: Number(formData.get("price") ?? 0),
            durationHours: Number(formData.get("durationHours") ?? 0),
            isLive: String(formData.get("isLive") ?? "false") === "true",
            isPublished: String(formData.get("isPublished") ?? (variant === "unpublished" ? "false" : "true")) === "true",
            language: String(formData.get("language") ?? "en").trim().toLowerCase(),
            shortDescription: String(formData.get("shortDescription") ?? "").trim(),
            description: String(formData.get("description") ?? "").trim(),
            instructorName: String(formData.get("instructorName") ?? "").trim(),
            instructorTitle: String(formData.get("instructorTitle") ?? "").trim(),
            imageUrl: String(formData.get("imageUrl") ?? "").trim(),
            previewLectureUrl: String(formData.get("previewLectureUrl") ?? "").trim(),
          };
        })
        .filter(Boolean) as Array<{
          id: string;
          title: string;
          slug: string;
          category: string;
          level: string;
          price: number;
          durationHours: number;
          isLive: boolean;
          isPublished: boolean;
          language: string;
          shortDescription: string;
          description: string;
          instructorName: string;
          instructorTitle: string;
          imageUrl: string;
          previewLectureUrl: string;
        }>;

      res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkUpdate", updates }),
      });
    } else {
      res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: type === "publish" ? "bulkPublish" : type === "unpublish" ? "bulkUnpublish" : "bulkDelete", ids }),
      });
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      const failureText =
        type === "update"
          ? "Course update failed."
          : type === "delete"
            ? "Course delete failed."
            : type === "publish"
              ? "Course publish failed."
              : "Course unpublish failed.";
      setActionFeedback(type, errorText || failureText, "red");
      return;
    }

    const successText =
      type === "update"
        ? "Course updated successfully."
        : type === "delete"
          ? "Course deleted successfully."
          : type === "publish"
            ? "Course published successfully."
            : "Course unpublished successfully.";

    setActionFeedback(type, successText, "green");
    setPendingAction(null);
    updateSelected({});
    router.refresh();
  }

  function requestAction(type: "publish" | "unpublish" | "delete" | "update") {
    const ids = Object.keys(currentSelected).filter((id) => currentSelected[id]);
    if (ids.length === 0) {
      setActionFeedback(type, "Select at least one course to continue.");
      return;
    }
    clearFeedback();
    setPendingAction({ type, ids });
  }

  const isUnpublishedMode = variant === "unpublished";

  return (
    <>
      {feedback ? (
        <div
          aria-live="polite"
          className={[
            "mb-3 rounded-2xl border px-3 py-2 text-[12px] font-medium shadow-sm",
            feedback.tone === "red"
              ? "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
              : feedback.tone === "green"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
          ].join(" ")}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50/80 p-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.02)] dark:border-slate-700 dark:bg-slate-800/80">
        <div className="flex items-center gap-1.5">
          <button
            onClick={selectAll}
            className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
          >
            Select all
          </button>
          <button
            onClick={clearAll}
            className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-3 py-1.5 text-[11px] font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {isUnpublishedMode ? (
            <>
              <button
                type="button"
                onClick={() => requestAction("update")}
                className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-[11px] font-semibold text-amber-700 shadow-[0_8px_20px_rgba(245,158,11,0.08)] backdrop-blur-sm transition duration-200 hover:border-amber-300 hover:bg-amber-100 hover:shadow-[0_10px_24px_rgba(245,158,11,0.12)] hover:brightness-105 active:scale-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:border-amber-400/50 dark:hover:bg-amber-500/15"
              >
                Update
              </button>
              <button
                onClick={() => requestAction("delete")}
                className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-3 py-1.5 text-[11px] font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
              >
                Delete
              </button>
              <button
                onClick={() => requestAction("publish")}
                className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)] backdrop-blur-sm transition duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] hover:brightness-105 active:scale-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15"
              >
                Publish
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => requestAction("unpublish")}
                className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700 transition duration-200 hover:border-amber-300 hover:bg-amber-100 hover:shadow-[0_10px_24px_rgba(245,158,11,0.12)] hover:brightness-105 active:scale-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:border-amber-400/50 dark:hover:bg-amber-500/15"
              >
                Unpublish
              </button>
              <button
                type="button"
                onClick={() => requestAction("update")}
                className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-[11px] font-semibold text-amber-700 shadow-[0_8px_20px_rgba(245,158,11,0.08)] backdrop-blur-sm transition duration-200 hover:border-amber-300 hover:bg-amber-100 hover:shadow-[0_10px_24px_rgba(245,158,11,0.12)] hover:brightness-105 active:scale-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:border-amber-400/50 dark:hover:bg-amber-500/15"
              >
                Update
              </button>
              <button
                onClick={() => requestAction("delete")}
                className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-3 py-1.5 text-[11px] font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
              >
                Delete
              </button>
              <button
                onClick={() => requestAction("publish")}
                className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)] backdrop-blur-sm transition duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] hover:brightness-105 active:scale-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15"
              >
                Publish
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingAction}
        title={
          pendingAction?.type === "delete"
            ? "Delete selected courses?"
            : pendingAction?.type === "publish"
              ? "Publish selected courses?"
              : pendingAction?.type === "update"
                ? "Update selected courses?"
                : "Unpublish selected courses?"
        }
        description={
          pendingAction
            ? pendingAction.type === "update"
              ? `This will save the current form values for ${pendingAction.ids.length} selected course${pendingAction.ids.length > 1 ? "s" : ""}.`
              : `This will ${pendingAction.type === "delete" ? "permanently delete" : pendingAction.type === "publish" ? "publish" : "unpublish"} ${pendingAction.ids.length} selected course${pendingAction.ids.length > 1 ? "s" : ""}.`
            : ""
        }
        confirmLabel={
          pendingAction?.type === "delete"
            ? "Yes, delete"
            : pendingAction?.type === "publish"
              ? "Yes, publish"
              : pendingAction?.type === "update"
                ? "Yes, update"
                : "Yes, unpublish"
        }
        onConfirm={() => {
          if (!pendingAction) return;
          executeAction(pendingAction.type);
        }}
        onCancel={() => setPendingAction(null)}
      />
    </>
  );
}
