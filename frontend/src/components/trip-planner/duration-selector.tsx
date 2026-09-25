"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/form";
import { rules } from "@/data/rules";

const PRESETS = [3, 4, 5, 6, 7, 8, 9, 10, 12, 14];

export function DurationSelector({ days, onChange }: { days: number; onChange: (d: number) => void }) {
  const isCustom = !PRESETS.includes(days);
  const [custom, setCustom] = useState(isCustom);
  const showCustom = custom || isCustom;
  return (
    <div>
      <div role="radiogroup" aria-label="Trip length" className="flex flex-wrap gap-2">
        {PRESETS.map((d) => (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={!showCustom && days === d}
            onClick={() => { setCustom(false); onChange(d); }}
            className={`min-h-12 min-w-[84px] border px-4 text-left transition-colors ${!showCustom && days === d ? "border-forest bg-forest text-ivory" : "border-line bg-paper hover:border-forest/50"}`}
          >
            <span className="block font-display text-3xl leading-none">{d}</span>
            <span className="text-[11px] uppercase tracking-[0.14em] opacity-70">days · {d - 1}N</span>
          </button>
        ))}
        <Chip selected={showCustom} onClick={() => setCustom(true)} className="min-h-12 self-stretch px-5">Custom</Chip>
      </div>
      {showCustom && (
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="custom-days" className="text-sm text-ink">Number of days</label>
          <input
            id="custom-days"
            type="number"
            inputMode="numeric"
            min={rules.minDays}
            max={rules.maxDays}
            value={days}
            onChange={(e) => onChange(Number(e.target.value) || rules.minDays)}
            className="h-11 w-24 rounded-[3px] border border-line bg-paper px-3 text-[15px] tabular-nums focus:border-forest focus:outline-none"
          />
          <span className="text-xs text-muted">{rules.minDays}–{rules.maxDays} days</span>
        </div>
      )}
    </div>
  );
}
