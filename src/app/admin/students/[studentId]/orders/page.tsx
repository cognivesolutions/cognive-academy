import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminNavbar } from "@/app/admin/components/admin-navbar";
import { AdminModeToggle } from "@/app/admin/components/admin-mode-toggle.client";
import { AdminTableFilterBar } from "@/app/admin/components/admin-table-filter-bar";
import { CourseSearchInput } from "@/app/admin/components/course-search-input";
import { CourseSelect } from "@/app/admin/components/course-select";
import { PaginationDots } from "@/components/pagination-dots";
import { PaginationPageSizeSelect } from "@/app/admin/components/pagination-page-size-select";
import { StudentProfileToggle } from "../student-profile-toggle.client";
import { PurchaseHistoryTable } from "../purchase-history-table.client";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ studentId: string }> | { studentId: string };
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export default async function StudentOrderHistoryPage({ params, searchParams }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent(`/admin/students/${resolvedParams.studentId}/orders`)}`);
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
      orders: {
        orderBy: { createdAt: "desc" },
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
  });

  if (!student) {
    redirect("/admin/students");
  }

  const q = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] ?? "" : resolvedSearchParams.q ?? "";
  const courseFilter = Array.isArray(resolvedSearchParams.course)
    ? resolvedSearchParams.course[0] ?? "all"
    : resolvedSearchParams.course ?? "all";
  const statusFilter = Array.isArray(resolvedSearchParams.status)
    ? resolvedSearchParams.status[0] ?? "all"
    : resolvedSearchParams.status ?? "all";
  const rawPage = Number(Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page ?? "1");
  const rawPageSize = Array.isArray(resolvedSearchParams.pageSize)
    ? resolvedSearchParams.pageSize[0] ?? "10"
    : resolvedSearchParams.pageSize ?? "10";

  const searchTerm = q.trim().toLowerCase();
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const fallbackPageSize = rawPageSize === "all" ? "all" : Number(rawPageSize) || 10;
  const pageSize = fallbackPageSize === "all" ? "all" : Math.max(1, Math.min(100, fallbackPageSize));
  const page = Math.max(1, requestedPage);

  const courseOptions = [
    { value: "all", label: "All" },
    ...Array.from(new Set(student.orders.map((order) => order.course.title))).map((title) => ({ value: title, label: title })),
  ];

  const filteredOrders = student.orders.filter((order) => {
    const orderText = [
      order.id,
      order.course.title,
      order.status,
      String(Number(order.amount ?? 0)),
      new Date(order.createdAt).toLocaleDateString(),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !searchTerm || orderText.includes(searchTerm);
    const matchesCourse = courseFilter === "all" || order.course.title === courseFilter;
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const hasActiveFilters = Boolean(q || courseFilter !== "all" || statusFilter !== "all");
  const effectivePageSize = pageSize === "all" ? filteredOrders.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / effectivePageSize));
  const safePage = Math.min(page, totalPages);
  const firstVisible = filteredOrders.length === 0 ? 0 : (safePage - 1) * effectivePageSize + 1;
  const lastVisible = Math.min(safePage * effectivePageSize, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * effectivePageSize, safePage * effectivePageSize);

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();

    if (q) {
      params.set("q", q);
    }

    if (courseFilter !== "all") {
      params.set("course", courseFilter);
    }

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
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

              <StudentProfileToggle studentId={student.id} />
            </div>

            <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50/60 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Billing</p>
                  <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900 dark:text-white">Purchase history</h3>
                </div>
                <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {filteredOrders.length} orders
                </span>
              </div>

              <form method="GET">
                <AdminTableFilterBar
                  hasActiveFilters={hasActiveFilters}
                  clearFiltersHref={`/admin/students/${student.id}/orders`}
                  leftControls={
                    <>
                      <div className="min-w-[150px]">
                        <CourseSelect
                          name="course"
                          label="Course"
                          compact
                          hideLabel
                          placeholder="Course"
                          defaultValue={courseFilter || "all"}
                          options={courseOptions}
                          triggerClassName="!h-[38px] !min-h-[38px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          menuClassName="!min-w-[150px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
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
                          options={[
                            { value: "all", label: "All" },
                            { value: "PAID", label: "Paid" },
                            { value: "PENDING", label: "Pending" },
                            { value: "FAILED", label: "Failed" },
                            { value: "CANCELLED", label: "Cancelled" },
                          ]}
                          triggerClassName="!h-[38px] !min-h-[38px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          menuClassName="!min-w-[140px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                        />
                      </div>
                    </>
                  }
                  rightControls={<CourseSearchInput defaultValue={q} />}
                />
              </form>

              {filteredOrders.length === 0 ? (
                <div className="rounded-[16px] border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                  No purchases match your current search or status filter.
                </div>
              ) : (
                <>
                  <PurchaseHistoryTable
                    orders={paginatedOrders.map((order) => ({
                      id: order.id,
                      amount: Number(order.amount ?? 0),
                      status: order.status,
                      createdAt: order.createdAt,
                      course: {
                        title: order.course.title,
                      },
                    }))}
                  />

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
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}
