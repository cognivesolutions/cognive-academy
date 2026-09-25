"use client";

import { useEffect, useState } from "react";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 320);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/75 text-slate-600 shadow-md shadow-slate-200/50 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-900"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path fillRule="evenodd" d="M10 17.25a.75.75 0 0 1-.75-.75V7.81l-2.72 2.72a.75.75 0 0 1-1.06-1.06l4-4a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1-1.06 1.06L10.75 7.81v8.69c0 .41-.34.75-.75.75Z" clipRule="evenodd" />
      </svg>
    </button>
  );
}
