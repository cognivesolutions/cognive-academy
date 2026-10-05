import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }> | { orderId: string };
};

export default async function OrderDetailPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent(`/admin/orders/${resolvedParams.orderId}`)}`);
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
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

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
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Link href="/admin" className="font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">
            Admin
          </Link>
          <span>/</span>
          <Link href="/admin/students" className="font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">
            Students
          </Link>
          <span>/</span>
          <Link href={`/admin/students/${order.user.id}`} className="font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">
            Student
          </Link>
          <span>/</span>
          <span className="text-slate-500 dark:text-slate-400">Order details</span>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Order details</h1>
          </div>

          <Link
            href={`/admin/students/${order.user.id}`}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Back to student
          </Link>
        </div>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Payment information</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{order.course.title}</h2>
            </div>

            <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClasses}`}>
              {order.status}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Amount</p>
              <div className="mt-3 text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-300">
                ₹{Number(order.amount ?? 0).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Invoice</p>
              <div className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                {order.invoiceNumber ?? order.id.slice(0, 8).toUpperCase()}
              </div>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Placed</p>
              <div className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Student</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <div className="font-semibold text-slate-900 dark:text-white">{order.user.name ?? "Unnamed student"}</div>
                <div>{order.user.email}</div>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Payment details</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <div>Provider: {order.paymentProvider}</div>
                <div>Currency: {order.currency}</div>
                <div>Order ID: {order.id}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/70">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Reference data</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <span className="text-slate-500 dark:text-slate-400">Payment ID:</span> {order.razorpayPaymentId ?? "—"}
              </div>
              <div className="rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <span className="text-slate-500 dark:text-slate-400">Razorpay Order:</span> {order.razorpayOrderId ?? "—"}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
