import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminNavbar } from "@/app/admin/components/admin-navbar";
import { AdminModeToggle } from "@/app/admin/components/admin-mode-toggle.client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const session = await auth();
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent("/admin/orders")}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const q = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] ?? "" : resolvedSearchParams.q ?? "";
  const statusFilter = Array.isArray(resolvedSearchParams.status)
    ? resolvedSearchParams.status[0] ?? "all"
    : resolvedSearchParams.status ?? "all";

  const searchTerm = q.trim();

  const orders = await prisma.order.findMany({
    where: {
      ...(searchTerm
        ? {
            OR: [
              { user: { is: { name: { contains: searchTerm, mode: "insensitive" } } } },
              { user: { is: { email: { contains: searchTerm, mode: "insensitive" } } } },
              { course: { is: { title: { contains: searchTerm, mode: "insensitive" } } } },
              { id: { contains: searchTerm, mode: "insensitive" } },
              { invoiceNumber: { contains: searchTerm, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
      course: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Orders</h1>
          </div>

          <div className="flex items-center gap-2">
            <AdminModeToggle />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AdminNavbar />

          <section className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Billing</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">All orders</h2>
              </div>

              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {orders.length} total
              </span>
            </div>

            <div className="mb-4 flex flex-col gap-3 rounded-[18px] border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-800/60">
              <form className="flex w-full flex-col gap-3 md:flex-row md:items-center" action="/admin/orders" method="get">
                <label className="flex-1">
                  <span className="sr-only">Search orders</span>
                  <input
                    type="search"
                    name="q"
                    defaultValue={searchTerm}
                    placeholder="Search by student, course, email, ID..."
                    className="w-full rounded-full border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
                  />
                </label>

                <label className="min-w-[180px]">
                  <span className="sr-only">Filter by status</span>
                  <select
                    name="status"
                    defaultValue={statusFilter}
                    className="w-full rounded-full border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
                  >
                    <option value="all">All statuses</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </label>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.22)] transition hover:brightness-110"
                >
                  Apply
                </button>
              </form>

              {(searchTerm || statusFilter !== "all") && (
                <Link
                  href="/admin/orders"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Clear filters
                </Link>
              )}
            </div>

            <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800/80">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Student</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Course</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Amount</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Status</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          No orders match your current search or status filter.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => {
                        const statusClasses = (() => {
                          const normalized = order.status.toUpperCase();

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
                        })();

                        return (
                          <tr key={order.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/70">
                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                              <div className="font-semibold text-slate-900 dark:text-white">{order.user.name ?? "Unnamed student"}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{order.user.email}</div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                              <Link href={`/admin/orders/${order.id}`} className="transition hover:text-indigo-600 dark:hover:text-indigo-300">
                                {order.course.title}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">₹{Number(order.amount ?? 0).toLocaleString("en-IN")}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${statusClasses}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
