import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { InvoiceDetailClient } from "./invoice-detail.client";

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

export default async function TransactionDetailPage({
  params,
}: {
  params?: Promise<{ invoiceId: string }> | { invoiceId: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = params ? await Promise.resolve(params) : null;
  const invoiceId = resolvedParams?.invoiceId;

  if (!invoiceId) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      id: invoiceId,
      userId: session.user.id,
    },
    include: {
      course: true,
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

  const invoiceNumber = order.invoiceNumber ?? order.id.slice(0, 8).toUpperCase();
  const statusClass =
    order.status === "PAID"
      ? "text-emerald-600 dark:text-emerald-300"
      : order.status === "PENDING"
        ? "text-amber-600 dark:text-amber-300"
        : order.status === "FAILED"
          ? "text-rose-600 dark:text-rose-300"
          : "text-slate-600 dark:text-slate-300";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/transactions"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Back to transactions
          </Link>
        </div>

        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Payment details</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{invoiceNumber}</h1>
            </div>
            <InvoiceDetailClient
              invoice={{
                invoiceNumber,
                courseTitle: order.course.title ?? "Course",
                buyerName: order.user?.name ?? "Customer",
                amount: Number(order.amount),
                status: order.status,
                createdAt: order.createdAt,
                paymentProvider: order.paymentProvider,
                reference: order.razorpayPaymentId ?? order.razorpayOrderId ?? order.id,
              }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <div className="text-sm text-slate-500 dark:text-slate-400">Course</div>
              <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{order.course.title}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <div className="text-sm text-slate-500 dark:text-slate-400">Amount</div>
              <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(Number(order.amount))}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <div className="text-sm text-slate-500 dark:text-slate-400">Payment date</div>
              <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{formatDate(order.createdAt)}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <div className="text-sm text-slate-500 dark:text-slate-400">Status</div>
              <div className="mt-2">
                <span className={`text-base font-normal ${statusClass}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">Provider</div>
            <div className="mt-2 text-base font-medium text-slate-900 dark:text-white">{order.paymentProvider ?? "—"}</div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">Reference</div>
            <div className="mt-2 break-all text-base font-medium text-slate-900 dark:text-white">
              {order.razorpayPaymentId ?? order.razorpayOrderId ?? order.id}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
