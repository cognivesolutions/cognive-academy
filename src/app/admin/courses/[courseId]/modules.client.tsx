"use client";

import React, { useState } from "react";

export default function ModuleManagement({ courseId, modules }: { courseId: string; modules: { id: string; title: string; position: number }[] }) {
  const [local, setLocal] = useState(modules);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

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

  async function reorder(direction: "up" | "down", index: number) {
    // swap positions locally and then send updates
    const copy = [...local];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= copy.length) return;
    const tmp = copy[index];
    copy[index] = copy[target];
    copy[target] = tmp;
    // reassign positions
    copy.forEach((c, i) => (c.position = i + 1));
    setLocal(copy);

    // send batch update to server
    const updates = copy.map((c) => ({ id: c.id, title: c.title, position: c.position }));
    const res = await fetch(`/api/admin/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "batchUpdate", courseId, updates }),
    });
    if (!res.ok) alert("Reorder failed");
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
      <div className="space-y-2">
        {local.map((m, idx) => (
          <div key={m.id} className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50/80 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.025)] transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-slate-600">
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
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                <button onClick={() => reorder("up", idx)} className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-200" aria-label="Move module up">▲</button>
                <button onClick={() => reorder("down", idx)} className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-200" aria-label="Move module down">▼</button>
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
        <button onClick={createModule} className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(99,102,241,0.28)] transition hover:-translate-y-0.5">Create</button>
      </div>
    </div>
  );
}
