"use client";

import { useMemo, useState } from "react";

interface ProfileUser {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  bio?: string | null;
  role: string;
  emailVerifiedAt?: Date | string | null;
  phoneVerifiedAt?: Date | string | null;
  emailNotifications: boolean;
  courseReminders: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export function ProfileEditor({ user }: { user: ProfileUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications ?? true);
  const [courseReminders, setCourseReminders] = useState(user.courseReminders ?? true);
  const [marketingEmails, setMarketingEmails] = useState(user.marketingEmails ?? false);
  const [securityAlerts, setSecurityAlerts] = useState(user.securityAlerts ?? true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(Boolean(user.emailVerifiedAt));
  const [phoneVerified, setPhoneVerified] = useState(Boolean(user.phoneVerifiedAt));
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const initials = useMemo(() => {
    const label = name?.trim() || user.email || "S";
    return label.charAt(0).toUpperCase();
  }, [name, user.email]);

  const profileCompletion = useMemo(() => {
    let score = 35;
    if (name.trim()) score += 20;
    if (phone.trim()) score += 20;
    if (bio.trim()) score += 20;
    if (user.email) score += 5;
    return Math.min(score, 100);
  }, [bio, name, phone, user.email]);

  const accountOverview = [
    { label: "Account status", value: "Active" },
    { label: "Role", value: user.role },
    { label: "Email verification", value: emailVerified ? "Verified" : "Pending" },
  ];

  async function handleSendEmailOtp() {
    setEmailOtpLoading(true);
    setVerificationMessage(null);

    try {
      const response = await fetch("/api/auth/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to send email OTP.");
      }

      setVerificationMessage("A verification code has been sent to your email.");
    } catch (error) {
      setVerificationMessage(error instanceof Error ? error.message : "Unable to send email OTP.");
    } finally {
      setEmailOtpLoading(false);
    }
  }

  async function handleVerifyEmailOtp() {
    if (!emailOtpCode.trim()) {
      setVerificationMessage("Please enter the email verification code.");
      return;
    }

    setEmailOtpLoading(true);
    setVerificationMessage(null);

    try {
      const response = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, code: emailOtpCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to verify email OTP.");
      }

      setEmailVerified(true);
      setEmailOtpCode("");
      setVerificationMessage("Email verified successfully.");
    } catch (error) {
      setVerificationMessage(error instanceof Error ? error.message : "Unable to verify email OTP.");
    } finally {
      setEmailOtpLoading(false);
    }
  }

