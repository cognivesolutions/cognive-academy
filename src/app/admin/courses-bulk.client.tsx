"use client";

import React, { useEffect, useState } from "react";

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
  const [internalSelected, setInternalSelected] = useState<Record<string, boolean>>({});
  const currentSelected = selected ?? internalSelected;
  const [pendingAction, setPendingAction] = useState<{ type: "publish" | "unpublish" | "delete"; ids: string[] } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const clearFeedback = () => setFeedback(null);

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

  async function executeAction(type: "publish" | "unpublish" | "delete") {
    const ids = Object.keys(currentSelected).filter((id) => currentSelected[id]);
    if (ids.length === 0) {
      setFeedback("Select at least one course to continue.");
      return;
    }

    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: type === "publish" ? "bulkPublish" : type === "unpublish" ? "bulkUnpublish" : "bulkDelete", ids }),
    });

    if (!res.ok) return;
    setPendingAction(null);
    window.location.reload();
  }

  function requestAction(type: "publish" | "unpublish" | "delete") {
    const ids = Object.keys(currentSelected).filter((id) => currentSelected[id]);
    if (ids.length === 0) {
      setFeedback("Select at least one course to continue.");
      return;
    }
    clearFeedback();
    setPendingAction({ type, ids });
  }

  const isUnpublishedMode = variant === "unpublished";

  return (
    <>
      {feedback ? (
        <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200" aria-live="polite">
          {feedback}
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
                onClick={() => setFeedback("Use the course card update action to update selected items.")}
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
                onClick={() => setFeedback("Use the course card update action to update selected items.")}
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
        title={pendingAction?.type === "delete" ? "Delete selected courses?" : pendingAction?.type === "publish" ? "Publish selected courses?" : "Unpublish selected courses?"}
        description={
          pendingAction
            ? `This will ${pendingAction.type === "delete" ? "permanently delete" : pendingAction.type === "publish" ? "publish" : "unpublish"} ${pendingAction.ids.length} selected course${pendingAction.ids.length > 1 ? "s" : ""}.`
            : ""
        }
        confirmLabel={pendingAction?.type === "delete" ? "Yes, delete" : pendingAction?.type === "publish" ? "Yes, publish" : "Yes, unpublish"}
        onConfirm={() => {
          if (!pendingAction) return;
          executeAction(pendingAction.type);
        }}
        onCancel={() => setPendingAction(null)}
      />
    </>
  );
}
