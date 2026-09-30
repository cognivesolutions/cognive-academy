"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Maximize2,
  Minus,
  Pause,
  Play,
  Plus,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

const DEFAULT_PREVIEW_VIDEO =
  "https://www.pexels.com/download/video/8084496/";

const isSupportedVideoSource = (value: string | null | undefined) => {
  if (!value) return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  if (/youtube\.com\/(watch|embed)|youtu\.be\//i.test(trimmed)) return false;

  return (
    /\.(mp4|webm|ogg|mov|m4v|m3u8)(\?.*)?$/i.test(trimmed) ||
    /(?:download\/video\/|video-files\/|videos\.pexels\.com|cdn\.)/i.test(trimmed) ||
    /^blob:/i.test(trimmed)
  );
};

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function CoursePreviewDialog({
  videoUrl,
  title,
}: {
  videoUrl?: string | null;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [lastVolume, setLastVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastKnownTime, setLastKnownTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!videoUrl || videoUrl.trim().length === 0) return DEFAULT_PREVIEW_VIDEO;

    const trimmedUrl = videoUrl.trim();
    if (!isSupportedVideoSource(trimmedUrl)) {
      return DEFAULT_PREVIEW_VIDEO;
    }

    return trimmedUrl;
  }, [videoUrl]);

  const ensurePlayableSource = (video: HTMLVideoElement | null) => {
    if (!video) return false;

    const currentSource = video.currentSrc || video.src || previewUrl;
    if (!isSupportedVideoSource(currentSource)) {
      video.src = DEFAULT_PREVIEW_VIDEO;
      video.load();
      return false;
    }

    return true;
  };

  const syncVideoState = (video: HTMLVideoElement | null = videoRef.current) => {
    if (!video) return;

    const nextProgress = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    setLastKnownTime(video.currentTime);
    setIsPlaying(!video.paused && !video.ended);
    setIsMuted(video.muted);
    setVolume(video.volume);
    setDuration(video.duration || 0);
    setProgress(nextProgress);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!open && !isExpanded) {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    if (open && !isExpanded) {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [open, isExpanded]);

  const unmuteOnUserInteraction = () => {
    const video = videoRef.current;

    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      setIsMuted(false);
      if (video) {
        video.muted = false;
      }
    }
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (!ensurePlayableSource(video)) {
      return;
    }

    unmuteOnUserInteraction();

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      console.warn("Preview video playback is unavailable:", error);
      setIsPlaying(false);
    }
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const nextTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || 0);
    video.currentTime = nextTime;
    setProgress(video.duration ? (nextTime / video.duration) * 100 : 0);
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;

    const nextTime = (value / 100) * (video.duration || 0);
    video.currentTime = nextTime;
    setProgress(value);
  };

  const handleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (!ensurePlayableSource(video)) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (video.paused) {
      try {
        await video.play();
      } catch {
        // Ignore autoplay restrictions and keep the current video state intact.
      }
    }

    await video.requestFullscreen();
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isTypingTarget || event.repeat) return;

      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        await togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const currentTime = duration ? (progress / 100) * duration : 0;

  const handleCompactPlay = async () => {
    unmuteOnUserInteraction();
    await togglePlay();
  };

  const openPreview = () => {
    const video = videoRef.current;
    const currentTime = video ? video.currentTime : lastKnownTime;
    const shouldPlay = !!video && !video.paused && !video.ended;

    if (video) {
      video.pause();
    }

    setLastKnownTime(currentTime);
    setProgress(duration ? (currentTime / duration) * 100 : 0);
    setOpen(true);
    setIsExpanded(true);

    if (modalVideoRef.current) {
      if (!ensurePlayableSource(modalVideoRef.current)) {
        modalVideoRef.current.src = DEFAULT_PREVIEW_VIDEO;
        modalVideoRef.current.load();
      }

      modalVideoRef.current.currentTime = currentTime;
      if (shouldPlay) {
        void modalVideoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
        setIsPlaying(true);
      } else {
        modalVideoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (!open || !modalVideoRef.current) return;

    const popupVideo = modalVideoRef.current;
    if (!ensurePlayableSource(popupVideo)) {
      popupVideo.src = DEFAULT_PREVIEW_VIDEO;
      popupVideo.load();
    }

    popupVideo.currentTime = lastKnownTime;

    if (isPlaying) {
      void popupVideo.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      popupVideo.pause();
    }

    setProgress(duration ? (lastKnownTime / duration) * 100 : 0);
  }, [open, duration, lastKnownTime, isPlaying]);

  return (
    <>
      <div className="group relative overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.45),_transparent_30%),linear-gradient(135deg,_#0f172a_0%,_#1e1b4b_40%,_#111827_100%)] shadow-inner">
        <video
          ref={videoRef}
          src={previewUrl}
          className="aspect-video w-full cursor-pointer bg-black object-cover"
          playsInline
          preload="metadata"
          controls={false}
          muted={isMuted}
          onClick={() => {
            if (!open) {
              void handleCompactPlay();
            }
          }}
          onLoadedMetadata={() => syncVideoState(videoRef.current)}
          onTimeUpdate={() => syncVideoState(videoRef.current)}
          onPlay={() => syncVideoState(videoRef.current)}
          onPause={() => syncVideoState(videoRef.current)}
          onEnded={() => syncVideoState(videoRef.current)}
        />

        {!isPlaying && !open ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/15">
            <button
              type="button"
              onClick={() => {
                void handleCompactPlay();
              }}
              className="flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-white/8 backdrop-blur-sm transition-transform hover:scale-105"
              aria-label={`Play preview video for ${title}`}
            >
              <Play className="ml-1 h-7 w-7 fill-current text-white" />
            </button>
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-transparent p-3 text-left">
          <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-300">
            <span className="min-w-10 text-right font-medium">{formatTime(currentTime)}</span>
            <input
              aria-label="Compact preview progress"
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(event) => handleSeek(Number(event.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-indigo-500"
            />
            <span className="min-w-10 text-left font-medium">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                aria-label={volume === 0 ? "Unmute video" : "Mute video"}
                onClick={() => {
                  if (volume === 0) {
                    const restoredVolume = lastVolume > 0 ? lastVolume : 0.8;
                    setVolume(restoredVolume);
                    setIsMuted(false);
                    return;
                  }

                  setLastVolume(volume > 0 ? volume : lastVolume);
                  setVolume(0);
                  setIsMuted(true);
                }}
              >
                {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextValue = Math.max(0, Number((volume - 0.1).toFixed(2)));
                  setVolume(nextValue);
                  if (nextValue > 0) {
                    setLastVolume(nextValue);
                  }
                  setIsMuted(nextValue === 0);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                aria-label="Decrease volume"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                <input
                  aria-label="Compact volume"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    setVolume(nextValue);
                    if (nextValue > 0) {
                      setLastVolume(nextValue);
                    }
                    setIsMuted(nextValue === 0);
                  }}
                  className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-slate-700 accent-indigo-500"
                />
                <span className="text-[10px] font-medium text-slate-300">
                  {isMuted || volume === 0 ? "0%" : `${Math.round(volume * 100)}%`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextValue = Math.min(1, Number((volume + 0.1).toFixed(2)));
                  setVolume(nextValue);
                  if (nextValue > 0) {
                    setLastVolume(nextValue);
                  }
                  setIsMuted(nextValue === 0);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                aria-label="Increase volume"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2" style={{ marginLeft: '-1.5rem' }}>
              <button
                type="button"
                onClick={() => skipTime(-10)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                aria-label="Skip back 10 seconds"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleCompactPlay();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_12px_28px_rgba(79,70,229,0.45)] transition hover:bg-indigo-400"
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
                style={{ marginLeft: '-0.35rem', transform: 'none' }}
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-1 h-5 w-5 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => skipTime(10)}
                className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                aria-label="Skip ahead 10 seconds"
              >
                <SkipForward className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={openPreview}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                aria-label="Open expanded preview"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => {
            setOpen(false);
            setIsExpanded(false);
          }}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-700 bg-slate-950 text-white shadow-[0_24px_80px_rgba(2,6,23,0.85)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-4 py-3">
              <div>
                <h3 className="text-base font-semibold text-white">{title} preview</h3>
                <p className="mt-1 text-xs text-slate-300">
                  Course overview and demo walkthrough
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setIsExpanded(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                aria-label="Close preview dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <video
                ref={modalVideoRef}
                src={previewUrl}
                className="aspect-video w-full cursor-pointer bg-black"
                playsInline
                preload="metadata"
                controls={false}
                onClick={togglePlay}
                onLoadedMetadata={() => syncVideoState(modalVideoRef.current)}
                onTimeUpdate={() => syncVideoState(modalVideoRef.current)}
                onPlay={() => syncVideoState(modalVideoRef.current)}
                onPause={() => syncVideoState(modalVideoRef.current)}
                onEnded={() => syncVideoState(modalVideoRef.current)}
              />

              {!isPlaying ? (
                <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      togglePlay();
                    }}
                    className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-white/10 backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform hover:scale-105"
                    aria-label={isPlaying ? "Pause preview" : "Play preview"}
                  >
                    <Play className="ml-1 h-7 w-7 fill-current text-white" />
                  </button>
                </div>
              ) : null}
            </div>

            <div className="space-y-2 bg-slate-950 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
              <div className="flex items-center gap-3 pt-1">
                <span className="min-w-10 text-right text-[11px] font-medium text-slate-300">
                  {formatTime(currentTime)}
                </span>
                <input
                  aria-label="Preview progress"
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(event) => handleSeek(Number(event.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-indigo-500"
                />
                <span className="min-w-10 text-left text-[11px] font-medium text-slate-300">
                  {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                    aria-label={volume === 0 ? "Unmute video" : "Mute video"}
                    onClick={() => {
                      if (volume === 0) {
                        const restoredVolume = lastVolume > 0 ? lastVolume : 0.8;
                        setVolume(restoredVolume);
                        setIsMuted(false);
                        return;
                      }

                      setLastVolume(volume > 0 ? volume : lastVolume);
                      setVolume(0);
                      setIsMuted(true);
                    }}
                  >
                    {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextValue = Math.max(0, Number((volume - 0.1).toFixed(2)));
                      setVolume(nextValue);
                      if (nextValue > 0) {
                        setLastVolume(nextValue);
                      }
                      setIsMuted(nextValue === 0);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                    aria-label="Decrease volume"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    <input
                      aria-label="Volume"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);
                        setVolume(nextValue);
                        if (nextValue > 0) {
                          setLastVolume(nextValue);
                        }
                        setIsMuted(nextValue === 0);
                      }}
                      className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-slate-700 accent-indigo-500"
                    />
                    <span className="text-[10px] font-medium text-slate-300">
                      {isMuted || volume === 0 ? "0%" : `${Math.round(volume * 100)}%`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextValue = Math.min(1, Number((volume + 0.1).toFixed(2)));
                      setVolume(nextValue);
                      if (nextValue > 0) {
                        setLastVolume(nextValue);
                      }
                      setIsMuted(nextValue === 0);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                    aria-label="Increase volume"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="-ml-50 flex flex-1 items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => skipTime(-10)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                    aria-label="Skip back 10 seconds"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_12px_28px_rgba(79,70,229,0.45)] transition hover:bg-indigo-400"
                    aria-label={isPlaying ? "Pause preview" : "Play preview"}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 fill-current" />
                    ) : (
                      <Play className="ml-1 h-5 w-5 fill-current" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => skipTime(10)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                    aria-label="Skip ahead 10 seconds"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                  aria-label="Toggle fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
