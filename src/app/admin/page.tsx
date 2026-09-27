import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [totalCourses, publishedCourses, unpublishedCourses] = await Promise.all([
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.course.count({ where: { isPublished: false } }),
  ]);

  const quickStats = [
    { label: "Total courses", value: totalCourses, accent: "text-indigo-600 dark:text-indigo-300" },
    { label: "Published", value: publishedCourses, accent: "text-emerald-600 dark:text-emerald-300" },
    { label: "Unpublished", value: unpublishedCourses, accent: "text-amber-600 dark:text-amber-300" },
  ];

  const actionCards = [
    {
      href: "/admin/courses/new",
      eyebrow: "Create",
      title: "Create course",
      description: "Add a new course, upload the thumbnail, and save it as unpublished or publish when ready.",
      cta: "Open creator",
      tone: "bg-gradient-to-br from-white via-indigo-50/70 to-sky-50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900",
    },
    {
      href: "/admin/courses",
      eyebrow: "Manage",
      title: "Manage courses",
      description: "Review, search, filter, update, bulk publish, and unpublish courses in one place.",
      cta: "Open library",
      tone: "bg-white dark:bg-slate-900/80",
    },
    {
      href: "/admin/unpublished",
      eyebrow: "Unpublished",
      title: "Unpublished Courses",
      description: "Review all saved unpublished courses, continue edits, and publish them when they are ready.",
      cta: "Review courses",
      tone: "bg-white dark:bg-slate-900/80",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Course dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(99,102,241,0.26)] transition hover:brightness-110"
            >
              Back to site
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className={`mt-4 text-3xl font-black tracking-tight ${stat.accent}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {actionCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group rounded-[28px] border border-slate-200 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_24px_48px_rgba(99,102,241,0.12)] ${card.tone} dark:border-slate-700`}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">{card.eyebrow}</p>
                <span className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                  {card.eyebrow === "Create" ? "New" : "Open"}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{card.title}</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                {card.cta}
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
