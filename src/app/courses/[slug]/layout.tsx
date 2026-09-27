import React from "react";
import { notFound } from "next/navigation";
import prisma from "../../../lib/prisma";
import BackButton from "../../../components/back-button";
import CourseTabs from "../../../components/course-tabs";

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

// Use a local `Props` type instead of relying on Next's internal LayoutProps.
// Export a non-async default wrapper to satisfy Next's expected layout component
// type, and perform async data fetching in an inner server component.
async function CourseLayoutServer({ params, children }: Props) {
  const { slug } = params;

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

export default function CourseLayout(props: any) {
  // Accept `props: any` here and cast when forwarding to the async server
  // component to avoid Next's validator type mismatch across versions.
  return <CourseLayoutServer {...(props as Props)} />;
}
