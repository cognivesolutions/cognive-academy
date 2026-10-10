"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import ConfirmDialog from "./confirm-dialog";


const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <path d="M3 12.75V6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v6.25" />
        <path d="M9 20h6" />
        <path d="M12 4v9" />
      </svg>
    ),
  },
  {
    label: "My courses",
    href: "/my-courses",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v13.5A2.5 2.5 0 0 0 17.5 20H6.5A2.5 2.5 0 0 1 4 17.5v-11Z" />
        <path d="M8 8h8M8 12h8" />
      </svg>
    ),
  },
  {
    label: "Saved courses",
    href: "/saved-courses",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <path d="M12 20.25s-7.5-4.35-9.33-8.29C1.35 9.28 3.03 5.25 7.2 5.25c2.08 0 3.27 1.1 4.08 2.1.81-1 .99-2.1 4.08-2.1 4.17 0 5.85 4.03 4.53 6.71C19.5 15.9 12 20.25 12 20.25Z" />
      </svg>
    ),
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5 18.75c1.8-2.4 4.1-3.6 7-3.6s5.2 1.2 7 3.6" />
      </svg>
    ),
  },
];

function getLogoutRedirectPath() {
  if (typeof window === "undefined") {
    return "/login";
  }

  return window.location.pathname.startsWith("/admin") ? "/admin/login" : "/login";
}

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

function clearLocalProfileOverride() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("cognive-profile-sync");
}

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const overrideProfile = readLocalProfileOverride(session?.user?.email ?? null);

  const displayName = overrideProfile?.name?.trim() || session?.user?.name?.trim() || session?.user?.email?.split("@")[0] || "Student";
  const avatarSrc = overrideProfile?.avatarUrl || session?.user?.image || undefined;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideMenu = menuRef.current?.contains(target);
      const isInsideButton = buttonRef.current?.contains(target);

      if (!isInsideMenu && !isInsideButton) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative flex items-center justify-end -mr-1 sm:-mr-4">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Account menu"
        className="mt-2 ml-2 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-sm font-black text-white shadow-[0_10px_25px_rgba(79,70,229,0.25)] ring-2 ring-indigo-100/70 transition hover:scale-[1.02] dark:ring-slate-700/80"
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_20px_45px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-[0_22px_50px_rgba(2,6,23,0.75)]">
          <div className="mb-2 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50 px-3 py-2.5 dark:from-slate-800/90 dark:to-indigo-950/30">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-400">Signed in</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{displayName}</div>
            <div className="text-xs text-slate-500 dark:text-slate-300">{session?.user?.email || "student@cognive.academy"}</div>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-indigo-100 group-hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-indigo-500/15 dark:group-hover:text-indigo-300">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />

            {/* Use modal confirmation for logout */}
            <LogoutInlineConfirm onOpenDialog={() => {
              // close the avatar menu and open the confirmation dialog
              setOpen(false);
              setLogoutDialogOpen(true);
            }} />
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={logoutDialogOpen}
        title="Sign out"
        description="You will be signed out of your account. Are you sure you want to continue?"
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        onConfirm={() => {
          clearLocalProfileOverride();
          setLogoutDialogOpen(false);
          signOut({ callbackUrl: getLogoutRedirectPath(), redirect: true });
        }}
        onCancel={() => setLogoutDialogOpen(false)}
      />
    </div>
  );
}

function LogoutInlineConfirm({ onOpenDialog }: { onOpenDialog?: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenDialog?.();
      }}
      className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 transition group-hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300 dark:group-hover:bg-red-900/50">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path d="M9 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3H9" />
          <path d="M16 17 21 12l-5-5" />
          <path d="M21 12H9" />
        </svg>
      </span>
      <span>Logout</span>
    </button>
  );
}
