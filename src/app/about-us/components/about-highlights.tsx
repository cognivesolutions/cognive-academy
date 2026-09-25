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
    const duration = 1200;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);

      if (value % 1 === 0) {
        setCount(Math.round(progress * value));
      } else {
        setCount(Number((progress * value).toFixed(1)));
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
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function AboutHighlights() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {highlights.map((item) => (
        <div
          key={item.label}
          className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:bg-white hover:shadow-[0_28px_64px_rgba(15,23,42,0.12),0_0_0_1px_rgba(99,102,241,0.06)]"
        >
          <div className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            <AnimatedValue value={item.value} suffix={item.suffix} />
          </div>
          <div className="mt-2 text-sm font-medium text-slate-600">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
