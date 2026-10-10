"use client";

import { X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import ConfirmDialog from "@/components/confirm-dialog";
import { AdminTableFilterBar } from "@/app/admin/components/admin-table-filter-bar";

type Lecture = {
  id: string;
  title: string;
  position: number;
  liveSessionUrl?: string | null;
  videoUrl?: string | null;
  hlsUrl?: string | null;
  isPreview?: boolean;
  moduleId?: string;
};

type Module = { id: string; title: string; lectures: Lecture[] };
type PendingAction = { type: "publish" | "unpublish" | "delete" | "save"; ids: string[]; items?: Lecture[] } | null;

export default function BulkEditor({ modules, courseId }: { modules: Module[]; courseId: string }) {
  const [local, setLocal] = useState<Module[]>(() =>
    modules.map((module) => ({
      ...module,
      lectures: module.lectures.map((lecture) => ({
        ...lecture,
        moduleId: module.id,
        isPreview: Boolean(lecture.isPreview),
        videoUrl: lecture.videoUrl ?? null,
        hlsUrl: lecture.hlsUrl ?? null,
      })),
    })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState<{ modIndex: number; lecIndex: number } | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [moduleMenuOpen, setModuleMenuOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [recentDeletion, setRecentDeletion] = useState<{ items: Lecture[] } | null>(null);
  const moduleFilterRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moduleFilterRef.current && !moduleFilterRef.current.contains(event.target as Node)) {
        setModuleMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const clearFeedback = () => setFeedback(null);

  const courseSummary = useMemo(() => {
    const summary = { total: 0, live: 0, recorded: 0, preview: 0, draft: 0 };

    local.forEach((module) => {
      module.lectures.forEach((lecture) => {
        summary.total += 1;
        if (lecture.liveSessionUrl?.trim()) summary.live += 1;
        if (lecture.hlsUrl?.trim() || lecture.videoUrl?.trim()) summary.recorded += 1;
        if (lecture.isPreview) summary.preview += 1;
        if (!lecture.liveSessionUrl?.trim() && !lecture.hlsUrl?.trim() && !lecture.videoUrl?.trim() && !lecture.isPreview) {
          summary.draft += 1;
        }
      });
    });

    return summary;
  }, [local]);

  const filteredModules = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return local.filter((mod) => {
      const matchesModule = moduleFilter === "all" || mod.id === moduleFilter;
      if (!matchesModule) return false;

      if (!normalizedQuery) return true;

      const lectureMatches = mod.lectures.some((lecture) => {
        const haystack = `${lecture.title} ${lecture.liveSessionUrl ?? ""}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });

      return mod.title.toLowerCase().includes(normalizedQuery) || lectureMatches;
    });
  }, [local, moduleFilter, searchQuery]);

  const visibleLectureIds = filteredModules.flatMap((mod) => mod.lectures.map((lecture) => lecture.id));
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const toggleSelect = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
    clearFeedback();
  };

  const selectAll = () => {
    const all: Record<string, boolean> = {};
    visibleLectureIds.forEach((id) => {
      all[id] = true;
    });
    setSelected((prev) => ({ ...prev, ...all }));
    clearFeedback();
  };

  const clearAll = () => {
    setSelected({});
    clearFeedback();
  };

  function swapLectures(src: { modIndex: number; lecIndex: number }, dest: { modIndex: number; lecIndex: number }) {
    setLocal((prev) => {
      const copy = prev.map((module) => ({ ...module, lectures: [...module.lectures] }));
      const sourceModule = copy[src.modIndex];
      const targetModule = copy[dest.modIndex];
      if (!sourceModule || !targetModule) return prev;

      const [item] = sourceModule.lectures.splice(src.lecIndex, 1);
      if (!item) return prev;
      targetModule.lectures.splice(dest.lecIndex, 0, { ...item, moduleId: targetModule.id });

      sourceModule.lectures = sourceModule.lectures.map((lecture, index) => ({ ...lecture, position: index + 1, moduleId: sourceModule.id }));
      targetModule.lectures = targetModule.lectures.map((lecture, index) => ({ ...lecture, position: index + 1, moduleId: targetModule.id }));
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
    swapLectures(dragging, { modIndex, lecIndex });
    setDragging(null);
  }

  function handleDropOnModuleEnd(e: React.DragEvent, modIndex: number) {
    e.preventDefault();
    if (!dragging) return;
    setLocal((prev) => {
      const copy = prev.map((module) => ({ ...module, lectures: [...module.lectures] }));
      const sourceModule = copy[dragging.modIndex];
      const targetModule = copy[modIndex];
      if (!sourceModule || !targetModule) return prev;
      const [item] = sourceModule.lectures.splice(dragging.lecIndex, 1);
      if (!item) return prev;
      targetModule.lectures.push({ ...item, moduleId: targetModule.id, position: targetModule.lectures.length + 1 });
      sourceModule.lectures = sourceModule.lectures.map((lecture, index) => ({ ...lecture, position: index + 1, moduleId: sourceModule.id }));
      targetModule.lectures = targetModule.lectures.map((lecture, index) => ({ ...lecture, position: index + 1, moduleId: targetModule.id }));
      return copy;
    });
    setDragging(null);
  }

  function updateField(modIndex: number, lecIndex: number, field: keyof Lecture, value: any) {
    setLocal((prev) => {
      const copy = prev.map((module) => ({ ...module, lectures: [...module.lectures] }));
      const lecture = copy[modIndex]?.lectures[lecIndex];
      if (!lecture) return prev;
      Object.assign(lecture, { [field]: value });
      return copy;
    });
  }

  function openConfirm() {
    setPendingAction({ type: "save", ids: Object.keys(selected).filter((id) => selected[id]) });
  }

  async function confirmSubmit() {
    setSubmitting(true);
    try {
      const updates: any[] = [];
      for (const mod of local) {
        for (let i = 0; i < mod.lectures.length; i++) {
          const lec = mod.lectures[i];
          updates.push({ id: lec.id, title: lec.title, position: i + 1, liveSessionUrl: lec.liveSessionUrl ?? null });
        }
      }

      const res = await fetch("/api/admin/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk", updates }),
      });

      if (!res.ok) throw new Error("Bulk update failed");
      setFeedback("Lecture changes saved.");
    } catch (err) {
      console.error(err);
      setFeedback("Unable to save lecture changes.");
    } finally {
      setSubmitting(false);
      setPendingAction(null);
    }
  }

  async function batchAction(type: "publish" | "unpublish" | "delete") {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) {
      setFeedback("Select at least one lecture to continue.");
      return;
    }

    const items = local.flatMap((module) => module.lectures.filter((lecture) => ids.includes(lecture.id)));
    clearFeedback();
    setPendingAction({ type, ids, items });
  }

  async function executePendingAction() {
    if (!pendingAction) return;
    const { type, ids, items = [] } = pendingAction;

    if (type === "save") {
      await confirmSubmit();
      return;
    }

    try {
      const res = await fetch(`/api/admin/lectures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: type === "publish" ? "bulkPublish" : type === "unpublish" ? "bulkUnpublish" : "bulkDelete",
          ids,
        }),
      });

      if (!res.ok) throw new Error("Bulk action failed");

      if (type === "publish") {
        setLocal((prev) => prev.map((module) => ({
          ...module,
          lectures: module.lectures.map((lecture) => ids.includes(lecture.id) ? { ...lecture, isPreview: false } : lecture),
        })));
        setFeedback("Selected lectures published.");
      } else if (type === "unpublish") {
        setLocal((prev) => prev.map((module) => ({
          ...module,
          lectures: module.lectures.map((lecture) => ids.includes(lecture.id) ? { ...lecture, isPreview: true } : lecture),
        })));
        setFeedback("Selected lectures unpublished.");
      } else {
        setLocal((prev) => prev
          .map((module) => ({ ...module, lectures: module.lectures.filter((lecture) => !ids.includes(lecture.id)) }))
          .filter((module) => module.lectures.length > 0 || true));

        setRecentDeletion({ items });
        setFeedback("Lecture deleted. Undo available.");
      }

      setSelected({});
    } catch (error) {
      console.error(error);
      setFeedback("This action failed. Please try again.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleUndoDelete() {
    if (!recentDeletion) return;

    try {
      const res = await fetch("/api/admin/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulkRestore",
          items: recentDeletion.items,
        }),
      });

      if (!res.ok) throw new Error("Restore failed");

      const restored = recentDeletion.items.map((item) => ({
        ...item,
        moduleId: item.moduleId ?? local[0]?.id,
        isPreview: Boolean(item.isPreview),
        position: item.position ?? 1,
      }));

      setLocal((prev) => {
        const copy = prev.map((module) => ({ ...module, lectures: [...module.lectures] }));
        restored.forEach((item) => {
          const targetModule = copy.find((module) => module.id === item.moduleId) ?? copy[0];
          if (!targetModule) return;
          targetModule.lectures.push({ ...item, moduleId: targetModule.id });
          targetModule.lectures = targetModule.lectures
            .map((lecture, index) => ({ ...lecture, position: index + 1, moduleId: targetModule.id }))
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        });
        return copy;
      });

      setRecentDeletion(null);
      setFeedback("Deleted lecture restored.");
    } catch (error) {
      console.error(error);
      setFeedback("Restore failed.");
    }
  }

  return (
    <div className="space-y-4">
      {feedback ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200" aria-live="polite">
          <span>{feedback}</span>
          {recentDeletion ? (
            <button type="button" onClick={handleUndoDelete} className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800 dark:border-amber-500/40 dark:bg-slate-900 dark:text-amber-200">
              Undo
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total</div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{courseSummary.total}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">Live</div>
          <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-200">{courseSummary.live}</div>
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-500/30 dark:bg-indigo-500/10">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-200">Recorded</div>
          <div className="mt-2 text-2xl font-black text-indigo-700 dark:text-indigo-200">{courseSummary.recorded}</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">Preview</div>
          <div className="mt-2 text-2xl font-black text-amber-700 dark:text-amber-200">{courseSummary.preview}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Draft</div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{courseSummary.draft}</div>
        </div>
      </div>

      <AdminTableFilterBar
        hasActiveFilters={Boolean(searchQuery.trim() || moduleFilter !== "all")}
        clearFiltersHref={undefined}
        clearFiltersLabel="Remove filter"
        leftControls={
          <div ref={moduleFilterRef} className="relative min-w-[170px] flex-1 lg:min-w-[190px]">
            <button
              type="button"
              aria-expanded={moduleMenuOpen}
              onClick={() => setModuleMenuOpen((open) => !open)}
              className="flex h-[38px] w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-100/90 px-3 pr-8 text-left text-[11px] font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(15,23,42,0.06)] transition duration-200 hover:border-indigo-200 hover:text-indigo-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-none dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
            >
              <span className="flex-1 truncate">{moduleFilter === "all" ? "Module" : local.find((mod) => mod.id === moduleFilter)?.title ?? "Module"}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 dark:text-slate-300 ${moduleMenuOpen ? "rotate-180" : "rotate-0"}`}
              >
                <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {moduleMenuOpen ? (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] ring-1 ring-slate-700/10 dark:border-slate-700 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => {
                    setModuleFilter("all");
                    setModuleMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition ${moduleFilter === "all" ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"}`}
                >
                  <span>All modules</span>
                </button>
                {local.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => {
                      setModuleFilter(mod.id);
                      setModuleMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition ${moduleFilter === mod.id ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"}`}
                  >
                    <span>{mod.title}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        }
        rightControls={
          <div className="flex h-[38px] w-[220px] items-center gap-2 rounded-full border border-slate-200 bg-slate-100/80 px-3 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(15,23,42,0.06)] transition duration-200 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-none dark:focus-within:bg-slate-950/60">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-400">
              <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M12.8 12.8L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Type to search..."
              className="w-full border-0 bg-transparent text-[0.92rem] text-slate-900 placeholder:text-slate-500 outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50/80 p-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.02)] dark:border-slate-700 dark:bg-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex min-w-[88px] items-center justify-center rounded-full border border-emerald-200/80 bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(255,255,255,0.72),rgba(16,185,129,0.18))] px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 shadow-[0_10px_22px_rgba(16,185,129,0.12)] backdrop-blur-md dark:border-emerald-500/30 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(15,23,42,0.7),rgba(16,185,129,0.12))] dark:text-emerald-200">
            {selectedCount} selected
          </div>
          <button
            type="button"
            onClick={selectAll}
            className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-3 py-1.5 text-[11px] font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => batchAction("publish")}
            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)] backdrop-blur-sm transition duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] hover:brightness-105 active:scale-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15"
          >
            Publish
          </button>
          <button
            type="button"
            onClick={() => batchAction("unpublish")}
            className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700 shadow-[0_8px_20px_rgba(245,158,11,0.08)] backdrop-blur-sm transition duration-200 hover:border-amber-300 hover:bg-amber-100 hover:shadow-[0_10px_24px_rgba(245,158,11,0.12)] hover:brightness-105 active:scale-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:border-amber-400/50 dark:hover:bg-amber-500/15"
          >
            Unpublish
          </button>
          <button
            type="button"
            onClick={() => batchAction("delete")}
            className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-3 py-1.5 text-[11px] font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
          >
            Delete
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={openConfirm}
            className="inline-flex h-[34px] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-1.5 text-[11px] font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)] backdrop-blur-sm transition duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] hover:brightness-105 active:scale-100 disabled:opacity-70 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15"
          >
            Save
          </button>
        </div>
      </div>

      {filteredModules.map((mod, mi) => (
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
                <div className="flex min-w-[72px] flex-col items-center justify-center gap-1 pt-1">
                  <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100/100 p-1 opacity-100 shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/100">
                    <button type="button" onClick={() => {
                      if (li > 0) swapLectures({ modIndex: mi, lecIndex: li }, { modIndex: mi, lecIndex: li - 1 });
                    }} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-semibold text-slate-700 opacity-100 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200" aria-label="Move lecture up">▲</button>
                    <button type="button" onClick={() => {
                      if (li < mod.lectures.length - 1) swapLectures({ modIndex: mi, lecIndex: li }, { modIndex: mi, lecIndex: li + 1 });
                    }} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-semibold text-slate-700 opacity-100 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200" aria-label="Move lecture down">▼</button>
                  </div>
                </div>
              </div>
            ))}
            <div onDragOver={handleDragOver} onDrop={(e) => handleDropOnModuleEnd(e, mi)} className="h-4" />
          </div>
        </div>
      ))}

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
