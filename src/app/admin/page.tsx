import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminMessage } from "./admin-message.client";
import { AdminModeToggle } from "./components/admin-mode-toggle.client";
import { AdminNavbar } from "./components/admin-navbar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }> | { success?: string; error?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent("/admin")}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = searchParams ? await Promise.resolve(searchParams) : {};
  const successMessage = params.success ? decodeURIComponent(params.success) : "";
  const errorMessage = params.error ? decodeURIComponent(params.error) : "";

  const [totalCourses, publishedCourses, unpublishedCourses] = await Promise.all([
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.course.count({ where: { isPublished: false } }),
  ]);

  const quickStats = [
    {
      label: "Total courses",
      value: totalCourses,
      accent: "text-indigo-600 dark:text-indigo-300",
      badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200",
      badgeDot: "bg-indigo-500 dark:bg-indigo-300",
      panel: "from-indigo-50 via-white to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900",
      glow: "shadow-[0_18px_40px_rgba(99,102,241,0.08)]",
      hoverTone: "hover:border-indigo-200 hover:shadow-[0_18px_32px_rgba(99,102,241,0.10)] hover:from-indigo-100 hover:via-white hover:to-sky-50",
    },
    {
      label: "Unpublished",
      value: unpublishedCourses,
      accent: "text-amber-600 dark:text-amber-300",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
      badgeDot: "bg-amber-500 dark:bg-amber-300",
      panel: "from-amber-50 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900",
      glow: "shadow-[0_18px_40px_rgba(245,158,11,0.08)]",
      hoverTone: "hover:border-amber-200 hover:shadow-[0_18px_32px_rgba(245,158,11,0.10)] hover:from-amber-100 hover:via-white hover:to-orange-50",
    },
    {
      label: "Published",
      value: publishedCourses,
      accent: "text-emerald-600 dark:text-emerald-300",
      badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
      badgeDot: "bg-emerald-500 dark:bg-emerald-300",
      panel: "from-emerald-50 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900",
      glow: "shadow-[0_18px_40px_rgba(16,185,129,0.08)]",
      hoverTone: "hover:border-emerald-200 hover:shadow-[0_18px_32px_rgba(16,185,129,0.10)] hover:from-emerald-100 hover:via-white hover:to-teal-50",
    },
  ];

  const actionCards = [
    {
      href: "/admin/courses/new",
      eyebrow: "Create",
      title: "Create course",
      description: "Add a new course, upload the thumbnail, and save it as unpublished or publish when ready.",
      cta: "Open creator",
      badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200",
      badgeDot: "bg-indigo-500 dark:bg-indigo-300",
      button: "border-indigo-200/80 bg-gradient-to-r from-white/70 via-indigo-100/80 to-sky-100/80 text-indigo-700 shadow-[0_12px_24px_rgba(99,102,241,0.18)] backdrop-blur-xl ring-1 ring-indigo-100/80 dark:border-indigo-400/40 dark:from-indigo-500/20 dark:via-violet-500/20 dark:to-sky-500/20 dark:text-indigo-100 dark:ring-indigo-500/20",
      tone: "bg-white dark:bg-slate-900/80",
      hoverTone: "hover:border-indigo-200 hover:shadow-[0_18px_32px_rgba(99,102,241,0.10)] hover:from-indigo-50 hover:via-white hover:to-sky-50 dark:hover:border-indigo-400/40 dark:hover:from-indigo-950/30 dark:hover:via-slate-900 dark:hover:to-slate-900",
    },
    {
      href: "/admin/unpublished",
      eyebrow: "Unpublished",
      title: "Unpublished Courses",
      description: "Review all saved unpublished courses, continue edits, and publish them when they are ready.",
      cta: "Review courses",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
      badgeDot: "bg-amber-500 dark:bg-amber-300",
      button: "border-amber-200/80 bg-amber-50/80 text-amber-700 shadow-[0_12px_24px_rgba(245,158,11,0.18)] backdrop-blur-xl ring-1 ring-amber-100/80 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/20",
      tone: "bg-white dark:bg-slate-900/80",
      hoverTone: "hover:border-amber-200 hover:shadow-[0_18px_32px_rgba(245,158,11,0.10)] hover:from-amber-50 hover:via-white hover:to-orange-50 dark:hover:border-amber-400/40 dark:hover:from-amber-950/20 dark:hover:via-slate-900 dark:hover:to-slate-900",
    },
    {
      href: "/admin/lectures",
      eyebrow: "Lectures",
      title: "Manage lectures",
      description: "Open course lecture management to add, edit, upload recordings, and update live session links for every module.",
      cta: "Open lecture manager",
      badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200",
      badgeDot: "bg-indigo-500 dark:bg-indigo-300",
      button: "border-indigo-200/80 bg-gradient-to-r from-white/70 via-indigo-100/80 to-cyan-100/80 text-indigo-700 shadow-[0_12px_24px_rgba(99,102,241,0.18)] backdrop-blur-xl ring-1 ring-indigo-100/80 dark:border-indigo-400/40 dark:from-indigo-500/20 dark:via-violet-500/20 dark:to-sky-500/20 dark:text-indigo-100 dark:ring-indigo-500/20",
      tone: "bg-white dark:bg-slate-900/80",
      hoverTone: "hover:border-indigo-200 hover:shadow-[0_18px_32px_rgba(99,102,241,0.10)] hover:from-indigo-50 hover:via-white hover:to-cyan-50 dark:hover:border-indigo-400/40 dark:hover:from-indigo-950/30 dark:hover:via-slate-900 dark:hover:to-slate-900",
    },
    {
      href: "/admin/courses",
      eyebrow: "Manage",
      title: "Manage courses",
      description: "Review, search, filter, update, bulk publish, and unpublish courses in one place.",
      cta: "Open library",
      badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200",
      badgeDot: "bg-violet-500 dark:bg-violet-300",
      button: "border-violet-200/80 bg-gradient-to-r from-white/70 via-violet-100/80 to-indigo-100/80 text-violet-700 shadow-[0_12px_24px_rgba(139,92,246,0.18)] backdrop-blur-xl ring-1 ring-violet-100/80 dark:border-violet-400/40 dark:from-violet-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 dark:text-violet-100 dark:ring-violet-500/20",
      tone: "bg-white dark:bg-slate-900/80",
      hoverTone: "hover:border-violet-200 hover:shadow-[0_18px_32px_rgba(139,92,246,0.10)] hover:from-violet-50 hover:via-white hover:to-indigo-50 dark:hover:border-violet-400/40 dark:hover:from-violet-950/20 dark:hover:via-slate-900 dark:hover:to-slate-900",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-8">
        {successMessage || errorMessage ? (
          <AdminMessage message={successMessage || errorMessage} type={successMessage ? "success" : "error"} />
        ) : null}

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Course dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(99,102,241,0.26)] transition hover:brightness-110"
            >
              Back to site
            </Link>
            <AdminModeToggle />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AdminNavbar />

          <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Overview</p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">Quick access</h2>
              </div>
              <div className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                {actionCards.length + quickStats.length} items
              </div>
            </div>

            <div className="mb-5 grid gap-3 lg:grid-cols-3">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-[22px] border border-slate-200 bg-gradient-to-br ${stat.panel} p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 ${stat.hoverTone} ${stat.glow} dark:border-slate-700 dark:ring-slate-800`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] ${stat.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${stat.badgeDot}`} />
                      {stat.label.includes("Published") ? "Live" : stat.label.includes("Unpublished") ? "Draft" : "All"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className={`text-2xl font-black tracking-tight ${stat.accent}`}>{stat.value}</p>
                    <div className="h-9 w-1.5 rounded-full bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-700 dark:to-transparent" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-3 xl:grid-cols-3">
              {actionCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className={`group flex min-h-[220px] flex-col rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 ${card.hoverTone} ${card.tone} dark:border-slate-700 dark:bg-slate-900/80`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">{card.eyebrow}</p>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] ${card.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${card.badgeDot}`} />
                      {card.eyebrow === "Create" ? "New" : card.eyebrow === "Manage" ? "Library" : "Drafts"}
                    </span>
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{card.title}</h2>
                  <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300">{card.description}</p>
                  <div className="mt-auto pt-4">
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-200 active:scale-100 ${card.button}`}>
                      {card.cta}
                      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
