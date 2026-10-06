"use client";

import React, { useState } from "react";

export default function ModuleManagement({ courseId, modules }: { courseId: string; modules: { id: string; title: string; position: number }[] }) {
  const [local, setLocal] = useState(modules);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);

  function startEdit(m: { id: string; title: string }) {
    setEditingId(m.id);
    setEditingTitle(m.title);
  }

  async function saveEdit(id: string) {
    const form = new FormData();
    form.append("action", "update");
    form.append("id", id);
    form.append("courseId", courseId);
    form.append("title", editingTitle);
    const res = await fetch(`/api/admin/modules`, { method: "POST", body: form });
    if (!res.ok) return alert("Update failed");
    setEditingId(null);
    window.location.reload();
  }

  async function persistModuleOrder(next: { id: string; title: string; position: number }[]) {
    const updates = next.map((module) => ({ id: module.id, title: module.title, position: module.position }));
    const res = await fetch(`/api/admin/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "batchUpdate", courseId, updates }),
    });
    if (!res.ok) alert("Reorder failed");
  }

  function reorderModules(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const copy = [...local];
    const [item] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, item);
    const next = copy.map((module, index) => ({ ...module, position: index + 1 }));
    setLocal(next);
    void persistModuleOrder(next);
  }

  async function reorder(direction: "up" | "down", index: number) {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= local.length) return;
    reorderModules(index, target);
  }

  async function createModule() {
    if (!title) return alert("Title required");
    const form = new FormData();
    form.append("action", "create");
    form.append("courseId", courseId);
    form.append("title", title);
    const res = await fetch(`/api/admin/modules`, { method: "POST", body: form });
    if (!res.ok) return alert("Create failed");
    window.location.reload();
  }

  async function remove(id: string) {
    if (!confirm("Delete module?")) return;
    const form = new FormData();
    form.append("action", "delete");
    form.append("id", id);
    form.append("courseId", courseId);
    const res = await fetch(`/api/admin/modules`, { method: "POST", body: form });
    if (!res.ok) return alert("Delete failed");
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      <div className="mb-3 flex items-center justify-between gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        <span>Drag to reorder</span>
        <span>{local.length} modules</span>
      </div>

      <div className="space-y-2">
        {local.map((m, idx) => (
          <div
            key={m.id}
            draggable
            onDragStart={() => setDraggedModuleId(m.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (!draggedModuleId) return;
              const fromIndex = local.findIndex((module) => module.id === draggedModuleId);
              if (fromIndex >= 0) reorderModules(fromIndex, idx);
              setDraggedModuleId(null);
            }}
            className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50/80 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.025)] transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-slate-600"
          >
            <div className="min-w-0 flex-1">
              {editingId === m.id ? (
                <div className="space-y-2">
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <div className="text-[11px] font-medium tracking-[0.08em] text-slate-500 uppercase dark:text-slate-400">Position {m.position}</div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-semibold tracking-[-0.01em] text-slate-900 dark:text-white">{m.title}</div>
                  <div className="mt-1 text-[11px] font-medium tracking-[0.08em] uppercase text-slate-500 dark:text-slate-400">Position {m.position}</div>
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <div className="flex min-w-[72px] items-center justify-center gap-1 rounded-full border border-slate-200 bg-white p-1 opacity-100 dark:border-slate-700 dark:bg-slate-900">
                <button onClick={() => reorder("up", idx)} className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-slate-600 opacity-100 transition hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-200" aria-label="Move module up">▲</button>
                <button onClick={() => reorder("down", idx)} className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-slate-600 opacity-100 transition hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-200" aria-label="Move module down">▼</button>
              </div>
              {editingId === m.id ? (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => saveEdit(m.id)} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200">Save</button>
                  <button onClick={() => setEditingId(null)} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => startEdit(m)} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200">Edit</button>
                  <button onClick={() => remove(m.id)} className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          id="new-module-title"
          placeholder="New module title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button onClick={createModule} className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15">Create</button>
      </div>
    </div>
  );
}
