"use client";

import React, { useEffect, useState, useRef } from "react";

type Course = {
  id: string;
  title: string;
  category?: string;
  price?: number | null;
  imageUrl?: string | null;
  isPublished?: boolean | null;
};

export default function AdminCoursesInfinite({
  initialItems = [],
  initialCursor = null,
  pageSize = 20,
}: {
  initialItems?: Course[];
  initialCursor?: string | null;
  pageSize?: number;
}) {
  const [items, setItems] = useState<Course[]>(initialItems as Course[]);
  const [cursor, setCursor] = useState<string | null | undefined>(initialCursor ?? undefined);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef.current, hasMore, loading, cursor]);

  async function loadMore() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(pageSize));
      if (cursor) params.set("cursor", String(cursor));

      const res = await fetch(`/api/admin/courses?${params.toString()}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length) {
        setItems((s) => [...s, ...data.items]);
        setCursor(data.nextCursor);
        if (!data.nextCursor) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function toggleAll() {
    const allSelected = items.every((it) => selected[it.id]);
    if (allSelected) setSelected({});
    else {
      const next: Record<string, boolean> = {};
      for (const it of items) next[it.id] = true;
      setSelected(next);
    }
  }

  async function bulkAction(action: "bulkPublish" | "bulkUnpublish" | "bulkDelete") {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return;
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids }),
    });
    if (res.ok) {
      if (action === "bulkDelete") {
        setItems((s) => s.filter((it) => !ids.includes(it.id)));
      } else if (action === "bulkPublish") {
        setItems((s) => s.map((it) => (ids.includes(it.id) ? { ...it, isPublished: true } : it)));
      } else if (action === "bulkUnpublish") {
        setItems((s) => s.map((it) => (ids.includes(it.id) ? { ...it, isPublished: false } : it)));
      }
      setSelected({});
    } else {
      console.error("bulk action failed");
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={toggleAll} className="rounded bg-slate-100 px-3 py-1 text-sm">Toggle all</button>
          <button onClick={() => bulkAction("bulkPublish")} className="rounded bg-green-600 px-3 py-1 text-sm text-white">Publish</button>
          <button onClick={() => bulkAction("bulkUnpublish")} className="rounded bg-yellow-600 px-3 py-1 text-sm text-white">Unpublish</button>
          <button onClick={() => bulkAction("bulkDelete")} className="rounded bg-red-600 px-3 py-1 text-sm text-white">Delete</button>
        </div>
        <div className="text-sm text-slate-500">{items.length} shown</div>
      </div>

      <div className="grid gap-4">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 rounded-lg border p-3">
            <input type="checkbox" checked={!!selected[it.id]} onChange={() => toggle(it.id)} />
            <div className="flex-1">
              <div className="font-semibold">{it.title}</div>
              <div className="text-xs text-slate-500">{it.category} • {it.price ? `₹${it.price}` : "Free"}</div>
            </div>
            {it.imageUrl ? <img src={it.imageUrl} className="h-12 w-20 object-cover rounded" alt="" /> : null}
          </div>
        ))}
      </div>

      <div ref={loaderRef} className="mt-4 flex items-center justify-center">
        {loading ? <div className="text-sm text-slate-500">Loading…</div> : hasMore ? <div className="text-sm text-slate-400">Scroll to load more</div> : <div className="text-sm text-slate-400">No more items</div>}
      </div>
    </div>
  );
}
