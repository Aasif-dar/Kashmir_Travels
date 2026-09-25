"use client";

import { ArrowRight, Check, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { originCities } from "@/data/site";
import { travelStyles } from "@/data/rules";
import { MONTHS } from "@/lib/format";
import { pickStops, recommendTier } from "@/lib/recommendations";
import { autoPlan, defaultTrip } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/store/catalog-context";
import { useTripStore } from "@/store/trip-store";
import type { TravelStyle } from "@/types/trip";
import type { Region } from "@/types/destination";

const DURATIONS = [3, 4, 5, 6, 7, 8, 9, 10, 12, 14];

function BarField({ label, htmlFor, children, className }: { label: string; htmlFor: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative border-b border-line px-4 py-3 xl:border-b-0 xl:border-r", className)}>
      <label htmlFor={htmlFor} className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-brass">
        {label}
      </label>
      {children}
    </div>
  );
}

const selectClasses = "mt-1 block w-full cursor-pointer appearance-none truncate bg-transparent pr-4 text-[15px] font-medium text-charcoal focus:outline-none";

export function QuickPlanner({ variant = "hero", className }: { variant?: "hero" | "panel"; className?: string }) {
  const catalog = useCatalog();
  const router = useRouter();
  const replace = useTripStore((s) => s.replace);
  const uid = useId();
  const [from, setFrom] = useState<string>("Delhi");
  const [region, setRegion] = useState<Region | "any">("kashmir");
  const [days, setDays] = useState(6);
  const [picked, setPicked] = useState<string[]>([]);
  const [adults, setAdults] = useState(2);
  const [month, setMonth] = useState<number | null>(null);
  const [style, setStyle] = useState<TravelStyle | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const regionDestinations = catalog.destinations.filter((d) => region === "any" || d.region === region);

  const onRegion = (r: Region | "any") => {
    setRegion(r);
    setPicked((p) => p.filter((id) => r === "any" || catalog.destinations.find((d) => d.id === id)?.region === r));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const stopIds = picked.length ? picked : pickStops(days, region, style, month, catalog);
    const base = { ...defaultTrip(), days, startingFrom: from, region, travelMonth: month, adults, style, tier: style ? recommendTier(style) : ("comfort" as const) };
    replace(autoPlan(base, catalog, stopIds), 2);
    router.push("/plan-your-trip");
  };

  return (
    <form
      onSubmit={submit}
      aria-label="Quick trip planner"
      className={cn(
        "bg-ivory text-ink shadow-[0_24px_60px_-28px_rgba(0,0,0,0.6)]",
        variant === "hero" ? "border border-white/20" : "border border-line",
        className
      )}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-[1fr_1fr_0.9fr_1.15fr_0.95fr_1fr_1.05fr_auto]">
        <BarField label="Starting from" htmlFor={`${uid}-from`}>
          <select id={`${uid}-from`} value={from} onChange={(e) => setFrom(e.target.value)} className={selectClasses}>
            {originCities.map((c) => <option key={c}>{c}</option>)}
          </select>
        </BarField>
        <BarField label="Region" htmlFor={`${uid}-region`}>
          <select id={`${uid}-region`} value={region} onChange={(e) => onRegion(e.target.value as Region | "any")} className={selectClasses}>
            <option value="kashmir">Kashmir</option>
            <option value="jammu">Jammu &amp; Katra</option>
            <option value="ladakh">Ladakh</option>
            <option value="any">Open to suggestions</option>
          </select>
        </BarField>
        <BarField label="Duration" htmlFor={`${uid}-days`}>
          <select id={`${uid}-days`} value={days} onChange={(e) => setDays(Number(e.target.value))} className={selectClasses}>
            {DURATIONS.map((d) => <option key={d} value={d}>{d} days</option>)}
          </select>
        </BarField>
        <BarField label="Destinations" htmlFor={`${uid}-dest`}>
          <button id={`${uid}-dest`} type="button" onClick={() => setPickerOpen(true)} className="mt-1 flex w-full items-center justify-between truncate text-left text-[15px] font-medium text-charcoal">
            <span className="truncate">{picked.length ? `${picked.length} chosen` : "Suggest for me"}</span>
            <MapPin className="ml-1 h-3.5 w-3.5 shrink-0 text-forest" aria-hidden />
          </button>
        </BarField>
        <BarField label="Travellers" htmlFor={`${uid}-adults`}>
          <select id={`${uid}-adults`} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={selectClasses}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? "adult" : "adults"}</option>)}
          </select>
        </BarField>
        <BarField label="Travel month" htmlFor={`${uid}-month`}>
          <select id={`${uid}-month`} value={month ?? ""} onChange={(e) => setMonth(e.target.value === "" ? null : Number(e.target.value))} className={selectClasses}>
            <option value="">Flexible</option>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
        </BarField>
        <BarField label="Travel style" htmlFor={`${uid}-style`}>
          <select id={`${uid}-style`} value={style ?? ""} onChange={(e) => setStyle((e.target.value || null) as TravelStyle | null)} className={selectClasses}>
            <option value="">Any style</option>
            {travelStyles.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </BarField>
        <div className="col-span-2 flex md:col-span-4 xl:col-span-1">
          <Button type="submit" variant="gold" size="lg" className="h-14 w-full rounded-none xl:h-full xl:min-h-[76px] xl:px-8">
            Build My Itinerary <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      <Sheet open={pickerOpen} onOpenChange={setPickerOpen} title="Choose destinations" description="Leave empty and we'll suggest a realistic route for your dates." side="center">
        <ul className="grid gap-px bg-line sm:grid-cols-2">
          {regionDestinations.map((d) => {
            const on = picked.includes(d.id);
            return (
              <li key={d.id} className="bg-ivory">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicked((p) => (on ? p.filter((x) => x !== d.id) : [...p, d.id]))}
                  className={cn("flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors", on ? "bg-forest text-ivory" : "hover:bg-parchment/60")}
                >
                  <span>
                    <span className="block font-display text-xl leading-none">{d.name}</span>
                    <span className={cn("text-xs", on ? "text-ivory/70" : "text-muted")}>{d.recommendedDays}</span>
                  </span>
                  {on && <Check className="h-4 w-4" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-line bg-ivory p-4">
          <button type="button" onClick={() => setPicked([])} className="text-sm text-forest underline underline-offset-4">Clear</button>
          <Button onClick={() => setPickerOpen(false)}>Done</Button>
        </div>
      </Sheet>
    </form>
  );
}
