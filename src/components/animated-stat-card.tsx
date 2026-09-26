"use client";

import { useEffect, useRef, useState } from "react";

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

export function AnimatedStatCard({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-center md:text-left transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_52px_rgba(79,70,229,0.22)] hover:border-indigo-200 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-indigo-500/40 dark:hover:from-indigo-600 dark:hover:to-violet-600">
      <div className="text-3xl font-black tracking-tight text-slate-900 transition-all duration-300 group-hover:scale-[1.03] group-hover:text-white dark:text-white">
        <AnimatedValue value={value} suffix={suffix} />
      </div>
      <div className="mt-2 text-sm text-slate-600 transition-colors duration-300 group-hover:text-indigo-100 dark:text-slate-300">{label}</div>
    </div>
  );
}
