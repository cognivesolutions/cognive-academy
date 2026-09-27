"use client";

import React, { useState } from "react";

type Lecture = { id: string; title: string; position: number; liveSessionUrl?: string | null };
type Module = { id: string; title: string; lectures: Lecture[] };

export default function BulkEditor({ modules, courseId }: { modules: Module[]; courseId: string }) {
  const [local, setLocal] = useState<Module[]>(() => modules.map((m) => ({ ...m, lectures: [...m.lectures] })));
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dragging, setDragging] = useState<{ modIndex: number; lecIndex: number } | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggleSelect = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectAll = () => {
    const all: Record<string, boolean> = {};
    local.forEach((m) => m.lectures.forEach((l) => (all[l.id] = true)));
    setSelected(all);
  };
  const clearAll = () => setSelected({});

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
    setShowConfirm(true);
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
      alert("Bulk update failed — see console.");
      setSubmitting(false);
      setShowConfirm(false);
    }
  }

  async function batchAction(type: "publish" | "unpublish" | "delete") {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) return alert("Select at least one lecture");
    if (type === "delete" && !confirm(`Delete ${ids.length} lectures? This cannot be undone.`)) return;

    // delegate to a new admin API endpoint /api/admin/lectures/batch
    const res = await fetch(`/api/admin/lectures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: type === "publish" ? "bulkPublish" : type === "unpublish" ? "bulkUnpublish" : "bulkDelete", ids }),
    });
    if (!res.ok) return alert("Batch action failed");
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      {local.map((mod, mi) => (
        <div key={mod.id} className="rounded-md border p-3">
          <div className="font-semibold">Module: {mod.title}</div>
          <div className="mt-2 space-y-2">
            {mod.lectures.map((lec, li) => (
              <div
                key={lec.id}
                draggable
                onDragStart={(e) => handleDragStart(e, mi, li)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, mi, li)}
                className="flex items-center gap-2"
              >
                <input type="checkbox" checked={!!selected[lec.id]} onChange={() => toggleSelect(lec.id)} className="mr-2" />
                <div className="flex flex-col flex-1">
                  <input value={lec.title} onChange={(e) => updateField(mi, li, "title", e.target.value)} className="rounded-md border px-2 py-1" />
                  <input value={lec.liveSessionUrl ?? ""} onChange={(e) => updateField(mi, li, "liveSessionUrl", e.target.value)} placeholder="Live URL" className="mt-1 rounded-md border px-2 py-1 text-sm" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button type="button" onClick={() => {
                    if (li > 0) swapLectures({ modIndex: mi, lecIndex: li }, { modIndex: mi, lecIndex: li - 1 });
                  }} className="rounded border bg-white px-2 py-1 text-xs">▲</button>
                  <button type="button" onClick={() => {
                    swapLectures({ modIndex: mi, lecIndex: li }, { modIndex: mi, lecIndex: li + 1 });
                  }} className="rounded border bg-white px-2 py-1 text-xs">▼</button>
                </div>
              </div>
            ))}
            <div onDragOver={handleDragOver} onDrop={(e) => handleDropOnModuleEnd(e, mi)} className="h-6" />
          </div>
        </div>
      ))}

      <div className="pt-2">
        <div className="flex items-center gap-2">
          <button onClick={selectAll} className="rounded border px-2 py-1 text-sm">Select all</button>
          <button onClick={clearAll} className="rounded border px-2 py-1 text-sm">Clear</button>
          <button onClick={() => batchAction("publish")} className="rounded bg-green-600 px-3 py-1 text-sm text-white">Publish</button>
          <button onClick={() => batchAction("unpublish")} className="rounded bg-yellow-600 px-3 py-1 text-sm text-white">Unpublish</button>
          <button onClick={() => batchAction("delete")} className="rounded bg-red-600 px-3 py-1 text-sm text-white">Delete</button>
          <button disabled={submitting} onClick={openConfirm} className="ml-auto rounded-full bg-indigo-600 px-4 py-2 text-white">Save changes</button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirm(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-slate-900">
            <h3 className="text-lg font-semibold">Confirm bulk update</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">You're about to apply changes to {local.reduce((s, m) => s + m.lectures.length, 0)} lectures. This will update titles and positions.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowConfirm(false)} className="rounded-md border px-3 py-2">Cancel</button>
              <button disabled={submitting} onClick={confirmSubmit} className="rounded-md bg-indigo-600 px-3 py-2 text-white">{submitting ? "Saving..." : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
