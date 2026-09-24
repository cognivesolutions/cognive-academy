"use client";

import React, { useEffect, useState, useRef } from "react";

interface AnimatedTypingProps {
  text: string;
  speed?: number; // ms per char
  pause?: number; // ms pause after full text
  loop?: boolean;
  className?: string; // optional classes for styling the typed text
  cursorClassName?: string; // optional classes for cursor
}

export default function AnimatedTyping({ text, speed = 180, pause = 1200, loop = true, className = "", cursorClassName = "" }: AnimatedTypingProps) {
  const [display, setDisplay] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);
  const deletingRef = useRef(isDeleting);

  // keep refs in sync with state for stable tick loop
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    deletingRef.current = isDeleting;
  }, [isDeleting]);

  useEffect(() => {
    let timeout = 0 as number;
    let mounted = true;

    const full = text;

    const schedule = (delay: number, fn: () => void) => {
      timeout = window.setTimeout(() => {
        if (!mounted) return;
        fn();
      }, delay);
    };

    const tick = () => {
      const curIndex = indexRef.current;
      const curDeleting = deletingRef.current;

      if (!curDeleting) {
        // type forward: reveal next char
        const next = Math.min(curIndex + 1, full.length);
        setDisplay(full.slice(0, next));
        setIndex(next);
        indexRef.current = next;

        if (next === full.length) {
          if (loop) {
            // pause, then start deleting
            schedule(pause, () => {
              setIsDeleting(true);
              deletingRef.current = true;
              schedule(80, tick);
            });
            return;
          }
        }

        // continue typing
        schedule(Math.max(40, speed + Math.random() * 80 - 40), tick);
      } else {
        // deleting: remove last char (right-to-left)
        const next = Math.max(0, curIndex - 1);
        setDisplay(full.slice(0, next));
        setIndex(next);
        indexRef.current = next;

        if (next === 0) {
          // finished deleting, start typing again
          setIsDeleting(false);
          deletingRef.current = false;
          schedule(400, tick);
          return;
        }

        schedule(Math.max(20, Math.floor(speed / 1.5)), tick);
      }
    };

    // start
    schedule(300, tick);

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, pause, loop]);

  return (
    <span className={`relative inline-block align-baseline text-[inherit] font-[inherit] leading-[inherit]`} aria-hidden={false}>
      {/* invisible full text reserves space so surrounding layout doesn't shift during typing */}
      <span className="invisible pointer-events-none select-none" aria-hidden="true">{text}</span>

      {/* visible typing overlaid on top of the reserved space */}
      <span className={`absolute left-0 top-0 inline align-baseline ${className}`}>
        {display}
        <span className={`ml-1 inline align-baseline animate-[blink_1.2s_steps(2,infinite)] ${cursorClassName}`}>|</span>
      </span>
    </span>
  );
}
