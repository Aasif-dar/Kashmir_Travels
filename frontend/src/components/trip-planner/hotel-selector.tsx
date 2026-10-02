"use client";

import { Check } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { EXTRA_BED_FACTOR } from "@/data/rules";
import { formatINR } from "@/lib/format";
import { hotelReason, hotelsFor } from "@/lib/recommendations";
import { roomsFor, seasonFactor } from "@/lib/pricing";
import { cn, plural } from "@/lib/utils";
import { HOTEL_CATEGORY_LABEL, type Hotel } from "@/types/hotel";
import type { TripApi } from "./use-trip";

/**
 * Handpicked stays, one destination at a time. The chosen stay is shown large and in full; the alternatives sit
 * underneath as compact rows with the price difference — so choosing feels like curation, not a marketplace.
 */
export function HotelSelector({ api }: { api: TripApi }) {
  const { trip, catalog, stays, actions } = api;
  const { notify } = useToast();
  const rooms = roomsFor(trip);

  return (
    <div className="space-y-16">
      {stays.map((stay) => {
        const options = hotelsFor(stay.destinationId, catalog);
        const dest = catalog.destinations.find((d) => d.id === stay.destinationId);
        const factor = seasonFactor(dest?.region ?? "kashmir", trip.travelMonth);
        const cost = (price: number) => stay.nights * (rooms * price * factor + trip.children * EXTRA_BED_FACTOR * price * factor);
        const current = stay.hotel;
        const currentCost = current ? cost(current.pricePerNight) : 0;
        const others = options.filter((h) => h.id !== current?.id);
        const choose = (h: Hotel) => {
          actions.selectHotel(stay.destinationId, h.id);
          notify(`${h.name} selected for ${stay.destinationName}`);
        };

        return (
          <section key={stay.destinationId} aria-labelledby={`hotels-${stay.destinationId}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line-strong pb-3">
              <h3 id={`hotels-${stay.destinationId}`} className="font-display text-[2.1rem] leading-none">{stay.destinationName}</h3>
              <p className="text-[13px] text-muted">{plural(stay.nights, "night")} · {plural(rooms, "room")}</p>
            </div>

            {options.length === 0 || !current ? (
              <EmptyState className="mt-6" title={`No stay listed in ${stay.destinationName}`} description="Our team can arrange one manually — carry on and mention it in your request." />
            ) : (
              <>
                {/* the chosen stay */}
                <article className="mt-6 grid overflow-hidden rounded-[3px] bg-paper ring-2 ring-forest md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                  <div className="relative aspect-[4/3] bg-forest md:aspect-auto md:min-h-[340px]">
                    <Photo k={current.image} sizes="(min-width:1024px) 38vw, 100vw" />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-[2px] bg-forest px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory"><Check className="h-3 w-3" aria-hidden /> Selected</span>
                  </div>
                  <div className="flex flex-col p-5 sm:p-7">
                    <p className="t-label !text-[10.5px] text-brass">{HOTEL_CATEGORY_LABEL[current.category].stars} {HOTEL_CATEGORY_LABEL[current.category].name} · {stay.destinationName}</p>
                    <h4 className="mt-2 font-display text-[2rem] leading-[1.05]">{current.name}</h4>
                    <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{current.description}</p>
                    <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-line pt-4 text-[13.5px] sm:grid-cols-2">
                      <div><dt className="t-label !text-[10px] text-brass">Rooms</dt><dd className="mt-1">{current.roomTypes.join(" · ")}</dd></div>
                      <div><dt className="t-label !text-[10px] text-brass">Amenities</dt><dd className="mt-1">{current.amenities.slice(0, 4).join(" · ")}</dd></div>
                    </dl>
                    {hotelReason(current, trip) && <p className="mt-4 text-[13px] font-medium text-pine">✓ {hotelReason(current, trip)}</p>}
                    <p className="mt-auto pt-5 text-[13px] text-muted"><span className="font-display text-[1.7rem] text-forest">{formatINR(current.pricePerNight)}</span> per room, per night · {formatINR(Math.round(currentCost / 10) * 10)} for {plural(stay.nights, "night")}</p>
                  </div>
                </article>

                {/* alternatives */}
                {others.length > 0 && (
                  <div className="mt-6">
                    <p className="t-label !text-[10.5px] text-forest">Other stays in {stay.destinationName}</p>
                    <ul className="mt-3 divide-y divide-line border-y border-line">
                      {others.map((h) => {
                        const delta = Math.round((cost(h.pricePerNight) - currentCost) / 10) * 10;
                        return (
                          <li key={h.id} className="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-4 py-3.5 sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:gap-6">
                            <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-forest"><Photo k={h.image} sizes="120px" /></div>
                            <div className="min-w-0">
                              <p className="t-label !text-[10px] text-brass">{HOTEL_CATEGORY_LABEL[h.category].stars} {HOTEL_CATEGORY_LABEL[h.category].name}</p>
                              <p className="mt-0.5 font-display text-[1.4rem] leading-tight">{h.name}</p>
                              <p className="mt-0.5 line-clamp-1 text-[13px] text-muted">{h.description}</p>
                              <p className="mt-1 text-[12.5px] tabular-nums text-ink/80">{formatINR(h.pricePerNight)} per night · {delta === 0 ? "same total" : `${delta > 0 ? "+" : "−"}${formatINR(Math.abs(delta))} overall`}</p>
                            </div>
                            <button type="button" onClick={() => choose(h)} aria-label={`Select ${h.name}`} className={cn("col-span-2 min-h-11 rounded-[3px] border border-forest px-5 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-forest transition-colors hover:bg-forest hover:text-ivory sm:col-span-1")}>
                              Select
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
