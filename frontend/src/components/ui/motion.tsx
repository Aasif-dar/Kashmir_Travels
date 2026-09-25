"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Calm fade-up on scroll. Respects reduced-motion. */
export function Reveal({ children, delay = 0, className, y = 18, as = "div" }: { children: ReactNode; delay?: number; className?: string; y?: number; as?: "div" | "li" | "section" | "article" }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

/** Image reveal: a curtain of the page colour lifts away. */
export function ImageReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {children}
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute inset-0 origin-top bg-ivory"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: inView ? 0 : 1 }}
          transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
        />
      )}
    </div>
  );
}

/** Smoothly animates between numeric values (used for the trip price). */
export function AnimatedNumber({ value, format, className }: { value: number; format: (n: number) => string; className?: string }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => format(v));
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] });
    return () => controls.stop();
  }, [value, mv, reduce]);
  useEffect(() => text.on("change", (v) => ref.current && (ref.current.textContent = v)), [text]);
  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
