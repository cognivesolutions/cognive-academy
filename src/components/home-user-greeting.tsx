"use client";

import { useSession } from "next-auth/react";

export function HomeUserGreeting() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (!session?.user?.name) return null;

  const displayName = session.user.name.trim();

  return (
    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-indigo-700 shadow-sm backdrop-blur-sm dark:border-indigo-500/30 dark:bg-slate-900/70 dark:text-indigo-200">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-[10px] font-black text-white">
        {displayName.charAt(0).toUpperCase()}
      </span>
      Hi, {displayName}
    </div>
  );
}
