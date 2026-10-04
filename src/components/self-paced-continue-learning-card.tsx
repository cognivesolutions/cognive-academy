"use client";

import { useEffect, useState } from "react";

type LectureStatus = "not_started" | "inprogress" | "completed";

type LectureProgress = {
  status: LectureStatus;
  watchedPercent: number;
};

type Lecture = {
  id: string;
  title: string;
  hlsUrl?: string | null;
};

type ModuleWithLectures = {
  id: string;
  title: string;
  lectures: Lecture[];
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

export function SelfPacedContinueLearningCard({
  courseId,
  modules,
}: {
  courseId: string;
  modules: ModuleWithLectures[];
}) {
  const [activeLecture, setActiveLecture] = useState<
    | {
        lecture: Lecture;
        module: ModuleWithLectures;
        moduleIndex: number;
        lectureIndex: number;
      }
    | null
  >(null);

  const syncProgress = async () => {
    const flattened = modules.flatMap((module, moduleIndex) =>
      module.lectures.map((lecture, lectureIndex) => ({
        module,
        moduleIndex,
        lectureIndex,
        lecture,
      }))
    );

    const progress = await fetchProgress(courseId);
    const nextLecture =
      flattened.find(({ lecture }) => {
        const current = progress[lecture.id];
        return !current || current.status !== "completed";
      }) ?? flattened[flattened.length - 1] ?? null;

    setActiveLecture(nextLecture ?? null);
  };

  useEffect(() => {
    void syncProgress();

    const handleUpdate = () => {
      void syncProgress();
    };

    window.addEventListener("self-paced-progress-updated", handleUpdate);

    return () => {
      window.removeEventListener("self-paced-progress-updated", handleUpdate);
    };
  }, [courseId, modules]);

  const lectureLabel = activeLecture
    ? `Lecture ${activeLecture.lectureIndex + 1}: ${activeLecture.lecture.title}`
    : "Start your learning journey";

  const moduleLabel = activeLecture
    ? `Module ${activeLecture.moduleIndex + 1} · ${activeLecture.module.title}`
    : "Your next lesson is waiting";

  const actionHref = activeLecture?.lecture.hlsUrl ?? "#";

  const handleCardAction = async () => {
    if (!activeLecture) return;

    const progress = await fetchProgress(courseId);
    const current = progress[activeLecture.lecture.id];

    if (current?.status === "completed") {
      return;
    }

    const nextStatus = !current || current.status === "not_started" ? "inprogress" : "completed";
    const watchedPercent = nextStatus === "inprogress" ? 45 : 92;

    const response = await fetch("/api/self-paced-progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseId,
        lectureId: activeLecture.lecture.id,
        status: nextStatus,
        watchedPercent,
      }),
    });

    if (!response.ok) {
      return;
    }

    window.dispatchEvent(new CustomEvent("self-paced-progress-updated", { detail: { courseId } }));
  };

  return (
    <div className="mb-6 rounded-[30px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(226,232,240,0.84),rgba(167,139,250,0.20))] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_22px_46px_rgba(109,40,217,0.14)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(14,23,38,0.96),rgba(29,39,59,0.94),rgba(110,103,210,0.52))] dark:shadow-[0_18px_40px_rgba(15,23,42,0.35)] dark:hover:border-violet-400/40 dark:hover:shadow-[0_22px_46px_rgba(76,29,149,0.3)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700 shadow-[0_10px_22px_rgba(139,92,246,0.12)] dark:border-violet-400/35 dark:bg-violet-500/10 dark:text-violet-200">
            <span className="h-2 w-2 rounded-full bg-violet-500 dark:bg-violet-400" aria-hidden="true" />
            Continue self paced learning
          </p>
          <h2 className="mt-2 text-[clamp(2rem,2.6vw,3rem)] font-black leading-[1.08] tracking-[-0.04em] text-slate-900 dark:text-white">{lectureLabel}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-200/90">{moduleLabel}</p>
        </div>

        {activeLecture?.lecture.hlsUrl ? (
          <a
            href={actionHref}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => {
              event.preventDefault();
              void handleCardAction();
              window.open(actionHref, "_blank", "noopener,noreferrer");
            }}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(109,40,217,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(109,40,217,0.42)] dark:shadow-[0_16px_36px_rgba(76,29,149,0.45)]"
          >
            Continue lecture
          </a>
        ) : null}
      </div>
    </div>
  );
}
