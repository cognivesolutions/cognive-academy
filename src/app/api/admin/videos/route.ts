import { NextResponse } from "next/server";

import { uploadRecordedVideo } from "@/lib/video-storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "No video file was provided." }, { status: 400 });
    }

    const upload = await uploadRecordedVideo(file);

    return NextResponse.json({
      success: true,
      url: upload.url,
      provider: upload.provider,
      fileName: upload.fileName,
    });
  } catch (error) {
    console.error("Video upload failed:", error);
    return NextResponse.json({ success: false, message: "Video upload failed." }, { status: 500 });
  }
}
