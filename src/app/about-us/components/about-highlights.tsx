"use client";

import { useEffect, useRef, useState } from "react";

const highlights = [
  { value: 500, suffix: "+", label: "Learners supported" },
  { value: 4.9, suffix: "/5", label: "Average learner experience" },
  { value: 12, suffix: "+", label: "Career pathways" },
  { value: 100, suffix: "%", label: "Project-led learning" },
];

function AnimatedValue({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1800;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = easeOutCubic(progress);

      if (value % 1 === 0) {
        setCount(Math.round(eased * value));
      } else {
        setCount(Number((eased * value).toFixed(1)));
      }

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value]);

  return (
    <span className="inline-block animate-[pulse_1.2s_ease-out_1]">
      {count}
      {suffix}
    </span>
  );
}

export default function AboutHighlights({ isDark = false }: { isDark?: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {highlights.map((item) => (
        <div
          key={item.label}
          className={`group rounded-[24px] border p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-[0_30px_70px_rgba(79,70,229,0.18)] ${isDark ? "border-slate-700 bg-slate-900/80 hover:bg-slate-900" : "border-slate-200/80 bg-white/80 hover:bg-white"}`}
        >
          <div className={`text-3xl font-black tracking-tight transition-all duration-300 group-hover:scale-[1.03] sm:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>
            <AnimatedValue value={item.value} suffix={item.suffix} />
          </div>
          <div className={`mt-2 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}
