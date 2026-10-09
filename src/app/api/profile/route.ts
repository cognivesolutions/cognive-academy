import { mkdir, unlink } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const AVATAR_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "profile-avatars");

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

async function saveAvatar(file: File | null, fallbackUrl?: string | null) {
  if (!file || file.size === 0) {
    return fallbackUrl ?? null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed for profile avatars.");
  }

  await mkdir(AVATAR_UPLOAD_DIR, { recursive: true });

  const safeFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
  const filePath = path.join(AVATAR_UPLOAD_DIR, safeFileName);

  const arrayBuffer = await file.arrayBuffer();
  await sharp(Buffer.from(arrayBuffer))
    .rotate()
    .resize(512, 512, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(filePath);

  return `/uploads/profile-avatars/${safeFileName}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    let name = "";
    let email = "";
    let phone = "";
    let bio = "";
    let avatarFile: File | null = null;
    let removeAvatar = false;
    let currentPassword = "";
    let newPassword = "";
    let confirmPassword = "";
    let notificationSettings = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = String(formData.get("name") ?? "").trim();
      email = String(formData.get("email") ?? "").trim();
      phone = String(formData.get("phone") ?? "").trim();
      bio = String(formData.get("bio") ?? "").trim();
      removeAvatar = String(formData.get("removeAvatar") ?? "false") === "true";
      currentPassword = String(formData.get("currentPassword") ?? "").trim();
      newPassword = String(formData.get("newPassword") ?? "").trim();
      confirmPassword = String(formData.get("confirmPassword") ?? "").trim();
      const rawNotifications = formData.get("notifications");
      if (rawNotifications && typeof rawNotifications === "string") {
        try {
          notificationSettings = JSON.parse(rawNotifications);
        } catch {
          notificationSettings = null;
        }
      }
      const fileEntry = formData.get("avatarFile");
      if (fileEntry instanceof File && fileEntry.size > 0) {
        avatarFile = fileEntry;
      }
    } else {
      const body = await request.json();
      name = typeof body?.name === "string" ? body.name.trim() : "";
      email = typeof body?.email === "string" ? body.email.trim() : "";
      phone = typeof body?.phone === "string" ? body.phone.trim() : "";
      bio = typeof body?.bio === "string" ? body.bio.trim() : "";
      currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
      newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
      confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";
      removeAvatar = Boolean(body?.removeAvatar);
      notificationSettings = body && typeof body === "object" && "notifications" in body && body.notifications && typeof body.notifications === "object" ? body.notifications : null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        recentPasswordHashes: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const normalizedEmail = email.toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    if (normalizedEmail !== user.email.toLowerCase()) {
      const emailOwner = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (emailOwner && emailOwner.id !== user.id) {
        return NextResponse.json({ error: "This email is already in use by another account" }, { status: 409 });
      }
    }

    if (currentPassword || newPassword || confirmPassword) {
      if (!user.passwordHash) {
        return NextResponse.json({ error: "No password set for this account" }, { status: 400 });
      }

      const validCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!validCurrentPassword) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      if (!passwordRegex.test(newPassword)) {
        return NextResponse.json({ error: "New password must be at least 8 characters and include uppercase, lowercase, number, and special character." }, { status: 400 });
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "New password and confirmation do not match" }, { status: 400 });
      }

      const recentPasswordHashes = [user.passwordHash, ...(user.recentPasswordHashes ?? [])].filter((hash): hash is string => Boolean(hash));
      const hasRecentPasswordMatch = await Promise.all(
        recentPasswordHashes.map((hash) => bcrypt.compare(newPassword, hash)),
      );

      if (hasRecentPasswordMatch.some(Boolean)) {
        return NextResponse.json({ error: "Please choose a new password you have not used in the last 3 password updates." }, { status: 400 });
      }
    }

    const nextPasswordHash = newPassword ? await bcrypt.hash(newPassword, 10) : undefined;
    const nextNotificationSettings = notificationSettings
      ? {
          emailNotifications: Boolean(notificationSettings.emailNotifications),
          courseReminders: Boolean(notificationSettings.courseReminders),
          marketingEmails: Boolean(notificationSettings.marketingEmails),
          securityAlerts: Boolean(notificationSettings.securityAlerts),
        }
      : {};

    let nextAvatarUrl = user.avatarUrl ?? null;
    if (removeAvatar) {
      await deleteUploadedFile(user.avatarUrl);
      nextAvatarUrl = null;
    } else if (avatarFile) {
      const savedUrl = await saveAvatar(avatarFile, user.avatarUrl ?? null);
      if (savedUrl && user.avatarUrl && user.avatarUrl.startsWith("/uploads/")) {
        await deleteUploadedFile(user.avatarUrl);
      }
      nextAvatarUrl = savedUrl;
    }

    const nextRecentPasswordHashes = nextPasswordHash
      ? [user.passwordHash, ...(user.recentPasswordHashes ?? [])].filter((hash): hash is string => Boolean(hash)).slice(0, 3)
      : (user.recentPasswordHashes ?? []);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: normalizedEmail,
        name: name || null,
        phone: phone || null,
        bio: bio || null,
        avatarUrl: nextAvatarUrl,
        ...(nextPasswordHash ? { passwordHash: nextPasswordHash, recentPasswordHashes: nextRecentPasswordHashes } : {}),
        ...nextNotificationSettings,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        avatarUrl: true,
        role: true,
        emailNotifications: true,
        courseReminders: true,
        marketingEmails: true,
        securityAlerts: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);

    const message = error instanceof Error ? error.message : "Unknown database error";
    const shouldExposeError = process.env.NODE_ENV !== "production" || process.env.ALLOW_PROFILE_DEBUG_ERRORS === "true";

    return NextResponse.json(
      shouldExposeError
        ? {
            error: message,
            details: message,
          }
        : { error: "Unable to update profile" },
      { status: 500 },
    );
  }
}
