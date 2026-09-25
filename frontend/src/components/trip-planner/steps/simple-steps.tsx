"use client";

import { ActivitySelector } from "../activity-selector";
import { HotelSelector } from "../hotel-selector";
import { TripStep } from "../trip-step";
import { VehicleSelector } from "../vehicle-selector";
import type { TripApi } from "../use-trip";
import { EmptyState, IssueList } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { styleById } from "@/data/rules";

function NoStops({ api, index, title }: { api: TripApi; index: number; title: string }) {
  return (
    <TripStep index={index} title={title}>
      <EmptyState title="Choose destinations first" description="We need at least one destination to show stays, vehicles and experiences." action={<Button onClick={() => api.setStep(1)}>Choose destinations</Button>} />
    </TripStep>
  );
}

export function HotelStep({ api }: { api: TripApi }) {
  if (!api.trip.stops.length) return <NoStops api={api} index={3} title="Choose your stays" />;
  const style = styleById(api.trip.style);
  return (
    <TripStep index={3} title="Choose your stays" lede={`One stay per destination. We've pre-selected the best match for your ${api.trip.tier} level${style ? ` and ${style.label.toLowerCase()} style` : ""} — change any of them and the price updates instantly.`}>
      <HotelSelector api={api} />
    </TripStep>
  );
}

export function VehicleStep({ api }: { api: TripApi }) {
  if (!api.trip.stops.length) return <NoStops api={api} index={4} title="Choose your vehicle" />;
  return (
    <TripStep index={4} title="Choose your vehicle" lede="A private vehicle with an experienced local driver stays with you for the whole trip. Rates are indicative daily prices, scaled for the road distance of your route.">
      <div className="space-y-6">
        <IssueList issues={api.issues.filter((i) => i.code.startsWith("VEHICLE") || i.code === "NO_VEHICLE")} />
        <VehicleSelector api={api} />
      </div>
    </TripStep>
  );
}

export function ActivityStep({ api }: { api: TripApi }) {
  if (!api.trip.stops.length) return <NoStops api={api} index={5} title="Add experiences" />;
  return (
    <TripStep index={5} title="Add experiences" lede="Ranked for your route, travel style and month. Add what appeals — each one is placed on a sensible day and priced instantly.">
      <div className="space-y-6">
        <IssueList issues={api.issues.filter((i) => i.code.startsWith("OFFSEASON"))} />
        <ActivitySelector api={api} />
      </div>
    </TripStep>
  );
}
