"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import ConfirmDialog from "./confirm-dialog";

function getLogoutRedirectPath() {
  if (typeof window === "undefined") {
    return "/login";
  }

  return window.location.pathname.startsWith("/admin") ? "/admin/login" : "/login";
}

export function LogoutButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800"
      >
        Logout
      </button>

      <ConfirmDialog
        open={open}
        title="Sign out"
        description="You will be signed out of your account. Are you sure you want to continue?"
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        onConfirm={() => {
          setOpen(false);
          signOut({ callbackUrl: getLogoutRedirectPath(), redirect: true });
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
