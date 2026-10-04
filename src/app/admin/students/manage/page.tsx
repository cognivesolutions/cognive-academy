import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PaginationDots } from "@/components/pagination-dots";
import { StudentFilterBar } from "../student-filter-bar.client";
import { StudentTableRow } from "../student-table-row.client";
import { AdminModeToggle } from "@/app/admin/components/admin-mode-toggle.client";
import { AdminSidebar } from "@/app/admin/components/admin-sidebar";
import { PaginationPageSizeSelect } from "@/app/admin/components/pagination-page-size-select";

export const dynamic = "force-dynamic";

export default async function AdminStudentsManagePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent("/admin/students/manage")}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});

  const q = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : resolvedSearchParams.q ?? "";
  const status = Array.isArray(resolvedSearchParams.status) ? resolvedSearchParams.status[0] : resolvedSearchParams.status ?? "all";
  const rawPage = Number(Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page ?? "1");
  const rawPageSize = Array.isArray(resolvedSearchParams.pageSize)
    ? resolvedSearchParams.pageSize[0]
    : resolvedSearchParams.pageSize ?? "10";

  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const fallbackPageSize = rawPageSize === "all" ? "all" : Number(rawPageSize) || 10;
  const pageSize = fallbackPageSize === "all" ? "all" : Math.max(1, Math.min(100, fallbackPageSize));
  const page = Math.max(1, requestedPage);

  const where: any = {
    role: "STUDENT",
  };

  if (status !== "all") {
    if (status === "active") {
      where.enrollments = { some: { accessGranted: true } };
    }
    if (status === "new") {
      where.enrollments = { none: {} };
    }
  }

  const students = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      enrollments: {
        select: {
          accessGranted: true,
          course: { select: { id: true, title: true } },
        },
      },
    },
  });

  const normalizedQuery = q.trim().toLowerCase();
  const filteredStudents = students.filter((student) => {
    if (!normalizedQuery) {
      return true;
    }

    const joinedDate = new Date(student.createdAt);
    const statusLabel = student.enrollments.some((enrollment) => enrollment.accessGranted) ? "active" : "new";
    const courseCount = student.enrollments.length;
    const searchableValues = [
      student.name ?? "",
      student.email ?? "",
      student.phone ?? "",
      statusLabel,
      joinedDate.toISOString(),
      joinedDate.toLocaleDateString(),
      joinedDate.toLocaleDateString("en-GB"),
      String(courseCount),
      `${courseCount} course${courseCount === 1 ? "" : "s"}`,
    ];

    return searchableValues.some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  const totalStudents = filteredStudents.length;
  const activeStudents = filteredStudents.filter((student) => student.enrollments.some((enrollment) => enrollment.accessGranted)).length;
  const totalEnrollments = students.reduce((total, student) => total + student.enrollments.length, 0);

  const effectivePageSize = pageSize === "all" ? totalStudents || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalStudents / effectivePageSize));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * effectivePageSize;
  const recentStudents = filteredStudents.slice(skip, skip + effectivePageSize);

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();

    if (q) {
      params.set("q", q);
    }

    if (status !== "all") {
      params.set("status", status);
    }

    if (pageSize === "all") {
      params.set("pageSize", "all");
    } else {
      params.set("pageSize", String(pageSize));
    }

    params.set("page", String(nextPage));

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "?";
  };

  const currentPageIndex = safePage - 1;
  const firstVisible = totalStudents === 0 ? 0 : (safePage - 1) * effectivePageSize + 1;
  const lastVisible = Math.min(safePage * effectivePageSize, totalStudents);

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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Student management</h1>
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
          <AdminSidebar />

          <section className="-mt-0 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Control center</p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">Manage students</h2>
              </div>
              <div className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                {totalStudents} learners
              </div>
            </div>

            <div className="mb-5 grid gap-3 lg:grid-cols-3">
              {dashboardStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`-translate-y-1 rounded-[22px] border border-slate-200 bg-gradient-to-br ${stat.panel} p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-1 ${stat.hoverTone} dark:border-slate-700 dark:ring-slate-800`}
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

            <div className="-translate-y-0">
              <StudentFilterBar defaultQ={q} defaultStatus={status} />
            </div>

            <div className="-translate-y-0 overflow-hidden rounded-[20px] border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800/80">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Student</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Contact</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Course</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Joined</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Status</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                    {recentStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          No students found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      recentStudents.map((student) => <StudentTableRow key={student.id} student={student} />)
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 -translate-y-0 flex items-center justify-end gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>Students per page</span>
                <PaginationPageSizeSelect defaultValue={String(pageSize === "all" ? "all" : pageSize)} />
              </div>

              <div className="flex items-center gap-0.5">
                <span className="min-w-[88px] text-right text-xs font-medium text-slate-600 dark:text-slate-300">
                  {firstVisible}-{lastVisible} of {totalStudents}
                </span>

                <PaginationDots
                  currentPage={currentPageIndex}
                  totalPages={totalPages}
                  showSinglePage={true}
                  pageHrefs={Array.from({ length: totalPages }, (_, index) => buildPageHref(index + 1))}
                  previousHref={currentPageIndex > 0 ? buildPageHref(currentPageIndex) : undefined}
                  nextHref={currentPageIndex < totalPages - 1 ? buildPageHref(currentPageIndex + 2) : undefined}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
