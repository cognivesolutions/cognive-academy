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
      <div className="grid gap-2">
        {local.map((m, idx) => (
          <div key={m.id} className="flex items-center justify-between rounded border p-2">
            <div>
              {editingId === m.id ? (
                <div>
                  <input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="rounded border px-2 py-1" />
                  <div className="text-xs text-slate-500">Position: {m.position}</div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">{m.title}</div>
                  <div className="text-xs text-slate-500">Position: {m.position}</div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => reorder("up", idx)} className="rounded border px-2 py-1 text-sm">▲</button>
              <button onClick={() => reorder("down", idx)} className="rounded border px-2 py-1 text-sm">▼</button>
              {editingId === m.id ? (
                <>
                  <button onClick={() => saveEdit(m.id)} className="rounded border px-2 py-1 text-sm">Save</button>
                  <button onClick={() => setEditingId(null)} className="rounded border px-2 py-1 text-sm">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(m)} className="rounded border px-2 py-1 text-sm">Edit</button>
                  <button onClick={() => remove(m.id)} className="rounded border px-2 py-1 text-sm">Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <input placeholder="New module title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded border px-2 py-1" />
        <button onClick={createModule} className="ml-2 rounded bg-indigo-600 px-3 py-1 text-white">Create</button>
      </div>
    </div>
  );
}
