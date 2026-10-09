"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ProfileUser {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  role: string;
  emailNotifications: boolean;
  courseReminders: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export function ProfileEditor({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const { update } = useSession();
  const cropRef = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showCropEditor, setShowCropEditor] = useState(false);
  const [crop, setCrop] = useState({ x: 0.15, y: 0.15, size: 0.7 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications ?? true);
  const [courseReminders, setCourseReminders] = useState(user.courseReminders ?? true);
  const [marketingEmails, setMarketingEmails] = useState(user.marketingEmails ?? false);
  const [securityAlerts, setSecurityAlerts] = useState(user.securityAlerts ?? true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const displayName = isEditing ? (user.name ?? "") : (name || user.name || "");
  const displayAvatarUrl = isEditing ? (user.avatarUrl ?? "") : (avatarUrl || user.avatarUrl || "");

  const initials = useMemo(() => {
    const label = displayName?.trim() || user.email || "S";
    return label.charAt(0).toUpperCase();
  }, [displayName, user.email]);

  const profileCompletion = useMemo(() => {
    let score = 35;
    if (name.trim()) score += 20;
    if (phone.trim()) score += 20;
    if (bio.trim()) score += 20;
    if (user.email) score += 5;
    return Math.min(score, 100);
  }, [bio, name, phone, user.email]);

  const notificationOptions = [
    { key: "emailNotifications", label: "Email notifications", description: "Course updates and platform announcements", value: emailNotifications, onChange: setEmailNotifications },
    { key: "courseReminders", label: "Course reminders", description: "Upcoming live sessions and deadlines", value: courseReminders, onChange: setCourseReminders },
    { key: "marketingEmails", label: "Marketing emails", description: "New courses and promotions", value: marketingEmails, onChange: setMarketingEmails },
    { key: "securityAlerts", label: "Security alerts", description: "Important account and sign-in updates", value: securityAlerts, onChange: setSecurityAlerts },
  ];

  const passwordChecks = [
    {
      label: "At least 8 characters",
      valid: newPassword.length >= 8,
    },
    {
      label: "Mix of letters, numbers, and symbols",
      valid:
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /\d/.test(newPassword) &&
        /[^A-Za-z0-9]/.test(newPassword),
    },
  ];

  const confirmPasswordWarning = confirmPassword.length > 0 && confirmPassword !== newPassword;

  useEffect(() => {
    if (currentPassword || newPassword || confirmPassword) {
      setPasswordError(null);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  useEffect(() => {
    if (!showCurrentPassword) return;

    const timer = window.setTimeout(() => setShowCurrentPassword(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showCurrentPassword]);

  useEffect(() => {
    if (!showNewPassword) return;

    const timer = window.setTimeout(() => setShowNewPassword(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showNewPassword]);

  useEffect(() => {
    if (!showConfirmPassword) return;

    const timer = window.setTimeout(() => setShowConfirmPassword(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showConfirmPassword]);

  useEffect(() => {
    if (!profileMessage && !accountMessage && !passwordError) return;

    const timer = window.setTimeout(() => {
      if (profileMessage) {
        setProfileMessage(null);
      }
      if (accountMessage) {
        setAccountMessage(null);
      }
      if (passwordError) {
        setPasswordError(null);
      }
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [profileMessage, accountMessage, passwordError]);

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  function handleCropDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!cropRef.current || !isDraggingCrop) return;

    const bounds = cropRef.current.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width;
    const relativeY = (event.clientY - bounds.top) / bounds.height;

    const nextX = clamp(relativeX - crop.size / 2, 0, 1 - crop.size);
    const nextY = clamp(relativeY - crop.size / 2, 0, 1 - crop.size);

    setCrop((current) => ({ ...current, x: nextX, y: nextY }));
  }

  function handleCropPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!cropRef.current) return;

    event.preventDefault();
    setIsDraggingCrop(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    handleCropDrag(event);
  }

  function handleCropPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    handleCropDrag(event);
  }

  function handleCropPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    setIsDraggingCrop(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function createCroppedAvatarFile(file: File, cropArea = crop): Promise<File | null> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        try {
          const maxDimension = Math.min(image.naturalWidth, image.naturalHeight);
          const cropSize = Math.max(1, Math.round(maxDimension * cropArea.size));
          const x = Math.max(0, Math.round(image.naturalWidth * cropArea.x));
          const y = Math.max(0, Math.round(image.naturalHeight * cropArea.y));

          const canvas = document.createElement("canvas");
          canvas.width = 512;
          canvas.height = 512;

          const context = canvas.getContext("2d");
          if (!context) {
            URL.revokeObjectURL(objectUrl);
            resolve(null);
            return;
          }

          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(
            image,
            clamp(x, 0, Math.max(0, image.naturalWidth - cropSize)),
            clamp(y, 0, Math.max(0, image.naturalHeight - cropSize)),
            cropSize,
            cropSize,
            0,
            0,
            512,
            512,
          );

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(objectUrl);
              if (!blob) {
                reject(new Error("Unable to generate the cropped avatar."));
                return;
              }

              resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
            },
            "image/jpeg",
            0.9,
          );
        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to load the selected profile image."));
      };

      image.src = objectUrl;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedBio = bio.trim();

    if (trimmedName.length > 60) {
      setProfileMessage("Name cannot be longer than 60 characters.");
      return;
    }

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setProfileMessage("Please enter a valid email address.");
      return;
    }

    if (trimmedBio.length > 500) {
      setProfileMessage("Bio cannot be longer than 500 characters.");
      return;
    }

    if (trimmedPhone && trimmedPhone.replace(/\D/g, "").length < 10) {
      setProfileMessage("Please enter a valid phone number with at least 10 digits.");
      return;
    }

    setSaving(true);
    setProfileMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", trimmedName);
      formData.append("email", trimmedEmail);
      formData.append("phone", trimmedPhone);
      formData.append("bio", trimmedBio);
      formData.append("notifications", JSON.stringify({
        emailNotifications,
        courseReminders,
        marketingEmails,
        securityAlerts,
      }));

      if (avatarFile) {
        const croppedAvatarFile = await createCroppedAvatarFile(avatarFile);
        if (croppedAvatarFile) {
          formData.append("avatarFile", croppedAvatarFile);
        }
      }

      if (!avatarFile && !avatarUrl && user.avatarUrl) {
        formData.append("removeAvatar", "true");
      }

      const response = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to save profile changes.");
      }

      const nextAvatarUrl = data?.user?.avatarUrl ?? (avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl);

      setIsEditing(false);
      setName(trimmedName);
      setEmail(trimmedEmail);
      setPhone(trimmedPhone);
      setBio(trimmedBio);
      setAvatarUrl(nextAvatarUrl || "");
      setAvatarFile(null);

      if (typeof update === "function") {
        await update({
          name: trimmedName,
          email: trimmedEmail,
          avatarUrl: nextAvatarUrl || null,
          image: nextAvatarUrl || null,
          user: {
            name: trimmedName,
            email: trimmedEmail,
            image: nextAvatarUrl || null,
          },
        });
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("cognive-profile-sync", JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          avatarUrl: nextAvatarUrl || "",
        }));
      }

      router.refresh();
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in your current password, new password, and confirmation.");
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      setPasswordError("New password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    setPasswordError(null);
    setAccountMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
          notifications: {
            emailNotifications,
            courseReminders,
            marketingEmails,
            securityAlerts,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setAccountMessage("Password updated successfully.");
      setPasswordError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update password.";
      const readableMessage = message === "Current password is incorrect"
        ? "The current password you entered is incorrect. Please try again."
        : message;
      setPasswordError(readableMessage);
      setAccountMessage(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleNotificationPreferencesSubmit() {
    setSavingNotifications(true);
    setAccountMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifications: {
            emailNotifications,
            courseReminders,
            marketingEmails,
            securityAlerts,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update notification preferences.");
      }

      setAccountMessage("Notification preferences updated successfully.");
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : "Unable to update notification preferences.");
    } finally {
      setSavingNotifications(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.94))] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] transition-colors duration-300 dark:border-slate-700 dark:bg-[linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(17,24,39,0.9))] dark:shadow-[0_28px_70px_rgba(15,23,42,0.36)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-2xl font-black text-white shadow-[0_16px_32px_rgba(99,102,241,0.28)]">
              {displayAvatarUrl ? (
                <img src={displayAvatarUrl} alt={displayName || user.email} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Profile</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {displayName || "Student"}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">{user.role}</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Account active</span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">{user.email}</span>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.35)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_18px_36px_rgba(99,102,241,0.42)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Edit profile
            </button>
          ) : null}
        </div>

      </div>

      {isEditing ? (
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_42px_rgba(15,23,42,0.28)] sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Edit details</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Update your public profile</h2>
          </div>

          {profileMessage ? (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                profileMessage.includes("success")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
              }`}
            >
              {profileMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-xl font-black text-white">
                {avatarUrl ? <img src={avatarUrl} alt={name || user.email} className="h-full w-full object-cover" /> : initials}
              </div>

              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white">Profile photo</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Upload a clear photo for your student profile.</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500">
                    Upload photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        if (!file) return;
                        setAvatarFile(file);
                        setShowCropEditor(true);
                        setAvatarUrl(URL.createObjectURL(file));
                        setCrop({ x: 0.15, y: 0.15, size: 0.7 });
                      }}
                    />
                  </label>
                  {avatarUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarUrl("");
                        setShowCropEditor(false);
                      }}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                    >
                      Remove photo
                    </button>
                  ) : null}
                </div>

                {avatarFile && showCropEditor ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/80">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Adjust crop</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Drag the square to position your profile photo.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCrop({ x: 0.15, y: 0.15, size: 0.7 })}
                        className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        Reset
                      </button>
                    </div>

                    <div
                      ref={cropRef}
                      onPointerDown={handleCropPointerDown}
                      onPointerMove={handleCropPointerMove}
                      onPointerUp={handleCropPointerUp}
                      onPointerLeave={handleCropPointerUp}
                      className="relative mx-auto aspect-square w-full max-w-[260px] cursor-move overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-800"
                    >
                      <img
                        src={avatarUrl}
                        alt="Selected avatar preview"
                        className="pointer-events-none h-full w-full select-none object-cover"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_calc(100%_-_28px),rgba(15,23,42,0.72)_100%)]" />

                      <div
                        className="pointer-events-none absolute rounded-xl border-2 border-indigo-500 bg-white/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.38)]"
                        style={{
                          left: `${crop.x * 100}%`,
                          top: `${crop.y * 100}%`,
                          width: `${crop.size * 100}%`,
                          height: `${crop.size * 100}%`,
                        }}
                      />
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarUrl(user.avatarUrl ?? "");
                          setShowCropEditor(false);
                        }}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCropEditor(false)}
                        className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Full name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email address"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Phone
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Add your contact number"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <div className="hidden md:block" />
            </div>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Bio
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={4}
                placeholder="Tell us a little about yourself"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name ?? "");
                  setEmail(user.email ?? "");
                  setPhone(user.phone ?? "");
                  setBio(user.bio ?? "");
                  setAvatarUrl(user.avatarUrl ?? "");
                  setAvatarFile(null);
                  setShowCropEditor(false);
                  setProfileMessage(null);
                }}
                className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(99,102,241,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_42px_rgba(15,23,42,0.28)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile details</h2>

            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="text-sm text-slate-500 dark:text-slate-400">Full name</div>
                <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{displayName || "Not provided"}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="text-sm text-slate-500 dark:text-slate-400">Email</div>
                <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{email || user.email}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="text-sm text-slate-500 dark:text-slate-400">Role</div>
                <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{user.role}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="text-sm text-slate-500 dark:text-slate-400">Phone</div>
                <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{phone || "Not added"}</div>
              </div>

              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="text-sm text-slate-500 dark:text-slate-400">Bio</div>
                <div className="mt-2 text-base leading-7 text-slate-900 dark:text-white">
                  {bio || "No bio added yet. Add a short introduction so your profile feels complete."}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_42px_rgba(15,23,42,0.18)]">
            <div className="mb-3 border-b border-slate-200 pb-2.5 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Account</p>
              <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Security & notifications</h2>
            </div>

            <div className="space-y-2.5">
              {accountMessage ? (
                <div
                  className={`rounded-xl border px-3 py-2 text-xs ${
                    accountMessage.includes("success")
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                      : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                  }`}
                >
                  {accountMessage}
                </div>
              ) : null}

              <form onSubmit={handlePasswordSubmit} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="mb-2 text-sm font-medium text-slate-900 dark:text-white">Change password</div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Current password
                    <div className="relative mt-1">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 pr-9 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-500/20"
                      />
                      <button
                        type="button"
                        aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                        onClick={() => setShowCurrentPassword((currentValue) => !currentValue)}
                        className="absolute inset-y-0 right-2.5 flex items-center text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        {showCurrentPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </label>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      New password
                      <div className="relative mt-1">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 pr-9 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-500/20"
                        />
                        <button
                          type="button"
                          aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                          onClick={() => setShowNewPassword((currentValue) => !currentValue)}
                          className="absolute inset-y-0 right-2.5 flex items-center text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          {showNewPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </label>

                    <label className="block text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Confirm
                      <div className="relative mt-1">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 pr-9 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-500/20"
                        />
                        <button
                          type="button"
                          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                          onClick={() => setShowConfirmPassword((currentValue) => !currentValue)}
                          className="absolute inset-y-0 right-2.5 flex items-center text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </label>
                  </div>

                  {newPassword.length > 0 ? (
                    <div className="grid gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900/80">
                      {passwordChecks.map((check) => (
                        <div key={check.label} className="flex items-center gap-2 text-[11px]">
                          <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-bold ${check.valid ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500"}`}>
                            {check.valid ? "✓" : "•"}
                          </span>
                          <span className={check.valid ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {(confirmPasswordWarning || passwordError) ? (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-[10px] font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">!</span>
                      {passwordError ?? "Passwords do not match."}
                    </div>
                  ) : null}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_22px_rgba(99,102,241,0.28)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_12px_26px_rgba(99,102,241,0.36)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? "Saving..." : "Update password"}
                    </button>
                  </div>
                </div>
              </form>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="text-sm font-medium text-slate-900 dark:text-white">Notification preferences</div>
                <div className="mt-2 space-y-1.5">
                  {notificationOptions.map((option) => (
                    <label key={option.key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-2.5 py-2 dark:border-slate-700 dark:bg-slate-900/80">
                      <div>
                        <div className="text-xs font-medium text-slate-900 dark:text-white">{option.label}</div>
                        <div className="mt-0.5 text-[9px] text-slate-500 dark:text-slate-400">{option.description}</div>
                      </div>

                      <button
                        type="button"
                        aria-label={option.label}
                        onClick={() => option.onChange(!option.value)}
                        className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition ${option.value ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition ${option.value ? "translate-x-4.5" : "translate-x-1"}`}
                        />
                      </button>
                    </label>
                  ))}
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNotificationPreferencesSubmit}
                    disabled={savingNotifications}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_22px_rgba(99,102,241,0.28)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_12px_26px_rgba(99,102,241,0.36)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingNotifications ? "Saving..." : "Save preferences"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
