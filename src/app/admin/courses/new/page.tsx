import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CreateCourseForm } from "./create-course-form.client";

export default async function NewCoursePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Create course</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/courses"
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)] transition duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] hover:brightness-105 active:scale-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15"
            >
              Manage courses
            </Link>
            <Link
              href="/admin/unpublished"
              className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-[0_8px_20px_rgba(245,158,11,0.08)] transition duration-200 hover:border-amber-300 hover:bg-amber-100 hover:shadow-[0_10px_24px_rgba(245,158,11,0.12)] hover:brightness-105 active:scale-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:border-amber-400/50 dark:hover:bg-amber-500/15"
            >
              Unpublished
            </Link>
          </div>
        </div>

        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">New course</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">Add a course</h2>
            </div>
          </div>

          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            Create an unpublished course and publish it when ready.
          </p>

          <CreateCourseForm />
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/admin"
            className="inline-flex h-[34px] items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-4 py-1.5 text-sm font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="create-course-form"
            className="inline-flex h-[34px] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50/80 px-5 py-1.5 text-sm font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)] backdrop-blur-sm transition duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] hover:brightness-105 active:scale-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15"
          >
            Create
          </button>
        </div>
      </div>
    </main>
  );
}
