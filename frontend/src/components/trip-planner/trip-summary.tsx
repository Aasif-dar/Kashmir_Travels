"use client";

import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { AnimatedNumber } from "@/components/ui/motion";
import { Sheet } from "@/components/ui/sheet";
import { styleById, tierById } from "@/data/rules";
import { formatINR, MONTHS } from "@/lib/format";
import { plural } from "@/lib/utils";
import { PriceBreakdown } from "./price-breakdown";
import type { TripApi } from "./use-trip";

function SummaryBody({ api }: { api: TripApi }) {
  const { trip, catalog, stays, vehicle, price } = api;
  const tier = tierById(trip.tier);
  const style = styleById(trip.style);
  const stopNames = trip.stops.map((s) => `${catalog.destinations.find((d) => d.id === s.destinationId)?.name} · ${s.nights}N`);
  const acts = trip.activities.map((a) => catalog.activities.find((x) => x.id === a.activityId)).filter((a) => a && a.destinationIds.some((d) => trip.stops.some((s) => s.destinationId === d)));

  const row = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 py-2.5">
      <dt className="t-label !text-[10px] pt-[3px] text-brass">{label}</dt>
      <dd className="text-[14px] leading-snug text-ink">{value}</dd>
    </div>
  );
  const none = (t: string) => <span className="text-muted">{t}</span>;

  return (
    <div>
      <dl className="divide-y divide-line border-y border-line">
        {row("Duration", `${trip.days} days · ${Math.max(trip.days - 1, 1)} nights${trip.travelMonth != null ? ` · ${MONTHS[trip.travelMonth]}` : ""}`)}
        {row("Route", stopNames.length ? <ul className="space-y-0.5">{stopNames.map((n) => <li key={n}>{n}</li>)}</ul> : none("Not chosen yet"))}
        {row("Style", `${style ? style.label : "Any"} · ${tier.name}`)}
        {row("Travellers", `${plural(trip.adults, "adult")}${trip.children ? `, ${plural(trip.children, "child", "children")}` : ""}`)}
        {row("Stays", stays.length ? <ul className="space-y-0.5">{stays.map((s) => <li key={s.destinationId}>{s.hotel ? s.hotel.name : none(`None in ${s.destinationName}`)}</li>)}</ul> : none("—"))}
        {row("Vehicle", vehicle.vehicle ? `${vehicle.vehicle.name.split(" — ")[0]}${vehicle.count > 1 ? ` × ${vehicle.count}` : ""}` : none("—"))}
        {row("Experiences", acts.length ? <ul className="space-y-0.5">{acts.map((a) => a && <li key={a.id}>{a.name}</li>)}</ul> : none("None yet"))}
      </dl>
      <div className="mt-6">
        <PriceBreakdown price={price} showLines={false} />
      </div>
    </div>
  );
}

/** Desktop: sticky "Your journey" panel with the running estimate. */
export function TripSummary({ api }: { api: TripApi }) {
  return (
    <aside aria-label="Your journey" tabIndex={0} className="shadow-float sticky top-[6.5rem] max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-[3px] border border-line bg-paper p-6">
      <h2 className="font-display text-[1.7rem] leading-none">Your journey</h2>
      <div className="mt-4">
        <SummaryBody api={api} />
      </div>
    </aside>
  );
}

/** Phones and tablets: a compact bar with the running estimate; opens the full summary on demand. */
export function MobileSummaryBar({ api, children }: { api: TripApi; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/[0.98] px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 lg:hidden">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setOpen(true)} className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-2 text-left" aria-label="Open your journey summary">
            <span className="min-w-0">
              {api.price.total > 0 ? (
                <>
                  <span className="t-label block whitespace-nowrap !text-[9.5px] text-brass"><span className="min-[400px]:hidden">Estimate</span><span className="hidden min-[400px]:inline">Estimated trip value</span></span>
                  <span className="t-price block text-[1.5rem] text-forest"><AnimatedNumber value={api.price.total} format={formatINR} /></span>
                </>
              ) : (
                <>
                  <span className="t-label block !text-[9.5px] text-brass">Your journey</span>
                  <span className="block truncate font-display text-[1.15rem] leading-tight text-forest">Choose places for an estimate</span>
                </>
              )}
            </span>
            <ChevronUp className="h-5 w-5 shrink-0 text-forest" aria-hidden />
          </button>
          {children}
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen} title="Your journey" side="bottom">
        {/* focusable so keyboard users can scroll the sheet when the summary is taller than the screen */}
        <div tabIndex={0} role="region" aria-label="Journey summary" className="px-5 pb-8 pt-4">
          <SummaryBody api={api} />
        </div>
      </Sheet>
    </>
  );
}
