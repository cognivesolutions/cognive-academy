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

import VideoPlayer from "@/components/video/video-player";

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
  triggerLabel,
  triggerClassName,
  onOpen,
}: {
  videoUrl?: string | null;
  title: string;
  triggerLabel?: string;
  triggerClassName?: string;
  onOpen?: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [lastVolume, setLastVolume] = useState(0.6);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastKnownTime, setLastKnownTime] = useState(0);
  const [compactHovered, setCompactHovered] = useState(false);
  const [compactControlsVisible, setCompactControlsVisible] = useState(false);
  const [expandedHovered, setExpandedHovered] = useState(false);
  const [expandedControlsVisible, setExpandedControlsVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const fullscreenHostRef = useRef<HTMLDivElement | null>(null);
  const pendingExpandedPlaybackRef = useRef(false);

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

  const applyVolumeState = (video: HTMLVideoElement | null) => {
    if (!video) return;

    video.volume = volume;
    video.muted = isMuted;
  };

  useEffect(() => {
    applyVolumeState(videoRef.current);
    applyVolumeState(modalVideoRef.current);
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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

  const getActivePreviewVideo = () => {
    if (open && modalVideoRef.current) {
      return modalVideoRef.current;
    }

    return videoRef.current;
  };

  const togglePlay = async () => {
    const video = getActivePreviewVideo();
    if (!video) return;

    if (!ensurePlayableSource(video)) {
      return;
    }

    unmuteOnUserInteraction();

    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.warn("Preview video playback is unavailable:", error);
      setIsPlaying(false);
    }
  };

  const skipTime = (seconds: number) => {
    const video = getActivePreviewVideo();
    if (!video) return;

    const nextTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || 0);
    video.currentTime = nextTime;
    setProgress(video.duration ? (nextTime / video.duration) * 100 : 0);
  };

  const handleSeek = (value: number) => {
    const video = getActivePreviewVideo();
    if (!video) return;

    const nextTime = (value / 100) * (video.duration || 0);
    video.currentTime = nextTime;
    setProgress(value);
  };

  const handleFullscreen = async () => {
    const video = getActivePreviewVideo();
    if (!video) return;

    if (!ensurePlayableSource(video)) {
      return;
    }

    const host = fullscreenHostRef.current;
    if (!host) return;

    if (document.fullscreenElement === host) {
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

    await host.requestFullscreen();
  };

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

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
  const currentVolumePercent = volume > 0 ? Math.round(volume * 100) : 0;
  const currentProgressPercent = duration ? Math.min(100, Math.max(0, progress)) : 0;
  const hoverHideDelayMs = 1800;
  const volumeTrackStyle = {
    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${currentVolumePercent}%, #cbd5e1 ${currentVolumePercent}%, #cbd5e1 100%)`,
  };
  const progressTrackStyle = {
    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${currentProgressPercent}%, rgba(148, 163, 184, 0.8) ${currentProgressPercent}%, rgba(148, 163, 184, 0.8) 100%)`,
  };

  const handleCompactPlay = async () => {
    unmuteOnUserInteraction();
    await togglePlay();
  };

  const handleVideoSurfaceClick = async (event?: React.MouseEvent<HTMLElement>) => {
    if (open) return;

    const target = event?.target as HTMLElement | null;
    if (target && target.closest("button, input, [role='button']")) {
      return;
    }

    await handleCompactPlay();
  };

  const openPreview = () => {
    void onOpen?.();

    const video = videoRef.current;
    const currentTime = video ? video.currentTime : lastKnownTime;
    const shouldPlay = !!video && !video.paused && !video.ended;

    pendingExpandedPlaybackRef.current = shouldPlay;

    if (video) {
      video.pause();
    }

    setLastKnownTime(currentTime);
    setProgress(duration ? (currentTime / duration) * 100 : 0);
    setIsPlaying(shouldPlay);
    setOpen(true);
    setIsExpanded(true);

    if (modalVideoRef.current) {
      if (!ensurePlayableSource(modalVideoRef.current)) {
        modalVideoRef.current.src = DEFAULT_PREVIEW_VIDEO;
        modalVideoRef.current.load();
      }

      modalVideoRef.current.volume = volume;
      modalVideoRef.current.muted = isMuted;
      modalVideoRef.current.currentTime = currentTime;

      if (shouldPlay) {
        void modalVideoRef.current.play().then(() => {
          setIsPlaying(true);
          pendingExpandedPlaybackRef.current = false;
        }).catch(() => {
          setIsPlaying(false);
          pendingExpandedPlaybackRef.current = false;
        });
      } else {
        modalVideoRef.current.pause();
        setIsPlaying(false);
        pendingExpandedPlaybackRef.current = false;
      }
    }
  };

  const closePreview = () => {
    const popupVideo = modalVideoRef.current;
    const isPopupPlaying = !!popupVideo && !popupVideo.paused && !popupVideo.ended;
    const nextTime = popupVideo ? popupVideo.currentTime : lastKnownTime;
    const nextProgress = duration ? (nextTime / duration) * 100 : 0;

    setIsPlaying(isPopupPlaying);

    if (videoRef.current) {
      videoRef.current.currentTime = nextTime;
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
      if (isPopupPlaying) {
        void videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }

    setLastKnownTime(nextTime);
    setProgress(nextProgress);
    setOpen(false);
    setIsExpanded(false);
  };

  useEffect(() => {
    if (!open || !modalVideoRef.current) return;

    const popupVideo = modalVideoRef.current;
    if (!ensurePlayableSource(popupVideo)) {
      popupVideo.src = DEFAULT_PREVIEW_VIDEO;
      popupVideo.load();
    }

    popupVideo.volume = volume;
    popupVideo.muted = isMuted;

    if (Math.abs(popupVideo.currentTime - lastKnownTime) > 0.25) {
      popupVideo.currentTime = lastKnownTime;
    }

    if (pendingExpandedPlaybackRef.current) {
      void popupVideo.play().then(() => {
        setIsPlaying(true);
        pendingExpandedPlaybackRef.current = false;
      }).catch(() => {
        setIsPlaying(false);
        pendingExpandedPlaybackRef.current = false;
      });
      return;
    }

    setProgress(duration ? (lastKnownTime / duration) * 100 : 0);
  }, [open, duration, lastKnownTime, volume, isMuted, isPlaying]);

  useEffect(() => {
    if (compactHovered) {
      setCompactControlsVisible(true);
      return;
    }

    if (isPlaying) {
      const timer = window.setTimeout(() => {
        setCompactControlsVisible(false);
      }, hoverHideDelayMs);
      return () => window.clearTimeout(timer);
    }

    setCompactControlsVisible(false);
  }, [compactHovered, isPlaying, hoverHideDelayMs]);

  useEffect(() => {
    if (expandedHovered) {
      setExpandedControlsVisible(true);
      return;
    }

    if (isPlaying) {
      const timer = window.setTimeout(() => {
        setExpandedControlsVisible(false);
      }, hoverHideDelayMs);
      return () => window.clearTimeout(timer);
    }

    setExpandedControlsVisible(false);
  }, [expandedHovered, isPlaying, hoverHideDelayMs]);

  if (triggerLabel) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            void onOpen?.();
            setOpen(true);
            setIsExpanded(true);
          }}
          className={triggerClassName ?? "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(99,102,241,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(99,102,241,0.36)]"}
        >
          {triggerLabel}
        </button>

        {open ? (
          <VideoPlayer
            isOpen={open}
            onClose={closePreview}
            videoUrl={previewUrl}
            title={title}
            autoPlay={isPlaying}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-[18px] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.7),_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#e2e8f0_38%,_#dbeafe_100%)] shadow-inner dark:border-white/10 dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.45),_transparent_30%),linear-gradient(135deg,_#0f172a_0%,_#1e1b4b_40%,_#111827_100%)]"
        onClick={handleVideoSurfaceClick}
        onMouseEnter={() => {
          setCompactHovered(true);
          setCompactControlsVisible(true);
        }}
        onMouseLeave={() => {
          setCompactHovered(false);
          setCompactControlsVisible(false);
        }}
      >
        <video
          ref={videoRef}
          src={previewUrl}
          className="aspect-video w-full cursor-pointer bg-black object-cover"
          playsInline
          preload="metadata"
          controls={false}
          muted={isMuted}
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
              onClick={(event) => {
                event.stopPropagation();
                void handleCompactPlay();
              }}
              className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-300/80 bg-white/70 backdrop-blur-sm transition-transform hover:scale-105 dark:border-white/80 dark:bg-white/8"
              aria-label={`Play preview video for ${title}`}
            >
              <Play className="ml-1 h-7 w-7 fill-current text-slate-700 dark:text-white" />
            </button>
          </div>
        ) : null}

        <div
          className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-100/90 via-slate-100/70 to-transparent p-3 text-left transition-all duration-300 ease-out dark:from-slate-950/90 dark:via-slate-950/70 dark:to-transparent ${compactControlsVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
        >
          <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
            <span className="min-w-10 text-right font-medium">{formatTime(currentTime)}</span>
            <input
              aria-label="Compact preview progress"
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(event) => handleSeek(Number(event.target.value))}
              style={progressTrackStyle}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-300 accent-indigo-500 dark:bg-slate-700"
            />
            <span className="min-w-10 text-left font-medium">{formatTime(duration)}</span>
          </div>

          <div className="flex w-full items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
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
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Decrease volume"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-2 py-1 dark:border-white/10 dark:bg-white/5">
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
                  style={volumeTrackStyle}
                  className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-slate-300 accent-indigo-500 dark:bg-slate-700"
                />
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                  {`${currentVolumePercent}%`}
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
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Increase volume"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="relative z-30 ml-[2.5rem] flex items-center gap-2">
              <button
                type="button"
                onClick={() => skipTime(-10)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
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
                style={{ marginLeft: '0rem', transform: 'none' }}
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-1 h-5 w-5 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => skipTime(10)}
                className="ml-0 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Skip ahead 10 seconds"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={openPreview}
              className="relative z-30 ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              aria-label="Open expanded preview"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div
            ref={fullscreenHostRef}
            className="relative flex w-full max-w-5xl flex-col justify-center overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-[0_24px_80px_rgba(2,6,23,0.18)] dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:shadow-[0_24px_80px_rgba(2,6,23,0.85)]"
            onClick={(event) => event.stopPropagation()}
            onMouseEnter={() => setExpandedHovered(true)}
            onMouseLeave={() => setExpandedHovered(false)}
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title} preview</h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Course overview and demo walkthrough
                </p>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Close preview dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mx-auto w-full max-w-[calc(100%-0px)]">
              <video
                ref={modalVideoRef}
                src={previewUrl}
                className="aspect-video w-full cursor-pointer bg-black object-cover"
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

              {isFullscreen ? (
                <div className={`pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent transition-all duration-300 ${expandedControlsVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="flex items-center gap-5 sm:gap-150">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          skipTime(-10);
                        }}
                        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-white/30"
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
                        className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-white/30"
                        aria-label={isPlaying ? "Pause preview" : "Play preview"}
                      >
                        {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="ml-1 h-7 w-7 fill-current" />}
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          skipTime(10);
                        }}
                        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-white/30"
                        aria-label="Skip forward 10 seconds"
                      >
                        <SkipForward className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2 p-2 text-white sm:gap-3">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
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
                          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10"
                          aria-label={volume === 0 ? "Unmute video" : "Mute video"}
                        >
                          {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            const nextValue = Math.max(0, Number((volume - 0.1).toFixed(2)));
                            setVolume(nextValue);
                            if (nextValue > 0) {
                              setLastVolume(nextValue);
                            }
                            setIsMuted(nextValue === 0);
                          }}
                          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/5 text-white transition hover:bg-white/10"
                          aria-label="Decrease volume"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-black/10 px-2 py-1 text-[10px] font-medium text-white/90">
                          <input
                            aria-label="Fullscreen volume"
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={volume}
                            onPointerDown={(event) => event.stopPropagation()}
                            onMouseDown={(event) => event.stopPropagation()}
                            onTouchStart={(event) => event.stopPropagation()}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => {
                              event.stopPropagation();
                              const nextValue = Number(event.target.value);
                              setVolume(nextValue);
                              if (nextValue > 0) {
                                setLastVolume(nextValue);
                              }
                              setIsMuted(nextValue === 0);
                            }}
                            className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-slate-300 accent-indigo-500 sm:w-28"
                            style={volumeTrackStyle}
                          />
                          <span>{`${currentVolumePercent}%`}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            const nextValue = Math.min(1, Number((volume + 0.1).toFixed(2)));
                            setVolume(nextValue);
                            if (nextValue > 0) {
                              setLastVolume(nextValue);
                            }
                            setIsMuted(nextValue === 0);
                          }}
                          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/5 text-white transition hover:bg-white/10"
                          aria-label="Increase volume"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex -translate-x-2 items-center justify-center gap-1.5 pl-00 sm:-translate-x-36 sm:gap-2 sm:pl-0">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            skipTime(-10);
                          }}
                          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-white/30"
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
                          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_12px_28px_rgba(79,70,229,0.45)] transition-colors duration-200 hover:bg-indigo-400"
                          aria-label={isPlaying ? "Pause preview" : "Play preview"}
                        >
                          {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-1 h-6 w-6 fill-current" />}
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            skipTime(10);
                          }}
                          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-white/30"
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
                        className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/5 text-white transition hover:bg-white/10"
                        aria-label="Exit fullscreen"
                      >
                        <Minimize2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`pointer-events-none absolute inset-0 z-10 transition-all duration-300 ${expandedControlsVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
                >
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          skipTime(-10);
                        }}
                        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-slate-950/35 text-white shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-slate-950/70"
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
                        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/60 bg-slate-950/35 text-white shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-slate-950/70"
                        aria-label={isPlaying ? "Pause preview" : "Play preview"}
                      >
                        {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-1 h-6 w-6 fill-current" />}
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          skipTime(10);
                        }}
                        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-slate-950/35 text-white shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-slate-950/70"
                        aria-label="Skip forward 10 seconds"
                      >
                        <SkipForward className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isPlaying ? (
                <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
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

            <div
              className={`space-y-2 bg-slate-50 px-3 pb-3 pt-2 transition-all duration-300 sm:px-4 sm:pb-4 dark:bg-slate-950 ${expandedControlsVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
            >
              <div className="flex items-center gap-3 pt-1">
                <span className="min-w-10 text-right text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {formatTime(currentTime)}
                </span>
                <input
                  aria-label="Preview progress"
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
                    aria-label={volume === 0 ? "Unmute video" : "Mute video"}
                    onClick={(event) => {
                      event.stopPropagation();
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
                    onClick={(event) => {
                      event.stopPropagation();
                      const nextValue = Math.max(0, Number((volume - 0.1).toFixed(2)));
                      setVolume(nextValue);
                      if (nextValue > 0) {
                        setLastVolume(nextValue);
                      }
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
                      onTouchStart={(event) => event.stopPropagation()}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);
                        setVolume(nextValue);
                        if (nextValue > 0) {
                          setLastVolume(nextValue);
                        }
                        setIsMuted(nextValue === 0);
                      }}
                      style={volumeTrackStyle}
                      className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-slate-300 accent-indigo-500 dark:bg-slate-700"
                    />
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                      {`${currentVolumePercent}%`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      const nextValue = Math.min(1, Number((volume + 0.1).toFixed(2)));
                      setVolume(nextValue);
                      if (nextValue > 0) {
                        setLastVolume(nextValue);
                      }
                      setIsMuted(nextValue === 0);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                    aria-label="Increase volume"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative z-10 ml-2 flex flex-1 -translate-x-8 items-center justify-center gap-2 sm:ml-4 sm:-translate-x-30">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      skipTime(-10);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors duration-200 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
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
                    onClick={(event) => {
                      event.stopPropagation();
                      skipTime(10);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors duration-200 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                    aria-label="Skip ahead 10 seconds"
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
