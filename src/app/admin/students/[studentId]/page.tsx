import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminNavbar } from "@/app/admin/components/admin-navbar";
import { AdminModeToggle } from "@/app/admin/components/admin-mode-toggle.client";
import { PaginationDots } from "@/components/pagination-dots";
import { PaginationPageSizeSelect } from "@/app/admin/components/pagination-page-size-select";
import { StudentRecordsFilterBar } from "./student-records-filter-bar.client";
import { StudentRecordTableRow } from "./student-record-row.client";

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

  const student = await prisma.user.findUnique({
    where: { id: resolvedParams.studentId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      enrollments: {
        select: {
          accessGranted: true,
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
          course: { select: { title: true } },
        },
      },
    },
  });

  if (!student) {
    redirect("/admin/students");
  }

  const activeCourses = student.enrollments.filter((enrollment) => enrollment.accessGranted);

  const q = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] ?? "" : resolvedSearchParams.q ?? "";
  const status = Array.isArray(resolvedSearchParams.status) ? resolvedSearchParams.status[0] ?? "all" : resolvedSearchParams.status ?? "all";
  const selectedCourse = Array.isArray(resolvedSearchParams.course)
    ? resolvedSearchParams.course[0] ?? ""
    : resolvedSearchParams.course ?? "";
  const selectedType = Array.isArray(resolvedSearchParams.type)
    ? resolvedSearchParams.type[0] ?? "all"
    : resolvedSearchParams.type ?? "all";
  const selectedPrice = Array.isArray(resolvedSearchParams.price)
    ? resolvedSearchParams.price[0] ?? "all"
    : resolvedSearchParams.price ?? "all";
  const rawPage = Number(Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page ?? "1");
  const rawPageSize = Array.isArray(resolvedSearchParams.pageSize)
    ? resolvedSearchParams.pageSize[0] ?? "10"
    : resolvedSearchParams.pageSize ?? "10";

  const normalizedQuery = q.trim().toLowerCase();
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const fallbackPageSize = rawPageSize === "all" ? "all" : Number(rawPageSize) || 10;
  const pageSize = fallbackPageSize === "all" ? "all" : Math.max(1, Math.min(100, fallbackPageSize));
  const page = Math.max(1, requestedPage);

  const recordRows = [
    ...student.enrollments.map((enrollment) => ({
      id: `${student.id}-course-${enrollment.course.id}`,
      courseId: enrollment.course.id,
      title: enrollment.course.title,
      category: enrollment.course.category ?? "General",
      type: enrollment.accessGranted ? "Active" : "Pending",
      amount: "—",
      numericAmount: 0,
      status: enrollment.accessGranted ? "Access granted" : "Awaiting access",
      isActive: enrollment.accessGranted,
      isOrder: false,
    })),
    ...student.orders.map((order) => ({
      id: `${student.id}-order-${order.id}`,
      courseId: null,
      title: order.course.title,
      category: "Order",
      type: "Order",
      amount: `₹${order.amount}`,
      numericAmount: Number(order.amount ?? 0),
      status: order.status,
      isActive: order.status === "PAID" || order.status === "SUCCESS" || order.status === "COMPLETED",
      isOrder: true,
    })),
  ];

  const uniqueCourseOptions = Array.from(
    new Map(
      recordRows.map((record) => [record.title, { value: record.title, label: record.title }]),
    ).values(),
  );

  const priceOptions = [
    { value: "all", label: "All" },
    ...Array.from(
      new Set(
        recordRows
          .filter((record) => record.isOrder && Number(record.numericAmount) > 0)
          .map((record) => String(Number(record.numericAmount))),
      ),
    )
      .sort((a, b) => Number(a) - Number(b))
      .map((amount) => ({
        value: amount,
        label: `₹${Number(amount).toLocaleString("en-IN")}`,
      })),
  ];

  const filteredRecords = recordRows.filter((record) => {
    const searchText = [
      record.title,
      record.category,
      record.type,
      record.status,
      record.amount,
      record.isOrder ? "order" : "enrollment",
      record.isOrder ? "paid" : "active",
      record.numericAmount > 0 ? String(record.numericAmount) : "0",
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !normalizedQuery || searchText.includes(normalizedQuery);

    const matchesStatus =
      status === "all" ||
      (status === "active"
        ? record.isActive
        : !record.isActive);

    const matchesCourse = !selectedCourse || record.title === selectedCourse;

    const matchesType =
      selectedType === "all" ||
      (selectedType === "enrollment" && !record.isOrder) ||
      (selectedType === "order" && record.isOrder) ||
      (selectedType === "active" && record.isActive) ||
      (selectedType === "pending" && !record.isActive && !record.isOrder);

    const matchesPrice =
      selectedPrice === "all" ||
      (selectedPrice === "under-2000" && record.numericAmount > 0 && record.numericAmount < 2000) ||
      (selectedPrice === "2000-5000" && record.numericAmount >= 2000 && record.numericAmount <= 5000) ||
      (selectedPrice === "above-5000" && record.numericAmount > 5000) ||
      (selectedPrice === "free" && record.numericAmount === 0) ||
      (selectedPrice !== "all" && selectedPrice !== "under-2000" && selectedPrice !== "2000-5000" && selectedPrice !== "above-5000" && selectedPrice !== "free" && Number(selectedPrice) === record.numericAmount);

    return matchesQuery && matchesStatus && matchesCourse && matchesType && matchesPrice;
  });

  const hasActiveFilters = Boolean(q || status !== "all" || selectedCourse || selectedType !== "all" || selectedPrice !== "all");

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

    if (selectedCourse) {
      params.set("course", selectedCourse);
    }

    if (selectedType !== "all") {
      params.set("type", selectedType);
    }

    if (selectedPrice !== "all") {
      params.set("price", selectedPrice);
    }

    params.set("page", String(nextPage));
    params.set("pageSize", pageSize === "all" ? "all" : String(pageSize));

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "?";
  };

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

              <div className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {student.enrollments.length} courses
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Contact</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <div>{student.email}</div>
                  <div>{student.phone ?? "No phone number"}</div>
                  <div>Joined {new Date(student.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Enrollments</p>
                <div className="mt-3 text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-300">{activeCourses.length}</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Active course access</p>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Orders</p>
                <div className="mt-3 text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-300">{student.orders.length}</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Recent transactions</p>
              </div>
            </div>

            <div className="mt-6">
              <StudentRecordsFilterBar
                defaultQ={q}
                defaultStatus={status}
                defaultCourse={selectedCourse}
                defaultType={selectedType}
                defaultPrice={selectedPrice}
                pageSize={pageSize === "all" ? "all" : String(pageSize)}
                hasActiveFilters={hasActiveFilters}
                courseOptions={uniqueCourseOptions}
                priceOptions={priceOptions}
              />

              <div className="overflow-hidden rounded-[20px] border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800/80">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Course</th>
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Category</th>
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Type</th>
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Order</th>
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Status</th>
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            No course or order records match your filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedRecords.map((record) => (
                          <StudentRecordTableRow key={record.id} record={record} />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-1.5 text-sm text-slate-600 dark:text-slate-300">
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
          </section>
        </div>
      </div>
    </main>
  );
}
