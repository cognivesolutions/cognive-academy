import React from "react";
import { notFound } from "next/navigation";
import prisma from "../../../lib/prisma";
import BackButton from "../../../components/back-button";
import CourseTabs from "../../../components/course-tabs";

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
  children: React.ReactNode;
};

async function CourseLayoutServer({ params, children }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;

  if (!slug) {
    return notFound();
  }

  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="pt-6 pb-4">
        <BackButton href="/courses" />
      </div>
      <header className="pb-6">
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <p className="text-sm text-slate-500">{(course as any).shortDescription ?? ""}</p>
      </header>

      <CourseTabs slug={course.slug} />
      <main className="pt-4">{children}</main>
    </div>
  );
}

export default async function CourseLayout(props: Props) {
  return <CourseLayoutServer {...props} />;
}
