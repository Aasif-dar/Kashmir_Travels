"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatedNumber } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/form";
import { Eyebrow } from "@/components/ui/section";
import { travelStyles } from "@/data/rules";
import { formatINR, MONTHS, roundEstimate } from "@/lib/format";
import { computePrice } from "@/lib/pricing";
import { pickStops, recommendTier } from "@/lib/recommendations";
import { autoPlan, defaultTrip } from "@/lib/trip";
import { validateTrip, hasErrors } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/store/catalog-context";
import { useTripStore } from "@/store/trip-store";
import type { TravelStyle } from "@/types/trip";

const DAYS = [3, 5, 7, 9, 12, 14];

/** A live taste of the planner: change days, style or month and watch the route and estimate rebuild. */
export function PlannerPreview() {
  const catalog = useCatalog();
  const router = useRouter();
  const replace = useTripStore((s) => s.replace);
  const [days, setDays] = useState(5);
  const [style, setStyle] = useState<TravelStyle | null>("couple");
  const [month, setMonth] = useState<number | null>(null);

  const trip = useMemo(() => {
    const ids = pickStops(days, "any", style, month, catalog);
    const base = { ...defaultTrip(), days, style, travelMonth: month, tier: style ? recommendTier(style) : ("comfort" as const) };
    return autoPlan(base, catalog, ids);
  }, [days, style, month, catalog]);
  const price = useMemo(() => computePrice(trip, catalog), [trip, catalog]);
  const ok = !hasErrors(validateTrip(trip, catalog));
  const total = trip.stops.reduce((a, s) => a + s.nights, 0);

  const open = () => {
    replace(trip, 2);
    router.push("/plan-your-trip");
  };

  return (
    <section aria-labelledby="planner-preview-title" className="border-y border-line bg-parchment/50 py-20 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <Eyebrow>The planner</Eyebrow>
          <h2 id="planner-preview-title" className="display-lg mt-3">
            Build it here. <span className="italic text-forest">Watch it take shape.</span>
          </h2>
          <p className="lede mt-5 max-w-lg">Change the length, the mood or the month. The route, the pace and the estimate rebuild instantly — no forms, no waiting for a quote.</p>

          <div className="mt-10 space-y-8">
            <fieldset>
              <legend className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-forest">How many days?</legend>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => <Chip key={d} selected={days === d} onClick={() => setDays(d)}>{d} days</Chip>)}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-forest">What kind of trip?</legend>
              <div className="flex flex-wrap gap-2">
                {travelStyles.map((s) => <Chip key={s.id} selected={style === s.id} onClick={() => setStyle(style === s.id ? null : s.id)}>{s.label}</Chip>)}
              </div>
              {style && <p className="mt-3 text-sm text-muted">{travelStyles.find((s) => s.id === style)?.note}</p>}
            </fieldset>
            <div>
              <label htmlFor="pp-month" className="mb-3 block text-[12px] font-semibold uppercase tracking-[0.16em] text-forest">When?</label>
              <select id="pp-month" value={month ?? ""} onChange={(e) => setMonth(e.target.value === "" ? null : Number(e.target.value))} className="h-11 w-full max-w-xs rounded-[3px] border border-line bg-paper px-3 text-[15px]">
                <option value="">I&apos;m flexible</option>
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="relative bg-forest p-6 text-ivory sm:p-9" aria-live="polite">
          <div className="absolute inset-0 bg-jaali-light opacity-60" aria-hidden />
          <div className="relative">
            <p className="eyebrow !text-brass-soft">Suggested route · {days} days</p>
            <ol className="mt-6">
              {trip.stops.map((s, i) => {
                const d = catalog.destinations.find((x) => x.id === s.destinationId);
                return (
                  <li key={s.destinationId} className="relative flex gap-5 pb-6 last:pb-0">
                    {i < trip.stops.length - 1 && <span className="absolute left-[7px] top-5 h-full w-px bg-brass-soft/40" aria-hidden />}
                    <span className="relative mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-brass-soft bg-forest" aria-hidden />
                    <div className="flex flex-1 items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="font-display text-3xl leading-none">{d?.name}</span>
                      <span className="text-sm text-ivory/70">{s.nights} {s.nights === 1 ? "night" : "nights"}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className={cn("mt-5 text-sm", ok ? "text-ivory/70" : "text-brass-soft")}>
              {total + 1} days · {trip.activities.length} suggested {trip.activities.length === 1 ? "experience" : "experiences"}{month != null ? ` · priced for ${MONTHS[month]}` : ""}
            </p>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6 border-t border-white/15 pt-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-ivory/60">Estimated per person (demo)</p>
                <AnimatedNumber value={roundEstimate(price.perPerson)} format={(n) => formatINR(n)} className="font-display text-5xl leading-none text-ivory" />
                <p className="mt-2 text-xs text-ivory/55">for 2 adults · total ≈ {formatINR(roundEstimate(price.total))}</p>
              </div>
              <Button variant="gold" size="lg" onClick={open}>
                Continue in planner <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
