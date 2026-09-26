"use client";

import { useEffect, useRef, useState } from "react";

function AnimatedMetric({ value, suffix = "", decimals = 0, onUpdate }: { value: number; suffix?: string; decimals?: number; onUpdate?: (value: number) => void }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1200;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const nextValue = value * progress;
      const roundedValue = Number(nextValue.toFixed(decimals));

      setCount(roundedValue);
      onUpdate?.(roundedValue);

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
  }, [value, decimals, onUpdate]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function AboutHeroVisual({ isDark = false }: { isDark?: boolean }) {
  const [momentumProgress, setMomentumProgress] = useState(0);

  return (
    <div className="relative mx-auto w-full max-w-[430px]">
      <div className={`absolute -left-8 top-10 h-28 w-28 rounded-full blur-2xl ${isDark ? "bg-violet-500/20" : "bg-indigo-200/50"}`} aria-hidden="true" />
      <div className={`absolute -right-6 bottom-6 h-32 w-32 rounded-full blur-2xl ${isDark ? "bg-cyan-500/20" : "bg-violet-200/60"}`} aria-hidden="true" />

      <div className={`relative rounded-[32px] border p-4 pb-5 shadow-[0_30px_70px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_40px_120px_rgba(79,70,229,0.3),0_20px_45px_rgba(15,23,42,0.18)] ${isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-white/80"}`}>
        <div className="rounded-[30px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-5 text-white shadow-[0_28px_60px_rgba(15,23,42,0.25)] transition-all duration-300 transform-gpu hover:-translate-y-1.5 hover:shadow-[0_42px_120px_rgba(79,70,229,0.35),0_24px_50px_rgba(14,165,233,0.2)] hover:ring-2 hover:ring-indigo-300/50 hover:border hover:border-indigo-200/40 hover:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_42%),linear-gradient(145deg,_#0f172a_0%,_#111827_25%,_#312e81_100%)]">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100/80">
            <span>Community</span>
            <span className="rounded-full border border-white/20 bg-white/5 px-2 py-1">
              +<AnimatedMetric value={1.2} suffix="k" decimals={1} />
            </span>
          </div>

          <div className="mt-5 flex -space-x-2.5">
            {['A', 'K', 'S', 'J'].map((letter, index) => (
              <div
                key={letter}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 text-xs font-bold text-white ${['bg-cyan-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500'][index]}`}
              >
                {letter}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-white/7 p-3 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/12 hover:shadow-[0_22px_40px_rgba(99,102,241,0.24),0_12px_25px_rgba(14,165,233,0.18)] hover:ring-2 hover:ring-indigo-200/60">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>Career momentum</span>
              <span className="font-semibold text-white">+<AnimatedMetric value={68} suffix="%" onUpdate={setMomentumProgress} /></span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 transition-all duration-300 ease-out"
                style={{ width: `${momentumProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/6 p-3 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/12 hover:shadow-[0_22px_42px_rgba(99,102,241,0.24),0_12px_26px_rgba(14,165,233,0.18)] hover:ring-2 hover:ring-indigo-200/60">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-300">Mentors</div>
              <div className="mt-2 text-2xl font-black text-white"><AnimatedMetric value={6} suffix="+" /></div>
            </div>
            <div className="rounded-2xl bg-white/6 p-3 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/12 hover:shadow-[0_22px_42px_rgba(99,102,241,0.24),0_12px_26px_rgba(14,165,233,0.18)] hover:ring-2 hover:ring-indigo-200/60">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-300">Projects</div>
              <div className="mt-2 text-2xl font-black text-white"><AnimatedMetric value={25} suffix="+" /></div>
            </div>
          </div>
        </div>

        <div className={`relative z-10 mt-4 ml-4 mr-3 rounded-[24px] border p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(79,70,229,0.18),0_12px_30px_rgba(15,23,42,0.12)] hover:border-indigo-200/60 hover:ring-1 hover:ring-indigo-200/40 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className={`text-[11px] uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Top outcome</div>
              <div className={`mt-1 text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>Career-ready confidence</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-700">
              ✓
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
