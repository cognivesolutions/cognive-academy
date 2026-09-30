import React from "react";
import { notFound } from "next/navigation";
import prisma from "../../../lib/prisma";
import BackButton from "../../../components/back-button";

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

  return <main>{children}</main>;
}

export default async function CourseLayout(props: Props) {
  return <CourseLayoutServer {...props} />;
}
