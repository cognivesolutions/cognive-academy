"use client";

import React, { useEffect, useRef, useState } from "react";

type Faq = { q: string; a: string };

export default function FAQAccordion({ items }: { items: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    // Ensure max-height is correct after mount and when window resizes
    const updateHeights = () => {
      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        if (openIndex === i) {
          el.style.maxHeight = `${el.scrollHeight}px`;
        } else {
          el.style.maxHeight = "0px";
        }
      });
    };

    updateHeights();
    window.addEventListener("resize", updateHeights);
    return () => window.removeEventListener("resize", updateHeights);
  }, [openIndex, items.length]);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const key = e.key;
    if (key === "ArrowDown") {
      e.preventDefault();
      const next = (i + 1) % items.length;
      btnRefs.current[next]?.focus();
    } else if (key === "ArrowUp") {
      e.preventDefault();
      const prev = (i - 1 + items.length) % items.length;
      btnRefs.current[prev]?.focus();
    } else if (key === "Home") {
      e.preventDefault();
      btnRefs.current[0]?.focus();
    } else if (key === "End") {
      e.preventDefault();
      btnRefs.current[items.length - 1]?.focus();
    } else if (key === "Enter" || key === " ") {
      e.preventDefault();
      toggle(i);
    }
  };

  return (
    <div className="mt-8">
      <div className="space-y-3">
        {items.map((faq, i) => {
          const open = openIndex === i;
          return (
            <div key={faq.q} className="rounded-2xl border border-slate-200 bg-white">
              <button
                ref={(el) => {
                  btnRefs.current[i] = el;
                }}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 focus:outline-none"
                aria-expanded={open}
                aria-controls={`faq-panel-${i}`}
                id={`faq-btn-${i}`}
                onClick={() => toggle(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                <span className="text-slate-900 font-semibold">{faq.q}</span>
                <svg
                  className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-btn-${i}`}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                style={{ maxHeight: open ? "none" : "0px", overflow: "hidden", transition: "max-height 260ms ease" }}
              >
                <div className="px-5 pb-5 pt-0 text-slate-600">
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
