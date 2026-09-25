"use client";

import { Check } from "lucide-react";
import { HotelCard } from "@/components/hotels/hotel-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { EXTRA_BED_FACTOR } from "@/data/rules";
import { formatINR } from "@/lib/format";
import { hotelReason, hotelsFor } from "@/lib/recommendations";
import { roomsFor, seasonFactor } from "@/lib/pricing";
import { plural } from "@/lib/utils";
import type { TripApi } from "./use-trip";

/** Per-destination hotel choice. Selecting a hotel updates the trip price immediately. */
export function HotelSelector({ api }: { api: TripApi }) {
  const { trip, catalog, stays, actions } = api;
  const rooms = roomsFor(trip);

  return (
    <div className="space-y-14">
      {stays.map((stay) => {
        const options = hotelsFor(stay.destinationId, catalog);
        const dest = catalog.destinations.find((d) => d.id === stay.destinationId);
        const factor = seasonFactor(dest?.region ?? "kashmir", trip.travelMonth);
        const cost = (price: number) => stay.nights * (rooms * price * factor + trip.children * EXTRA_BED_FACTOR * price * factor);
        const currentCost = stay.hotel ? cost(stay.hotel.pricePerNight) : 0;
        return (
          <section key={stay.destinationId} aria-labelledby={`hotels-${stay.destinationId}`}>
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
              <h3 id={`hotels-${stay.destinationId}`} className="font-display text-4xl leading-none">{stay.destinationName}</h3>
              <p className="text-sm text-muted">{plural(stay.nights, "night")} · {plural(rooms, "room")}</p>
            </div>
            {options.length === 0 ? (
              <EmptyState title={`No hotel available in ${stay.destinationName}`} description="Our team can arrange a stay manually — continue and mention it in your booking request." />
            ) : (
              <div className="space-y-4">
                {options.map((h) => {
                  const selected = stay.hotel?.id === h.id;
                  const delta = Math.round((cost(h.pricePerNight) - currentCost) / 10) * 10;
                  return (
                    <HotelCard
                      key={h.id}
                      hotel={h}
                      selected={selected}
                      reason={hotelReason(h, trip)}
                      action={
                        <div className="text-right">
                          {!selected && <p className="mb-1 text-[12px] tabular-nums text-muted">{delta === 0 ? "Same total" : `${delta > 0 ? "+" : "−"}${formatINR(Math.abs(delta))} for ${plural(stay.nights, "night")}`}</p>}
                          <Button variant={selected ? "primary" : "outline"} size="md" onClick={() => actions.selectHotel(stay.destinationId, h.id)} aria-pressed={selected} aria-label={`${selected ? "Selected:" : "Select"} ${h.name}`}>
                            {selected ? <><Check className="h-4 w-4" aria-hidden /> Selected</> : "Select hotel"}
                          </Button>
                        </div>
                      }
                    />
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
