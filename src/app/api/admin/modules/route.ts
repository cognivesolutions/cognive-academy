import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getNextModuleBusinessId } from "@/lib/id-generator";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return NextResponse.json({ success: false }, { status: 403 });

  try {
    const form = await req.formData();
    const action = String(form.get("action") ?? "create");
    const courseId = String(form.get("courseId") ?? "").trim();
    const id = String(form.get("id") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    const position = Number(form.get("position") ?? 0) || 0;

    if (action === "create") {
      if (!courseId || !title) return NextResponse.json({ success: false, message: "Missing" }, { status: 400 });

      const moduleId = await getNextModuleBusinessId(prisma);

      const mod = await prisma.module.create({ data: { moduleId, courseId, title, position } });
      return NextResponse.redirect(new URL(`/admin/courses/${courseId}/lectures?success=Module created`, req.url));
    }

    if (action === "update") {
      if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });
      await prisma.module.update({ where: { id }, data: { title: title || undefined, position: position || undefined } });
      return NextResponse.redirect(new URL(`/admin/courses/${courseId}/lectures?success=Module updated`, req.url));
    }

    if (action === "delete") {
      if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });
      await prisma.module.delete({ where: { id } });
      return NextResponse.redirect(new URL(`/admin/courses/${courseId}/lectures?success=Module deleted`, req.url));
    }

    // support batch update via JSON
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      if (body.action === "batchUpdate") {
        const updates: { id: string; title?: string; position?: number }[] = body.updates || [];
        await prisma.$transaction(updates.map((u) => prisma.module.update({ where: { id: u.id }, data: { title: u.title ?? undefined, position: u.position ?? undefined } })));
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
