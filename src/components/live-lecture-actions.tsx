"use client";

import { useEffect, useState } from "react";

type LectureStatus = "not_started" | "inprogress" | "completed";

type LectureProgress = {
  status: LectureStatus;
  watchedPercent: number;
};

async function fetchProgress(courseId: string): Promise<Record<string, LectureProgress>> {
  const response = await fetch(`/api/self-paced-progress?courseId=${encodeURIComponent(courseId)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return {};
  }

  const payload = (await response.json()) as { progress?: Record<string, LectureProgress> };
  return payload.progress ?? {};
}

export function LiveLectureActions({
  courseId,
  lecture,
}: {
  courseId: string;
  lecture: {
    id: string;
    title: string;
    liveSessionUrl?: string | null;
    hlsUrl?: string | null;
  };
}) {
  const [status, setStatus] = useState<LectureStatus>("not_started");

  useEffect(() => {
    const loadProgress = async () => {
      const progress = await fetchProgress(courseId);
      setStatus(progress[lecture.id]?.status ?? "not_started");
    };

    void loadProgress();
  }, [courseId, lecture.id]);

  const updateStatus = async (nextStatus: LectureStatus, watchedPercent: number) => {
    const response = await fetch("/api/self-paced-progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseId,
        lectureId: lecture.id,
        status: nextStatus,
        watchedPercent,
      }),
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { progress?: Record<string, LectureProgress> };
    const nextProgress = payload.progress?.[lecture.id];

    if (nextProgress) {
      setStatus(nextProgress.status);
    }

    window.dispatchEvent(new CustomEvent("self-paced-progress-updated", { detail: { courseId } }));
  };

  const handleAction = async () => {
    const progress = await fetchProgress(courseId);
    const current = progress[lecture.id];

    if (current?.status === "completed") {
      return;
    }

    if (!current || current.status === "not_started") {
      await updateStatus("inprogress", 45);
      return;
    }

    await updateStatus("completed", 92);
  };

  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">✓</span>
        Completed
      </span>
    );
  }

  const isLive = !!lecture.liveSessionUrl;
  const href = isLive ? lecture.liveSessionUrl ?? "#" : lecture.hlsUrl ?? "#";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
        if (!href || href === "#") {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        void handleAction();
        window.open(href, "_blank", "noopener,noreferrer");
      }}
      className={
        isLive
          ? "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-400 via-cyan-500 to-emerald-500 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(13,148,136,0.32)] transition-all duration-200 hover:shadow-[0_20px_42px_rgba(13,148,136,0.42)]"
          : "inline-flex items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 dark:border-violet-400/40 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/20"
      }
    >
      {isLive ? "Join session" : "Watch recording"}
    </a>
  );
}
