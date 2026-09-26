import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const statusOptions = ["ALL", "PAID", "PENDING", "FAILED", "REFUNDED"] as const;
const pageSize = 8;

function buildTransactionsUrl({
  status,
  search,
  startDate,
  endDate,
  invoice,
  page,
}: {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  invoice?: string;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (status && status !== "ALL") params.set("status", status);
  if (search) params.set("search", search);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (page && page > 1) params.set("page", String(page));
  if (invoice) params.set("invoice", invoice);

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
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; invoice?: string; search?: string; startDate?: string; endDate?: string; page?: string }> | { status?: string; invoice?: string; search?: string; startDate?: string; endDate?: string; page?: string };
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

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = !searchQuery
      ? true
      : `${order.invoiceNumber ?? order.id} ${order.course.title}`.toLowerCase().includes(searchQuery);

    const createdAt = new Date(order.createdAt);
    const matchesStart = !startDate ? true : createdAt >= new Date(`${startDate}T00:00:00`);
    const matchesEnd = !endDate ? true : createdAt <= new Date(`${endDate}T23:59:59`);

    return matchesSearch && matchesStart && matchesEnd;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const page = Math.min(safePage, totalPages);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const selectedOrder =
    paginatedOrders.find((order) => order.id === resolvedSearchParams.invoice) ??
    filteredOrders.find((order) => order.id === resolvedSearchParams.invoice) ??
    paginatedOrders[0] ??
    null;

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

  const invoiceData = selectedOrder
    ? `INVOICE\n${selectedOrder.invoiceNumber ?? selectedOrder.id}\nCourse: ${selectedOrder.course.title}\nAmount: ${formatCurrency(Number(selectedOrder.amount))}\nStatus: ${selectedOrder.status}\nDate: ${formatDate(selectedOrder.createdAt)}\nProvider: ${selectedOrder.paymentProvider}`
    : "";

  const invoiceDownloadHref = selectedOrder
    ? `data:text/plain;charset=utf-8,${encodeURIComponent(invoiceData)}`
    : "";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">Billing</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Transactions</h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="mb-8 overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 p-6 text-white shadow-[0_24px_60px_rgba(79,70,229,0.22)] dark:border-slate-700">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200">Payment overview</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">{formatCurrency(totalAmount)}</h2>
            </div>

            <form method="GET" className="flex w-full max-w-xl flex-col gap-2 rounded-[20px] border border-white/15 bg-white/5 p-2 backdrop-blur-sm sm:flex-row sm:items-center">
              <input
                type="search"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search invoice or course"
                className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-indigo-200/80 focus:outline-none"
              />
              <div className="flex items-center gap-2 sm:w-auto">
                <input
                  type="date"
                  name="startDate"
                  defaultValue={startDate}
                  className="rounded-full border border-white/15 bg-transparent px-3 py-2 text-xs text-white placeholder:text-indigo-200/80 focus:outline-none"
                />
                <input
                  type="date"
                  name="endDate"
                  defaultValue={endDate}
                  className="rounded-full border border-white/15 bg-transparent px-3 py-2 text-xs text-white placeholder:text-indigo-200/80 focus:outline-none"
                />
              </div>
              {statusFilter !== "ALL" ? <input type="hidden" name="status" value={statusFilter} /> : null}
              <button
                type="submit"
                className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Search
              </button>
            </form>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {monthlySummary.map((entry) => (
              <div key={entry.monthName} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">{entry.monthName}</div>
                <div className="mt-2 text-xl font-black text-white">{formatCurrency(entry.monthTotal)}</div>
              </div>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <section className="rounded-[30px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-800">🧾</div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900 dark:text-white">No transactions yet</h2>
            <p className="mt-2 mx-auto max-w-md text-sm text-slate-500 dark:text-slate-400">
              Your purchase history will appear here once you enroll in a course or complete a checkout.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/courses#course-results"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(79,70,229,0.25)] transition hover:brightness-110"
              >
                Explore courses
              </Link>
              {(startDate || endDate || searchQuery || statusFilter !== "ALL") && (
                <Link
                  href="/transactions"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  Clear filters
                </Link>
              )}
            </div>
          </section>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
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

                    return (
                      <Link
                        key={option}
                        href={url}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                          isActive
                            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                      >
                        {option}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {(startDate || endDate || searchQuery || statusFilter !== "ALL") && (
                <div className="mb-4 flex justify-end">
                  <Link
                    href="/transactions"
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
                  >
                    Clear filters
                  </Link>
                </div>
              )}

              <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Invoice</th>
                        <th className="px-4 py-3 font-semibold">Course</th>
                        <th className="px-4 py-3 font-semibold">Amount</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700 dark:divide-slate-700 dark:text-slate-200">
                      {paginatedOrders.map((order) => {
                        const isSelected = selectedOrder?.id === order.id;
                        const statusClasses =
                          order.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : order.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";

                        return (
                          <tr
                            key={order.id}
                            className={isSelected ? "bg-indigo-50/60 dark:bg-indigo-500/5" : "bg-white dark:bg-slate-900/80"}
                          >
                            <td className="px-4 py-4">
                              <Link
                                href={buildTransactionsUrl({ status: statusFilter, search: searchQuery || undefined, startDate: startDate || undefined, endDate: endDate || undefined, invoice: order.id, page })}
                                className="font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
                              >
                                {order.invoiceNumber ?? order.id.slice(0, 8).toUpperCase()}
                              </Link>
                            </td>
                            <td className="px-4 py-4">{order.course.title}</td>
                            <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">{formatCurrency(Number(order.amount))}</td>
                            <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusClasses}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4 lg:hidden">
                {paginatedOrders.map((order) => {
                  const statusClasses =
                    order.status === "PAID"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : order.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";

                  return (
                    <Link
                      key={order.id}
                      href={buildTransactionsUrl({ status: statusFilter, search: searchQuery || undefined, startDate: startDate || undefined, endDate: endDate || undefined, invoice: order.id, page })}
                      className={`block rounded-[22px] border p-4 ${selectedOrder?.id === order.id ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-500/30 dark:bg-indigo-500/5" : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            {order.invoiceNumber ?? order.id.slice(0, 8).toUpperCase()}
                          </div>
                          <div className="mt-2 text-base font-bold text-slate-900 dark:text-white">{order.course.title}</div>
                        </div>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusClasses}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                        <span>{formatCurrency(Number(order.amount))}</span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <Link
                    href={buildTransactionsUrl({ status: statusFilter, search: searchQuery || undefined, startDate: startDate || undefined, endDate: endDate || undefined, page: Math.max(1, page - 1) })}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold ${page === 1 ? "pointer-events-none border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-600" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}`}
                  >
                    Previous
                  </Link>

                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Page {page} of {totalPages}
                  </span>

                  <Link
                    href={buildTransactionsUrl({ status: statusFilter, search: searchQuery || undefined, startDate: startDate || undefined, endDate: endDate || undefined, page: Math.min(totalPages, page + 1) })}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold ${page === totalPages ? "pointer-events-none border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-600" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}`}
                  >
                    Next
                  </Link>
                </div>
              )}
            </section>

            <aside className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Payment details</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Invoice overview</h2>
                </div>
              </div>

              {selectedOrder ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Invoice</div>
                    <div className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                      {selectedOrder.invoiceNumber ?? selectedOrder.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/80">
                      <span>Course</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedOrder.course.title}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/80">
                      <span>Amount</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(Number(selectedOrder.amount))}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/80">
                      <span>Payment date</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{formatDate(selectedOrder.createdAt)}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/80">
                      <span>Provider</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedOrder.paymentProvider}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/80">
                      <span>Status</span>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                          selectedOrder.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : selectedOrder.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                        }`}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Reference</div>
                    <div className="mt-2 break-all text-sm font-medium text-slate-900 dark:text-white">
                      {selectedOrder.razorpayPaymentId ?? selectedOrder.razorpayOrderId ?? selectedOrder.id}
                    </div>
                  </div>

                  <a
                    href={invoiceDownloadHref}
                    download={`${(selectedOrder.invoiceNumber ?? selectedOrder.id).replace(/\s+/g, "-")}.txt`}
                    className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.22)] transition hover:brightness-110"
                  >
                    Download invoice
                  </a>
                </div>
              ) : null}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
