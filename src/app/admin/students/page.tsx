import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminModeToggle } from "../components/admin-mode-toggle.client";
import { AdminNavbar } from "../components/admin-navbar";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent("/admin/students")}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      enrollments: {
        select: {
          accessGranted: true,
        },
      },
    },
  });

  const totalStudents = students.length;
  const activeStudents = students.filter((student) => student.enrollments.some((enrollment) => enrollment.accessGranted)).length;
  const totalEnrollments = students.reduce((total, student) => total + student.enrollments.length, 0);

  const dashboardStats = [
    {
      label: "Total students",
      value: totalStudents,
      accent: "text-indigo-600 dark:text-indigo-300",
      badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200",
      badgeDot: "bg-indigo-500 dark:bg-indigo-300",
      badgeLabel: "Users",
      panel: "from-indigo-50 via-white to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900",
      hoverTone: "hover:border-indigo-200 hover:shadow-[0_18px_32px_rgba(99,102,241,0.10)] hover:from-indigo-100 hover:via-white hover:to-sky-50",
    },
    {
      label: "Active enrollments",
      value: activeStudents,
      accent: "text-emerald-600 dark:text-emerald-300",
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
      badgeDot: "bg-emerald-500 dark:bg-emerald-300",
      badgeLabel: "Active",
      panel: "from-emerald-50 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900",
      hoverTone: "hover:border-emerald-200 hover:shadow-[0_18px_32px_rgba(16,185,129,0.10)] hover:from-emerald-100 hover:via-white hover:to-teal-50",
    },
    {
      label: "Total enrollments",
      value: totalEnrollments,
      accent: "text-violet-600 dark:text-violet-300",
      badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200",
      badgeDot: "bg-violet-500 dark:bg-violet-300",
      badgeLabel: "All",
      panel: "from-violet-50 via-white to-white dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-900",
      hoverTone: "hover:border-violet-200 hover:shadow-[0_18px_32px_rgba(139,92,246,0.10)] hover:from-violet-100 hover:via-white hover:to-indigo-50",
    },
  ];

  const quickAccessCards = [
    {
      eyebrow: "Student management",
      title: "Manage students",
      description: "Search students, filter by status, review enrollment history, and open each student record in one place.",
      badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200",
      badgeDot: "bg-indigo-500 dark:bg-indigo-300",
      badgeLabel: "Users",
      tone: "bg-gradient-to-br from-[#eef2ff] via-[#edf4ff] to-[#e7ebff] text-slate-800 transition-all duration-200 hover:from-[#edf3ff] hover:via-white hover:to-[#e7f0ff] dark:from-[#172847] dark:via-[#131e38] dark:to-[#0f1a30] dark:text-white",
      href: "/admin/students/manage",
      buttonLabel: "Open management",
      buttonClassName: "border-indigo-300 bg-indigo-100 text-indigo-800 shadow-[0_10px_26px_rgba(79,70,229,0.10)] transition-all duration-200 group-hover:-translate-x-0.5 group-hover:bg-indigo-200 group-hover:shadow-[0_12px_26px_rgba(79,70,229,0.12)] dark:border-indigo-400/40 dark:bg-indigo-500/15 dark:text-indigo-100 dark:shadow-[0_10px_26px_rgba(99,102,241,0.14)] dark:group-hover:bg-indigo-500/25",
    },
    {
      eyebrow: "Records",
      title: "View student access",
      description: "Check active and pending enrollments, identify students with missing access, and review recent activity.",
      badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200",
      badgeDot: "bg-violet-500 dark:bg-violet-300",
      badgeLabel: "Access",
      tone: "bg-gradient-to-br from-[#f3ecff] via-[#f1f0ff] to-[#e9edff] text-slate-800 transition-all duration-200 hover:from-[#f5f0ff] hover:via-white hover:to-[#edf3ff] dark:from-[#111d35] dark:via-[#101b32] dark:to-[#0d172d] dark:text-white",
      href: "/admin/students/manage",
      buttonLabel: "View records",
      buttonClassName: "border-violet-300 bg-violet-100 text-violet-800 shadow-[0_10px_26px_rgba(139,92,246,0.10)] transition-all duration-200 group-hover:-translate-x-0.5 group-hover:bg-violet-200 group-hover:shadow-[0_12px_26px_rgba(139,92,246,0.12)] dark:border-violet-400/40 dark:bg-violet-500/15 dark:text-violet-100 dark:shadow-[0_10px_26px_rgba(91,105,255,0.14)] dark:group-hover:bg-violet-500/25",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Student dashboard</h1>
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

          <section className="-mt-0 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Overview</p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">Quick access</h2>
              </div>
              <div className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                {totalStudents} students
              </div>
            </div>

            <div className="mb-5 grid gap-3 lg:grid-cols-3">
              {dashboardStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-[22px] border border-slate-200 bg-gradient-to-br ${stat.panel} p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 ${stat.hoverTone} dark:border-slate-700 dark:ring-slate-800`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] ${stat.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${stat.badgeDot}`} />
                      {stat.badgeLabel}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className={`text-2xl font-black tracking-tight ${stat.accent}`}>{stat.value}</p>
                    <div className="h-9 w-1.5 rounded-full bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-700 dark:to-transparent" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-5 grid items-stretch gap-3 lg:grid-cols-3">
              {quickAccessCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className={`group flex h-full min-h-[230px] flex-col justify-between rounded-[22px] border border-slate-200 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(99,102,241,0.10)] dark:border-slate-700/80 ${card.tone}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-300">{card.eyebrow}</p>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] ${card.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${card.badgeDot}`} />
                      {card.badgeLabel}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div>
                      <h2 className="text-[24px] font-black leading-[1.1] tracking-[-0.05em] text-slate-900 dark:text-white">{card.title}</h2>
                      <p className="mt-2 max-w-[38ch] text-sm leading-6 text-slate-700 dark:text-slate-300">{card.description}</p>
                    </div>

                    <span className={`inline-flex w-fit items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ${card.buttonClassName}`}>
                      {card.buttonLabel}
                      <span aria-hidden="true">→</span>
                    </span>
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
