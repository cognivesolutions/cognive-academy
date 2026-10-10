"use client";

import { useSession } from "next-auth/react";

function readLocalProfileOverride(currentEmail?: string | null) {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.localStorage.getItem("cognive-profile-sync");
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as { name?: string; avatarUrl?: string; email?: string };
    if (!parsed || (!parsed.name && !parsed.avatarUrl)) return null;

    if (currentEmail && parsed.email && parsed.email.toLowerCase() !== currentEmail.toLowerCase()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function HomeUserGreeting() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  const overrideProfile = readLocalProfileOverride(session?.user?.email ?? null);
  const displayName = (overrideProfile?.name?.trim() || session?.user?.name?.trim() || "").trim();
  const avatarSrc = overrideProfile?.avatarUrl || session?.user?.image || undefined;

  if (!displayName) return null;

  return (
    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-indigo-700 shadow-sm backdrop-blur-sm dark:border-indigo-500/30 dark:bg-slate-900/70 dark:text-indigo-200">
      <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-[10px] font-black text-white">
        {avatarSrc ? <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" /> : displayName.charAt(0).toUpperCase()}
      </span>
      Hi, {displayName}
    </div>
  );
}
