import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function parseFormData(formData: FormData) {
  return {
    id: String(formData.get("id") ?? "").trim(),
    courseId: String(formData.get("courseId") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    liveSessionUrl: String(formData.get("liveSessionUrl") ?? "").trim() || null,
    position: Number(formData.get("position") ?? 0) || 0,
    isPreview: String(formData.get("isPreview") ?? "false") === "true",
    action: String(formData.get("action") ?? "update").trim(),
  };
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return NextResponse.json({ success: false }, { status: 403 });

  try {
    const formData = await request.formData();
    const payload = parseFormData(formData);

    if (payload.action === "create") {
      if (!payload.courseId) return NextResponse.json({ success: false, message: "Course id required" }, { status: 400 });

      // create a new lecture in the first module for the course if available
      const course = await prisma.course.findUnique({ where: { id: payload.courseId }, include: { modules: { orderBy: { position: "asc" } } } });
      if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });

      let moduleId = course.modules && course.modules.length > 0 ? course.modules[0].id : undefined;
      if (!moduleId) {
        // create a default module
        const mod = await prisma.module.create({ data: { courseId: payload.courseId, title: "Module 1", position: 1 } });
        moduleId = mod.id;
      }

      await prisma.lecture.create({ data: { moduleId, title: payload.title || "Untitled lecture", position: payload.position || 0, liveSessionUrl: payload.liveSessionUrl, isPreview: payload.isPreview } });

      return NextResponse.redirect(new URL(`/admin/courses/${payload.courseId}/lectures`, request.url));
    }
    // handle bulk updates
    if (payload.action === "bulk") {
      // payload.updates is expected to be provided in JSON body when action=bulk
      const json = await request.json();
      const updates: { id: string; title?: string; position?: number; liveSessionUrl?: string | null }[] = json.updates || [];
      // perform updates in a transaction
      await prisma.$transaction(
        updates.map((u) => prisma.lecture.update({ where: { id: u.id }, data: { title: u.title ?? undefined, position: u.position ?? undefined, liveSessionUrl: u.liveSessionUrl ?? undefined } }))
      );

      return NextResponse.json({ success: true });
    }

    if (!payload.id) return NextResponse.json({ success: false, message: "Lecture id required" }, { status: 400 });

    await prisma.lecture.update({ where: { id: payload.id }, data: { title: payload.title || undefined, liveSessionUrl: payload.liveSessionUrl } });

    return NextResponse.redirect(new URL(`/admin/courses/${payload.courseId}/lectures`, request.url));
  } catch (error) {
    console.error("Lecture save error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
