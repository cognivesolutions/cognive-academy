import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BackButton from "@/components/back-button";
import { AdminSidebar } from "@/app/admin/components/admin-sidebar";
import { LectureUploadForm } from "@/app/admin/components/lecture-upload-form.client";

export const dynamic = "force-dynamic";

type Props = { params: { courseId: string; lectureId: string } };

export default async function LectureEditPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    const callbackUrl = `/admin/courses/${params?.courseId}/lectures/${params?.lectureId}`;
    redirect(`/admin/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (session.user.role !== "ADMIN") redirect("/");

  const lectureId = params?.lectureId;
  const courseId = params?.courseId;
  if (!lectureId || !courseId) redirect("/admin");

  const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });
  if (!lecture) redirect(`/admin/courses/${courseId}/lectures`);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Edit lecture — {lecture.title}</h1>
            <p className="text-sm text-slate-600">Set a live session URL to enable Join Live buttons for this lecture.</p>
          </div>
          <BackButton href={`/admin/courses/${params.courseId}/lectures`} />
        </div>

        <div className="mb-6">
          <AdminSidebar />
        </div>

        <LectureUploadForm
          mode="edit"
          courseId={params.courseId}
          lectureId={lecture.id}
          defaultTitle={lecture.title ?? ""}
          defaultPosition={lecture.position ?? 1}
          defaultLiveSessionUrl={lecture.liveSessionUrl ?? ""}
          defaultVideoUrl={lecture.videoUrl ?? ""}
          defaultHlsUrl={lecture.hlsUrl ?? ""}
          defaultIsPreview={lecture.isPreview ?? false}
          submitLabel="Save"
        />
      </div>
    </main>
  );
}
