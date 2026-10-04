"use client";

import { useRef, useState } from "react";

export function LectureUploadForm({
  mode,
  courseId,
  lectureId,
  defaultTitle = "",
  defaultPosition = 1,
  defaultLiveSessionUrl = "",
  defaultVideoUrl = "",
  defaultHlsUrl = "",
  defaultIsPreview = false,
  submitLabel,
}: {
  mode: "create" | "edit";
  courseId: string;
  lectureId?: string;
  defaultTitle?: string;
  defaultPosition?: number;
  defaultLiveSessionUrl?: string;
  defaultVideoUrl?: string;
  defaultHlsUrl?: string;
  defaultIsPreview?: boolean;
  submitLabel: string;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const fileInput = form.querySelector<HTMLInputElement>('input[name="recordingFile"]');
    const file = fileInput?.files?.[0];

    if (!file) {
      form.submit();
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const response = await fetch("/api/admin/videos", {
        method: "POST",
        body: fd,
      });

      const payload = (await response.json()) as { success?: boolean; message?: string; url?: string };

      if (!response.ok || !payload.success || !payload.url) {
        throw new Error(payload.message || "Video upload failed.");
      }

      const videoUrlInput = form.querySelector<HTMLInputElement>('input[name="videoUrl"]');
      const hlsUrlInput = form.querySelector<HTMLInputElement>('input[name="hlsUrl"]');

      if (videoUrlInput) {
        videoUrlInput.value = payload.url;
      }

      if (hlsUrlInput) {
        hlsUrlInput.value = payload.url;
      }

      form.submit();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Video upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form ref={formRef} action="/api/admin/lectures" method="POST" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {mode === "create" ? <input type="hidden" name="action" value="create" /> : <input type="hidden" name="id" value={lectureId} />}
      {mode === "create" ? <input type="hidden" name="courseId" value={courseId} /> : <input type="hidden" name="courseId" value={courseId} />}
      {mode === "edit" ? <input type="hidden" name="action" value="update" /> : null}

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
        Title
        <input
          name="title"
          required
          defaultValue={defaultTitle}
          placeholder="e.g. Intro to the course"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Position
        <input
          name="position"
          type="number"
          defaultValue={defaultPosition}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:h-5 [&::-webkit-inner-spin-button]:h-5"
        />
      </label>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Preview
          <select
            name="isPreview"
            defaultValue={defaultIsPreview ? "true" : "false"}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
        Live session URL (optional)
        <input
          name="liveSessionUrl"
          defaultValue={defaultLiveSessionUrl}
          placeholder="https://zoom.us/j/123456789"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
        Recorded video upload
        <input
          type="file"
          name="recordingFile"
          accept="video/*"
          className="mt-2 block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-indigo-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:file:bg-indigo-500/15 dark:file:text-indigo-200"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
        Recorded video URL (optional)
        <input
          name="videoUrl"
          defaultValue={defaultVideoUrl ?? ""}
          placeholder="https://.../lecture.mp4 or https://.../playlist.m3u8"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </label>

      <input type="hidden" name="hlsUrl" defaultValue={defaultHlsUrl ?? ""} />

      {errorMessage ? (
        <div className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="sm:col-span-2 flex justify-end">
        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex h-[34px] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50/80 px-5 py-1.5 text-sm font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)] backdrop-blur-sm transition duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] hover:brightness-105 active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15"
        >
          {isUploading ? "Uploading..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
