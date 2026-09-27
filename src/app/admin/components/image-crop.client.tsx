"use client";

import React, { useCallback, useRef, useState } from "react";
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

  export default function ImageCrop({ initialSrc, width, height }: Props) {
  const [src, setSrc] = useState<string | undefined>(initialSrc);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [draggingState, setDraggingState] = useState<{ down: boolean; sx: number; sy: number } | null>(null);

  const onFile = async (f: File) => {
    const url = URL.createObjectURL(f);
    setSrc(url);
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setImgSize(null);
  };

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    // center image
    const container = containerRef.current;
    if (!container) return;
    const bs = Math.max(container.clientWidth / img.naturalWidth, container.clientHeight / img.naturalHeight);
    setBaseScale(bs);
    const renderedW = img.naturalWidth * bs * zoom;
    const renderedH = img.naturalHeight * bs * zoom;
    setOffset({ x: (container.clientWidth - renderedW) / 2, y: (container.clientHeight - renderedH) / 2 });
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingState({ down: true, sx: e.clientX, sy: e.clientY });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingState || !draggingState.down) return;
    const dx = e.clientX - draggingState.sx;
    const dy = e.clientY - draggingState.sy;
    setDraggingState({ down: true, sx: e.clientX, sy: e.clientY });
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  }

  function onPointerUp(e: React.PointerEvent) {
    setDraggingState(null);
  }

  const cropImage = async () => {
    if (!src) return;
    setStatus("Processing...");
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
      const srcX = (-offset.x) / scale;
      const srcY = (-offset.y) / scale;
      const srcW = containerW / scale;
      const srcH = containerH / scale;

      const sx = Math.max(0, Math.round(srcX));
      const sy = Math.max(0, Math.round(srcY));
      const sWidth = Math.max(1, Math.round(Math.min(img.naturalWidth - sx, srcW)));
      const sHeight = Math.max(1, Math.round(Math.min(img.naturalHeight - sy, srcH)));

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, outputW, outputH);
      const blob = await toBlob(canvas);
      if (!blob) {
        setStatus("Failed to create image");
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
        setStatus("Upload failed");
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

      setStatus("Uploaded");
    } catch (err) {
      console.error(err);
      setStatus("Error");
    }
  };

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={(e) => e.target.files && onFile(e.target.files[0])} />

      {src && (
        <div
          ref={containerRef}
          className="relative h-64 w-full overflow-hidden bg-black/5"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <img
            ref={imgRef}
            src={src}
            alt="crop source"
            onLoad={onImgLoad}
            style={{
              position: "absolute",
              left: `${offset.x}px`,
              top: `${offset.y}px`,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              userSelect: "none",
            }}
            draggable={false}
          />
        </div>
      )}

      {src && (
        <div className="flex items-center gap-2">
          <label className="text-sm">Zoom</label>
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
        </div>
      )}

      <div className="flex items-center gap-2">
        <button onClick={cropImage} className="rounded bg-indigo-600 px-3 py-1 text-white">Crop & Upload</button>
      </div>
    </div>
  );
}
