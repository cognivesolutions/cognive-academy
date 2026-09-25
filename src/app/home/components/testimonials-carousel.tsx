"use client"

import React, { useEffect, useRef } from "react";
import { TESTIMONIALS } from "@/data/testimonials";

type Testimonial = { name: string; role?: string; quote: string };

export default function TestimonialsCarousel({ items }: { items?: Testimonial[] }) {
  const list = items && items.length ? items : TESTIMONIALS;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let speed = 1.2;

    const step = () => {
      if (!el) return;
      el.scrollLeft = el.scrollLeft + speed;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
        el.scrollLeft = 0;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="-mx-3 flex gap-6 overflow-hidden px-3 py-6 hide-scrollbar"
        aria-hidden={false}
      >
        {list.concat(list).map((t, i) => (
          <blockquote
            key={`${t.name}-${i}`}
            className="w-[320px] flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[200px]"
          >
            <p className="text-lg leading-7 text-slate-700 italic">“{t.quote}”</p>
            <footer className="mt-4 text-right">
              <div className="font-bold text-slate-900">{t.name}</div>
              {t.role && <div className="text-sm text-slate-500">{t.role}</div>}
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
