"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
// lightweight no-dependency crop UI (drag to pan + zoom)

type Props = {
  initialSrc?: string;
  // desired output size
  width?: number;
  height?: number;
};

function toBlob(canvas: HTMLCanvasElement, mime = "image/jpeg", quality = 0.9): Promise<Blob | null> {
  return new Promise((res) => canvas.toBlob(res, mime, quality));
}

const DEFAULT_COURSE_THUMBNAIL = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80";

  export default function ImageCrop({ initialSrc, width, height }: Props) {
  const [src, setSrc] = useState<string | undefined>();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const [selectedFileName, setSelectedFileName] = useState(initialSrc ? "Current thumbnail" : "No file chosen");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewHover, setIsPreviewHover] = useState(false);

  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [draggingState, setDraggingState] = useState<{ down: boolean; sx: number; sy: number } | null>(null);
  const isDragging = Boolean(draggingState?.down);

  useEffect(() => {
    if (initialSrc) {
      setPreviewUrl(initialSrc);
      setSelectedFileName("Current thumbnail");
    } else {
      setPreviewUrl(null);
      setSelectedFileName("No file chosen");
    }
  }, [initialSrc]);

  const onFile = async (f: File) => {
    const url = URL.createObjectURL(f);
    setSelectedFileName(f.name);
    setSrc(url);
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setImgSize(null);
    setMessage(null);
    setMessageType(null);
    // clear existing preview when a new file is chosen for cropping
    setPreviewUrl(null);
  };

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    const container = containerRef.current;
    if (!container) return;

    const cardAspect = 4 / 3;
    const containerAspect = container.clientWidth / container.clientHeight;
    const preferredScale = containerAspect > cardAspect ? 1.08 : 0.96;
    const fitScale = Math.min(container.clientWidth / img.naturalWidth, container.clientHeight / img.naturalHeight);
    const nextBaseScale = Math.min(fitScale * preferredScale, fitScale * 1.12);
    setBaseScale(nextBaseScale);

    const renderedW = img.naturalWidth * nextBaseScale * zoom;
    const renderedH = img.naturalHeight * nextBaseScale * zoom;
    setOffset({
      x: (container.clientWidth - renderedW) / 2,
      y: (container.clientHeight - renderedH) / 2,
    });
    // ensure crop box updates when image is loaded
    // (no-op if container not mounted)
    try {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("resize"));
    } catch (e) {}
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingState({ down: true, sx: e.clientX, sy: e.clientY });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingState || !draggingState.down) return;
    e.preventDefault();
    const dx = e.clientX - draggingState.sx;
    const dy = e.clientY - draggingState.sy;
    setDraggingState({ down: true, sx: e.clientX, sy: e.clientY });
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  }

  function onPointerUp(e: React.PointerEvent) {
    e.preventDefault();
    setDraggingState(null);
  }

  const cropImage = async () => {
    if (!src) return;
    setMessage("Processing...");
    setMessageType("info");
    try {
      // draw image to canvas
      const img = imgRef.current;
      if (!img) return;
      const canvas = document.createElement("canvas");
      const outputW = width ?? 1200;
      const outputH = height ?? 800;
      canvas.width = outputW;
      canvas.height = outputH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // compute crop rectangle in source image pixels corresponding to container viewport
      const container = containerRef.current;
      if (!container) return;
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const scale = baseScale * zoom;

      // compute crop box (centered) matching desired output aspect ratio
      const outW = width ?? 400;
      const outH = height ?? 300;
      const ratio = outW / outH;
      let boxW = containerW;
      let boxH = Math.round(boxW / ratio);
      if (boxH > containerH) {
        boxH = containerH;
        boxW = Math.round(boxH * ratio);
      }
      const boxLeft = Math.round((containerW - boxW) / 2);
      const boxTop = Math.round((containerH - boxH) / 2);

      const srcX = (-offset.x + boxLeft) / scale;
      const srcY = (-offset.y + boxTop) / scale;
      const srcW = boxW / scale;
      const srcH = boxH / scale;

      const sx = Math.max(0, Math.round(srcX));
      const sy = Math.max(0, Math.round(srcY));
      const sWidth = Math.max(1, Math.round(Math.min(img.naturalWidth - sx, srcW)));
      const sHeight = Math.max(1, Math.round(Math.min(img.naturalHeight - sy, srcH)));

      // paint white background so JPEG encoding doesn't render transparent pixels as black
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, outputW, outputH);
      const blob = await toBlob(canvas);
      if (!blob) {
        setMessage("Failed to create image");
        setMessageType("error");
        return;
      }

      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: blob.type });
      // upload to server
      const form = new FormData();
      form.append("file", file);
      form.append("width", String(outputW));
      form.append("height", String(outputH));
      const res = await fetch("/api/admin/uploads", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json?.url) {
        setMessage("Upload failed");
        setMessageType("error");
        return;
      }

      // set the nearest form's imageUrl input value
      const el = (document.activeElement as HTMLElement) || null;
      // find closest form ancestor starting from this component's container
      let node: HTMLElement | null = el;
      if (!node) node = document.body;
      // try to find input[name=imageUrl] in the current form
      const formEl = node.closest ? node.closest("form") : document.querySelector("form");
      if (formEl) {
        const input = (formEl as HTMLFormElement).querySelector('input[name="imageUrl"]') as HTMLInputElement | null;
        if (input) {
          input.value = json.url;
          // dispatch change event
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      // show small preview, close crop UI and report success
      setPreviewUrl(json.url);
      setSrc(undefined);
      setMessage("Course Thumbnail uploaded Successfully!");
      setMessageType("success");
    } catch (err) {
      console.error(err);
      setMessage("Error uploading image");
      setMessageType("error");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex cursor-pointer items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:bg-indigo-500/20"
        >
          Choose file
        </button>

        {!src && (previewUrl || initialSrc) && (
          <div
            className="ml-2 relative inline-block"
            onMouseEnter={() => setIsPreviewHover(true)}
            onMouseLeave={() => setIsPreviewHover(false)}
          >
            <img
              src={previewUrl || initialSrc || DEFAULT_COURSE_THUMBNAIL}
              alt="Current course thumbnail"
              className="h-10 w-16 rounded-md object-cover border border-slate-200"
              onError={(event) => {
                const target = event.currentTarget as HTMLImageElement;
                if (target.src !== DEFAULT_COURSE_THUMBNAIL) {
                  target.src = DEFAULT_COURSE_THUMBNAIL;
                }
              }}
            />
            {previewUrl && (
              <button
                type="button"
                aria-label="Remove preview"
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFileName("No file chosen");
                  if (fileInputRef.current) {
                    try {
                      (fileInputRef.current as HTMLInputElement).value = "";
                    } catch (e) {}
                  }
                }}
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600/20 backdrop-blur-sm border border-white/20 text-white text-xs shadow-md hover:bg-red-600/30 focus:outline-none focus:ring-2 focus:ring-red-300/40"
              >
                ×
              </button>
            )}

            {isPreviewHover && previewUrl && (
              <div className="absolute z-50 left-1/2 top-0 -translate-x-1/2 -translate-y-full mb-2 w-48 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
                <img
                  src={previewUrl || DEFAULT_COURSE_THUMBNAIL}
                  alt="preview-large"
                  className="w-full rounded-md object-cover"
                  onError={(event) => {
                    const target = event.currentTarget as HTMLImageElement;
                    if (target.src !== DEFAULT_COURSE_THUMBNAIL) {
                      target.src = DEFAULT_COURSE_THUMBNAIL;
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <span className="truncate text-sm text-slate-500 dark:text-slate-400">{selectedFileName}</span>
      </div>

      {src && (
        <div className="space-y-2">
          <div
            ref={containerRef}
            className={`relative h-52 w-full overflow-hidden rounded-xl border border-slate-200 bg-black/5 transition-colors dark:border-slate-700 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onWheel={(event) => {
              if (!event.ctrlKey) return;
              event.preventDefault();
              const delta = event.deltaY > 0 ? -0.1 : 0.1;
              setZoom((current) => Math.min(3, Math.max(1, Number((current + delta).toFixed(2)))));
            }}
            onDragStart={(event) => event.preventDefault()}
            style={{ touchAction: "none", aspectRatio: "4 / 3" }}
          >
            <img
              ref={imgRef}
              src={src}
              alt="crop source"
              onLoad={onImgLoad}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onMouseDown={(event) => event.preventDefault()}
              onDragStart={(event) => event.preventDefault()}
              style={{
                position: "absolute",
                left: `${offset.x}px`,
                top: `${offset.y}px`,
                transform: `scale(${baseScale * zoom})`,
                transformOrigin: "top left",
                userSelect: "none",
                pointerEvents: "none",
              }}
              draggable={false}
            />
            {/* centered crop box overlay matching output aspect ratio */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 flex items-center justify-center w-full h-full"
            >
              <div
                className="rounded-md border-2 border-dashed border-slate-300 bg-transparent"
                style={{ width: `${Math.min(containerRef.current?.clientWidth ?? 0, (containerRef.current?.clientHeight ?? 0) * ((width ?? 400) / (height ?? 300)))}px`, height: `${Math.min(containerRef.current?.clientHeight ?? 0, (containerRef.current?.clientWidth ?? 0) / ((width ?? 400) / (height ?? 300)))}px` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setZoom((current) => Number(Math.max(1, Number((current - 0.1).toFixed(2)))))}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                aria-label="Zoom out"
              >
                −
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-2 w-28 accent-indigo-600"
                aria-label="Zoom level"
              />

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((current) => Number(Math.min(3, Number((current + 0.1).toFixed(2)))))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  aria-label="Zoom in"
                >
                  +
                </button>

                <input
                  type="number"
                  min={100}
                  max={300}
                  step={5}
                  value={Math.round(zoom * 100)}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    if (Number.isNaN(nextValue)) return;
                    const clamped = Math.min(300, Math.max(100, nextValue));
                    setZoom(Number((clamped / 100).toFixed(2)));
                  }}
                  aria-label="Zoom percentage"
                  className="w-[34px] border-0 bg-transparent px-1 py-0 text-right text-[11px] font-medium text-slate-600 outline-none dark:text-slate-300 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'textfield', appearance: 'textfield' }}
                />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-200">%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full">
              <div className="ml-auto flex items-center gap-2">
                {message && (
                  <div
                    className={`rounded-md px-2 py-1 text-sm font-medium mr-2 flex-shrink-0 ${
                      messageType === "success"
                        ? "border border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200"
                        : messageType === "error"
                        ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                        : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    // clear selected image
                    setSrc(undefined);
                    setSelectedFileName("No file chosen");
                    setMessage(null);
                    setMessageType(null);
                    if (fileInputRef.current) {
                      try {
                        (fileInputRef.current as HTMLInputElement).value = "";
                      } catch (e) {}
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-3 py-1.5 text-sm font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
                >
                  Remove
                </button>

                <button
                  type="button"
                  onClick={cropImage}
                  className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-sm font-semibold text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
                >
                  Crop & Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
