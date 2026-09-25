"use client";

import { ChevronUp, MapPin } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { tierById } from "@/data/rules";
import { AnimatedNumber } from "@/components/ui/motion";
import { formatINR, MONTHS } from "@/lib/format";
import { plural } from "@/lib/utils";
import { PriceBreakdown } from "./price-breakdown";
import type { TripApi } from "./use-trip";

function SummaryBody({ api, compact }: { api: TripApi; compact?: boolean }) {
  const { trip, catalog, stays, vehicle, price } = api;
  const tier = tierById(trip.tier);
  const stopNames = trip.stops.map((s) => `${catalog.destinations.find((d) => d.id === s.destinationId)?.name} (${s.nights}N)`);
  const actNames = trip.activities.map((a) => catalog.activities.find((x) => x.id === a.activityId)).filter((a) => a && a.destinationIds.some((d) => trip.stops.some((s) => s.destinationId === d)));

  const row = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-[92px_1fr] gap-3 py-2.5">
      <dt className="pt-0.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brass">{label}</dt>
      <dd className="text-[14px] leading-snug text-ink">{value}</dd>
    </div>
  );

  return (
    <div>
      <dl className="divide-y divide-line border-y border-line">
        {row("Duration", `${trip.days} days / ${Math.max(trip.days - 1, 1)} nights`)}
        {row("Route", stopNames.length ? stopNames.join(" → ") : <span className="text-muted">Choose destinations</span>)}
        {row("Level", tier.name)}
        {row("Travellers", `${plural(trip.adults, "adult")}${trip.children ? `, ${plural(trip.children, "child", "children")}` : ""}`)}
        {trip.travelMonth != null && row("Month", MONTHS[trip.travelMonth])}
        {row(
          "Hotels",
          stays.length ? (
            <ul className="space-y-0.5">
              {stays.map((s) => <li key={s.destinationId}>{s.hotel ? s.hotel.name : <span className="text-muted">No hotel for {s.destinationName}</span>}</li>)}
            </ul>
          ) : <span className="text-muted">—</span>
        )}
        {row("Vehicle", vehicle.vehicle ? `${vehicle.vehicle.name.split(" — ")[0]}${vehicle.count > 1 ? ` × ${vehicle.count}` : ""}` : <span className="text-burgundy">None available</span>)}
        {row("Activities", actNames.length ? <ul className="space-y-0.5">{actNames.map((a) => a && <li key={a.id}>{a.name}</li>)}</ul> : <span className="text-muted">None added</span>)}
      </dl>
      <div className="mt-5">
        <PriceBreakdown price={price} showLines={!compact} />
      </div>
    </div>
  );
}

/** Desktop: sticky sidebar. */
export function TripSummary({ api }: { api: TripApi }) {
  return (
    <aside aria-label="Trip summary" className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto border border-line bg-paper p-5 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.5)]">
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-brass" aria-hidden />
        <h2 className="font-display text-3xl leading-none">Your trip</h2>
      </div>
      <SummaryBody api={api} />
    </aside>
  );
}

/** Mobile / tablet: sticky bottom bar with the live total, opening a bottom sheet with the full summary. */
export function MobileSummaryBar({ api, children }: { api: TripApi; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/97 px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-10px_30px_-20px_rgba(0,0,0,0.5)] backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setOpen(true)} className="flex min-h-12 flex-1 items-center justify-between gap-2 text-left" aria-label="Open trip summary">
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-brass">Estimated (demo)</span>
              {api.price.total > 0 ? (
                <>
                  <span className="block font-display text-[1.6rem] leading-none text-forest"><AnimatedNumber value={api.price.total} format={formatINR} /></span>
                  <span className="block text-[11px] text-muted">{formatINR(api.price.perPerson)} pp</span>
                </>
              ) : (
                <span className="block font-display text-xl leading-tight text-forest">Choose destinations<span className="block font-sans text-[11px] text-muted">to see an estimate</span></span>
              )}
            </span>
            <ChevronUp className="h-5 w-5 text-forest" aria-hidden />
          </button>
          {children}
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen} title="Your trip" side="bottom">
        <div className="px-5 py-4 pb-8"><SummaryBody api={api} /></div>
      </Sheet>
    </>
  );
}
