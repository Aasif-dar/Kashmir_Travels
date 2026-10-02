"use client";

import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { summariseRoute } from "@/lib/itinerary-engine";
import { distanceMultiplier, travellersOf } from "@/lib/pricing";
import { recommendVehicle } from "@/lib/recommendations";
import { cn } from "@/lib/utils";
import type { TripApi } from "./use-trip";

/** Four vehicle tiles: what it seats, what it carries, and what it adds to the estimate. */
export function VehicleSelector({ api }: { api: TripApi }) {
  const { trip, catalog, vehicle, actions } = api;
  const { notify } = useToast();
  const stopIds = trip.stops.map((s) => s.destinationId);
  const recommended = recommendVehicle(trip, catalog);
  const route = summariseRoute(trip.stops, catalog);
  const mult = distanceMultiplier(route.totalHours, trip.days);
  const travellers = travellersOf(trip);

  if (!catalog.vehicles.length) return <EmptyState title="No vehicles available" description="Our team will arrange transport manually. Carry on and mention any preferences in your request." />;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {catalog.vehicles.map((v) => {
          const unsupported = stopIds.filter((id) => !v.supportedDestinations.includes(id)).map((id) => catalog.destinations.find((d) => d.id === id)?.name);
          const selected = vehicle.vehicle?.id === v.id;
          const count = Math.max(1, Math.ceil(travellers / v.passengers));
          const total = Math.round((v.pricePerDay * trip.days * count * mult) / 10) * 10;
          const blocked = unsupported.length > 0;
          const note = blocked ? `Not suitable for ${unsupported.join(", ")}.` : count > 1 ? `Your group of ${travellers} needs ${count} vehicles.` : undefined;
          return (
            <VehicleCard
              key={v.id}
              vehicle={v}
              selected={selected}
              recommended={recommended?.id === v.id}
              note={note}
              price={total}
              priceLabel={`Estimate for ${trip.days} days${count > 1 ? ` × ${count}` : ""}`}
              className={cn(blocked && "opacity-75")}
              action={
                <button
                  type="button"
                  disabled={blocked}
                  aria-pressed={selected}
                  aria-label={`${selected ? "Selected:" : "Select"} ${v.name}`}
                  onClick={() => { actions.selectVehicle(v.id); notify(`${v.name.split(" — ")[0]} selected`); }}
                  className={cn("min-h-11 rounded-[3px] border px-5 text-[11.5px] font-semibold uppercase tracking-[0.16em] transition-colors disabled:cursor-not-allowed disabled:opacity-50", selected ? "border-forest bg-forest text-ivory" : "border-forest text-forest hover:bg-forest hover:text-ivory")}
                >
                  {selected ? "✓ Selected" : blocked ? "Not for this route" : "Select"}
                </button>
              }
            />
          );
        })}
      </div>
      {trip.vehicleId && (
        <button type="button" onClick={() => actions.selectVehicle(null)} className="mt-5 text-sm text-forest underline underline-offset-4">Use the recommended vehicle instead</button>
      )}
      <p className="mt-6 text-[12.5px] text-muted">Indicative rates for the whole trip, scaled for the road distance of your route. Vehicles are confirmed by our team — never shown as live availability.</p>
    </div>
  );
}
