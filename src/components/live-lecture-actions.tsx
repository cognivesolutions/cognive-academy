"use client";

import { useEffect, useState } from "react";

import MasterVideoPlayer from "@/components/video-player/master-video-player";

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
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

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
  const hasRecording = !!lecture.hlsUrl;

  if (!isLive && !hasRecording) {
    return <span className="text-sm text-slate-500 dark:text-slate-400">Not scheduled</span>;
  }

  if (status === "inprogress") {
    if (isLive) {
      return (
        <a
          href={lecture.liveSessionUrl ?? lecture.hlsUrl ?? "#"}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => {
            if (!lecture.liveSessionUrl && !lecture.hlsUrl) {
              event.preventDefault();
              return;
            }

            event.preventDefault();
            void handleAction();
            window.open((lecture.liveSessionUrl ?? lecture.hlsUrl) ?? "#", "_blank", "noopener,noreferrer");
          }}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_22px_rgba(16,185,129,0.22)] transition-all duration-200 hover:brightness-[1.02]"
        >
          Continue lecture
        </a>
      );
    }

    return (
      <>
        <button
          type="button"
          onClick={() => {
            setIsPlayerOpen(true);
            void handleAction();
          }}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_22px_rgba(16,185,129,0.22)] transition-all duration-200 hover:brightness-[1.02]"
        >
          Continue lecture
        </button>
        <MasterVideoPlayer
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          videoUrl={lecture.hlsUrl ?? undefined}
          title={lecture.title}
          autoPlay
        />
      </>
    );
  }

  if (isLive) {
    return (
      <a
        href={lecture.liveSessionUrl ?? "#"}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => {
          if (!lecture.liveSessionUrl) {
            event.preventDefault();
            return;
          }

          event.preventDefault();
          window.open(lecture.liveSessionUrl, "_blank", "noopener,noreferrer");
        }}
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_22px_rgba(16,185,129,0.22)] transition-all duration-200 hover:brightness-[1.02]"
      >
        Join session
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsPlayerOpen(true);
          void handleAction();
        }}
        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-700/90"
      >
        Watch recording
      </button>
      <MasterVideoPlayer
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        videoUrl={lecture.hlsUrl ?? undefined}
        title={lecture.title}
        autoPlay
      />
    </>
  );
}
