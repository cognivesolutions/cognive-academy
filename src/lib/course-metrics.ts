export type CourseMetricInput = {
  durationHours?: number | null;
  modules?: Array<{
    lectures?: Array<{
      durationSeconds?: number | null;
    } | null> | null;
  } | null> | null;
};

const formatDurationLabel = (totalSeconds: number) => {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0h";

  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

export function getCourseMetricCards(course: CourseMetricInput) {
  const modules = Array.isArray(course.modules) ? course.modules : [];
  const lectureCount = modules.reduce((sum, module) => {
    const lectures = Array.isArray(module?.lectures) ? module.lectures : [];
    return sum + lectures.length;
  }, 0);

  const totalSeconds = modules.reduce((sum, module) => {
    const lectures = Array.isArray(module?.lectures) ? module.lectures : [];
    return sum + lectures.reduce((moduleTotal, lecture) => {
      const seconds = Number(lecture?.durationSeconds ?? 0);
      return moduleTotal + (Number.isFinite(seconds) ? seconds : 0);
    }, 0);
  }, 0);

  const explicitHours = Number(course.durationHours ?? 0);
  const derivedHours = Math.max(0, Math.round(totalSeconds / 3600));
  const totalHours = Math.max(explicitHours || 0, derivedHours);
  const weeks = Math.max(1, Math.ceil(totalHours / 8));
  const projectCount = modules.length > 0 ? modules.length : 1;

  return [
    { label: "Sessions", value: String(lectureCount || 0), icon: "◉" },
    { label: "Weeks", value: String(weeks), icon: "⏱" },
    { label: "Hours", value: String(totalHours || 0), icon: "⌛" },
    { label: "Projects", value: String(projectCount), icon: "✦" },
  ];
}
