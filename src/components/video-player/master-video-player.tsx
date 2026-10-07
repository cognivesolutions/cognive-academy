"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Maximize2,
  Minimize2,
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

const DEFAULT_VIDEO_URL = "https://www.pexels.com/download/video/8084496/";

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

export default function MasterVideoPlayer({
  isOpen,
  onClose,
  videoUrl,
  title,
  autoPlay = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string | null;
  title: string;
  autoPlay?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [lastVolume, setLastVolume] = useState(0.6);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastKnownTime, setLastKnownTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!videoUrl || videoUrl.trim().length === 0) return DEFAULT_VIDEO_URL;
    const trimmed = videoUrl.trim();
    if (!isSupportedVideoSource(trimmed)) return DEFAULT_VIDEO_URL;
    return trimmed;
  }, [videoUrl]);

  const syncVideoState = (video: HTMLVideoElement | null) => {
    if (!video) return;

    const nextProgress = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    setLastKnownTime(video.currentTime);
    setIsPlaying(!video.paused && !video.ended);
    setIsMuted(video.muted);
    setVolume(video.volume);
    setDuration(video.duration || 0);
    setProgress(nextProgress);
  };

  const ensurePlayableSource = (video: HTMLVideoElement | null) => {
    if (!video) return false;

    const currentSource = video.currentSrc || video.src || previewUrl;
    if (!isSupportedVideoSource(currentSource)) {
      video.src = DEFAULT_VIDEO_URL;
      video.load();
      return false;
    }

    return true;
  };

  const applyVolumeState = (video: HTMLVideoElement | null) => {
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  };

  useEffect(() => {
    applyVolumeState(videoRef.current);
  }, [volume, isMuted]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
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
        void togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const getCurrentVideo = () => videoRef.current;

  const togglePlay = async () => {
    const video = getCurrentVideo();
    if (!video) return;

    if (!ensurePlayableSource(video)) return;

    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  const skipTime = (seconds: number) => {
    const video = getCurrentVideo();
    if (!video) return;

    const nextTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || 0);
    video.currentTime = nextTime;
    setProgress(video.duration ? (nextTime / video.duration) * 100 : 0);
  };

  const handleSeek = (value: number) => {
    const video = getCurrentVideo();
    if (!video) return;

    const nextTime = (value / 100) * (video.duration || 0);
    video.currentTime = nextTime;
    setProgress(value);
  };

  const handleFullscreen = async () => {
    const host = hostRef.current;
    const video = getCurrentVideo();
    if (!host || !video) return;

    if (!ensurePlayableSource(video)) return;

    if (document.fullscreenElement === host) {
      await document.exitFullscreen();
      return;
    }

    if (video.paused) {
      try {
        await video.play();
      } catch {
        // ignore autoplay restrictions
      }
    }

    await host.requestFullscreen();
  };

  useEffect(() => {
    if (!isOpen) return;

    const video = videoRef.current;
    if (!video) return;

    if (!ensurePlayableSource(video)) return;

    video.volume = volume;
    video.muted = isMuted;

    if (autoPlay && video.readyState >= 1) {
      void video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isOpen, autoPlay, volume, isMuted]);

  const currentTime = duration ? (progress / 100) * duration : 0;
  const currentVolumePercent = volume > 0 ? Math.round(volume * 100) : 0;
  const currentProgressPercent = duration ? Math.min(100, Math.max(0, progress)) : 0;

  const volumeTrackStyle = {
    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${currentVolumePercent}%, rgba(148,163,184,0.8) ${currentVolumePercent}%, rgba(148,163,184,0.8) 100%)`,
  };

  const progressTrackStyle = {
    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${currentProgressPercent}%, rgba(148,163,184,0.8) ${currentProgressPercent}%, rgba(148,163,184,0.8) 100%)`,
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        ref={hostRef}
        className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-[0_30px_90px_rgba(2,6,23,0.2)] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Course overview and demo walkthrough</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            aria-label="Close video player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <video
            ref={videoRef}
            src={previewUrl}
            className="aspect-video w-full cursor-pointer bg-black object-cover"
            playsInline
            preload="metadata"
            controls={false}
            onClick={() => void togglePlay()}
            onLoadedMetadata={() => syncVideoState(videoRef.current)}
            onTimeUpdate={() => syncVideoState(videoRef.current)}
            onPlay={() => syncVideoState(videoRef.current)}
            onPause={() => syncVideoState(videoRef.current)}
            onEnded={() => syncVideoState(videoRef.current)}
          />

          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  skipTime(-10);
                }}
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-slate-950/35 text-white shadow-lg backdrop-blur-sm transition hover:bg-slate-950/60"
                aria-label="Skip back 10 seconds"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void togglePlay();
                }}
                className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-slate-950/35 text-white shadow-lg backdrop-blur-sm transition hover:bg-slate-950/60"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="ml-1 h-7 w-7 fill-current" />}
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  skipTime(10);
                }}
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-slate-950/35 text-white shadow-lg backdrop-blur-sm transition hover:bg-slate-950/60"
                aria-label="Skip forward 10 seconds"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 bg-slate-50 px-3 pb-3 pt-2 dark:bg-slate-950 sm:px-4 sm:pb-4">
          <div className="flex items-center gap-3 pt-1">
            <span className="min-w-10 text-right text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {formatTime(currentTime)}
            </span>
            <input
              aria-label="Video progress"
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(event) => handleSeek(Number(event.target.value))}
              style={progressTrackStyle}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-300 accent-indigo-500 dark:bg-slate-700"
            />
            <span className="min-w-10 text-left text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {formatTime(duration)}
            </span>
          </div>

          <div className="relative z-20 flex items-center gap-2 sm:gap-3">
            <div className="relative z-30 flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label={isMuted || volume === 0 ? "Unmute video" : "Mute video"}
                onClick={(event) => {
                  event.stopPropagation();
                  if (volume === 0 || isMuted) {
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
                {volume === 0 || isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  const nextValue = Math.max(0, Number((volume - 0.1).toFixed(2)));
                  setVolume(nextValue);
                  if (nextValue > 0) setLastVolume(nextValue);
                  setIsMuted(nextValue === 0);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Decrease volume"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-white/10 dark:bg-white/5">
                <input
                  aria-label="Volume"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onPointerDown={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    setVolume(nextValue);
                    if (nextValue > 0) setLastVolume(nextValue);
                    setIsMuted(nextValue === 0);
                  }}
                  style={volumeTrackStyle}
                  className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-slate-300 accent-indigo-500 dark:bg-slate-700"
                />
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{`${currentVolumePercent}%`}</span>
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  const nextValue = Math.min(1, Number((volume + 0.1).toFixed(2)));
                  setVolume(nextValue);
                  if (nextValue > 0) setLastVolume(nextValue);
                  setIsMuted(nextValue === 0);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Increase volume"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="ml-2 flex flex-1 items-center justify-center gap-2 sm:ml-4">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  skipTime(-10);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Skip back 10 seconds"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void togglePlay();
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_12px_28px_rgba(79,70,229,0.45)] transition hover:bg-indigo-400"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-1 h-5 w-5 fill-current" />}
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  skipTime(10);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Skip forward 10 seconds"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void handleFullscreen();
              }}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              aria-label={isFullscreen ? "Exit fullscreen" : "Toggle fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
