"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { PackageComparison } from "@/components/packages/package-comparison";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { styleById, tiers, travelStyles } from "@/data/rules";
import { recommendTier } from "@/lib/recommendations";
import { cn } from "@/lib/utils";
import { SubHeading, TripStep } from "../trip-step";
import type { TripApi } from "../use-trip";

export function StyleStep({ api }: { api: TripApi }) {
  const { trip, actions } = api;
  const [compare, setCompare] = useState(false);
  const style = styleById(trip.style);
  const recTier = trip.style ? recommendTier(trip.style) : null;

  return (
    <TripStep index={2} title="How do you like to travel?" lede="Your style shapes the stays, vehicle and experiences we suggest. It's a set of simple rules, not an algorithm — and nothing leaves your browser.">
      <div className="space-y-12">
        <div>
          <SubHeading>Travel style</SubHeading>
          <div role="radiogroup" aria-label="Travel style" className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {travelStyles.map((s) => {
              const on = trip.style === s.id;
              return (
                <button key={s.id} type="button" role="radio" aria-checked={on} onClick={() => actions.setStyle(on ? null : s.id)} className={cn("relative min-h-[92px] rounded-[3px] border p-4 text-left transition-colors", on ? "border-forest bg-forest text-ivory" : "border-line-strong bg-paper hover:border-forest")}>
                  <span className="block font-display text-[1.6rem] leading-none">{s.label}</span>
                  <span className={cn("mt-2 block text-[12.5px] leading-snug", on ? "text-ivory/80" : "text-muted")}>{s.blurb}</span>
                  {on && <span className="absolute right-3 top-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brass-soft"><Check className="h-3 w-3" aria-hidden /> Selected</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-pine" aria-live="polite">
            {style ? (
              <>
                {style.note}
                {recTier && recTier !== trip.tier && (
                  <button type="button" className="ml-2 underline underline-offset-4" onClick={() => actions.setTier(recTier)}>
                    Use the {recTier[0].toUpperCase() + recTier.slice(1)} level
                  </button>
                )}
              </>
            ) : (
              <span className="text-muted">Optional — skip it and we&apos;ll suggest a balanced mix.</span>
            )}
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <SubHeading hint="The level changes stays, vehicle, meals and services — and therefore the estimate.">Package level</SubHeading>
            <Button variant="ghost" size="sm" onClick={() => setCompare(true)}>Compare levels</Button>
          </div>
          <div role="radiogroup" aria-label="Package level" className="grid gap-2.5 md:grid-cols-3">
            {tiers.map((t) => {
              const on = trip.tier === t.id;
              return (
                <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => actions.setTier(t.id)} className={cn("relative rounded-[3px] border p-5 text-left transition-colors", on ? "border-forest bg-forest text-ivory" : "border-line-strong bg-paper hover:border-forest")}>
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-[1.9rem] leading-none">{t.name}</span>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", on ? "text-brass-soft" : "text-brass")}>{on ? "✓ Selected" : t.id === "comfort" ? "Most chosen" : ""}</span>
                  </span>
                  <span className={cn("mt-2 block text-[13px] leading-snug", on ? "text-ivory/80" : "text-muted")}>{t.audience}</span>
                  <ul className={cn("mt-4 space-y-1 border-t pt-3 text-[12.5px]", on ? "border-white/20 text-ivory/90" : "border-line text-ink/80")}>
                    <li>{t.hotelLabel}</li>
                    <li>{t.vehicleLabel}</li>
                    <li>{t.meals}</li>
                  </ul>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Sheet open={compare} onOpenChange={setCompare} title="Compare package levels" side="center" className="!w-[min(96vw,980px)]">
        <div className="p-5">
          <PackageComparison selected={trip.tier} onSelect={actions.setTier} />
        </div>
      </Sheet>
    </TripStep>
  );
}
