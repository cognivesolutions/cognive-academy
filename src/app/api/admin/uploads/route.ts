import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "course-thumbnails");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const width = Number(formData.get("width") ?? 1200);
    const height = Number(formData.get("height") ?? 800);

    if (!file) return NextResponse.json({ success: false, message: "No file" }, { status: 400 });

    await mkdir(UPLOAD_DIR, { recursive: true });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const outPath = path.join(UPLOAD_DIR, filename);

    // resize using sharp
    await sharp(buffer).resize(width, height, { fit: "cover" }).jpeg({ quality: 80 }).toFile(outPath);

    return NextResponse.json({ success: true, url: `/uploads/course-thumbnails/${filename}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}
