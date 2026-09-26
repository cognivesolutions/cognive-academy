import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const bio = typeof body?.bio === "string" ? body.bio.trim() : "";

    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
    const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

    const notificationSettings =
      body && typeof body === "object" && "notifications" in body && body.notifications && typeof body.notifications === "object"
        ? body.notifications
        : null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentPassword || newPassword || confirmPassword) {
      if (!user.passwordHash) {
        return NextResponse.json({ error: "No password set for this account" }, { status: 400 });
      }

      const validCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!validCurrentPassword) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "New password and confirmation do not match" }, { status: 400 });
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

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
        phone: phone || null,
        bio: bio || null,
        ...(nextPasswordHash ? { passwordHash: nextPasswordHash } : {}),
        ...nextNotificationSettings,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
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
    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 });
  }
}
