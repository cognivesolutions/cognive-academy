"use client";

import React, { useState } from "react";

export default function CoursesBulk({ courses }: { courses: { id: string; title: string }[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const selectAll = () => {
    const all: Record<string, boolean> = {};
    for (const c of courses) all[c.id] = true;
    setSelected(all);
  };
  const clearAll = () => setSelected({});

  async function action(type: "publish" | "unpublish" | "delete") {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) return alert("Select at least one course");
    if (type === "delete" && !confirm(`Delete ${ids.length} courses? This cannot be undone.`)) return;

    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: type === "publish" ? "bulkPublish" : type === "unpublish" ? "bulkUnpublish" : "bulkDelete", ids }),
    });
    if (!res.ok) return alert("Bulk action failed");
    window.location.reload();
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button onClick={selectAll} className="rounded border px-2 py-1 text-sm">Select all</button>
        <button onClick={clearAll} className="rounded border px-2 py-1 text-sm">Clear</button>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => action("publish")} className="rounded bg-green-600 px-3 py-1 text-sm text-white">Publish</button>
        <button onClick={() => action("unpublish")} className="rounded bg-yellow-600 px-3 py-1 text-sm text-white">Unpublish</button>
        <button onClick={() => action("delete")} className="rounded bg-red-600 px-3 py-1 text-sm text-white">Delete</button>
      </div>
    </div>
  );
}
