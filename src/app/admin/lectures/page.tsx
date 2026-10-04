import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminSidebar } from "../components/admin-sidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLecturesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent("/admin/lectures")}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const courses = await prisma.course.findMany({
    orderBy: [{ isPublished: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      level: true,
      isPublished: true,
      isLive: true,
      language: true,
      modules: { include: { lectures: true } },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Manage lectures</h1>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          <AdminSidebar />

          <div className="flex-1">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Modules</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Courses</h2>
            </div>
            <div className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
              {courses.length} course{courses.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const lectureCount = course.modules.reduce((total, module) => total + module.lectures.length, 0);

              return (
                <div key={course.id} className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)] dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {course.category}
                      </div>
                      <h3 className="mt-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">{course.title}</h3>
                    </div>
                    <span
                      className={
                        course.isPublished
                          ? "rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                          : "rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-800 dark:bg-amber-500/10 dark:text-amber-200"
                      }
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-700">{course.isLive ? "Live" : "Recorded"}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-700">{course.level ?? "Beginner"}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-700">{course.language === "hi" ? "Hindi" : "English"}</span>
                  </div>

                  <div className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                    {lectureCount} lecture{lectureCount === 1 ? "" : "s"}
                  </div>

                  <Link
                    href={`/admin/courses/${course.id}/lectures?courseId=${course.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-[11px] font-semibold text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
                  >
                    Manage lectures
                  </Link>
                </div>
              );
            })}
          </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
