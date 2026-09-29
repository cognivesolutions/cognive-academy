"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminMessage({ message, type }: { message: string; type: "success" | "error" }) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      setVisible(false);

      if (!pathname) return;

      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.delete("success");
      params.delete("error");

      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [message, type, pathname, searchParams, router]);

  if (!visible || !message) return null;

  return (
    <div
      className={type === "success"
        ? "mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
        : "mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"}
    >
      {message}
    </div>
  );
}
