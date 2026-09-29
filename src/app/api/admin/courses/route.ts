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
  const rawIsPublished = formData.get("isPublished");

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
    isPublished: rawIsPublished === null ? undefined : String(rawIsPublished) === "true",
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
    // DEBUG: log incoming request info to help diagnose 404s from client
    try {
      const ct = request.headers.get("content-type");
      console.log("[api/admin/courses] POST called", { url: request.url, contentType: ct, user: session?.user?.id });
    } catch (e) {
      console.error("[api/admin/courses] debug log failed", e);
    }
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const json = await request.json().catch(() => null);
      if (json && typeof json.action === "string") {
        if (json.action === "bulkPublish" && Array.isArray(json.ids)) {
          await prisma.course.updateMany({ where: { id: { in: json.ids } }, data: { isPublished: true } });
          return NextResponse.json({ success: true });
        }
        if (json.action === "bulkUnpublish" && Array.isArray(json.ids)) {
          await prisma.course.updateMany({ where: { id: { in: json.ids } }, data: { isPublished: false } });
          return NextResponse.json({ success: true });
        }
        if (json.action === "bulkDelete" && Array.isArray(json.ids)) {
          const courses = await prisma.course.findMany({ where: { id: { in: json.ids } } });
          for (const c of courses) {
            await deleteUploadedFile(c.imageUrl);
          }
          await prisma.course.deleteMany({ where: { id: { in: json.ids } } });
          return NextResponse.json({ success: true });
        }
        if (json.action === "bulkUpdate" && Array.isArray(json.updates)) {
          const prepared = await Promise.all(
            json.updates.map(async (update: any) => {
              const existing = await prisma.course.findUnique({ where: { id: update.id } });
              if (!existing) return null;

              return {
                update,
                existing,
              };
            }),
          );

          const valid = prepared.filter((entry): entry is { update: any; existing: any } => entry !== null);
          if (valid.length === 0) {
            return NextResponse.json({ success: true, updated: 0 });
          }

          await prisma.$transaction(
            valid.map(({ update, existing }) => {
              const nextTitle = update.title || existing.title;
              const nextSlug = update.slug || existing.slug || slugify(nextTitle);
              const nextPreviewUrl = update.previewLectureUrl ?? existing.previewLectureUrl ?? null;

              return prisma.course.update({
                where: { id: update.id },
                data: {
                  title: nextTitle,
                  slug: nextSlug,
                  category: update.category || existing.category,
                  level: update.level || existing.level || "Beginner",
                  price: Number.isFinite(update.price) ? Number(update.price) : existing.price,
                  durationHours: Number.isFinite(update.durationHours) && Number(update.durationHours) > 0 ? Number(update.durationHours) : existing.durationHours,
                  isLive: typeof update.isLive === "boolean" ? update.isLive : existing.isLive,
                  isPublished: typeof update.isPublished === "boolean" ? update.isPublished : existing.isPublished,
                  language: update.language === "hi" ? "hi" : "en",
                  shortDescription: update.shortDescription || existing.shortDescription || nextTitle,
                  description: update.description || existing.description,
                  instructorName: update.instructorName || existing.instructorName,
                  instructorTitle: update.instructorTitle ?? existing.instructorTitle,
                  imageUrl: update.imageUrl || existing.imageUrl || null,
                  previewLectureUrl: nextPreviewUrl,
                },
              });
            }),
          );

          return NextResponse.json({ success: true, updated: valid.length });
        }
      }
    }

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

      return NextResponse.redirect(new URL("/admin?success=Course deleted successfully", request.url), 303);
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
          isPublished: typeof payload.isPublished === "boolean" ? payload.isPublished : existing.isPublished,
          language: payload.language === "hi" ? "hi" : "en",
          shortDescription: payload.shortDescription || existing.shortDescription || nextTitle,
          description: payload.description || existing.description,
          instructorName: payload.instructorName || existing.instructorName,
          instructorTitle: payload.instructorTitle || existing.instructorTitle || null,
          imageUrl: nextFileUrl || existing.imageUrl || null,
          previewLectureUrl: nextPreviewUrl,
        },
      });

      return NextResponse.redirect(new URL("/admin?success=Course updated successfully", request.url), 303);
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
        isPublished: typeof payload.isPublished === "boolean" ? payload.isPublished : false,
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

    return NextResponse.redirect(
      new URL(
        "/admin?success=Course%20saved%20successfully.%20This%20course%20will%20appear%20under%20Unpublished%20until%20you%20publish%20it.",
        request.url,
      ),
      303,
    );
  } catch (error) {
    console.error("[api/admin/courses] request failed:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong while creating the course.",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const params = url.searchParams;

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? undefined;
  const published = params.get("published");
  const limit = Math.min(Math.max(Number(params.get("limit") ?? params.get("pageSize") ?? 20), 1), 100);
  const cursor = params.get("cursor") ?? undefined;
  const sort = params.get("sort") ?? "createdAt";
  const dir = (params.get("dir") ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";

  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (published !== null) {
    if (published === "true" || published === "1") where.isPublished = true;
    else if (published === "false" || published === "0") where.isPublished = false;
  }

  const orderBy: any = {};
  if (sort === "price") orderBy.price = dir;
  else if (sort === "title") orderBy.title = dir;
  else orderBy.createdAt = dir;

  const findArgs: any = {
    where,
    orderBy,
    take: limit,
    select: {
      id: true,
      title: true,
      category: true,
      isLive: true,
      language: true,
      price: true,
      slug: true,
      imageUrl: true,
      shortDescription: true,
      isPublished: true,
    },
  };

  if (cursor) {
    findArgs.cursor = { id: cursor };
    findArgs.skip = 1;
  }

  const items = await prisma.course.findMany(findArgs);

  const nextCursor = items.length ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor });
}
