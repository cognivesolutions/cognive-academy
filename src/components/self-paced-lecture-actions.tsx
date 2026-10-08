"use client";

import { useEffect, useState } from "react";

import VideoPlayer from "@/components/video/video-player";
import { resolveLectureVideoUrl } from "@/lib/temp-video-assets";

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

export function SelfPacedLectureActions({
  courseId,
  lecture,
}: {
  courseId: string;
  lecture: {
    id: string;
    title: string;
    hlsUrl?: string | null;
    videoUrl?: string | null;
  };
}) {
  const [status, setStatus] = useState<LectureStatus>("not_started");
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const effectiveVideoUrl = resolveLectureVideoUrl(lecture.hlsUrl ?? lecture.videoUrl, lecture);

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

  const handleVideoProgressUpdate = async (watchedPercent: number) => {
    if (watchedPercent >= 90) {
      await updateStatus("completed", watchedPercent);
      return;
    }

    if (watchedPercent > 0) {
      await updateStatus("inprogress", watchedPercent);
    }
  };

  const handleAction = async () => {
    const progress = await fetchProgress(courseId);
    const current = progress[lecture.id];

    if (current?.status === "completed") {
      return;
    }

    await updateStatus("inprogress", current?.watchedPercent ?? 0);
  };

  if (!effectiveVideoUrl) {
    return <span className="text-sm text-slate-500 dark:text-slate-400">Not scheduled</span>;
  }

  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">✓</span>
        Completed
      </span>
    );
  }

  if (status === "inprogress") {
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
        <VideoPlayer
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          videoUrl={effectiveVideoUrl}
          title={lecture.title}
          autoPlay={false}
          resumeKey={`${courseId}:${lecture.id}`}
          onProgressUpdate={handleVideoProgressUpdate}
        />
      </>
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
      <VideoPlayer
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        videoUrl={effectiveVideoUrl}
        title={lecture.title}
        autoPlay={false}
        resumeKey={`${courseId}:${lecture.id}`}
        onProgressUpdate={handleVideoProgressUpdate}
      />
    </>
  );
}
