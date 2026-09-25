"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { PackageComparison } from "@/components/packages/package-comparison";
import { Button } from "@/components/ui/button";
import { Field, Select, Stepper } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { originCities } from "@/data/site";
import { styleById, tiers, travelStyles } from "@/data/rules";
import { MONTHS } from "@/lib/format";
import { recommendTier } from "@/lib/recommendations";
import { cn } from "@/lib/utils";
import { DurationSelector } from "../duration-selector";
import { SubHeading, TripStep } from "../trip-step";
import type { TripApi } from "../use-trip";

export function DurationStep({ api }: { api: TripApi }) {
  const { trip, actions } = api;
  const [compare, setCompare] = useState(false);
  const style = styleById(trip.style);
  const recTier = trip.style ? recommendTier(trip.style) : null;

  return (
    <TripStep index={0} title="How long do you have?" lede="Start with the length of your trip. Everything else — pace, places, price — flows from this.">
      <div className="space-y-12">
        <div>
          <SubHeading>Duration</SubHeading>
          <DurationSelector days={trip.days} onChange={actions.setDays} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-forest" id="adults-label">Adults</p>
            <Stepper label="adults" value={trip.adults} min={1} max={20} onChange={actions.setAdults} />
          </div>
          <div>
            <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-forest">Children (under 12)</p>
            <Stepper label="children" value={trip.children} min={0} max={10} onChange={actions.setChildren} />
          </div>
          <Field label="Travel month" htmlFor="month" hint="Used for seasonal advice and pricing.">
            <Select id="month" value={trip.travelMonth ?? ""} onChange={(e) => actions.setMonth(e.target.value === "" ? null : Number(e.target.value))}>
              <option value="">I&apos;m flexible</option>
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Starting from" htmlFor="from" hint="Where you'll fly or travel from.">
            <Select id="from" value={trip.startingFrom} onChange={(e) => actions.setStartingFrom(e.target.value)}>
              {originCities.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
        </div>

        <div>
          <SubHeading hint="Shapes the hotels, vehicle and activities we recommend. Rule-based — nothing leaves your browser.">Travel style</SubHeading>
          <div role="radiogroup" aria-label="Travel style" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {travelStyles.map((s) => {
              const on = trip.style === s.id;
              return (
                <button key={s.id} type="button" role="radio" aria-checked={on} onClick={() => actions.setStyle(on ? null : s.id)} className={cn("min-h-[76px] border p-3.5 text-left transition-colors", on ? "border-forest bg-forest text-ivory" : "border-line bg-paper hover:border-forest/50")}>
                  <span className="block font-display text-2xl leading-none">{s.label}</span>
                  <span className={cn("mt-1.5 block text-[12.5px] leading-snug", on ? "text-ivory/75" : "text-muted")}>{s.blurb}</span>
                </button>
              );
            })}
          </div>
          {style && (
            <p className="mt-3 flex items-start gap-2 text-[13.5px] text-pine">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {style.note}
              {recTier && recTier !== trip.tier && <button type="button" className="ml-1 underline underline-offset-4" onClick={() => actions.setTier(recTier)}>Switch to {recTier[0].toUpperCase() + recTier.slice(1)} level</button>}
            </p>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <SubHeading hint="Changes hotels, vehicle, meals and services — and the price.">Package level</SubHeading>
            <Button variant="ghost" size="sm" onClick={() => setCompare(true)}>Compare levels</Button>
          </div>
          <div role="radiogroup" aria-label="Package level" className="grid gap-2 md:grid-cols-3">
            {tiers.map((t) => {
              const on = trip.tier === t.id;
              return (
                <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => actions.setTier(t.id)} className={cn("border p-4 text-left transition-colors", on ? "border-forest bg-forest text-ivory" : "border-line bg-paper hover:border-forest/50")}>
                  <span className="flex items-baseline justify-between"><span className="font-display text-3xl leading-none">{t.name}</span>{t.id === "comfort" && <span className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", on ? "text-brass-soft" : "text-brass")}>Most chosen</span>}</span>
                  <span className={cn("mt-2 block text-[13px] leading-snug", on ? "text-ivory/80" : "text-muted")}>{t.audience}</span>
                  <ul className={cn("mt-3 space-y-1 text-[12.5px]", on ? "text-ivory/90" : "text-ink/80")}>
                    <li>{t.hotelLabel}</li><li>{t.vehicleLabel}</li><li>{t.meals}</li>
                  </ul>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Sheet open={compare} onOpenChange={setCompare} title="Compare package levels" side="center" className="!w-[min(96vw,980px)]">
        <div className="p-5"><PackageComparison selected={trip.tier} onSelect={actions.setTier} /></div>
      </Sheet>
    </TripStep>
  );
}
