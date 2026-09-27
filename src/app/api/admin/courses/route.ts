import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "course-thumbnails");

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || `course-${Date.now()}`;
}

async function deleteUploadedFile(imageUrl?: string | null) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) {
    return;
  }

  const filePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));

  try {
    await unlink(filePath);
  } catch {
    // ignore missing file
  }
}

async function saveUploadedImage(file: File | null, fallbackUrl?: string | null) {
  if (!file || file.size === 0) {
    return (fallbackUrl ?? "") || null;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const extension = (file.name.split(".").pop() || "png").toLowerCase();
  const safeFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const filePath = path.join(UPLOAD_DIR, safeFileName);

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(arrayBuffer));

  return `/uploads/course-thumbnails/${safeFileName}`;
}

function parseForm(formData: FormData) {
  return {
    action: String(formData.get("action") ?? "create"),
    id: String(formData.get("id") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    level: String(formData.get("level") ?? "Beginner").trim(),
    price: Number(formData.get("price") ?? 0),
    durationHours: Number(formData.get("durationHours") ?? 0),
    language: String(formData.get("language") ?? "en").trim().toLowerCase(),
    isLive: String(formData.get("isLive") ?? "false") === "true",
    shortDescription: String(formData.get("shortDescription") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    instructorName: String(formData.get("instructorName") ?? "").trim(),
    instructorTitle: String(formData.get("instructorTitle") ?? "").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim(),
    previewLectureUrl: String(formData.get("previewLectureUrl") ?? "").trim(),
    imageFile: formData.get("imageFile") instanceof File ? (formData.get("imageFile") as File) : null,
  };
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const payload = parseForm(formData);

    if (payload.action === "delete") {
      if (!payload.id) {
        return NextResponse.json({ success: false, message: "Course id is required for deletion." }, { status: 400 });
      }

      const existing = await prisma.course.findUnique({ where: { id: payload.id } });
      if (!existing) {
        return NextResponse.json({ success: false, message: "Course not found." }, { status: 404 });
      }

      await deleteUploadedFile(existing.imageUrl);
      await prisma.course.delete({ where: { id: payload.id } });

      return NextResponse.redirect(new URL("/admin?success=Course deleted successfully", request.url));
    }

    // JSON bulk actions
    // expect { action: 'bulkPublish'|'bulkUnpublish'|'bulkDelete', ids: [] }
    try {
      const json = await request.json().catch(() => null);
      if (json && typeof json.action === "string" && Array.isArray(json.ids)) {
        if (json.action === "bulkPublish") {
          await prisma.course.updateMany({ where: { id: { in: json.ids } }, data: { isPublished: true } });
          return NextResponse.json({ success: true });
        }
        if (json.action === "bulkUnpublish") {
          await prisma.course.updateMany({ where: { id: { in: json.ids } }, data: { isPublished: false } });
          return NextResponse.json({ success: true });
        }
        if (json.action === "bulkDelete") {
          // delete images for the courses first
          const courses = await prisma.course.findMany({ where: { id: { in: json.ids } } });
          for (const c of courses) {
            await deleteUploadedFile(c.imageUrl);
          }
          await prisma.course.deleteMany({ where: { id: { in: json.ids } } });
          return NextResponse.json({ success: true });
        }
      }
    } catch (e) {
      // ignore JSON parse errors and continue with form handling
    }

    if (payload.action === "update") {
      if (!payload.id) {
        return NextResponse.json({ success: false, message: "Course id is required for update." }, { status: 400 });
      }

      const existing = await prisma.course.findUnique({ where: { id: payload.id } });
      if (!existing) {
        return NextResponse.json({ success: false, message: "Course not found." }, { status: 404 });
      }

      const nextFileUrl = await saveUploadedImage(payload.imageFile, payload.imageUrl || existing.imageUrl);
      if (payload.imageFile && existing.imageUrl && existing.imageUrl.startsWith("/uploads/")) {
        await deleteUploadedFile(existing.imageUrl);
      }

      const nextTitle = payload.title || existing.title;
      const nextSlug = payload.slug || existing.slug || slugify(nextTitle);
      const nextPreviewUrl = payload.previewLectureUrl || existing.previewLectureUrl || null;

      await prisma.course.update({
        where: { id: payload.id },
        data: {
          title: nextTitle,
          slug: nextSlug,
          category: payload.category || existing.category,
          level: payload.level || existing.level,
          price: Number.isFinite(payload.price) ? payload.price : existing.price,
          durationHours: Number.isFinite(payload.durationHours) && payload.durationHours > 0 ? payload.durationHours : existing.durationHours,
          isLive: payload.isLive,
          language: payload.language === "hi" ? "hi" : "en",
          shortDescription: payload.shortDescription || existing.shortDescription || nextTitle,
          description: payload.description || existing.description,
          instructorName: payload.instructorName || existing.instructorName,
          instructorTitle: payload.instructorTitle || existing.instructorTitle || null,
          imageUrl: nextFileUrl || existing.imageUrl || null,
          previewLectureUrl: nextPreviewUrl,
        },
      });

      return NextResponse.redirect(new URL("/admin?success=Course updated successfully", request.url));
    }

    const rawTitle = payload.title;
    const category = payload.category;
    const description = payload.description;
    const instructorName = payload.instructorName;

    if (!rawTitle || !category || !description || !instructorName) {
      return NextResponse.json(
        { success: false, message: "Title, category, description, and instructor name are required." },
        { status: 400 },
      );
    }

    const baseSlug = payload.slug || rawTitle;
    let slug = slugify(baseSlug);
    let counter = 1;

    while (true) {
      const existing = await prisma.course.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${slugify(baseSlug)}-${counter}`;
      counter += 1;
    }

    const finalImageUrl = await saveUploadedImage(payload.imageFile, payload.imageUrl || null);

    await prisma.course.create({
      data: {
        title: rawTitle,
        slug,
        category,
        level: payload.level || "Beginner",
        price: Number.isFinite(payload.price) ? payload.price : 0,
        durationHours: Number.isFinite(payload.durationHours) && payload.durationHours > 0 ? payload.durationHours : null,
        currency: "INR",
        featured: false,
        isPublished: true,
        isLive: payload.isLive,
        language: payload.language === "hi" ? "hi" : "en",
        imageUrl: finalImageUrl,
        instructorName,
        instructorTitle: payload.instructorTitle || null,
        shortDescription: payload.shortDescription || description.slice(0, 180),
        description,
        previewLectureUrl: payload.previewLectureUrl || null,
      },
    });

    return NextResponse.redirect(new URL("/admin?success=Course created successfully", request.url));
  } catch (error) {
    console.error("Course creation error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong while creating the course." },
      { status: 500 },
    );
  }
}
