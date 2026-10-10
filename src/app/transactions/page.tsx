import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PaginationDots } from "@/components/pagination-dots";

import { PaginationPageSizeSelect } from "../admin/components/pagination-page-size-select";
import { TransactionsDateRangeFilterField } from "./date-range-filter.client";
import { TransactionsSearchInput } from "./transactions-search-input.client";
import { TransactionsTableRow } from "./transactions-table-row.client";

const statusOptions = ["ALL", "PAID", "PENDING", "FAILED", "REFUNDED"] as const;
const defaultPageSize = 10;

function buildTransactionsUrl({
  status,
  search,
  startDate,
  endDate,
  invoice,
  page,
  pageSize,
}: {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  invoice?: string;
  page?: number;
  pageSize?: number | "all" | string;
}) {
  const params = new URLSearchParams();

  if (status && status !== "ALL") params.set("status", status);
  if (search) params.set("search", search);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (invoice) params.set("invoice", invoice);
  if (page && page > 1) params.set("page", String(page));
  if (pageSize && pageSize !== defaultPageSize && pageSize !== "10") params.set("pageSize", String(pageSize));

  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function highlightText(value: string | null | undefined, searchTerm: string): ReactNode {
  const text = value ?? "";
  const trimmedTerm = searchTerm.trim();

  if (!trimmedTerm || !text) {
    return value ?? "";
  }

  const lowerText = text.toLowerCase();
  const lowerTerm = trimmedTerm.toLowerCase();
  const nodes: ReactNode[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const matchIndex = lowerText.indexOf(lowerTerm, startIndex);

    if (matchIndex === -1) {
      nodes.push(text.slice(startIndex));
      break;
    }

    if (matchIndex > startIndex) {
      nodes.push(text.slice(startIndex, matchIndex));
    }

    const matchText = text.slice(matchIndex, matchIndex + trimmedTerm.length);
    nodes.push(
      <mark
        key={`${matchIndex}-${startIndex}`}
        className="rounded-sm bg-amber-100 px-0.5 py-0.5 font-semibold text-slate-900 shadow-[inset_0_0_0_1px_rgba(202,138,4,0.18)] dark:bg-yellow-200 dark:text-slate-900"
      >
        {matchText}
      </mark>,
    );

    startIndex = matchIndex + trimmedTerm.length;
  }

  return nodes.length > 0 ? nodes : value ?? "";
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; invoice?: string; search?: string; startDate?: string; endDate?: string; page?: string; pageSize?: string }> | { status?: string; invoice?: string; search?: string; startDate?: string; endDate?: string; page?: string; pageSize?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams
    ? await Promise.resolve(searchParams)
    : { status: "ALL", invoice: undefined, search: "", startDate: "", endDate: "", page: "1" };

  const rawStatus = typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status.toUpperCase() : "ALL";
  const statusFilter = statusOptions.includes(rawStatus as (typeof statusOptions)[number]) ? rawStatus : "ALL";
  const searchQuery = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search.trim().toLowerCase() : "";
  const startDate = typeof resolvedSearchParams.startDate === "string" ? resolvedSearchParams.startDate : "";
  const endDate = typeof resolvedSearchParams.endDate === "string" ? resolvedSearchParams.endDate : "";
  const currentPage = Number.parseInt(typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : "1", 10);
  const safePage = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
  const requestedPageSize = typeof resolvedSearchParams.pageSize === "string" ? resolvedSearchParams.pageSize : String(defaultPageSize);
  const effectivePageSize = requestedPageSize === "all" ? Number.MAX_SAFE_INTEGER : Number.parseInt(requestedPageSize, 10) || defaultPageSize;

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  const filteredOrders = orders.filter((order) => {
    const searchableText = [
      order.invoiceNumber ?? order.id,
      order.id,
      order.course.title,
      order.course.category,
      order.status,
      String(order.amount),
      formatCurrency(Number(order.amount)),
      formatDate(order.createdAt),
      String(order.paymentProvider ?? ""),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !searchQuery ? true : searchableText.includes(searchQuery);

    const createdAt = new Date(order.createdAt);
    const matchesStart = !startDate ? true : createdAt >= new Date(`${startDate}T00:00:00`);
    const matchesEnd = !endDate ? true : createdAt <= new Date(`${endDate}T23:59:59`);

    return matchesSearch && matchesStart && matchesEnd;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / effectivePageSize));
  const page = Math.min(safePage, totalPages);
  const firstVisible = filteredOrders.length === 0 ? 0 : (page - 1) * effectivePageSize + 1;
  const lastVisible = Math.min(page * effectivePageSize, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice((page - 1) * effectivePageSize, page * effectivePageSize);

  const totalAmount = filteredOrders.reduce((sum, order) => sum + Number(order.amount), 0);
  const paidCount = filteredOrders.filter((order) => order.status === "PAID").length;
  const pendingCount = filteredOrders.filter((order) => order.status === "PENDING").length;

  const monthlySummary = Array.from({ length: 3 }, (_, index) => {
    const monthDate = new Date();
    monthDate.setDate(1);
    monthDate.setMonth(monthDate.getMonth() - index);

    const monthName = monthDate.toLocaleString("en-IN", { month: "short" });
    const monthTotal = filteredOrders
      .filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getFullYear() === monthDate.getFullYear() &&
          orderDate.getMonth() === monthDate.getMonth()
        );
      })
      .reduce((sum, order) => sum + Number(order.amount), 0);

    return { monthName, monthTotal };
  }).reverse();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">Billing</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Transactions</h1>
          </div>
        </div>

        <div className="mb-8 overflow-visible rounded-[30px] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.10),_rgba(255,255,255,0.98)_38%,_rgba(241,245,249,1)_100%)] p-4 shadow-[0_18px_32px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_rgba(10,18,31,0.96)_38%,_rgba(2,6,23,1)_100%)] dark:shadow-[0_18px_32px_rgba(15,23,42,0.28)]">
          <form method="GET" className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-start gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Purchased Date
              </span>

              <div className="relative z-20 flex items-center gap-2">
                <TransactionsDateRangeFilterField name="startDate" defaultValue={startDate} label="Start date" />
                <TransactionsDateRangeFilterField name="endDate" defaultValue={endDate} label="End date" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <TransactionsSearchInput defaultValue={searchQuery} />

              {(startDate || endDate || searchQuery || statusFilter !== "ALL") && (
                <Link
                  href="/transactions"
                  className="inline-flex h-[38px] items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-4 py-0 text-sm font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] transition hover:border-red-300 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
                >
                  Clear
                </Link>
              )}

              {statusFilter !== "ALL" ? <input type="hidden" name="status" value={statusFilter} /> : null}
            </div>
          </form>
        </div>

        <div>
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Invoice list</h2>

              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                  const isActive = option === statusFilter;
                  const url = buildTransactionsUrl({
                    status: option,
                    search: searchQuery || undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                  });

                  const activeClass =
                    option === "PAID"
                      ? "bg-emerald-600 text-white shadow-[0_10px_20px_rgba(16,185,129,0.22)] dark:bg-emerald-500 dark:text-white"
                      : option === "PENDING"
                        ? "bg-amber-500 text-white shadow-[0_10px_20px_rgba(245,158,11,0.22)] dark:bg-amber-400 dark:text-slate-900"
                        : option === "FAILED"
                          ? "bg-rose-500 text-white shadow-[0_10px_20px_rgba(244,63,94,0.22)] dark:bg-rose-500 dark:text-white"
                          : option === "REFUNDED"
                            ? "bg-violet-600 text-white shadow-[0_10px_20px_rgba(139,92,246,0.22)] dark:bg-violet-500 dark:text-white"
                            : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_12px_28px_rgba(79,70,229,0.25)] transition hover:brightness-110 dark:shadow-[0_12px_28px_rgba(99,102,241,0.35)]";

                  const idleClass =
                    option === "PAID"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/15"
                      : option === "PENDING"
                        ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/15"
                        : option === "FAILED"
                          ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/15"
                          : option === "REFUNDED"
                            ? "border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/15"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700";

                  return (
                    <Link
                      key={option}
                      href={url}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition ${isActive ? activeClass : idleClass}`}
                    >
                      {option}
                    </Link>
                  );
                })}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/60">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm dark:bg-slate-900">🧾</div>
                <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-900 dark:text-white">No transactions found</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                  There are no invoices matching the current filters. Try another status or clear the search.
                </p>
                {(startDate || endDate || searchQuery || statusFilter !== "ALL") && (
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/transactions"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                    >
                      Clear filters
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Invoice ID</th>
                          <th className="px-4 py-3 font-semibold">Course Name</th>
                          <th className="px-4 py-3 font-semibold">Amount</th>
                          <th className="px-4 py-3 font-semibold">Purchased Date</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700 dark:divide-slate-700 dark:text-slate-200">
                        {paginatedOrders.map((order) => {
                          const searchMatch = searchQuery
                            ? [
                                order.invoiceNumber ?? order.id,
                                order.id,
                                order.course.title,
                                order.course.category,
                                order.status,
                                String(order.amount),
                                formatCurrency(Number(order.amount)),
                                formatDate(order.createdAt),
                                String(order.paymentProvider ?? ""),
                              ]
                                .join(" ")
                                .toLowerCase()
                                .includes(searchQuery)
                            : false;

                          return (
                            <TransactionsTableRow
                              key={order.id}
                              order={order}
                              searchQuery={searchQuery}
                              statusFilter={statusFilter}
                              startDate={startDate}
                              endDate={endDate}
                              page={page}
                              searchMatch={searchMatch}
                              isSelected={false}
                            />
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4 lg:hidden">
                  {paginatedOrders.map((order) => {
                    const searchMatch = searchQuery
                      ? [
                          order.invoiceNumber ?? order.id,
                          order.id,
                          order.course.title,
                          order.course.category,
                          order.status,
                          String(order.amount),
                          formatCurrency(Number(order.amount)),
                          formatDate(order.createdAt),
                          String(order.paymentProvider ?? ""),
                        ]
                          .join(" ")
                          .toLowerCase()
                          .includes(searchQuery)
                      : false;
                    const statusClasses =
                      order.status === "PAID"
                        ? "text-emerald-600 dark:text-emerald-300"
                        : order.status === "PENDING"
                          ? "text-amber-600 dark:text-amber-300"
                          : order.status === "FAILED"
                            ? "text-rose-600 dark:text-rose-300"
                            : "text-slate-600 dark:text-slate-300";

                    return (
                      <Link
                        key={order.id}
                        href={`/transactions/${order.id}`}
                        className={`block rounded-[22px] border p-4 ${searchMatch ? "border-indigo-200 bg-indigo-50/40 dark:border-indigo-500/20 dark:bg-indigo-500/5" : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              {highlightText(order.invoiceNumber ?? order.id.slice(0, 8).toUpperCase(), searchQuery)}
                            </div>
                            <div className="mt-2 text-base font-normal text-slate-900 dark:text-white">{highlightText(order.course.title ?? "", searchQuery)}</div>
                          </div>
                          <span className={`${statusClasses} text-sm font-normal`}>{highlightText(order.status, searchQuery)}</span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-900 dark:text-white">
                          <span className="whitespace-nowrap">{highlightText(formatCurrency(Number(order.amount)), searchQuery)}</span>
                          <span className="whitespace-nowrap text-right">{highlightText(formatDate(order.createdAt), searchQuery)}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-end border-t border-slate-200 pt-3 dark:border-slate-700">
                  <div className="flex items-center justify-end gap-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      <span>Records per page</span>
                      <PaginationPageSizeSelect
                        defaultValue={requestedPageSize === "all" ? "10" : String(effectivePageSize)}
                        options={[
                          { value: "5", label: "5" },
                          { value: "10", label: "10" },
                          { value: "20", label: "20" },
                          { value: "50", label: "50" },
                          { value: "100", label: "100" },
                        ]}
                      />
                    </div>

                    <span className="min-w-[78px] text-right text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      {filteredOrders.length === 0 ? 0 : firstVisible}-{lastVisible} of {filteredOrders.length}
                    </span>

                    <PaginationDots
                      currentPage={page - 1}
                      totalPages={totalPages}
                      showSinglePage={true}
                      pageHrefs={Array.from({ length: totalPages }, (_, index) =>
                        buildTransactionsUrl({
                          status: statusFilter,
                          search: searchQuery || undefined,
                          startDate: startDate || undefined,
                          endDate: endDate || undefined,
                          page: index + 1,
                          pageSize: requestedPageSize,
                        }),
                      )}
                      previousHref={
                        page > 1
                          ? buildTransactionsUrl({
                              status: statusFilter,
                              search: searchQuery || undefined,
                              startDate: startDate || undefined,
                              endDate: endDate || undefined,
                              page: page - 1,
                              pageSize: requestedPageSize,
                            })
                          : undefined
                      }
                      nextHref={
                        page < totalPages
                          ? buildTransactionsUrl({
                              status: statusFilter,
                              search: searchQuery || undefined,
                              startDate: startDate || undefined,
                              endDate: endDate || undefined,
                              page: page + 1,
                              pageSize: requestedPageSize,
                            })
                          : undefined
                      }
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
