"use client"

import React, { useState, useMemo } from "react";
import CoursesSwitcher from "./courses-switcher";
import RecordedCoursesCarousel from "./recorded-courses-carousel";

type Course = any;

export default function RecordedSection({ courses }: { courses: Course[] }) {
  const [lang, setLang] = useState<string>("en");

  const english = useMemo(() => courses.filter((c) => (c.language || c.lang || c.locale) === "en"), [courses]);
  const hindi = useMemo(() => courses.filter((c) => (c.language || c.lang || c.locale) === "hi"), [courses]);

  const fallbackEnglish = courses.slice(0, 5);
  const fallbackHindi = courses.slice(5, 9).length ? courses.slice(5, 9) : courses.slice(0, 4);

  const enToShow = english.length ? english.slice(0, 5) : fallbackEnglish;
  const hiToShow = hindi.length ? hindi.slice(0, 4) : fallbackHindi.slice(0, 4);

  const current = lang === "en" ? enToShow : hiToShow;

  return (
    <div>
      <div className="mb-6 flex items-center justify-end">
        <CoursesSwitcher
          leftLabel={"English"}
          rightLabel={"Hindi"}
          leftValue={"en"}
          rightValue={"hi"}
          onChange={(v) => setLang(v)}
        />
      </div>

      <RecordedCoursesCarousel courses={current} />
    </div>
  );
}
