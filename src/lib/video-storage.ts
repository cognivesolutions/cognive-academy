import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type UploadedVideoResult = {
  url: string;
  provider: "vercel-blob" | "local";
  fileName: string;
};

const sanitizeFileName = (fileName: string) => {
  const safe = fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

  return safe || `video-${Date.now()}`;
};

export async function uploadRecordedVideo(file: File): Promise<UploadedVideoResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? process.env.VERCEL_BLOB_READ_WRITE_TOKEN;

  if (token) {
    try {
      const { put } = await import("@vercel/blob");
      const fileName = sanitizeFileName(file.name || `recording-${Date.now()}.mp4`);
      const result = await put(`course-videos/${fileName}`, file, {
        access: "public",
      });

      return {
        url: result.url,
        provider: "vercel-blob",
        fileName,
      };
    } catch (error) {
      console.warn("Vercel Blob upload failed, falling back to local storage.", error);
    }
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "course-videos");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = sanitizeFileName(file.name || `recording-${Date.now()}.mp4`);
  const uploadPath = path.join(uploadDir, fileName);
  await writeFile(uploadPath, buffer);

  return {
    url: `/uploads/course-videos/${fileName}`,
    provider: "local",
    fileName,
  };
}
