import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminNavbar } from "@/app/admin/components/admin-navbar";
import { AdminModeToggle } from "@/app/admin/components/admin-mode-toggle.client";
import { PaginationDots } from "@/components/pagination-dots";
import { PaginationPageSizeSelect } from "@/app/admin/components/pagination-page-size-select";
import { StudentCourseAccessFilterBar } from "./student-course-access-filter-bar.client";
import { StudentCourseAccessTableRow } from "./student-course-access-table-row.client";
import { StudentAccessActions } from "./student-access-actions.client";
import { StudentAdminQuickActions } from "./student-admin-actions.client";
import { StudentProfileToggle } from "./student-profile-toggle.client";
import { StudentProfileExportActions } from "../student-profile-export-actions.client";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ studentId: string }> | { studentId: string };
};

export default async function StudentDetailPage({
  params,
  searchParams,
}: Props & {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent(`/admin/students/${resolvedParams.studentId}`)}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [student, allCourses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: resolvedParams.studentId },
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
            grantedAt: true,
            createdAt: true,
            course: { select: { id: true, title: true, category: true } },
          },
        },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
    }),
    prisma.course.findMany({
      select: {
        id: true,
        title: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!student) {
    redirect("/admin/students");
  }

  const activeCourses = student.enrollments.filter((enrollment) => enrollment.accessGranted);
  const totalSpent = student.orders.reduce((sum, order) => sum + Number(order.amount ?? 0), 0);
  const pendingAccessCount = student.enrollments.filter((enrollment) => !enrollment.accessGranted).length;
  const latestOrder = student.orders[0];
  const enrolledCourseIds = new Set(student.enrollments.map((enrollment) => enrollment.course.id));
  const availableCourses = allCourses
    .filter((course) => !enrolledCourseIds.has(course.id))
    .map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category,
    }));
  const courseAccessCards = student.enrollments.map((enrollment) => {
    const matchingOrder = student.orders.find((order) => order.course.id === enrollment.course.id);

    return {
      id: enrollment.course.id,
      title: enrollment.course.title,
      category: enrollment.course.category ?? "General",
      accessGranted: enrollment.accessGranted,
      grantedAt: enrollment.grantedAt ?? enrollment.createdAt,
      lastPayment: matchingOrder ? {
        amount: Number(matchingOrder.amount ?? 0),
        status: matchingOrder.status,
        createdAt: matchingOrder.createdAt,
      } : null,
    };
  });

  const q = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] ?? "" : resolvedSearchParams.q ?? "";
  const status = Array.isArray(resolvedSearchParams.status) ? resolvedSearchParams.status[0] ?? "all" : resolvedSearchParams.status ?? "all";
  const selectedType = Array.isArray(resolvedSearchParams.type) ? resolvedSearchParams.type[0] ?? "all" : resolvedSearchParams.type ?? "all";
  const selectedCourse = Array.isArray(resolvedSearchParams.course)
    ? resolvedSearchParams.course[0] ?? ""
    : resolvedSearchParams.course ?? "";
  const selectedCategory = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category[0] ?? "all"
    : resolvedSearchParams.category ?? "all";
  const selectedJoined = Array.isArray(resolvedSearchParams.joined)
    ? resolvedSearchParams.joined[0] ?? "all"
    : resolvedSearchParams.joined ?? "all";
  const rawPage = Number(Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page ?? "1");
  const rawPageSize = Array.isArray(resolvedSearchParams.pageSize)
    ? resolvedSearchParams.pageSize[0] ?? "10"
    : resolvedSearchParams.pageSize ?? "10";

  const normalizedQuery = q.trim().toLowerCase();
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const fallbackPageSize = rawPageSize === "all" ? "all" : Number(rawPageSize) || 10;
  const pageSize = fallbackPageSize === "all" ? "all" : Math.max(1, Math.min(100, fallbackPageSize));
  const page = Math.max(1, requestedPage);

  const recordRows = student.enrollments.map((enrollment) => {
    const matchingOrder = student.orders.find((order) => order.course.id === enrollment.course.id);
    const derivedType = matchingOrder
      ? "Purchased"
      : enrollment.accessGranted
        ? "Manual access"
        : "Not assigned";

    return {
      id: `${student.id}-course-${enrollment.course.id}`,
      courseId: enrollment.course.id,
      title: enrollment.course.title,
      category: enrollment.course.category ?? "General",
      joinedAt: new Date(enrollment.createdAt),
      expiryLabel: enrollment.accessGranted ? "Lifetime" : "No access",
      type: derivedType,
      amount: "—",
      numericAmount: 0,
      status: enrollment.accessGranted ? "Access granted" : matchingOrder ? "Access revoked" : "Awaiting access",
      isActive: enrollment.accessGranted,
      isOrder: Boolean(matchingOrder),
    };
  });

  const uniqueCourseOptions = Array.from(
    new Map(
      recordRows.map((record) => [record.title, { value: record.title, label: record.title }]),
    ).values(),
  );

  const uniqueCategoryOptions = Array.from(
    new Map(
      recordRows.map((record) => [record.category, { value: record.category, label: record.category }]),
    ).values(),
  );

  const uniqueJoinedOptions = Array.from(
    new Map(
      recordRows.map((record) => {
        const label = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(record.joinedAt));
        return [label, { value: label, label }];
      }),
    ).values(),
  );

  const uniqueTypeOptions = Array.from(
    new Map(recordRows.map((record) => [record.type, { value: record.type, label: record.type }])).values(),
  );

  const uniqueStatusOptions = Array.from(
    new Map(recordRows.map((record) => [record.status, { value: record.status, label: record.status }])).values(),
  );

  const filteredRecords = recordRows.filter((record) => {
    const joinedDateText = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(record.joinedAt));

    const searchText = [
      record.title,
      record.category,
      joinedDateText,
      record.isActive ? "active" : "inactive",
      record.status,
      record.type,
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !normalizedQuery || searchText.includes(normalizedQuery);

    const matchesStatus =
      status === "all" ||
      (status === "granted" && record.status === "Access granted") ||
      (status === "revoked" && record.status === "Access revoked") ||
      (status === "awaiting" && record.status === "Awaiting access") ||
      (status === "active" && record.isActive) ||
      (status === "inactive" && !record.isActive);

    const matchesType = selectedType === "all" || record.type === selectedType;
    const matchesCourse = !selectedCourse || record.title === selectedCourse;
    const matchesCategory = selectedCategory === "all" || record.category === selectedCategory;
    const matchesJoined = selectedJoined === "all" || joinedDateText === selectedJoined;

    return matchesQuery && matchesStatus && matchesType && matchesCourse && matchesCategory && matchesJoined;
  });

  const hasActiveFilters = Boolean(q || status !== "all" || selectedType !== "all" || selectedCourse || selectedCategory !== "all" || selectedJoined !== "all");

  const effectivePageSize = pageSize === "all" ? filteredRecords.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / effectivePageSize));
  const safePage = Math.min(page, totalPages);
  const firstVisible = filteredRecords.length === 0 ? 0 : (safePage - 1) * effectivePageSize + 1;
  const lastVisible = Math.min(safePage * effectivePageSize, filteredRecords.length);
  const paginatedRecords = filteredRecords.slice((safePage - 1) * effectivePageSize, safePage * effectivePageSize);

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();

    if (q) {
      params.set("q", q);
    }

    if (status !== "all") {
      params.set("status", status);
    }

    if (selectedType !== "all") {
      params.set("type", selectedType);
    }

    if (selectedCourse) {
      params.set("course", selectedCourse);
    }

    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    if (selectedJoined !== "all") {
      params.set("joined", selectedJoined);
    }

    params.set("page", String(nextPage));
    params.set("pageSize", pageSize === "all" ? "all" : String(pageSize));

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "?";
  };

  const getOrderStatusClasses = (value: string) => {
    const normalized = value.toUpperCase();

    if (normalized === "PAID" || normalized === "SUCCESS" || normalized === "COMPLETED") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200";
    }

    if (normalized === "PENDING") {
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200";
    }

    if (normalized === "FAILED" || normalized === "CANCELLED" || normalized === "CANCELED") {
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200";
    }

    return "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";
  };

  const formatJoinedDate = (date: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Student profile</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <AdminModeToggle />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AdminNavbar />

          <section className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Profile</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{student.name ?? "Unnamed student"}</h2>
              </div>

              <StudentProfileToggle studentId={student.id} />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_18px_32px_rgba(99,102,241,0.10)] hover:from-indigo-100 hover:via-white hover:to-sky-50 dark:border-slate-700 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-800 dark:hover:border-indigo-500/20 dark:hover:shadow-[0_18px_32px_rgba(99,102,241,0.16)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Contact</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <div>{student.email}</div>
                  <div>{student.phone ?? "No phone number"}</div>
                  <div>Joined {formatJoinedDate(new Date(student.createdAt))}</div>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_32px_rgba(16,185,129,0.10)] hover:from-emerald-100 hover:via-white hover:to-teal-50 dark:border-slate-700 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-800 dark:hover:border-emerald-500/20 dark:hover:shadow-[0_18px_32px_rgba(16,185,129,0.16)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Active access</p>
                <div className="mt-3 text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-300">{activeCourses.length}</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Currently active course access</p>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_18px_32px_rgba(139,92,246,0.10)] hover:from-violet-100 hover:via-white hover:to-purple-50 dark:border-slate-700 dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-800 dark:hover:border-violet-500/20 dark:hover:shadow-[0_18px_32px_rgba(139,92,246,0.16)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Total enrolled courses</p>
                <div className="mt-3 text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-300">{student.enrollments.length}</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">All courses linked to this student</p>
              </div>
            </div>

            <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Quick actions</p>
                  <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900 dark:text-white">Admin controls</h3>
                </div>

                <div className="relative z-[80] flex flex-wrap items-center justify-end gap-2 rounded-full border border-slate-200 bg-white/80 p-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_24px_rgba(15,23,42,0.22)]">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <StudentAccessActions studentId={student.id} availableCourses={availableCourses} />
                    <StudentAdminQuickActions
                      studentId={student.id}
                      studentEmail={student.email}
                      studentName={student.name}
                      isActive={student.isActive}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div id="course-access" className="mt-6 scroll-mt-24">
              <StudentCourseAccessFilterBar
                defaultQ={q}
                defaultStatus={status}
                defaultType={selectedType}
                defaultCourse={selectedCourse}
                defaultCategory={selectedCategory}
                defaultJoined={selectedJoined}
                pageSize={pageSize === "all" ? "all" : String(pageSize)}
                hasActiveFilters={hasActiveFilters}
                courseOptions={uniqueCourseOptions}
                categoryOptions={uniqueCategoryOptions}
                joinedOptions={uniqueJoinedOptions}
                typeOptions={uniqueTypeOptions}
                statusOptions={uniqueStatusOptions}
              />

              <div className="overflow-hidden rounded-[20px] border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800/80">
                      <tr>
                        <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Course Name</th>
                        <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Category</th>
                        <th className="px-3 py-2.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Start Date</th>
                        <th className="px-3 py-2.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Expiry Date</th>
                        <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Type</th>
                        <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Status</th>
                        <th className="px-3 py-2.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            No course access records match your filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedRecords.map((record) => (
                          <StudentCourseAccessTableRow key={record.id} record={record} studentId={student.id} />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <StudentProfileExportActions
                    title={`Course access - ${student.name ?? "Student"}`}
                    filenamePrefix={`course-access-${student.name ?? "student"}`}
                    rows={filteredRecords.map((record) => ({
                      "Course Name": record.title,
                      Category: record.category,
                      Type: record.type,
                      "Start Date": new Intl.DateTimeFormat("en-GB", {
                        timeZone: "Asia/Kolkata",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(new Date(record.joinedAt)),
                      "Expiry Date": record.expiryLabel,
                      Status: record.status,
                    }))}
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span>Records per page</span>
                    <PaginationPageSizeSelect defaultValue={String(pageSize === "all" ? "all" : pageSize)} />
                  </div>

                  <div className="flex items-center gap-0.5">
                    <span className="min-w-[88px] text-right text-xs font-medium text-slate-600 dark:text-slate-300">
                      {filteredRecords.length === 0 ? 0 : firstVisible}-{lastVisible} of {filteredRecords.length}
                    </span>

                    <PaginationDots
                      currentPage={safePage - 1}
                      totalPages={totalPages}
                      showSinglePage={true}
                      pageHrefs={Array.from({ length: totalPages }, (_, index) => buildPageHref(index + 1))}
                      previousHref={safePage > 1 ? buildPageHref(safePage - 1) : undefined}
                      nextHref={safePage < totalPages ? buildPageHref(safePage + 1) : undefined}
                    />
                  </div>
                </div>
              </div>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}
