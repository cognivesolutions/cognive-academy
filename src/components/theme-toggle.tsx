"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = savedTheme === "dark" || (!savedTheme && prefersDark) ? "dark" : "light";

    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
  };

  const isDarkTheme = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(255,255,255,0.12),rgba(99,102,241,0.18))] text-[1.15rem] text-slate-700 shadow-[0_10px_25px_rgba(99,102,241,0.12)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200/80 hover:shadow-[0_14px_28px_rgba(99,102,241,0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:border-slate-700/70 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(30,41,59,0.7),rgba(99,102,241,0.28))] dark:text-slate-100"
      aria-label={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
      title={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
    >
      <span aria-hidden="true" className="drop-shadow-[0_2px_8px_rgba(99,102,241,0.2)] leading-none">{isDarkTheme ? "☀️" : "🌙"}</span>
    </button>
  );
}
