"use client";

import { Check } from "lucide-react";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { formatINR } from "@/lib/format";
import { summariseRoute } from "@/lib/itinerary-engine";
import { distanceMultiplier, travellersOf } from "@/lib/pricing";
import { recommendVehicle } from "@/lib/recommendations";
import type { TripApi } from "./use-trip";

export function VehicleSelector({ api }: { api: TripApi }) {
  const { trip, catalog, vehicle, actions } = api;
  const stopIds = trip.stops.map((s) => s.destinationId);
  const recommended = recommendVehicle(trip, catalog);
  const route = summariseRoute(trip.stops, catalog);
  const mult = distanceMultiplier(route.totalHours, trip.days);
  const travellers = travellersOf(trip);

  if (!catalog.vehicles.length) return <EmptyState title="No vehicles available" description="Our team will arrange transport manually. Continue and mention any preferences in your booking request." />;

  return (
    <div className="space-y-4">
      {catalog.vehicles.map((v) => {
        const unsupported = stopIds.filter((id) => !v.supportedDestinations.includes(id)).map((id) => catalog.destinations.find((d) => d.id === id)?.name);
        const selected = vehicle.vehicle?.id === v.id;
        const count = Math.max(1, Math.ceil(travellers / v.passengers));
        const total = Math.round((v.pricePerDay * trip.days * count * mult) / 10) * 10;
        const note = unsupported.length ? `Not suitable for ${unsupported.join(", ")}.` : count > 1 ? `Your group of ${travellers} needs ${count} vehicles.` : undefined;
        return (
          <VehicleCard
            key={v.id}
            vehicle={v}
            selected={selected}
            recommended={recommended?.id === v.id}
            note={note}
            action={
              <div className="text-right">
                <p className="mb-1 text-[12px] tabular-nums text-muted">≈ {formatINR(total)} for {trip.days} days{count > 1 ? ` × ${count}` : ""}</p>
                <Button variant={selected ? "primary" : "outline"} disabled={unsupported.length > 0} onClick={() => actions.selectVehicle(v.id)} aria-pressed={selected} aria-label={`${selected ? "Selected:" : "Select"} ${v.name}`}>
                  {selected ? <><Check className="h-4 w-4" aria-hidden /> Selected</> : unsupported.length ? "Unavailable for route" : "Select vehicle"}
                </Button>
              </div>
            }
          />
        );
      })}
      {trip.vehicleId && (
        <button type="button" onClick={() => actions.selectVehicle(null)} className="text-sm text-forest underline underline-offset-4">Use the recommended vehicle instead</button>
      )}
    </div>
  );
}
