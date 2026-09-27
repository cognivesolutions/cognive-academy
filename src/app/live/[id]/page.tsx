import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: { id: string };
};

export default async function LivePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          modules: {
            include: { lectures: true },
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  if (!enrollment || enrollment.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const lectures = enrollment.course.modules.flatMap((m: any) => m.lectures || []);
  const lectureWithLive = lectures.find((l: any) => l.liveSessionUrl);

  const joinHref = lectureWithLive ? lectureWithLive.liveSessionUrl : `/courses/${enrollment.course.slug}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <Link
            href="/dashboard"
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(79,70,229,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(79,70,229,0.35)]"
          >
            <span aria-hidden>←</span>
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Join live session</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Course: {enrollment.course.title}</p>

          <div className="mt-6 flex items-center gap-3">
            {lectureWithLive ? (
              <a href={joinHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                Join live session
              </a>
            ) : (
              <Link href={joinHref} className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                View course / Join
              </Link>
            )}

            <Link href="/dashboard" className="inline-flex items-center rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
              Back to dashboard
            </Link>
          </div>

          <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            {lectureWithLive ? (
              <p>You're about to open the external live session. The session will open in a new tab.</p>
            ) : (
              <p>No live session URL available for this enrollment. You can open the course page to join or view details.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
