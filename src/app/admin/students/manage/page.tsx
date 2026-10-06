import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PaginationDots } from "@/components/pagination-dots";
import { StudentFilterBar } from "../student-filter-bar.client";
import { StudentTableRow } from "../student-table-row.client";
import { AdminModeToggle } from "@/app/admin/components/admin-mode-toggle.client";
import { AdminNavbar } from "@/app/admin/components/admin-navbar";
import { PaginationPageSizeSelect } from "@/app/admin/components/pagination-page-size-select";
import { StudentManageExportActions } from "./student-manage-export-actions.client";

export const dynamic = "force-dynamic";

const formatIstDateForFilter = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
};

const formatIstDate = (date: Date, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    ...options,
  }).format(date);

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
  const studentFilter = Array.isArray(resolvedSearchParams.student) ? resolvedSearchParams.student[0] : resolvedSearchParams.student ?? "all";
  const mobileFilter = Array.isArray(resolvedSearchParams.mobile) ? resolvedSearchParams.mobile[0] : resolvedSearchParams.mobile ?? "all";
  const joiningFilter = Array.isArray(resolvedSearchParams.joining) ? resolvedSearchParams.joining[0] : resolvedSearchParams.joining ?? "all";
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
    where.isActive = status === "active";
  }

  const students = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
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

  const getStatusValue = (student: (typeof students)[number]) => (student.isActive ? "active" : "inactive");
  const matchesActiveFilters = (
    student: (typeof students)[number],
    filters: {
      student: string;
      mobile: string;
      status: string;
      joining: string;
    },
  ) => {
    const joinedDate = new Date(student.createdAt);
    const joinedDateValue = formatIstDateForFilter(joinedDate);
    const statusValue = getStatusValue(student);

    const matchesStudentFilter = filters.student === "all" || student.id === filters.student;
    const matchesMobileFilter = filters.mobile === "all" || student.phone?.trim() === filters.mobile;
    const matchesStatusFilter = filters.status === "all" || statusValue === filters.status;
    const matchesJoiningFilter = filters.joining === "all" || joinedDateValue === filters.joining;

    return matchesStudentFilter && matchesMobileFilter && matchesStatusFilter && matchesJoiningFilter;
  };

  const buildCascadingOptions = (field: "student" | "mobile" | "status") => {
    const candidateUsers = students.filter((student) => {
      const nextFilters = {
        student: field === "student" ? "all" : studentFilter,
        mobile: field === "mobile" ? "all" : mobileFilter,
        status: field === "status" ? "all" : status,
        joining: joiningFilter,
      };

      return matchesActiveFilters(student, nextFilters);
    });

    if (field === "student") {
      return Array.from(
        new Map(
          candidateUsers
            .filter((student) => student.name?.trim())
            .map((student) => [student.id, { value: student.id, label: student.name ?? "Unnamed student" }]),
        ).values(),
      );
    }

    if (field === "mobile") {
      return Array.from(
        new Set(
          candidateUsers
            .map((student) => student.phone?.trim())
            .filter((phone): phone is string => Boolean(phone)),
        ),
      )
        .sort()
        .map((phone) => ({ value: phone, label: phone }));
    }

    return Array.from(
      new Map(
        candidateUsers.map((student) => [
          getStatusValue(student),
          {
            value: getStatusValue(student),
            label: student.isActive ? "Active" : "Inactive",
          },
        ]),
      ).values(),
    );
  };

  const studentOptions = buildCascadingOptions("student");
  const mobileOptions = buildCascadingOptions("mobile");
  const statusOptions = buildCascadingOptions("status");

  const effectiveStudentFilter = studentFilter !== "all" && !studentOptions.some((option) => option.value === studentFilter)
    ? "all"
    : studentFilter;
  const effectiveMobileFilter = mobileFilter !== "all" && !mobileOptions.some((option) => option.value === mobileFilter)
    ? "all"
    : mobileFilter;
  const effectiveStatus = status !== "all" && !statusOptions.some((option) => option.value === status)
    ? "all"
    : status;

  const filteredStudents = students.filter((student) => {
    const joinedDate = new Date(student.createdAt);
    const joinedDateValue = formatIstDateForFilter(joinedDate);
    const statusLabel = getStatusValue(student);
    const courseCount = student.enrollments.length;

    const matchesStudentFilter = effectiveStudentFilter === "all" || student.id === effectiveStudentFilter;
    const matchesMobileFilter = effectiveMobileFilter === "all" || student.phone?.trim() === effectiveMobileFilter;
    const matchesStatusFilter = effectiveStatus === "all" || statusLabel === effectiveStatus;
    const matchesJoiningFilter = joiningFilter === "all" || joinedDateValue === joiningFilter;

    if (!matchesStudentFilter || !matchesMobileFilter || !matchesStatusFilter || !matchesJoiningFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableValues = [
      student.name ?? "",
      student.email ?? "",
      student.phone ?? "",
      statusLabel,
      student.isActive ? "Active" : "Inactive",
      joinedDateValue,
      formatIstDate(joinedDate, { day: "2-digit", month: "2-digit", year: "numeric" }),
      formatIstDate(joinedDate, { day: "2-digit", month: "short", year: "numeric" }),
      String(courseCount),
      `${courseCount} course${courseCount === 1 ? "" : "s"}`,
    ];

    return searchableValues.some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  const totalStudents = filteredStudents.length;
  const activeStudents = filteredStudents.filter((student) => student.isActive).length;
  const inactiveStudents = filteredStudents.filter((student) => !student.isActive).length;
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

    if (effectiveStudentFilter !== "all") {
      params.set("student", effectiveStudentFilter);
    }

    if (effectiveMobileFilter !== "all") {
      params.set("mobile", effectiveMobileFilter);
    }

    if (joiningFilter !== "all") {
      params.set("joining", joiningFilter);
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Student management</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <AdminModeToggle />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AdminNavbar />

          <section className="-mt-0 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Control center</p>
                <h2 className="mt-1.5 text-xl font-black tracking-tight text-slate-900 dark:text-white">Manage students</h2>
              </div>
              <div className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {totalStudents} Students
              </div>
            </div>

            <div className="mb-5 mt-2 grid gap-3 lg:grid-cols-3">
              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_18px_32px_rgba(99,102,241,0.10)] hover:from-indigo-100 hover:via-white hover:to-sky-50 dark:border-slate-700 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-800 dark:hover:border-indigo-500/20 dark:hover:shadow-[0_18px_32px_rgba(99,102,241,0.16)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Total students</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-300" />
                    Users
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-300">{totalStudents}</p>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_32px_rgba(16,185,129,0.10)] hover:from-emerald-100 hover:via-white hover:to-teal-50 dark:border-slate-700 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-800 dark:hover:border-emerald-500/20 dark:hover:shadow-[0_18px_32px_rgba(16,185,129,0.16)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Active Student</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-300" />
                    Active
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-300">{activeStudents}</p>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-rose-50 via-white to-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-[0_18px_32px_rgba(244,63,94,0.10)] hover:from-rose-100 hover:via-white hover:to-red-50 dark:border-slate-700 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-800 dark:hover:border-red-500/20 dark:hover:shadow-[0_18px_32px_rgba(244,63,94,0.16)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Inactive Student</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 dark:bg-rose-300" />
                    Inactive
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-300">{inactiveStudents}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <StudentFilterBar
                defaultQ={q}
                defaultStatus={effectiveStatus}
                defaultStudent={effectiveStudentFilter}
                defaultMobile={effectiveMobileFilter}
                defaultJoining={joiningFilter}
                studentOptions={studentOptions}
                mobileOptions={mobileOptions}
                statusOptions={statusOptions}
              />
            </div>

            <div className="overflow-hidden rounded-[20px] border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800/80">
                    <tr>
                      <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Student Name</th>
                      <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Email</th>
                      <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Mobile</th>
                      <th className="px-3 py-2.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Course</th>
                      <th className="px-3 py-2.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Joined On</th>
                      <th className="px-3 py-2.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Status</th>
                      <th className="px-3 py-2.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Actions</th>
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

            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <StudentManageExportActions
                  rows={recentStudents.map((student) => ({
                    name: student.name ?? "Unnamed student",
                    email: student.email ?? "N/A",
                    mobile: student.phone ?? "N/A",
                    courseCount: String(student.enrollments.length),
                    joinedOn: formatIstDate(new Date(student.createdAt), {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }),
                    status: student.isActive ? "Active" : "Inactive",
                  }))}
                />
              </div>

              <div className="flex items-center gap-1.5">
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
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
