"use client";

import { useEffect, useRef, useState } from "react";

type CourseOption = { id: string; title: string };

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export default function ContactForm({ courses = [], isDark: forcedIsDark }: { courses?: CourseOption[]; isDark?: boolean }) {
  const [isDark, setIsDark] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", occupation: "", course: "", message: "" });
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const courseMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const resolvedIsDark = typeof forcedIsDark === "boolean" ? forcedIsDark : isDark;

  useEffect(() => {
    if (!courseMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (courseMenuRef.current && !courseMenuRef.current.contains(event.target as Node)) {
        setCourseMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [courseMenuOpen]);

  useEffect(() => {
    if (!feedback) return;

    const timer = window.setTimeout(() => {
      setFeedback(null);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));

    if (feedback) {
      setFeedback(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const requiredFields = [form.name, form.email, form.phone, form.message];
    const hasEmptyRequired = requiredFields.some((value) => value.trim() === "");

    if (hasEmptyRequired) {
      setFeedback({
        type: "error",
        message: "Please fill in the required fields before submitting.",
      });
      submitButtonRef.current?.blur();
      return;
    }

    console.log("contact submit", form);
    setFeedback({
      type: "success",
      message: "Thanks! We’ll get back to you soon.",
    });

    setForm({ name: "", email: "", phone: "", occupation: "", course: "", message: "" });
    submitButtonRef.current?.blur();
  }

  function handleClear() {
    setForm({ name: "", email: "", phone: "", occupation: "", course: "", message: "" });
    setFeedback(null);
    submitButtonRef.current?.blur();
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full rounded-[30px] border p-5 backdrop-blur-sm md:p-6 lg:p-7 ${resolvedIsDark ? "border-slate-700 bg-slate-900/85 shadow-[0_28px_80px_rgba(15,23,42,0.22),0_0_0_1px_rgba(148,163,184,0.08)] ring-1 ring-white/5" : "border-slate-200/80 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-100"}`}>
      <div className="mb-5">
        <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] shadow-sm ${resolvedIsDark ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-200" : "border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700"}`}>Education for everyone</div>
        <h2 className={`mt-3 text-xl font-bold leading-tight lg:text-[1.75rem] ${resolvedIsDark ? "text-white" : "text-slate-900"}`}>Fill out the form below, and one of our friendly representatives will give you a call as soon as possible.</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={`mb-1.5 block text-sm font-medium ${resolvedIsDark ? "text-slate-200" : "text-slate-700"}`}>Name <span className="text-red-500">*</span></label>
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Enter your full name" className={`h-12 w-full rounded-2xl border px-3.5 py-3 text-sm shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] outline-none transition-all duration-200 placeholder:text-sm placeholder:font-medium hover:border-slate-300 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/15 ${resolvedIsDark ? "border-slate-700 bg-slate-800/80 text-slate-50 placeholder:text-slate-400 focus:bg-slate-800" : "border-slate-200 bg-slate-50/80 text-slate-800 placeholder:text-slate-400 focus:bg-white"}`} />
        </div>

        <div>
          <label className={`mb-1.5 block text-sm font-medium ${resolvedIsDark ? "text-slate-200" : "text-slate-700"}`}>Email <span className="text-red-500">*</span></label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Enter your email" className={`h-12 w-full rounded-2xl border px-3.5 py-3 text-sm shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] outline-none transition-all duration-200 placeholder:text-sm placeholder:font-medium hover:border-slate-300 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/15 ${resolvedIsDark ? "border-slate-700 bg-slate-800/80 text-slate-50 placeholder:text-slate-400 focus:bg-slate-800" : "border-slate-200 bg-slate-50/80 text-slate-800 placeholder:text-slate-400 focus:bg-white"}`} />
        </div>

        <div>
          <label className={`mb-1.5 block text-sm font-medium ${resolvedIsDark ? "text-slate-200" : "text-slate-700"}`}>Phone Number <span className="text-red-500">*</span></label>
          <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="Enter your phone number" className={`h-12 w-full rounded-2xl border px-3.5 py-3 text-sm shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] outline-none transition-all duration-200 placeholder:text-sm placeholder:font-medium hover:border-slate-300 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/15 ${resolvedIsDark ? "border-slate-700 bg-slate-800/80 text-slate-50 placeholder:text-slate-400 focus:bg-slate-800" : "border-slate-200 bg-slate-50/80 text-slate-800 placeholder:text-slate-400 focus:bg-white"}`} />
        </div>

        <div>
          <label className={`mb-1.5 block text-sm font-medium ${resolvedIsDark ? "text-slate-200" : "text-slate-700"}`}>Skill / Occupation</label>
          <input name="occupation" value={form.occupation} onChange={handleChange} placeholder="Your current role or field" className={`h-12 w-full rounded-2xl border px-3.5 py-3 text-sm shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] outline-none transition-all duration-200 placeholder:text-sm placeholder:font-medium hover:border-slate-300 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/15 ${resolvedIsDark ? "border-slate-700 bg-slate-800/80 text-slate-50 placeholder:text-slate-400 focus:bg-slate-800" : "border-slate-200 bg-slate-50/80 text-slate-800 placeholder:text-slate-400 focus:bg-white"}`} />
        </div>

        <div>
          <label className={`mb-1.5 block text-sm font-medium ${resolvedIsDark ? "text-slate-200" : "text-slate-700"}`}>Course</label>
          <div ref={courseMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setCourseMenuOpen((open) => !open)}
              className={`flex h-12 w-full items-center justify-between rounded-2xl border px-3.5 pr-10 text-left text-sm shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] outline-none transition-all duration-200 hover:border-slate-300 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/15 ${resolvedIsDark ? "border-slate-700 bg-slate-800/80 text-slate-200" : "border-slate-200 bg-slate-50/80 text-slate-500"} ${form.course ? (resolvedIsDark ? "text-slate-50" : "text-slate-800") : "text-slate-500"}`}
            >
              <span className={form.course ? (resolvedIsDark ? "text-slate-50" : "text-slate-800") : "text-slate-500"}>{form.course || "Select a course"}</span>
              <svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${courseMenuOpen ? "rotate-180" : "rotate-0"}`}>
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {courseMenuOpen && (
              <div className={`absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border shadow-[0_24px_52px_-20px_rgba(15,23,42,0.35)] ring-1 ${resolvedIsDark ? "border-slate-700 bg-slate-800 ring-slate-700" : "border-slate-200 bg-white ring-slate-100"}`}>
                <div className="max-h-64 overflow-y-auto p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setForm((s) => ({ ...s, course: "" }));
                      setCourseMenuOpen(false);
                    }}
                    className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition ${resolvedIsDark ? "text-slate-300 hover:bg-slate-700 hover:text-white" : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"}`}
                  >
                    Select a course
                  </button>
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => {
                        setForm((s) => ({ ...s, course: course.title }));
                        setCourseMenuOpen(false);
                      }}
                      className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        form.course === course.title
                          ? resolvedIsDark
                            ? "bg-indigo-500/15 font-semibold text-indigo-200"
                            : "bg-indigo-50 font-semibold text-indigo-700"
                          : resolvedIsDark
                            ? "text-slate-200 hover:bg-slate-700 hover:text-white"
                            : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                      }`}
                    >
                      {course.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={`mb-1.5 block text-sm font-medium ${resolvedIsDark ? "text-slate-200" : "text-slate-700"}`}>Message <span className="text-red-500">*</span></label>
          <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Tell us about your learning goals" className={`min-h-[120px] w-full rounded-2xl border px-3.5 py-3 text-sm shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] outline-none transition-all duration-200 placeholder:text-sm placeholder:font-medium hover:border-slate-300 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/15 ${resolvedIsDark ? "border-slate-700 bg-slate-800/80 text-slate-50 placeholder:text-slate-400 focus:bg-slate-800" : "border-slate-200 bg-slate-50/80 text-slate-800 placeholder:text-slate-400 focus:bg-white"}`} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {feedback && (
          <div
            className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-medium shadow-[0_18px_34px_-18px_rgba(15,23,42,0.7)] backdrop-blur-sm ${
              feedback.type === "success"
                ? resolvedIsDark
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
                : resolvedIsDark
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-red-200 bg-red-50 text-red-700"
            }`}
            role="status"
            aria-live="polite"
          >
            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${resolvedIsDark ? "bg-slate-900/60 text-white" : "bg-white/80 text-slate-700"}`}>
              {feedback.type === "success" ? "✓" : "!"}
            </span>
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleClear}
            className={`inline-flex h-[48px] w-[120px] items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:outline-none focus-visible:ring-0 active:scale-[0.98] ${resolvedIsDark ? "border-slate-700 bg-slate-800 text-slate-100 shadow-[0_0_0_1px_rgba(148,163,184,0.08),0_0_24px_rgba(99,102,241,0.18),0_12px_26px_-16px_rgba(15,23,42,0.9)] hover:border-slate-600 hover:bg-slate-700 hover:shadow-[0_0_0_1px_rgba(148,163,184,0.12),0_0_28px_rgba(99,102,241,0.22),0_14px_28px_-16px_rgba(15,23,42,0.92)]" : "border-slate-200 bg-slate-100 text-slate-700 shadow-[0_8px_18px_-12px_rgba(15,23,42,0.35)] hover:border-slate-300 hover:bg-slate-200"}`}
          >
            Clear
          </button>

          <button
            ref={submitButtonRef}
            type="submit"
            className={`group inline-flex h-[48px] w-[120px] items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 px-4 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${resolvedIsDark ? "shadow-[0_0_0_1px_rgba(129,140,248,0.2),0_0_30px_rgba(99,102,241,0.28),0_14px_26px_-18px_rgba(15,23,42,0.92)] hover:shadow-[0_0_0_1px_rgba(129,140,248,0.28),0_0_36px_rgba(99,102,241,0.32),0_18px_32px_-18px_rgba(15,23,42,0.94)]" : "shadow-[0_18px_28px_-14px_rgba(79,70,229,1)] hover:shadow-[0_20px_36px_-14px_rgba(79,70,229,1)]"}`}
          >
            <span className="transition-transform duration-200 ease-out group-active:scale-[0.97]">Submit</span>
          </button>
        </div>
      </div>
    </form>
  );
}
