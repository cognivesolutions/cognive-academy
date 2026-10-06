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

const formatCurrencyInr = (value: number | string | null) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

function getOrderStatusClasses(value: string) {
  const normalized = value.toUpperCase();

  if (normalized === "PAID" || normalized === "SUCCESS" || normalized === "COMPLETED") {
    return "text-emerald-600 dark:text-emerald-300";
  }

  if (normalized === "PENDING") {
    return "text-amber-600 dark:text-amber-300";
  }

  if (normalized === "FAILED" || normalized === "CANCELLED" || normalized === "CANCELED") {
    return "text-rose-600 dark:text-rose-300";
  }

  return "text-slate-600 dark:text-slate-300";
}

export function StudentOrderHistoryTable({ orders }: { orders: PurchaseHistoryOrder[] }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/80">
            <tr>
              <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Course</th>
              <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Amount</th>
              <th className="px-3 py-2.5 align-middle text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-3 py-2.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Placed on</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
            {orders.map((order) => {
              const rowAmount = formatCurrencyInr(order.amount);
              const placedDate = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }).format(new Date(order.createdAt));

              return (
                <tr
                  key={order.id}
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest("a, button, input, select, textarea")) {
                      return;
                    }
                    router.push(`/admin/students/orders/${order.id}`);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/admin/students/orders/${order.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  aria-label={`Open order details for ${order.course.title}`}
                  className="group cursor-pointer align-middle transition-colors duration-200 hover:bg-indigo-50/90 hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:hover:bg-slate-800/80"
                  title={`Open order details for ${order.id} • ${order.course.title} • ${order.status} • ${rowAmount}`}
                >
                  <td className="px-3 py-2 align-middle text-left leading-[1.35]">
                    <div className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-white">{order.course.title}</div>
                  </td>
                  <td className="px-3 py-2 align-middle text-left text-[12.5px] leading-[1.35] text-slate-700 dark:text-slate-200">{rowAmount}</td>
                  <td className="px-3 py-2 align-middle text-left leading-[1.35]">
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] leading-none ${getOrderStatusClasses(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle text-center text-[12.5px] leading-[1.35] text-slate-700 dark:text-slate-200">{placedDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
