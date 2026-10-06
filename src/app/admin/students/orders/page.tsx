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
  const courseFilter = Array.isArray(resolvedSearchParams.course)
    ? resolvedSearchParams.course[0] ?? "all"
    : resolvedSearchParams.course ?? "all";
  const statusFilter = Array.isArray(resolvedSearchParams.status)
    ? resolvedSearchParams.status[0] ?? "all"
    : resolvedSearchParams.status ?? "all";
  const placedOnFilter = Array.isArray(resolvedSearchParams.placedOn)
    ? resolvedSearchParams.placedOn[0] ?? "all"
    : resolvedSearchParams.placedOn ?? "all";
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

  const priceOptions = [
    { value: "all", label: "All" },
    ...Array.from(new Set(orders.map((order) => String(Number(order.amount ?? 0))))).map((amountValue) => ({
      value: amountValue,
      label: `₹${Number(amountValue).toLocaleString("en-IN")}`,
    })),
  ];

  const statusOptions = [
    { value: "all", label: "All" },
    ...Array.from(new Set(orders.map((order) => order.status))).map((status) => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
    })),
  ];

  const placedOnInputValue = normalizePlacedOnValue(placedOnFilter);

  const filteredOrders = orders.filter((order) => {
    const rowText = [
      order.user.name ?? "",
      order.user.email ?? "",
      order.course.title,
      String(Number(order.amount ?? 0)),
      `₹${Number(order.amount ?? 0).toLocaleString("en-IN")}`,
      order.status,
      formatPlacedDate(order.createdAt),
      normalizePlacedOnValue(formatPlacedDate(order.createdAt)),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !searchTerm || rowText.includes(searchTerm);
    const matchesStudent = studentFilter === "all" || order.user.id === studentFilter;
    const matchesCourse = courseFilter === "all" || order.course.title === courseFilter;
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPlacedOn = placedOnInputValue === "" || normalizePlacedOnValue(formatPlacedDate(order.createdAt)) === placedOnInputValue;

    return matchesSearch && matchesStudent && matchesCourse && matchesStatus && matchesPlacedOn;
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
      studentFilter !== "all" ||
      courseFilter !== "all" ||
      statusFilter !== "all" ||
      placedOnFilter !== "all",
  );

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();

    if (q) {
      params.set("q", q);
    }

    if (studentFilter !== "all") {
      params.set("student", studentFilter);
    }

    if (courseFilter !== "all") {
      params.set("course", courseFilter);
    }

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    if (placedOnFilter !== "all") {
      params.set("placedOn", placedOnFilter);
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
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Student dashboard</h1>
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
                <h2 className="mt-1.5 text-xl font-black tracking-tight text-slate-900 dark:text-white">Course orders</h2>
              </div>
              <div className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {filteredOrders.length} records
              </div>
            </div>

            <div className="mb-5 grid gap-3 lg:grid-cols-4">
              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_18px_32px_rgba(99,102,241,0.10)] dark:border-slate-700 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Students</p>
                <p className="mt-4 text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-300">{totalStudents}</p>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_32px_rgba(16,185,129,0.10)] dark:border-slate-700 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Paid orders</p>
                <p className="mt-4 text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-300">{activeAccessCount}</p>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_18px_32px_rgba(245,158,11,0.10)] dark:border-slate-700 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Pending</p>
                <p className="mt-4 text-2xl font-black tracking-tight text-amber-600 dark:text-amber-300">{pendingAccessCount}</p>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_18px_32px_rgba(139,92,246,0.10)] dark:border-slate-700 dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-900">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Revenue</p>
                <p className="mt-4 text-2xl font-black tracking-tight text-violet-600 dark:text-violet-300">₹{totalRevenue.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <form method="GET">
              <AdminTableFilterBar
                hasActiveFilters={hasActiveFilters}
                clearFiltersHref="/admin/students/orders"
                leftControls={
                  <>
                    <div className="min-w-[150px]">
                      <CourseSelect
                        name="student"
                        label="Student"
                        compact
                        hideLabel
                        placeholder="Student"
                        defaultValue={studentFilter || "all"}
                        options={studentOptions}
                        triggerClassName="!h-[38px] !min-h-[38px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                        menuClassName="!min-w-[150px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                      />
                    </div>

                    <div className="min-w-[160px]">
                      <CourseSelect
                        name="course"
                        label="Course"
                        compact
                        hideLabel
                        placeholder="Course"
                        defaultValue={courseFilter || "all"}
                        options={courseOptions}
                        triggerClassName="!h-[38px] !min-h-[38px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                        menuClassName="!min-w-[160px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                      />
                    </div>

                    <div className="min-w-[140px]">
                      <CourseSelect
                        name="status"
                        label="Status"
                        compact
                        hideLabel
                        placeholder="Status"
                        defaultValue={statusFilter || "all"}
                        options={statusOptions}
                        triggerClassName="!h-[38px] !min-h-[38px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                        menuClassName="!min-w-[140px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                      />
                    </div>

                    <PlacedOnDateFilter defaultValue={placedOnInputValue} />
                  </>
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
                          <th className="px-4 py-3 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Student</th>
                          <th className="px-4 py-3 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Course</th>
                          <th className="px-4 py-3 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Status</th>
                          <th className="px-4 py-3 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Placed on</th>
                          <th className="px-4 py-3 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Price</th>
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
                            <tr key={order.id} className="align-middle transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/80">
                              <td className="px-4 py-4 align-middle text-left">
                                <Link href={`/admin/students/${order.user.id}`} className="font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300">
                                  {order.user.name ?? "Unnamed student"}
                                </Link>
                              </td>
                              <td className="px-4 py-4 align-middle text-left text-sm text-slate-700 dark:text-slate-200">{order.course.title}</td>
                              <td className="px-4 py-4 align-middle text-left leading-[1.35]">
                                <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] leading-none ${statusTone}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 align-middle text-center text-sm text-slate-600 dark:text-slate-300">
                                {formatPlacedDate(order.createdAt)}
                              </td>
                              <td className="px-4 py-4 align-middle text-left text-sm text-slate-700 dark:text-slate-200">₹{Number(order.amount ?? 0).toLocaleString("en-IN")}</td>
                            </tr>
                          );
                        })}
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
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
