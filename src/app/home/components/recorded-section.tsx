"use client"

import React, { useState, useMemo } from "react";
import CoursesSwitcher from "./courses-switcher";
import RecordedCoursesCarousel from "./recorded-courses-carousel";

type Course = any;

export default function RecordedSection({ courses }: { courses: Course[] }) {
  const [lang, setLang] = useState<string>("en");

  const english = useMemo(() => courses.filter((c) => (c.language || c.lang || c.locale) === "en"), [courses]);
  const hindi = useMemo(() => courses.filter((c) => (c.language || c.lang || c.locale) === "hi"), [courses]);

  const maxEnglish = 8;
  const maxHindi = 6;

  const fallbackEnglish = courses.slice(0, maxEnglish);
  const fallbackHindi = courses.slice(0, maxHindi);

  const enToShow = english.length ? english.slice(0, maxEnglish) : fallbackEnglish;
  const hiToShow = hindi.length ? hindi.slice(0, maxHindi) : fallbackHindi;

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
