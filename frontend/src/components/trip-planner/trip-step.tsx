import type { ReactNode } from "react";
import { STEPS } from "@/store/trip-store";
import { cn } from "@/lib/utils";

/** Consistent heading + body wrapper for each planner step. */
export function TripStep({ index, title, lede, children, className }: { index: number; title: string; lede?: string; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={`step-${index}-title`} className={cn("min-w-0", className)}>
      <p className="eyebrow">
        {String(index + 1).padStart(2, "0")} — {STEPS[index]}
      </p>
      <h2 id={`step-${index}-title`} tabIndex={-1} className="t-h2 mt-3 outline-none">{title}</h2>
      {lede && <p className="t-lede mt-3 measure">{lede}</p>}
      <div className="mt-9">{children}</div>
    </section>
  );
}

export function SubHeading({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h3 className="t-label text-forest">{children}</h3>
      {hint && <p className="mt-1.5 max-w-[60ch] text-[13.5px] leading-snug text-muted">{hint}</p>}
    </div>
  );
}
