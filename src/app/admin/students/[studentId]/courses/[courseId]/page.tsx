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

  const statusClasses = enrollment.accessGranted
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
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

              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClasses}`}>
                {enrollment.accessGranted ? "Access granted" : "Awaiting access"}
              </span>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Student</p>
                <div className="mt-3 text-lg font-black text-slate-900 dark:text-white">{enrollment.user.name ?? "Unnamed student"}</div>
                <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{enrollment.user.email}</div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Amount</p>
                <div className="mt-3 text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-300">
                  {enrollment.order ? `₹${Number(enrollment.order.amount ?? 0).toLocaleString("en-IN")}` : "—"}
                </div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Access granted</p>
                <div className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  {formatDate(enrollment.grantedAt ?? enrollment.createdAt, true)}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Access period</p>
                <div className="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <div><span className="font-medium text-slate-900 dark:text-white">Joined date:</span> {formatDate(joinedDate)}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Access granted:</span> {formatDate(accessGrantedDate, true)}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Expiry / period:</span> {accessPeriodLabel}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Access status:</span> {enrollment.accessGranted ? "Access granted" : "Awaiting access"}</div>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Order & payment</p>
                <div className="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <div><span className="font-medium text-slate-900 dark:text-white">Status:</span> {enrollment.order?.status ?? "—"}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Invoice:</span> {enrollment.order?.invoiceNumber ?? "—"}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Provider:</span> {enrollment.order?.paymentProvider ?? "—"}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Placed on:</span> {enrollment.order ? formatDate(new Date(enrollment.order.createdAt), true) : "—"}</div>
                  <div><span className="font-medium text-slate-900 dark:text-white">Payment ID:</span> {enrollment.order?.razorpayPaymentId ?? "—"}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50/70 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800/70">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Access controls</p>
                  <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900 dark:text-white">Course access</h3>
                </div>
                <StudentCourseAccessActions
                  studentId={enrollment.user.id}
                  courseId={enrollment.course.id}
                  initialAccessGranted={enrollment.accessGranted}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <span className="font-medium text-slate-900 dark:text-white">Joined:</span> {formatDate(joinedDate)}
                </div>
                <div className="rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <span className="font-medium text-slate-900 dark:text-white">Access period:</span> {accessPeriodLabel}
                </div>
              </div>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}
