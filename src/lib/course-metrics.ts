export type CourseMetricInput = {
  durationHours?: number | null;
  weeks?: number | null;
  projectCount?: number | null;
  sessionCount?: number | null;
  modules?: Array<{
    lectures?: Array<{
      durationSeconds?: number | null;
    } | null> | null;
  } | null> | null;
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export function getCourseMetricCards(course: CourseMetricInput) {
  const modules = Array.isArray(course.modules) ? course.modules : [];

  const directLectureCount = toNumber((course as any).sessionCount ?? (course as any).sessions ?? (course as any).lectureCount);
  const derivedLectureCount = modules.reduce((sum, module) => {
    const lectures = Array.isArray(module?.lectures) ? module.lectures : [];
    return sum + lectures.length;
  }, 0);
  const lectureCount = directLectureCount > 0 ? directLectureCount : derivedLectureCount;

  const totalSeconds = modules.reduce((sum, module) => {
    const lectures = Array.isArray(module?.lectures) ? module.lectures : [];
    return sum + lectures.reduce((moduleTotal, lecture) => {
      const seconds = Number(lecture?.durationSeconds ?? 0);
      return moduleTotal + (Number.isFinite(seconds) ? seconds : 0);
    }, 0);
  }, 0);

  const explicitHours = toNumber(course.durationHours);
  const derivedHours = Math.max(0, Math.round(totalSeconds / 3600));
  const totalHours = explicitHours > 0 ? explicitHours : derivedHours;

  const explicitWeeks = toNumber((course as any).weeks ?? (course as any).weekCount ?? (course as any).totalWeeks);
  const derivedWeeks = totalHours > 0 ? Math.max(1, Math.ceil(totalHours / 8)) : 0;
  const weeks = explicitWeeks > 0 ? explicitWeeks : derivedWeeks;

  const explicitProjects = toNumber((course as any).projectCount ?? (course as any).projects ?? (course as any).totalProjects);
  const derivedProjects = modules.length > 0 ? modules.length : 1;
  const projectCount = explicitProjects > 0 ? explicitProjects : derivedProjects;

  return [
    { label: "Sessions", value: String(lectureCount || 0), icon: "◉" },
    { label: "Weeks", value: String(weeks || 0), icon: "⏱" },
    { label: "Hours", value: String(totalHours || 0), icon: "⌛" },
    { label: "Projects", value: String(projectCount || 0), icon: "✦" },
  ];
}
