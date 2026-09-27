"use client";

import React, { useEffect } from "react";

async function uploadFile(file: File, width = 1200, height = 800) {
  const form = new FormData();
  form.append("file", file);
  form.append("width", String(width));
  form.append("height", String(height));
  const res = await fetch("/api/admin/uploads", { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json();
  return json.url as string;
}

export default function ImageFileUploader() {
  useEffect(() => {
    function onChange(e: Event) {
      const input = e.target as HTMLInputElement;
      if (!input || input.name !== "imageFile") return;
      const files = input.files;
      if (!files || files.length === 0) return;
      const file = files[0];
      const form = input.closest("form");
      const urlInput = form ? (form.querySelector('input[name="imageUrl"]') as HTMLInputElement | null) : null;

      // optimistic UI: show uploading text
      const originalValue = urlInput ? urlInput.value : "";
      if (urlInput) urlInput.value = "Uploading...";

      uploadFile(file).then((url) => {
        if (urlInput) {
          urlInput.value = url;
          urlInput.dispatchEvent(new Event("input", { bubbles: true }));
          urlInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }).catch((err) => {
        console.error("Upload failed:", err);
        if (urlInput) urlInput.value = originalValue;
        alert("Image upload failed");
      });
    }

    document.addEventListener("change", onChange, true);
    return () => document.removeEventListener("change", onChange, true);
  }, []);

  return null;
}
