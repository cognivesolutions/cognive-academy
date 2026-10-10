import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminModeToggle } from "@/app/admin/components/admin-mode-toggle.client";
import { AdminNavbar } from "@/app/admin/components/admin-navbar";
import { AdminTableFilterBar } from "@/app/admin/components/admin-table-filter-bar";
import { CourseSearchInput } from "@/app/admin/components/course-search-input";
import { CourseSelect } from "@/app/admin/components/course-select";
import { PaginationDots } from "@/components/pagination-dots";
import { PaginationPageSizeSelect } from "@/app/admin/components/pagination-page-size-select";
import { PlacedOnDateFilter } from "@/app/admin/students/[studentId]/orders/placed-on-date-filter.client";
import { StudentPurchaseExportActions } from "./student-order-export-actions.client";

export const dynamic = "force-dynamic";

const formatPlacedDate = (value: Date | string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const normalizePlacedOnValue = (value: string) => {
  if (!value || value === "all") {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const [day, month, year] = value.split("/");
  if (day && month && year) {
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return "";
};

export default async function StudentOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent("/admin/students/orders")}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});

  const q = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] ?? "" : resolvedSearchParams.q ?? "";
  const studentFilter = Array.isArray(resolvedSearchParams.student)
    ? resolvedSearchParams.student[0] ?? "all"
    : resolvedSearchParams.student ?? "all";
  const studentIdFilter = Array.isArray(resolvedSearchParams.studentId)
    ? resolvedSearchParams.studentId[0] ?? "all"
    : resolvedSearchParams.studentId ?? "all";
  const courseFilter = Array.isArray(resolvedSearchParams.course)
    ? resolvedSearchParams.course[0] ?? "all"
    : resolvedSearchParams.course ?? "all";
  const courseIdFilter = Array.isArray(resolvedSearchParams.courseId)
    ? resolvedSearchParams.courseId[0] ?? "all"
    : resolvedSearchParams.courseId ?? "all";
  const categoryFilter = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category[0] ?? "all"
    : resolvedSearchParams.category ?? "all";
  const statusFilter = Array.isArray(resolvedSearchParams.status)
    ? resolvedSearchParams.status[0] ?? "all"
    : resolvedSearchParams.status ?? "all";
  const placedOnFilter = Array.isArray(resolvedSearchParams.placedOn)
    ? resolvedSearchParams.placedOn[0] ?? "all"
    : resolvedSearchParams.placedOn ?? "all";
  const amountFilter = Array.isArray(resolvedSearchParams.amount)
    ? resolvedSearchParams.amount[0] ?? "all"
    : resolvedSearchParams.amount ?? "all";
  const rawPage = Number(Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page ?? "1");
  const rawPageSize = Array.isArray(resolvedSearchParams.pageSize)
    ? resolvedSearchParams.pageSize[0] ?? "10"
    : resolvedSearchParams.pageSize ?? "10";

  const searchTerm = q.trim().toLowerCase();
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const fallbackPageSize = rawPageSize === "all" ? "all" : Number(rawPageSize) || 10;
  const pageSize = fallbackPageSize === "all" ? "all" : Math.max(1, Math.min(100, fallbackPageSize));
  const page = Math.max(1, requestedPage);

  const orders = await prisma.order.findMany({
    where: {
      user: {
        role: "STUDENT",
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          category: true,
        },
      },
    },
  });

  const studentOptions = [
    { value: "all", label: "All" },
    ...Array.from(
      new Map(
        orders
          .filter((order) => order.user?.name)
          .map((order) => [
            order.user.id,
            {
              value: order.user.id,
              label: order.user.name ?? "Unnamed student",
            },
          ]),
      ).values(),
    ),
  ];

  const studentIdOptions = [
    { value: "all", label: "All" },
    ...Array.from(new Set(orders.map((order) => order.user.id))).map((id) => ({ value: id, label: id })),
  ];

  const courseOptions = [
    { value: "all", label: "All" },
    ...Array.from(
      new Map(
        orders.map((order) => [
          order.course.id,
          {
            value: order.course.title,
            label: order.course.title,
          },
        ]),
      ).values(),
    ),
  ];

  const courseIdOptions = [
    { value: "all", label: "All" },
    ...Array.from(new Set(orders.map((order) => order.course.id))).map((id) => ({ value: id, label: id })),
  ];

  const categoryOptions = [
    { value: "all", label: "All" },
    ...Array.from(new Set(orders.map((order) => order.course.category ?? "General"))).map((category) => ({
      value: category,
      label: category,
    })),
  ];

  const formatCurrencyInr = (value: number | string | null) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

  const statusOptions = [
    { value: "all", label: "All" },
    ...Array.from(new Set(orders.map((order) => order.status))).map((status) => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
    })),
  ];

  const amountOptions = [
    { value: "all", label: "All" },
    ...Array.from(new Set(orders.map((order) => Number(order.amount ?? 0).toFixed(2))))
      .sort((a, b) => Number(a) - Number(b))
      .map((amount) => ({
        value: amount,
        label: formatCurrencyInr(amount),
      })),
  ];

  const placedOnInputValue = normalizePlacedOnValue(placedOnFilter);

  const filteredOrders = orders.filter((order) => {
    const rowText = [
      order.user.id,
      order.user.name ?? "",
      order.user.email ?? "",
      order.course.id,
      order.course.title,
      order.course.category ?? "General",
      String(Number(order.amount ?? 0)),
      formatCurrencyInr(order.amount),
      order.status,
      formatPlacedDate(order.createdAt),
      normalizePlacedOnValue(formatPlacedDate(order.createdAt)),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !searchTerm || rowText.includes(searchTerm);
    const matchesStudentId = studentIdFilter === "all" || order.user.id === studentIdFilter;
    const matchesStudent = studentFilter === "all" || order.user.id === studentFilter;
    const matchesCourseId = courseIdFilter === "all" || order.course.id === courseIdFilter;
    const matchesCourse = courseFilter === "all" || order.course.title === courseFilter;
    const matchesCategory = categoryFilter === "all" || (order.course.category ?? "General") === categoryFilter;
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPlacedOn = placedOnInputValue === "" || normalizePlacedOnValue(formatPlacedDate(order.createdAt)) === placedOnInputValue;
    const matchesAmount = amountFilter === "all" || Number(order.amount ?? 0).toFixed(2) === String(amountFilter);

    return matchesSearch && matchesStudentId && matchesStudent && matchesCourseId && matchesCourse && matchesCategory && matchesStatus && matchesPlacedOn && matchesAmount;
  });

  const totalStudents = new Set(orders.map((order) => order.user.id)).size;
  const activeAccessCount = orders.filter((order) => ["PAID", "SUCCESS", "COMPLETED"].includes(order.status.toUpperCase())).length;
  const pendingAccessCount = orders.filter((order) => ["PENDING", "INITIATED", "CREATED"].includes(order.status.toUpperCase())).length;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount ?? 0), 0);

  const effectivePageSize = pageSize === "all" ? filteredOrders.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / effectivePageSize));
  const safePage = Math.min(page, totalPages);
  const firstVisible = filteredOrders.length === 0 ? 0 : (safePage - 1) * effectivePageSize + 1;
  const lastVisible = Math.min(safePage * effectivePageSize, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * effectivePageSize, safePage * effectivePageSize);

  const hasActiveFilters = Boolean(
    q ||
      studentIdFilter !== "all" ||
      studentFilter !== "all" ||
      courseIdFilter !== "all" ||
      courseFilter !== "all" ||
      categoryFilter !== "all" ||
      statusFilter !== "all" ||
      placedOnFilter !== "all" ||
      amountFilter !== "all",
  );

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();

    if (q) {
      params.set("q", q);
    }

