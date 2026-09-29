"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Yes, sign out",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const modal = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      aria-modal="true"
      role="dialog"
      onMouseDown={(e) => {
        // prevent document-level outside-click handlers from running
        e.stopPropagation();
        // close when clicking on overlay (but not when clicking inside modal)
        if (e.target === overlayRef.current) onCancel();
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div ref={modalRef} className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(2,6,23,0.5)] dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
          {description ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p> : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-full border border-slate-200/80 bg-white/55 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:border-slate-300 hover:bg-white/75 dark:border-slate-700/80 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800/70"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-full border border-violet-200/80 bg-gradient-to-r from-white/80 via-violet-100/80 to-indigo-100/80 px-4 py-2 text-sm font-semibold text-violet-700 shadow-[0_10px_26px_rgba(139,92,246,0.22)] backdrop-blur-xl ring-1 ring-violet-100/80 transition hover:border-violet-300 hover:shadow-[0_12px_30px_rgba(139,92,246,0.28)] dark:border-violet-400/40 dark:from-violet-500/20 dark:via-indigo-500/20 dark:to-sky-500/20 dark:text-violet-100 dark:ring-violet-500/20"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}
