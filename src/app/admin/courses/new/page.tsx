import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminModeToggle } from "../../components/admin-mode-toggle.client";
import { CreateCourseActionButton } from "./create-course-action.client";
import { AdminNavbar } from "../../components/admin-navbar";

export const dynamic = "force-dynamic";
import { CreateCourseCancelButton } from "./create-course-cancel-action.client";
import { CreateCourseErrorNotice } from "./create-course-error.client";
import { CreateCourseForm } from "./create-course-form.client";

export default async function NewCoursePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent("/admin/courses/new")}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Create course</h1>
          </div>
          <div className="flex items-center gap-2">
            <AdminModeToggle />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AdminNavbar />

          <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">New course</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">Add a course</h2>
              </div>
            </div>

            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              Create an unpublished course and publish it when ready.
            </p>

            <CreateCourseForm />
          </section>

          <div className="mt-1 flex flex-wrap items-center justify-end gap-3">
            <CreateCourseErrorNotice />
            <CreateCourseCancelButton />
            <CreateCourseActionButton />
          </div>
        </div>
      </div>
    </main>
  );
}
