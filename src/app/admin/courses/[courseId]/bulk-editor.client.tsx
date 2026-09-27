"use client";

import React, { useEffect, useState } from "react";

import ConfirmDialog from "@/components/confirm-dialog";

type Lecture = { id: string; title: string; position: number; liveSessionUrl?: string | null };
type Module = { id: string; title: string; lectures: Lecture[] };

export default function BulkEditor({ modules, courseId }: { modules: Module[]; courseId: string }) {
  const [local, setLocal] = useState<Module[]>(() => modules.map((m) => ({ ...m, lectures: [...m.lectures] })));
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dragging, setDragging] = useState<{ modIndex: number; lecIndex: number } | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const clearFeedback = () => setFeedback(null);

  const toggleSelect = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
    clearFeedback();
  };
  const selectAll = () => {
    const all: Record<string, boolean> = {};
    local.forEach((m) => m.lectures.forEach((l) => (all[l.id] = true)));
    setSelected(all);
    clearFeedback();
  };
  const clearAll = () => {
    setSelected({});
    clearFeedback();
  };

  function swapLectures(src: { modIndex: number; lecIndex: number }, dest: { modIndex: number; lecIndex: number }) {
    setLocal((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as Module[];
      const srcArr = copy[src.modIndex].lectures;
      const [item] = srcArr.splice(src.lecIndex, 1);
      const destArr = copy[dest.modIndex].lectures;
      destArr.splice(dest.lecIndex, 0, item);
      return copy;
    });
  }

  function handleDragStart(e: React.DragEvent, modIndex: number, lecIndex: number) {
    setDragging({ modIndex, lecIndex });
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, modIndex: number, lecIndex: number) {
    e.preventDefault();
    if (!dragging) return;
    // if dropping after the last item, adjust index
    const targetIndex = lecIndex;
    swapLectures(dragging, { modIndex, lecIndex: targetIndex });
    setDragging(null);
  }

  function handleDropOnModuleEnd(e: React.DragEvent, modIndex: number) {
    e.preventDefault();
    if (!dragging) return;
    setLocal((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as Module[];
      const srcArr = copy[dragging.modIndex].lectures;
      const [item] = srcArr.splice(dragging.lecIndex, 1);
      copy[modIndex].lectures.push(item);
      return copy;
    });
    setDragging(null);
  }

  function updateField(modIndex: number, lecIndex: number, field: keyof Lecture, value: any) {
    setLocal((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as Module[];
      // @ts-ignore
      copy[modIndex].lectures[lecIndex][field] = value;
      return copy;
    });
  }

  function openConfirm() {
    setPendingAction({ type: "save", ids: Object.keys(selected).filter((id) => selected[id]) || [] });
  }

  async function confirmSubmit() {
    setSubmitting(true);
    try {
      const updates: any[] = [];
      for (const mod of local) {
        for (let i = 0; i < mod.lectures.length; i++) {
          const lec = mod.lectures[i];
          updates.push({ id: lec.id, title: lec.title, position: i + 1, liveSessionUrl: lec.liveSessionUrl });
        }
      }

      const res = await fetch("/api/admin/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk", updates }),
      });

      if (!res.ok) throw new Error("Bulk update failed");
      window.location.reload();
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      setShowConfirm(false);
    }
  }

  const [pendingAction, setPendingAction] = useState<{ type: "publish" | "unpublish" | "delete" | "save"; ids: string[] } | null>(null);

  async function batchAction(type: "publish" | "unpublish" | "delete") {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) {
      setFeedback("Select at least one lecture to continue.");
      return;
    }
    clearFeedback();
    setPendingAction({ type, ids });
  }

  async function executePendingAction() {
    if (!pendingAction) return;
    const { type, ids } = pendingAction;

    if (type === "save") {
      await confirmSubmit();
      return;
    }

    const res = await fetch(`/api/admin/lectures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: type === "publish" ? "bulkPublish" : type === "unpublish" ? "bulkUnpublish" : "bulkDelete", ids }),
    });

    if (!res.ok) {
      setPendingAction(null);
      return;
    }

    setPendingAction(null);
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      {feedback ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200" aria-live="polite">
          {feedback}
        </div>
      ) : null}

      {local.map((mod, mi) => (
        <div key={mod.id} className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.03)] dark:border-slate-700 dark:bg-slate-800/80">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Module: {mod.title}</div>
          </div>
          <div className="space-y-2">
            {mod.lectures.map((lec, li) => (
              <div
                key={lec.id}
                draggable
                onDragStart={(e) => handleDragStart(e, mi, li)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, mi, li)}
                className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900"
              >
                <input type="checkbox" checked={!!selected[lec.id]} onChange={() => toggleSelect(lec.id)} className="mt-3 h-4 w-4 accent-indigo-600" />
                <div className="flex flex-1 flex-col gap-2">
                  <input value={lec.title} onChange={(e) => updateField(mi, li, "title", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
                  <input value={lec.liveSessionUrl ?? ""} onChange={(e) => updateField(mi, li, "liveSessionUrl", e.target.value)} placeholder="Live URL" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500" />
                </div>
                <div className="flex flex-col items-center gap-1 pt-1">
                  <button type="button" onClick={() => {
                    if (li > 0) swapLectures({ modIndex: mi, lecIndex: li }, { modIndex: mi, lecIndex: li - 1 });
                  }} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200">▲</button>
                  <button type="button" onClick={() => {
                    swapLectures({ modIndex: mi, lecIndex: li }, { modIndex: mi, lecIndex: li + 1 });
                  }} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200">▼</button>
                </div>
              </div>
            ))}
            <div onDragOver={handleDragOver} onDrop={(e) => handleDropOnModuleEnd(e, mi)} className="h-4" />
          </div>
        </div>
      ))}

      <div className="pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-slate-200 bg-slate-50/80 p-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.02)] dark:border-slate-700 dark:bg-slate-800/80">
          <div className="flex items-center gap-1.5">
            <button onClick={selectAll} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200">Select all</button>
            <button onClick={clearAll} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200">Clear</button>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => batchAction("publish")} className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">Publish</button>
            <button onClick={() => batchAction("unpublish")} className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">Unpublish</button>
            <button onClick={() => batchAction("delete")} className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">Delete</button>
            <button disabled={submitting} onClick={openConfirm} className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-2 text-[11px] font-semibold text-white shadow-[0_10px_24px_rgba(99,102,241,0.24)] transition hover:-translate-y-0.5 disabled:opacity-70">Save changes</button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingAction}
        title={pendingAction?.type === "save" ? "Save lecture changes?" : pendingAction?.type === "delete" ? "Delete selected lectures?" : pendingAction?.type === "publish" ? "Publish selected lectures?" : "Unpublish selected lectures?"}
        description={
          pendingAction?.type === "save"
            ? `This will save updates for ${local.reduce((s, m) => s + m.lectures.length, 0)} lecture${local.reduce((s, m) => s + m.lectures.length, 0) > 1 ? "s" : ""}.`
            : `This will ${pendingAction?.type === "delete" ? "delete" : pendingAction?.type === "publish" ? "publish" : "unpublish"} ${pendingAction?.ids.length ?? 0} selected lecture${(pendingAction?.ids.length ?? 0) > 1 ? "s" : ""}.`
        }
        confirmLabel={pendingAction?.type === "save" ? "Yes, save" : pendingAction?.type === "delete" ? "Yes, delete" : pendingAction?.type === "publish" ? "Yes, publish" : "Yes, unpublish"}
        onConfirm={async () => {
          if (!pendingAction) return;
          if (pendingAction.type === "save") {
            setPendingAction(null);
            await confirmSubmit();
            return;
          }

          await executePendingAction();
        }}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