  async function handleSendPhoneOtp() {
    const normalizedPhone = (phone || user.phone || "").trim();

    if (!normalizedPhone) {
      setVerificationMessage("Please add a mobile number before sending a verification code.");
      return;
    }

    setPhoneOtpLoading(true);
    setVerificationMessage(null);

    try {
      const response = await fetch("/api/auth/send-mobile-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to send mobile OTP.");
      }

      setVerificationMessage("A verification code has been sent to your mobile number.");
    } catch (error) {
      setVerificationMessage(error instanceof Error ? error.message : "Unable to send mobile OTP.");
    } finally {
      setPhoneOtpLoading(false);
    }
  }

  async function handleVerifyPhoneOtp() {
    const normalizedPhone = (phone || user.phone || "").trim();

    if (!normalizedPhone) {
      setVerificationMessage("Please add a mobile number before verifying it.");
      return;
    }

    if (!phoneOtpCode.trim()) {
      setVerificationMessage("Please enter the mobile verification code.");
      return;
    }

    setPhoneOtpLoading(true);
    setVerificationMessage(null);

    try {
      const response = await fetch("/api/auth/verify-mobile-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, code: phoneOtpCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to verify mobile OTP.");
      }

      setPhoneVerified(true);
      setPhoneOtpCode("");
      setVerificationMessage("Mobile number verified successfully.");
    } catch (error) {
      setVerificationMessage(error instanceof Error ? error.message : "Unable to verify mobile OTP.");
    } finally {
      setPhoneOtpLoading(false);
    }
  }

  const notificationOptions = [
    { key: "emailNotifications", label: "Email notifications", description: "Course updates and platform announcements", value: emailNotifications, onChange: setEmailNotifications },
    { key: "courseReminders", label: "Course reminders", description: "Upcoming live sessions and deadlines", value: courseReminders, onChange: setCourseReminders },
    { key: "marketingEmails", label: "Marketing emails", description: "New courses and promotions", value: marketingEmails, onChange: setMarketingEmails },
    { key: "securityAlerts", label: "Security alerts", description: "Important account and sign-in updates", value: securityAlerts, onChange: setSecurityAlerts },
  ];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedBio = bio.trim();

    if (trimmedName.length > 60) {
      setProfileMessage("Name cannot be longer than 60 characters.");
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
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          bio: trimmedBio,
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
        throw new Error(data?.error ?? "Unable to save profile changes.");
      }

      setIsEditing(false);
      setName(trimmedName);
      setPhone(trimmedPhone);
      setBio(trimmedBio);
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
      setAccountMessage("Please fill in your current password, new password, and confirmation.");
      return;
    }

    if (newPassword.length < 8) {
      setAccountMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setAccountMessage("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
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
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : "Unable to update password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.94))] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] transition-colors duration-300 dark:border-slate-700 dark:bg-[linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(17,24,39,0.9))] dark:shadow-[0_28px_70px_rgba(15,23,42,0.36)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-2xl font-black text-white shadow-[0_16px_32px_rgba(99,102,241,0.28)]">
              {initials}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Profile</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {name || "Student"}
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
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(15,23,42,0.18)] transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Edit profile
            </button>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {accountOverview.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.label}</div>
              <div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[26px] border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Account verification</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Verify your account before login</h2>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${emailVerified && phoneVerified ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
              {emailVerified && phoneVerified ? "Verified" : "Pending"}
            </span>
          </div>

          {verificationMessage ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              {verificationMessage}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">Email verification</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{emailVerified ? "Verified" : "Not verified"}</div>
                </div>
                {!emailVerified ? (
                  <button type="button" onClick={handleSendEmailOtp} disabled={emailOtpLoading} className="rounded-full bg-indigo-600 px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-70">
                    {emailOtpLoading ? "Sending..." : "Send OTP"}
                  </button>
                ) : null}
              </div>

              {!emailVerified ? (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={emailOtpCode}
                    onChange={(event) => setEmailOtpCode(event.target.value)}
                    placeholder="6-digit code"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <button type="button" onClick={handleVerifyEmailOtp} disabled={emailOtpLoading} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                    Verify
                  </button>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                  Your email is verified.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">Mobile verification</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{phoneVerified ? "Verified" : "Not verified"}</div>
                </div>
                {!phoneVerified ? (
                  <button type="button" onClick={handleSendPhoneOtp} disabled={phoneOtpLoading} className="rounded-full bg-indigo-600 px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-70">
                    {phoneOtpLoading ? "Sending..." : "Send OTP"}
                  </button>
                ) : null}
              </div>

              {!phoneVerified ? (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={phoneOtpCode}
                    onChange={(event) => setPhoneOtpCode(event.target.value)}
                    placeholder="6-digit code"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <button type="button" onClick={handleVerifyPhoneOtp} disabled={phoneOtpLoading} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                    Verify
                  </button>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                  Your mobile number is verified.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-sky-50 p-4 dark:border-indigo-500/20 dark:from-indigo-500/5 dark:via-violet-500/5 dark:to-sky-500/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Profile completion</div>
              <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">{profileCompletion}%</div>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {name ? "Personal details are ready" : "Add your name"}
            </div>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-indigo-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 transition-all duration-300"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
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
                Phone
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Add your contact number"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
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

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(99,102,241,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name ?? "");
                  setPhone(user.phone ?? "");
                  setBio(user.bio ?? "");
                  setProfileMessage(null);
                }}
                className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_42px_rgba(15,23,42,0.28)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile details</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Public info
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="text-sm text-slate-500 dark:text-slate-400">Full name</div>
                <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{name || "Not provided"}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="text-sm text-slate-500 dark:text-slate-400">Email</div>
                <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{user.email}</div>
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

            {accountMessage ? (
              <div
                className={`mb-3 rounded-xl border px-3 py-2 text-xs ${
                  accountMessage.includes("success")
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                }`}
              >
                {accountMessage}
              </div>
            ) : null}

            <div className="space-y-2.5">
              <form onSubmit={handlePasswordSubmit} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Change password</div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    {saving ? "Saving..." : "Update password"}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Current password
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-500/20"
                    />
                  </label>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      New password
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-500/20"
                      />
                    </label>

                    <label className="block text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Confirm
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-500/20"
                      />
                    </label>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
