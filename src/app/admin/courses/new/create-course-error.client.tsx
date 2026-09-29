"use client";

import { useEffect, useRef, useState } from "react";

export function CreateCourseErrorNotice() {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleError = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      setMessage(customEvent.detail || "Failed to save course.");
      timeoutRef.current = window.setTimeout(() => {
        setMessage(null);
      }, 4000);
    };

    window.addEventListener("course-create-error", handleError);
    return () => {
      window.removeEventListener("course-create-error", handleError);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!message) return null;

  return (
    <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
      {message}
    </div>
  );
}
