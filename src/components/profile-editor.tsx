"use client";

import { useState } from "react";

interface ProfileUser {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  bio?: string | null;
  role: string;
}

export function ProfileEditor({ user }: { user: ProfileUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, bio }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to save profile changes.");
      }

      setIsEditing(false);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_18px_40px_rgba(15,23,42,0.3)]">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Profile</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{name || "Student"}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-black text-white">
            {(name || user.email || "S").charAt(0).toUpperCase()}
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Edit profile
            </button>
          ) : null}
        </div>
      </div>

      {message ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {message}
        </div>
      ) : null}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                placeholder="Not added"
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
                setMessage(null);
              }}
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">Full name</div>
            <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{name || "Not provided"}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">Email</div>
            <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{user.email}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">Role</div>
            <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{user.role}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">Phone</div>
            <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{phone || "Not added"}</div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">Bio</div>
            <div className="mt-2 text-base font-medium text-slate-900 dark:text-white">{bio || "No bio added yet."}</div>
          </div>
        </div>
      )}
    </div>
  );
}
