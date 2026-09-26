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
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[1.15rem] text-slate-700 transition-all duration-200 hover:scale-105 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:text-slate-100 dark:hover:text-amber-300"
      aria-label={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
      title={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
    >
      <span aria-hidden="true" className="drop-shadow-[0_2px_8px_rgba(99,102,241,0.2)] leading-none">{isDarkTheme ? "☀️" : "🌙"}</span>
    </button>
  );
}
