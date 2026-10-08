"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
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

/**
 * @typedef {Object} VideoPlayerProps
 * @property {boolean} isOpen
 * @property {() => void} onClose
 * @property {string} videoUrl
 * @property {string} title
 * @property {boolean} [autoPlay]
 * @property {string | undefined} [resumeKey]
 * @property {((watchedPercent: number) => void | Promise<void>) | undefined} [onProgressUpdate]
 */

/*
 * @param {string | undefined | null} value
 */
const isSupportedVideoSource = (value) => {
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

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * @param {VideoPlayerProps} props
 */
export default function VideoPlayer({
  isOpen,
  onClose,
  videoUrl,
  title,
  autoPlay = false,
  resumeKey = undefined,
  onProgressUpdate = undefined,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [lastVolume, setLastVolume] = useState(0.6);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastKnownTime, setLastKnownTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isPlayerHovered, setIsPlayerHovered] = useState(false);
  const [isPlaybackMenuOpen, setIsPlaybackMenuOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef(null);
  const hostRef = useRef(null);
  const idleTimerRef = useRef(null);
  const lastReportedProgressRef = useRef(-1);

  const previewUrl = useMemo(() => {
    if (!videoUrl || videoUrl.trim().length === 0) return DEFAULT_VIDEO_URL;
    const trimmed = videoUrl.trim();
    if (!isSupportedVideoSource(trimmed)) return DEFAULT_VIDEO_URL;
    return trimmed;
  }, [videoUrl]);

  const syncVideoState = (video) => {
    if (!video) return;

    const nextProgress = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    const normalizedProgress = Number.isFinite(nextProgress) ? Math.min(100, Math.max(0, nextProgress)) : 0;

    setLastKnownTime(video.currentTime);
    setIsPlaying(!video.paused && !video.ended);
    setIsMuted(video.muted);
    setVolume(video.volume);
    setDuration(video.duration || 0);
    setProgress(normalizedProgress);

    if (resumeKey) {
      try {
        localStorage.setItem(`video-resume:${resumeKey}`, String(video.currentTime));
      } catch {
        // ignore storage errors
      }
    }

    if (typeof onProgressUpdate === "function") {
      const nextTrackedProgress = Math.max(lastReportedProgressRef.current, normalizedProgress);
      const delta = nextTrackedProgress - lastReportedProgressRef.current;
      const remainingTime = video.duration ? Math.max(0, video.duration - video.currentTime) : 0;
      const isNearCompletion = remainingTime <= 10 || normalizedProgress >= 90;

      if (isNearCompletion || delta >= 0.5) {
        lastReportedProgressRef.current = nextTrackedProgress;
        onProgressUpdate(nextTrackedProgress);
      }
    }
  };

  const ensurePlayableSource = (video) => {
    if (!video) return false;

    const currentSource = video.currentSrc || video.src || previewUrl;
    if (!isSupportedVideoSource(currentSource)) {
      video.src = DEFAULT_VIDEO_URL;
      video.load();
      return false;
    }

    return true;
  };

  const applyVolumeState = (video) => {
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  };

  useEffect(() => {
    applyVolumeState(videoRef.current);
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackRate;
  }, [playbackRate, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      const target = event.target;
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

  const skipTime = (seconds) => {
    const video = getCurrentVideo();
    if (!video) return;

    const nextTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || 0);
    video.currentTime = nextTime;
    setProgress(video.duration ? (nextTime / video.duration) * 100 : 0);
  };

  const handleSeek = (value) => {
    const video = getCurrentVideo();
    if (!video) return;

    const nextTime = (value / 100) * (video.duration || 0);
    video.currentTime = nextTime;
    setProgress(value);
  };

  const handleFullscreen = async () => {
    const host = hostRef.current;
    if (!host) return;

    const video = getCurrentVideo();
    if (!video) return;

    if (!ensurePlayableSource(video)) return;

    if (document.fullscreenElement === host) {
      await document.exitFullscreen();
      return;
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

    if (resumeKey) {
      try {
        const savedTime = Number(localStorage.getItem(`video-resume:${resumeKey}`) ?? "0");
        if (Number.isFinite(savedTime) && savedTime > 0 && (!video.duration || savedTime < video.duration)) {
          video.currentTime = savedTime;
        }
      } catch {
        // ignore storage errors
      }
    }

    if (autoPlay && video.readyState >= 1) {
      void video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isOpen, autoPlay, volume, isMuted, resumeKey]);

  useEffect(() => {
    if (!isOpen) {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      setControlsVisible(true);
      return;
    }

    if (isPlaybackMenuOpen || isPlayerHovered) {
      setControlsVisible(true);

      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }

      return () => {
        if (idleTimerRef.current) {
          window.clearTimeout(idleTimerRef.current);
          idleTimerRef.current = null;
        }
      };
    }

    setControlsVisible(false);
    return undefined;
  }, [isOpen, isFullscreen, isPlayerHovered, isPlaying, isPlaybackMenuOpen]);

  const currentTime = duration ? (progress / 100) * duration : 0;
  const currentVolumePercent = volume > 0 ? Math.round(volume * 100) : 0;
  const currentProgressPercent = duration ? Math.min(100, Math.max(0, progress)) : 0;
  const shouldShowTopBar = isPlayerHovered || controlsVisible;
  const shouldShowCenterControls = !isPlaying ? true : isPlayerHovered || controlsVisible;
  const shouldShowBottomControls = isPlayerHovered || controlsVisible;

  const playbackOptions = [2, 1.5, 1.25, 1, 0.75, 0.5];

  const volumeTrackStyle = {
    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${currentVolumePercent}%, rgba(148,163,184,0.8) ${currentVolumePercent}%, rgba(148,163,184,0.8) 100%)`,
  };

  const progressTrackStyle = {
    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${currentProgressPercent}%, rgba(148,163,184,0.8) ${currentProgressPercent}%, rgba(148,163,184,0.8) 100%)`,
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm pointer-events-auto select-none ${
        isFullscreen ? "p-0" : "px-3 sm:px-4"
      }`}
      style={{
        paddingTop: isFullscreen ? 0 : "max(88px, 9vh)",
        paddingBottom: isFullscreen ? 0 : "max(56px, 6vh)",
      }}
      onClick={onClose}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div
        ref={hostRef}
        className={`relative z-[100000] flex flex-col overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-[0_30px_90px_rgba(2,6,23,0.2)] dark:border-slate-700 dark:bg-slate-950 dark:text-white isolate ${
          isFullscreen
            ? "h-screen w-screen rounded-none border-0 shadow-none"
            : "w-full max-w-5xl rounded-[28px]"
        }`}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onMouseMove={(event) => {
          event.stopPropagation();
          setIsPlayerHovered(true);
          setControlsVisible(true);
        }}
        onMouseEnter={(event) => {
          event.stopPropagation();
          setIsPlayerHovered(true);
          setControlsVisible(true);
        }}
        onMouseLeave={(event) => {
          event.stopPropagation();
          if (isPlaybackMenuOpen) {
            setIsPlayerHovered(true);
            setControlsVisible(true);
            return;
          }
          setIsPlayerHovered(false);
          setControlsVisible(false);
          if (idleTimerRef.current) {
            window.clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
          }
        }}
      >
        <div
          className={`flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 transition-all duration-[1100ms] ease-in-out dark:border-white/10 dark:bg-slate-950 ${isFullscreen ? "h-16" : ""} ${
            shouldShowTopBar ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
          }`}
        >
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

        <div className={`relative ${isFullscreen ? "min-h-0 flex-1" : ""}`}>
          <video
            ref={videoRef}
            src={previewUrl}
            className={`w-full cursor-pointer bg-black object-cover ${isFullscreen ? "h-full" : "aspect-video"}`}
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

          <div
            className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-[1100ms] ease-in-out ${
              shouldShowCenterControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {isPlaying || isPlayerHovered ? (
              <div className={`flex items-center ${isFullscreen ? "gap-4 sm:gap-100" : "gap-4 sm:gap-50"}`}>
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
            ) : (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void togglePlay();
                }}
                className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-slate-950/35 text-white shadow-lg backdrop-blur-sm transition hover:bg-slate-950/60"
                aria-label="Play video"
              >
                <Play className="ml-1 h-7 w-7 fill-current" />
              </button>
            )}
          </div>
        </div>

        <div
          className={`shrink-0 space-y-2 bg-slate-50 px-3 pb-3 pt-2 transition-opacity duration-[1100ms] ease-in-out dark:bg-slate-950 sm:px-4 sm:pb-4 ${
            shouldShowBottomControls ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
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

          <div className="relative z-20 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
            <div className="relative z-30 flex items-center justify-self-start gap-1.5 sm:gap-2">
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

            <div className="relative z-30 flex min-w-0 items-center justify-self-center">
              <div className={`flex items-center ${isFullscreen ? "gap-10" : "gap-5"}`}>
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
                  style={{ marginLeft: "0rem", transform: "none" }}
                >
                  {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-1 h-5 w-5 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    skipTime(10);
                  }}
                  className="ml-0 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  aria-label="Skip forward 10 seconds"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative z-30 flex items-center justify-self-end gap-2">
              <div
                className="relative"
                onMouseEnter={() => {
                  setIsPlayerHovered(true);
                  setIsPlaybackMenuOpen(true);
                }}
                onMouseLeave={(event) => {
                  const nextTarget = event.relatedTarget;
                  if (nextTarget && event.currentTarget.contains(nextTarget)) {
                    return;
                  }

                  setIsPlaybackMenuOpen(false);
                  setIsPlayerHovered(false);
                  setControlsVisible(false);
                }}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsPlaybackMenuOpen((open) => !open);
                    setIsPlayerHovered(true);
                  }}
                  className="flex h-10 min-w-[84px] items-center justify-between gap-2 rounded-full border border-slate-200 bg-white/90 px-3 pr-2 text-[13px] font-medium text-slate-800 shadow-[0_5px_18px_rgba(15,23,42,0.04)] outline-none transition-all duration-200 hover:bg-white focus:border-indigo-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1),0_8px_20px_rgba(79,70,229,0.08)] dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100 dark:hover:bg-slate-900 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:shadow-[0_0_0_3px_rgba(129,140,248,0.12),0_8px_20px_rgba(99,102,241,0.12)]"
                  aria-label="Playback speed"
                  aria-expanded={isPlaybackMenuOpen}
                >
                  <span>{`${playbackRate}x`}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-600 dark:text-slate-200" />
                </button>

                {isPlaybackMenuOpen ? (
                  <div
                    className="absolute right-0 bottom-full z-[100001] mb-0 w-[84px] overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-[0_20px_45px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-900"
                    onMouseEnter={() => {
                      setIsPlayerHovered(true);
                      setControlsVisible(true);
                      setIsPlaybackMenuOpen(true);
                    }}
                    onMouseLeave={(event) => {
                      const nextTarget = event.relatedTarget;
                      if (nextTarget && event.currentTarget.parentElement?.contains(nextTarget)) {
                        return;
                      }

                      setIsPlaybackMenuOpen(false);
                      setIsPlayerHovered(false);
                      setControlsVisible(false);
                    }}
                  >
                    {playbackOptions.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPlaybackRate(rate);
                          setIsPlaybackMenuOpen(false);
                          setIsPlayerHovered(true);
                          const video = videoRef.current;
                          if (video) {
                            video.playbackRate = rate;
                          }
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-sm transition ${
                          playbackRate === rate
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span>{`${rate}x`}</span>
                        {playbackRate === rate ? <span className="text-xs font-semibold">●</span> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleFullscreen();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label={isFullscreen ? "Exit fullscreen" : "Toggle fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
