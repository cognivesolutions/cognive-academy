import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminModeToggle } from "@/app/admin/components/admin-mode-toggle.client";
import { AdminNavbar } from "@/app/admin/components/admin-navbar";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }> | { orderId: string };
};

const formatCurrencyInr = (value: number | string | null) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

export default async function OrderDetailPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent(`/admin/students/orders/${resolvedParams.orderId}`)}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.orderId },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      paymentProvider: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      invoiceNumber: true,
      createdAt: true,
      updatedAt: true,
      course: {
        select: {
          id: true,
          title: true,
          category: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: order.user.id,
        courseId: order.course.id,
      },
    },
    select: {
      id: true,
    },
  });

  const hasCourseAccessRecord = Boolean(enrollment);
  const courseAccessHref = enrollment
    ? `/admin/students/${order.user.id}/courses/${order.course.id}`
    : undefined;

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
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Order details</h1>
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
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{order.course.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClasses}`}>
                  {order.status}
                </span>

                {hasCourseAccessRecord && courseAccessHref ? (
                  <Link
                    href={courseAccessHref}
                    className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-semibold normal-case tracking-[0.02em] text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:bg-indigo-500/20"
                  >
                    View course access
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    title="No course access record exists for this order"
                    className="inline-flex cursor-not-allowed items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-semibold normal-case tracking-[0.02em] text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500"
                  >
                    No access record
                  </span>
                )}

                <Link
                  href="/admin/students/orders"
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold normal-case tracking-[0.02em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                >
                  Back to order history
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Amount</p>
                <div className="mt-3 text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-300">{formatCurrencyInr(order.amount)}</div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Invoice</p>
                <div className="mt-3 text-base font-bold text-slate-900 dark:text-white">{order.invoiceNumber ?? order.id.slice(0, 8).toUpperCase()}</div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Placed on</p>
                <div className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  {new Intl.DateTimeFormat("en-GB", {
                    timeZone: "Asia/Kolkata",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(order.createdAt))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Student</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <div className="font-semibold text-slate-900 dark:text-white">{order.user.name ?? "Unnamed student"}</div>
                  <div>{order.user.email}</div>
                  <div>{order.user.phone ?? "No phone number"}</div>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Payment details</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <div><span className="font-medium text-slate-900 dark:text-white">Provider:</span> {order.paymentProvider}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Currency:</span> {order.currency}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Order ID:</span> {order.id}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50/70 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Reference data</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <span className="font-medium text-slate-900 dark:text-white">Payment ID:</span> {order.razorpayPaymentId ?? "—"}
                </div>
                <div className="rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <span className="font-medium text-slate-900 dark:text-white">Razorpay Order:</span> {order.razorpayOrderId ?? "—"}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
