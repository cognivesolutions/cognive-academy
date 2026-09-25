"use client"

import React from "react";
import Link from "next/link";

type Course = any;

export default function RecordedCoursesCarousel({ courses }: { courses: Course[] }) {
  return (
    <div className="-mx-3">
      <div className="flex gap-6 overflow-x-auto px-3 hide-scrollbar">
        {courses.map((course) => (
          <article key={course.id} className="w-[320px] flex-shrink-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-40 w-full overflow-hidden rounded-xl bg-slate-100">
              {course.coverImage ? (
                <img src={course.coverImage} alt={course.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">No image</div>
              )}
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-indigo-600">Recorded</div>
              <h3 className="text-xl font-bold text-slate-900">{course.title}</h3>
              <p className="mt-3 text-sm text-slate-600 line-clamp-2">{course.shortDescription ?? course.description}</p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-lg font-bold text-slate-900">₹{Number(course.price).toLocaleString("en-IN")}</div>
              <Link href={`/courses/${course.slug}`} className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
