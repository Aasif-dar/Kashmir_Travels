import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Consistent heading + body wrapper for each planner step. */
export function TripStep({ index, title, lede, children, className }: { index: number; title: string; lede?: string; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={`step-${index}-title`} className={cn("min-w-0", className)}>
      <p className="eyebrow">Step {index + 1} of 7</p>
      <h2 id={`step-${index}-title`} tabIndex={-1} className="display-md mt-2 outline-none">{title}</h2>
      {lede && <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-muted">{lede}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function SubHeading({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-forest">{children}</h3>
      {hint && <p className="mt-1 text-[13px] text-muted">{hint}</p>}
    </div>
  );
}
