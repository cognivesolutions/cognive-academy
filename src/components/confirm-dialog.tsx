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
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60 cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.28)] hover:brightness-105 cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}
