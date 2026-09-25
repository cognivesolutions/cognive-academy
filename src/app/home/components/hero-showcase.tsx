"use client";

import React from "react";

type Badge = { text: string; color: string };

const badges: Badge[] = [
  { text: "Django", color: "bg-green-600" },
  { text: "React", color: "bg-cyan-500" },
  { text: "Excel", color: "bg-emerald-500" },
  { text: "Tableau", color: "bg-orange-500" },
  { text: "Power BI", color: "bg-yellow-400" },
  { text: "ML", color: "bg-purple-500" },
  { text: "AI", color: "bg-pink-500" },
  { text: "SQL", color: "bg-indigo-600" },
  { text: "Python", color: "bg-sky-600" },
];

export default function HeroShowcase() {
  const isSmall = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
  const visibleBadges = isSmall ? badges.slice(0, 5) : badges;
  const badgePadding = isSmall ? "px-3 py-1.5" : "px-4 py-2";
  const badgeRadius = isSmall ? "rounded-lg text-[12px]" : "rounded-xl text-[13px]";

  return (
    <div className="relative mx-auto flex w-full max-w-[640px] items-center justify-center py-8">
      <div className="relative h-[360px] w-[640px]">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex w-full items-center justify-center md:translate-x-[-60px]">
          <div className="h-[220px] w-[220px] rounded-full bg-gradient-to-b from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl ring-8 ring-white/10">
            <div className="text-2xl font-extrabold leading-none text-center">Skills & Tracks</div>
          </div>
        </div>

        <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center md:translate-x-[-60px]">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px]">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_20s_linear_infinite] motion-reduce:animate-none" style={{ width: 0, height: 0 }}>
              {visibleBadges.map((b, i) => {
                const deg = (i / visibleBadges.length) * 360 - 90;
                const radius = isSmall ? 140 : 180;
                const transform = `rotate(${deg}deg) translateX(${radius}px) rotate(${-deg}deg)`;

                return (
                  <div key={b.text} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform }}>
                    <div className={`flex items-center gap-2 ${badgeRadius} border border-white/30 bg-white ${badgePadding} font-semibold text-slate-700 shadow-md transform transition-all duration-200 hover:-translate-y-1 hover:scale-105 motion-reduce:animate-none animate-[spin_20s_linear_infinite_reverse]`}>
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${b.color}`} />
                      <span className="leading-tight whitespace-nowrap">{b.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
