import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminModeToggle } from "@/app/admin/components/admin-mode-toggle.client";
import { AdminNavbar } from "@/app/admin/components/admin-navbar";
import { StudentCourseAccessActions } from "./student-course-access-actions.client";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ studentId: string; courseId: string }> | { studentId: string; courseId: string };
};

export default async function StudentCourseDetailPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent(`/admin/students/${resolvedParams.studentId}/courses/${resolvedParams.courseId}`)}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: resolvedParams.studentId,
        courseId: resolvedParams.courseId,
      },
    },
    select: {
      id: true,
      userId: true,
      courseId: true,
      accessGranted: true,
      grantedAt: true,
      createdAt: true,
      course: {
        select: {
          id: true,
          title: true,
          shortDescription: true,
          category: true,
          level: true,
          durationHours: true,
          price: true,
          currency: true,
          imageUrl: true,
          instructorName: true,
          isPublished: true,
          createdAt: true,
          modules: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              position: true,
              lectures: {
                orderBy: { position: "asc" },
                select: {
                  id: true,
                  title: true,
                  position: true,
                  durationSeconds: true,
                },
              },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
        },
      },
      order: {
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          paymentProvider: true,
          invoiceNumber: true,
          createdAt: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
        },
      },
    },
  });

  if (!enrollment) {
    notFound();
  }

  const typeLabel = enrollment.order ? "Purchased" : enrollment.accessGranted ? "Manual access" : "Not assigned";
  const statusLabel = enrollment.accessGranted ? "Access granted" : enrollment.order ? "Access revoked" : "Awaiting access";
  const statusClasses = enrollment.accessGranted
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
    : enrollment.order
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
      : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200";

  const joinedDate = new Date(enrollment.createdAt);
  const accessGrantedDate = enrollment.grantedAt ? new Date(enrollment.grantedAt) : joinedDate;
  const accessPeriodLabel = enrollment.accessGranted ? "Lifetime access" : "No access";
  const lectureCount = enrollment.course.modules.reduce((total, module) => total + module.lectures.length, 0);
  const totalModuleCount = enrollment.course.modules.length;

  const formatDate = (value: Date, withTime = false) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(new Date(value));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Student course access</h1>
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Course</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{enrollment.course.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClasses}`}>
                  {statusLabel}
                </span>

                <Link
                  href={`/admin/students/${resolvedParams.studentId}`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold normal-case tracking-[0.02em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                >
                  Back to course access
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Student</p>
                <div className="mt-3 text-lg font-black text-slate-900 dark:text-white">{enrollment.user.name ?? "Unnamed student"}</div>
                <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{enrollment.user.email}</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{enrollment.user.phone ?? "No phone number"}</div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Amount</p>
                <div className="mt-3 text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-300">
                  {enrollment.order
                    ? new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Number(enrollment.order.amount ?? 0))
                    : "—"}
                </div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Type</p>
                <div className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  {typeLabel}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Access period</p>
                <div className="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <div><span className="font-medium text-slate-900 dark:text-white">Joined date:</span> {formatDate(joinedDate)}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Access granted:</span> {enrollment.accessGranted ? formatDate(accessGrantedDate, true) : "—"}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Expiry / period:</span> {accessPeriodLabel}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Status:</span> {statusLabel}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Type:</span> {typeLabel}</div>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Order & payment</p>
                <div className="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <div><span className="font-medium text-slate-900 dark:text-white">Purchase status:</span> {enrollment.order?.status ?? "—"}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Invoice:</span> {enrollment.order?.invoiceNumber ?? "—"}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Provider:</span> {enrollment.order?.paymentProvider ?? "—"}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Placed on:</span> {enrollment.order ? formatDate(new Date(enrollment.order.createdAt), true) : "—"}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Payment ID:</span> {enrollment.order?.razorpayPaymentId ?? "—"}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50/70 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/70">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <StudentCourseAccessActions
                studentId={enrollment.user.id}
                courseId={enrollment.course.id}
                initialAccessGranted={enrollment.accessGranted}
                initialTypeLabel={typeLabel}
                initialStatusLabel={statusLabel}
                hasOrder={Boolean(enrollment.order)}
                />
              </div>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}
