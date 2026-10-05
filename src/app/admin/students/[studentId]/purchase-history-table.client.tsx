"use client";

import { useRouter } from "next/navigation";

export type PurchaseHistoryOrder = {
  id: string;
  amount: number | string | null;
  status: string;
  createdAt: Date | string;
  course: {
    title: string;
  };
};

function getOrderStatusClasses(value: string) {
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
}

export function PurchaseHistoryTable({ orders }: { orders: PurchaseHistoryOrder[] }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/80">
            <tr>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Course</th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Amount</th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
            {orders.map((order) => {
              const rowAmount = `₹${Number(order.amount ?? 0).toLocaleString("en-IN")}`;
              const placedDate = new Date(order.createdAt).toLocaleDateString();

              return (
                <tr
                  key={order.id}
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/admin/orders/${order.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  aria-label={`Open order details for ${order.course.title}`}
                  className="cursor-pointer align-middle transition-all duration-200 hover:bg-slate-50/80 hover:shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:hover:bg-slate-800/70"
                  title={`Open order details for ${order.id} • ${order.course.title} • ${order.status} • ${rowAmount}`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">{order.course.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{rowAmount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] shadow-[0_6px_16px_rgba(15,23,42,0.04)] ${getOrderStatusClasses(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{placedDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
