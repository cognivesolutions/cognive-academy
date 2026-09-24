import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [enrollments, orders] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const userName = session.user.name ?? "Student";
  const totalProgress = enrollments.length ? Math.min(100, 72 + enrollments.length * 8) : 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black text-white shadow-lg shadow-indigo-200">
              C
            </div>
            <div>
              <div className="text-base font-bold text-slate-900">Cognive Academy</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">Student portal</div>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#overview" className="transition hover:text-slate-900">Overview</a>
            <a href="#courses" className="transition hover:text-slate-900">My courses</a>
            <a href="#transactions" className="transition hover:text-slate-900">Transactions</a>
          </div>

          <button className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
            Edit profile
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 p-7 text-white shadow-lg shadow-indigo-200/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-indigo-200">Student dashboard</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Welcome back, {userName}</h1>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-indigo-100">
              Next live session: <span className="font-semibold text-white">7:30 PM IST</span>
            </div>
          </div>
        </section>

        <div id="overview" className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Profile completion</div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{Math.min(100, 78 + enrollments.length * 6)}%</div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${Math.min(100, 78 + enrollments.length * 6)}%` }} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Enrolled courses</div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{enrollments.length}</div>
            <div className="mt-3 text-sm text-slate-600">{enrollments.filter((item) => item.accessGranted).length} active learning tracks</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Learning momentum</div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{totalProgress}%</div>
            <div className="mt-3 text-sm text-indigo-700">Keep going — you are on track</div>
          </div>
        </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        <section id="courses" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>
            <a href="/" className="text-sm font-semibold text-indigo-600">Browse catalog</a>
          </div>

          <div className="space-y-5">
            {enrollments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                You are not enrolled in any course yet. Browse the catalog to get started.
              </div>
            ) : (
              enrollments.map((enrollment) => {
                const progress = enrollment.accessGranted ? 72 : 0;
                return (
                  <div key={enrollment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{enrollment.course.title}</h3>
                        <p className="text-sm text-slate-600">Next lesson: {enrollment.course.shortDescription ?? "Continue your learning path"}</p>
                      </div>
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {enrollment.accessGranted ? "Active" : "Access pending"}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <aside className="space-y-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Profile settings</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span>Name</span>
                <span className="font-medium text-slate-900">{userName}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span>Email</span>
                <span className="font-medium text-slate-900">{session.user.email ?? "student@cognive.academy"}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span>Password</span>
                <span className="font-medium text-slate-900">••••••••</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Lecture room</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-sm font-medium text-slate-200">
                Recorded session: {enrollments[0]?.course.title ?? "SQL Fundamentals"}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                Play recording
              </button>
              <a
                href="https://meet.google.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-full bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Join Live Session
              </a>
            </div>
          </section>
        </aside>
      </div>

      <section id="transactions" className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">My Transactions</h2>
          <span className="text-sm font-medium text-slate-500">Order history</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Invoice</th>
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-900">{order.invoiceNumber ?? order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-3">{order.courseId}</td>
                    <td className="py-3">₹{Number(order.amount).toLocaleString("en-IN")}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          order.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    </main>
  );
}
