import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BackButton from "@/components/back-button";

export const dynamic = "force-dynamic";

type Props = { params: { courseId: string; lectureId: string } };

export default async function LectureEditPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/admin/login");

  const lectureId = params?.lectureId;
  const courseId = params?.courseId;
  if (!lectureId || !courseId) redirect("/admin");

  const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });
  if (!lecture) redirect(`/admin/courses/${courseId}/lectures`);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Edit lecture — {lecture.title}</h1>
            <p className="text-sm text-slate-600">Set a live session URL to enable Join Live buttons for this lecture.</p>
          </div>
          <BackButton href={`/admin/courses/${params.courseId}/lectures`} />
        </div>

        <form action="/api/admin/lectures" method="POST" className="space-y-4 rounded-lg bg-white p-6 dark:bg-slate-900">
          <input type="hidden" name="id" value={lecture.id} />
          <input type="hidden" name="courseId" value={params.courseId} />

          <label className="block text-sm font-medium text-slate-700">
            Lecture title
            <input name="title" defaultValue={lecture.title ?? ""} className="mt-2 w-full rounded-md border px-3 py-2" />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Live session URL
            <input name="liveSessionUrl" defaultValue={lecture.liveSessionUrl ?? ""} placeholder="https://zoom.us/...." className="mt-2 w-full rounded-md border px-3 py-2" />
          </label>

          <div className="flex gap-2">
            <button type="submit" className="rounded-full bg-indigo-600 px-4 py-2 text-white">Save</button>
            <Link href={`/admin/courses/${params.courseId}/lectures`} className="rounded-full border px-4 py-2">Cancel</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
