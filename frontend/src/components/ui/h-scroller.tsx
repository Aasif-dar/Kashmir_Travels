"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Horizontal snap scroller with keyboard-accessible previous / next controls. */
export function HScroller({ children, className, label, light, controlsClassName }: { children: ReactNode; className?: string; label: string; light?: boolean; controlsClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setPrev] = useState(false);
  const [canNext, setNext] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setPrev(el.scrollLeft > 8);
    setNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const scrollBy = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * Math.max(320, (ref.current?.clientWidth ?? 600) * 0.8), behavior: "smooth" });

  const btn = cn("grid h-11 w-11 place-items-center rounded-full border transition-colors disabled:opacity-30", light ? "border-white/30 text-ivory hover:bg-white/10" : "border-forest/30 text-forest hover:bg-forest/5");

  return (
    <div>
      <div className={cn("mb-5 hidden justify-end gap-2 md:flex", controlsClassName)}>
        <button type="button" className={btn} onClick={() => scrollBy(-1)} disabled={!canPrev} aria-label={`Scroll ${label} back`}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" className={btn} onClick={() => scrollBy(1)} disabled={!canNext} aria-label={`Scroll ${label} forward`}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div ref={ref} onScroll={update} role="region" aria-label={label} tabIndex={0} className={cn("no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 focus-visible:outline-offset-4", className)}>
        {children}
      </div>
    </div>
  );
}
