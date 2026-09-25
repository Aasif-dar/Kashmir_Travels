"use client";

import { AlertCircle, Minus, Plus } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export const inputClasses =
  "w-full rounded-[3px] border border-line bg-paper px-3.5 h-11 text-[15px] text-ink placeholder:text-muted/70 transition-colors focus:border-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 aria-[invalid=true]:border-burgundy disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(inputClasses, className)} {...p} />;
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(inputClasses, "h-auto min-h-28 py-3 leading-relaxed", className)} {...p} />;
});

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...p }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(inputClasses, "appearance-none pr-9", className)} {...p}>
        {children}
      </select>
      <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="m5 8 5 5 5-5" />
      </svg>
    </div>
  );
});

export function Field({ label, htmlFor, error, hint, children, className, required }: { label: string; htmlFor: string; error?: string; hint?: string; children: React.ReactNode; className?: string; required?: boolean }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.14em] text-forest">
        {label}
        {required && <span aria-hidden className="text-burgundy"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-burgundy">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}

/** − 2 + stepper with comfortable touch targets. */
export function Stepper({ value, onChange, min = 0, max = 20, label, id }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string; id?: string }) {
  return (
    <div className="inline-flex h-11 items-center rounded-[3px] border border-line bg-paper" role="group" aria-label={label}>
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className="grid h-11 w-11 place-items-center text-forest hover:bg-forest/5 disabled:opacity-30">
        <Minus className="h-4 w-4" />
      </button>
      <output id={id} aria-live="polite" className="min-w-8 text-center text-[15px] font-semibold tabular-nums text-charcoal">
        {value}
      </output>
      <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className="grid h-11 w-11 place-items-center text-forest hover:bg-forest/5 disabled:opacity-30">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Selectable pill (radio-like) for single/multi choice groups. */
export function Chip({ selected, onClick, children, className, disabled, title }: { selected?: boolean; onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-[3px] border px-4 text-sm transition-colors disabled:opacity-40",
        selected ? "border-forest bg-forest text-ivory" : "border-line bg-paper text-ink hover:border-forest/50",
        className
      )}
    >
      {children}
    </button>
  );
}