if (studentIdFilter !== "all") {
      params.set("studentId", studentIdFilter);
    }

    if (studentFilter !== "all") {
      params.set("student", studentFilter);
    }

    if (courseIdFilter !== "all") {
      params.set("courseId", courseIdFilter);
    }

    if (courseFilter !== "all") {
      params.set("course", courseFilter);
    }

    if (categoryFilter !== "all") {
      params.set("category", categoryFilter);
    }

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    if (placedOnFilter !== "all") {
      params.set("placedOn", placedOnFilter);
    }

    if (amountFilter !== "all") {
      params.set("amount", amountFilter);
    }

    params.set("page", String(nextPage));
    params.set("pageSize", pageSize === "all" ? "all" : String(pageSize));

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "?";
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Student purchases</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <AdminModeToggle />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AdminNavbar />

          <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Orders overview</p>
                <h2 className="mt-1.5 text-xl font-black tracking-tight text-slate-900 dark:text-white">Student purchases</h2>
              </div>
              <div className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {filteredOrders.length} purchases
              </div>
            </div>

            <div className="mb-5 mt-2 grid gap-3 lg:grid-cols-4">
              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_18px_32px_rgba(99,102,241,0.10)] dark:border-slate-700 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-800">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Students</p>
                <p className="mt-4 text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-300">{totalStudents}</p>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_32px_rgba(16,185,129,0.10)] dark:border-slate-700 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-800">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Paid orders</p>
                <p className="mt-4 text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-300">{activeAccessCount}</p>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_18px_32px_rgba(245,158,11,0.10)] dark:border-slate-700 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-800">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Pending</p>
                <p className="mt-4 text-2xl font-black tracking-tight text-amber-600 dark:text-amber-300">{pendingAccessCount}</p>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-white p-4 ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_18px_32px_rgba(139,92,246,0.10)] dark:border-slate-700 dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-800">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Revenue</p>
                <p className="mt-4 text-2xl font-black tracking-tight text-violet-600 dark:text-violet-300">{formatCurrencyInr(totalRevenue)}</p>
              </div>
            </div>

            <form method="GET">
              <AdminTableFilterBar
                hasActiveFilters={hasActiveFilters}
                clearFiltersHref="/admin/students/orders"
                leftControls={
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="min-w-[110px]">
                        <CourseSelect
                          name="studentId"
                          label="Student ID"
                          compact
                          hideLabel
                          placeholder="Student ID"
                          defaultValue={studentIdFilter || "all"}
                          options={studentIdOptions}
                          triggerClassName="!h-[34px] !min-h-[34px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          menuClassName="!min-w-[110px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                        />
                      </div>

                      <div className="min-w-[130px]">
                        <CourseSelect
                          name="student"
                          label="Student Name"
                          compact
                          hideLabel
                          placeholder="Student Name"
                          defaultValue={studentFilter || "all"}
                          options={studentOptions}
                          triggerClassName="!h-[34px] !min-h-[34px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          menuClassName="!min-w-[130px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                        />
                      </div>

                      <div className="min-w-[120px]">
                        <CourseSelect
                          name="courseId"
                          label="Course ID"
                          compact
                          hideLabel
                          placeholder="Course ID"
                          defaultValue={courseIdFilter || "all"}
                          options={courseIdOptions}
                          triggerClassName="!h-[34px] !min-h-[34px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          menuClassName="!min-w-[110px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                        />
                      </div>

                      <div className="min-w-[140px]">
                        <CourseSelect
                          name="course"
                          label="Course Name"
                          compact
                          hideLabel
                          placeholder="Course Name"
                          defaultValue={courseFilter || "all"}
                          options={courseOptions}
                          triggerClassName="!h-[34px] !min-h-[34px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          menuClassName="!min-w-[140px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                        />
                      </div>

                      <div className="min-w-[120px]">
                        <CourseSelect
                          name="category"
                          label="Category"
                          compact
                          hideLabel
                          placeholder="Category"
                          defaultValue={categoryFilter || "all"}
                          options={categoryOptions}
                          triggerClassName="!h-[34px] !min-h-[34px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          menuClassName="!min-w-[120px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                        />
                      </div>

                      <div className="min-w-[120px]">
                        <CourseSelect
                          name="amount"
                          label="Amount"
                          compact
                          hideLabel
                          placeholder="Amount"
                          defaultValue={amountFilter || "all"}
                          options={amountOptions}
                          triggerClassName="!h-[34px] !min-h-[34px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          menuClassName="!min-w-[120px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                        />
                      </div>

                      <div className="min-w-[110px]">
                        <CourseSelect
                          name="status"
                          label="Status"
                          compact
                          hideLabel
                          placeholder="Status"
                          defaultValue={statusFilter || "all"}
                          options={statusOptions}
                          triggerClassName="!h-[34px] !min-h-[34px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          menuClassName="!min-w-[110px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                        />
                      </div>

                      <div className="min-w-[120px]">
                        <PlacedOnDateFilter defaultValue={placedOnInputValue} />
                      </div>
                    </div>
                  </div>
                }
                rightControls={<CourseSearchInput defaultValue={q} />}
              />
            </form>

            {filteredOrders.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                No course orders match the current filters.
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-700">
                      <thead className="bg-slate-50 dark:bg-slate-800/80">
                        <tr>
                          <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Student ID</th>
                          <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Student Name</th>
                          <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Course ID</th>
                          <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Course Name</th>
                          <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Category</th>
                          <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Amount</th>
                          <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Status</th>
                          <th className="px-3 py-2.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Placed on</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                        {paginatedOrders.map((order) => {
                          const statusText = order.status.toUpperCase();
                          const statusTone =
                            statusText === "PAID" || statusText === "SUCCESS" || statusText === "COMPLETED"
                              ? "text-emerald-600 dark:text-emerald-300"
                              : statusText === "PENDING" || statusText === "INITIATED" || statusText === "CREATED"
                                ? "text-amber-600 dark:text-amber-300"
                                : statusText === "FAILED" || statusText === "CANCELLED" || statusText === "CANCELED"
                                  ? "text-rose-600 dark:text-rose-300"
                                  : "text-slate-600 dark:text-slate-300";

                          return (
                            <tr key={order.id} className="align-middle transition-colors duration-200 hover:bg-indigo-50/90 hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)] dark:hover:bg-slate-800/80">
                              <td className="px-3 py-2 align-middle text-left text-[12.5px] text-slate-700 dark:text-slate-200">{order.user.id}</td>
                              <td className="px-3 py-2 align-middle text-left">
                                <Link href={`/admin/students/${order.user.id}`} className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300">
                                  {order.user.name ?? "Unnamed student"}
                                </Link>
                              </td>
                              <td className="px-3 py-2 align-middle text-left text-[12.5px] text-slate-700 dark:text-slate-200">{order.course.id}</td>
                              <td className="px-3 py-2 align-middle text-left text-[12.5px] text-slate-700 dark:text-slate-200">{order.course.title}</td>
                              <td className="px-3 py-2 align-middle text-left text-[12.5px] text-slate-700 dark:text-slate-200">{order.course.category ?? "General"}</td>
                              <td className="px-3 py-2 align-middle text-left text-[12.5px] text-slate-700 dark:text-slate-200">{formatCurrencyInr(order.amount)}</td>
                              <td className="px-3 py-2 align-middle text-left leading-[1.35]">
                                <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] leading-none ${statusTone}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-3 py-2 align-middle text-center text-[12.5px] text-slate-700 dark:text-slate-200">
                                {formatPlacedDate(order.createdAt)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <StudentPurchaseExportActions
                      rows={filteredOrders.map((order) => ({
                        studentId: order.user.id,
                        student: order.user.name ?? "Unnamed student",
                        courseId: order.course.id,
                        course: order.course.title,
                        category: order.course.category ?? "General",
                        status: order.status,
                        placedOn: formatPlacedDate(order.createdAt),
                        amount: Number(order.amount ?? 0),
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
                        {filteredOrders.length === 0 ? 0 : firstVisible}-{lastVisible} of {filteredOrders.length}
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
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
