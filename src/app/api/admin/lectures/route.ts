import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function parseFormData(formData: FormData) {
  return {
    id: String(formData.get("id") ?? "").trim(),
    courseId: String(formData.get("courseId") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    liveSessionUrl: String(formData.get("liveSessionUrl") ?? "").trim() || null,
    videoUrl: String(formData.get("videoUrl") ?? "").trim() || null,
    hlsUrl: String(formData.get("hlsUrl") ?? "").trim() || null,
    position: Number(formData.get("position") ?? 0) || 0,
    isPreview: String(formData.get("isPreview") ?? "false") === "true",
    action: String(formData.get("action") ?? "update").trim(),
  };
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return NextResponse.json({ success: false }, { status: 403 });

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      const action = body.action;
      const ids: string[] = body.ids || [];

      if (action === "bulk") {
        const updates: { id: string; title?: string; position?: number; liveSessionUrl?: string | null }[] = body.updates || [];
        await prisma.$transaction(
          updates.map((update) => prisma.lecture.update({
            where: { id: update.id },
            data: {
              title: update.title ?? undefined,
              position: update.position ?? undefined,
              liveSessionUrl: update.liveSessionUrl ?? undefined,
            },
          })),
        );
        return NextResponse.json({ success: true });
      }

      if (action === "bulkPublish") {
        await prisma.lecture.updateMany({ where: { id: { in: ids } }, data: { isPreview: false } });
        return NextResponse.json({ success: true });
      }

      if (action === "bulkUnpublish") {
        await prisma.lecture.updateMany({ where: { id: { in: ids } }, data: { isPreview: true } });
        return NextResponse.json({ success: true });
      }

      if (action === "bulkDelete") {
        await prisma.lecture.deleteMany({ where: { id: { in: ids } } });
        return NextResponse.json({ success: true });
      }

      if (action === "bulkRestore") {
        const items = Array.isArray(body.items) ? body.items : [];
        if (items.length === 0) return NextResponse.json({ success: true });

        const firstCourse = await prisma.course.findFirst({ select: { id: true } });
        const courseId = body.courseId ?? firstCourse?.id;
        const course = courseId ? await prisma.course.findUnique({ where: { id: courseId }, include: { modules: { orderBy: { position: "asc" } } } }) : null;

        let fallbackModuleId = course?.modules[0]?.id ?? null;
        if (!fallbackModuleId && courseId) {
          const createdModule = await prisma.module.create({
            data: { courseId, title: "Module 1", position: 1 },
          });
          fallbackModuleId = createdModule.id;
        }

        await prisma.$transaction(
          items.map((item: {
            moduleId?: string | null;
            title?: string | null;
            position?: number | null;
            liveSessionUrl?: string | null;
            videoUrl?: string | null;
            hlsUrl?: string | null;
            isPreview?: boolean | null;
          }) => {
            const moduleId = item.moduleId || fallbackModuleId;
            if (!moduleId) {
              throw new Error("Cannot restore lecture without a module id");
            }

            return prisma.lecture.create({
              data: {
                moduleId,
                title: item.title || "Untitled lecture",
                position: item.position ?? 0,
                liveSessionUrl: item.liveSessionUrl ?? null,
                videoUrl: item.videoUrl ?? item.hlsUrl ?? null,
                hlsUrl: item.hlsUrl ?? item.videoUrl ?? null,
                isPreview: Boolean(item.isPreview),
              },
            });
          }),
        );

        return NextResponse.json({ success: true });
      }
    }

    const formData = await request.formData();
    const payload = parseFormData(formData);

    if (payload.action === "create") {
      if (!payload.courseId) return NextResponse.json({ success: false, message: "Course id required" }, { status: 400 });

      const course = await prisma.course.findUnique({ where: { id: payload.courseId }, include: { modules: { orderBy: { position: "asc" } } } });
      if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });

      let moduleId = course.modules && course.modules.length > 0 ? course.modules[0].id : undefined;
      if (!moduleId) {
        const mod = await prisma.module.create({ data: { courseId: payload.courseId, title: "Module 1", position: 1 } });
        moduleId = mod.id;
      }

      await prisma.lecture.create({
        data: {
          moduleId,
          title: payload.title || "Untitled lecture",
          position: payload.position || 0,
          liveSessionUrl: payload.liveSessionUrl,
          videoUrl: payload.videoUrl ?? payload.hlsUrl ?? null,
          hlsUrl: payload.hlsUrl ?? payload.videoUrl ?? null,
          isPreview: payload.isPreview,
        },
      });

      return NextResponse.redirect(new URL(`/admin/courses/${payload.courseId}/lectures`, request.url));
    }

    if (payload.action === "bulk") {
      const json = await request.json().catch(() => ({}));
      const updates: { id: string; title?: string; position?: number; liveSessionUrl?: string | null }[] = json.updates || [];
      await prisma.$transaction(
        updates.map((u) => prisma.lecture.update({
          where: { id: u.id },
          data: { title: u.title ?? undefined, position: u.position ?? undefined, liveSessionUrl: u.liveSessionUrl ?? undefined },
        })),
      );

      return NextResponse.json({ success: true });
    }

    if (!payload.id) return NextResponse.json({ success: false, message: "Lecture id required" }, { status: 400 });

    await prisma.lecture.update({
      where: { id: payload.id },
      data: {
        title: payload.title || undefined,
        liveSessionUrl: payload.liveSessionUrl,
        videoUrl: payload.videoUrl ?? undefined,
        hlsUrl: payload.hlsUrl ?? undefined,
      },
    });

    return NextResponse.redirect(new URL(`/admin/courses/${payload.courseId}/lectures`, request.url));
  } catch (error) {
    console.error("Lecture save error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
