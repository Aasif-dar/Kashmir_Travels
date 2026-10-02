"use client";

import { ArrowDown, ArrowUp, Minus, Plus, X } from "lucide-react";
import { ItineraryTimeline, type TimelineEditing } from "@/components/itinerary/itinerary-timeline";
import { Button } from "@/components/ui/button";
import { EmptyState, IssueList } from "@/components/ui/states";
import { tierById } from "@/data/rules";
import { formatHours } from "@/lib/format";
import { summariseRoute } from "@/lib/itinerary-engine";
import { plural } from "@/lib/utils";
import { STEP } from "@/store/trip-store";
import { SubHeading, TripStep } from "../trip-step";
import type { TripApi } from "../use-trip";

export function ItineraryStep({ api }: { api: TripApi }) {
  const { trip, catalog, actions, itinerary, stays, issues, setStep } = api;
  const route = summariseRoute(trip.stops, catalog);
  const nightsTotal = trip.stops.reduce((a, s) => a + s.nights, 0);
  const tripNights = Math.max(trip.days - 1, 1);

  if (!trip.stops.length) {
    return (
      <TripStep index={3} title="Your itinerary" lede="Choose places first and we'll draw the day-by-day route.">
        <EmptyState title="No destinations yet" description="Add at least one destination to see your itinerary." action={<Button onClick={() => setStep(STEP.destinations)}>Choose destinations</Button>} />
      </TripStep>
    );
  }

  const stopIds = trip.stops.map((s) => s.destinationId);
  const editing: TimelineEditing = {
    onRemoveActivity: actions.removeActivity,
    onAddActivity: actions.addActivity,
    onMoveActivity: actions.setActivityDay,
    onNote: actions.setDayNote,
    stayDaysFor: (id) => trip.stops.find((s) => s.destinationId === id)?.nights ?? 1,
    stopIndex: (id) => stopIds.indexOf(id),
    stopCount: trip.stops.length,
    onMoveStop: actions.moveStop,
    onRemoveStop: actions.removeDestination,
    onReplaceStop: actions.replaceStop,
    destinationChoices: (id) => catalog.destinations.filter((d) => d.id === id || !stopIds.includes(d.id)).map((d) => ({ id: d.id, name: d.name })),
    activityChoices: (id) => catalog.activities.filter((a) => a.destinationIds.includes(id) && !trip.activities.some((t) => t.activityId === a.id)),
  };

  return (
    <TripStep index={3} title="Shape your itinerary" lede="Here's a suggested day-by-day route. Shift nights between stops, edit any day, add an experience where it fits — the estimate follows every change.">
      <div className="space-y-14">
        <IssueList issues={issues.filter((i) => !["VEHICLE_COUNT", "VEHICLE_UNSUPPORTED", "NO_VEHICLE"].includes(i.code))} />

        <div>
          <SubHeading hint={`${plural(nightsTotal, "night")} across ${plural(trip.stops.length, "stop")}${Number.isFinite(route.totalHours) ? ` · about ${formatHours(route.totalHours)} on the road in total` : ""}`}>Route and nights</SubHeading>
          <ol className="divide-y divide-line border-y border-line">
            {trip.stops.map((s, i) => {
              const d = catalog.destinations.find((x) => x.id === s.destinationId)!;
              const leg = i > 0 ? route.legs[i - 1] : null;
              const canFewer = s.nights > 1 && trip.stops.length > 1;
              const donor = trip.stops.findIndex((o, j) => j !== i && o.nights > 1);
              return (
                <li key={s.destinationId} className="grid gap-3 py-4 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center">
                  <span className="hidden font-display text-[1.7rem] leading-none text-brass sm:block">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <p className="font-display text-[1.6rem] leading-none">{d.name}</p>
                    <p className="mt-1.5 text-[12.5px] text-muted">
                      {leg && Number.isFinite(leg.hours) ? `${formatHours(leg.hours)} from ${catalog.destinations.find((x) => x.id === leg.fromId)?.name}` : "Arrival"} · recommended {d.recommendedNights} {d.recommendedNights === 1 ? "night" : "nights"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex h-11 items-center rounded-[3px] border border-line-strong bg-paper" role="group" aria-label={`Nights in ${d.name}`}>
                      <button type="button" aria-label={`Fewer nights in ${d.name}`} disabled={!canFewer} onClick={() => actions.shiftNight(i, i === trip.stops.length - 1 ? i - 1 : i + 1)} className="grid h-11 w-10 place-items-center text-forest hover:bg-forest/5 disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                      <span className="min-w-[68px] text-center text-sm font-semibold tabular-nums">{s.nights} {s.nights === 1 ? "night" : "nights"}</span>
                      <button type="button" aria-label={`More nights in ${d.name}`} disabled={trip.stops.length < 2 || donor < 0} onClick={() => actions.shiftNight(donor, i)} className="grid h-11 w-10 place-items-center text-forest hover:bg-forest/5 disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                    </div>
                    <button type="button" onClick={() => actions.moveStop(i, -1)} disabled={i === 0} aria-label={`Move ${d.name} earlier`} className="grid h-11 w-11 place-items-center rounded-[3px] border border-line-strong bg-paper text-forest hover:bg-forest/5 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => actions.moveStop(i, 1)} disabled={i === trip.stops.length - 1} aria-label={`Move ${d.name} later`} className="grid h-11 w-11 place-items-center rounded-[3px] border border-line-strong bg-paper text-forest hover:bg-forest/5 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" onClick={() => actions.removeDestination(d.id)} aria-label={`Remove ${d.name}`} className="grid h-11 w-11 place-items-center rounded-[3px] border border-line-strong bg-paper text-burgundy hover:bg-burgundy hover:text-ivory"><X className="h-4 w-4" /></button>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Button variant="outline" size="sm" onClick={actions.optimise}>Optimise route</Button>
            <Button variant="outline" size="sm" onClick={actions.rebalance}>Rebalance nights</Button>
            <button type="button" onClick={() => setStep(STEP.destinations)} className="min-h-9 text-[13px] text-forest underline underline-offset-4">Add a destination</button>
          </div>
          {nightsTotal !== tripNights && <p className="mt-3 text-sm text-burgundy">Nights per stop add up to {nightsTotal}, but a {trip.days}-day trip has {tripNights}. Use “Rebalance nights”.</p>}
        </div>

        <div id="day-by-day" className="scroll-mt-32">
          <SubHeading hint="Edit a day, add an experience, move an activity to another day or remove it.">Day by day</SubHeading>
          <ItineraryTimeline days={itinerary} stays={stays.map((s) => ({ destinationId: s.destinationId, hotel: s.hotel ? { name: s.hotel.name, category: s.hotel.category } : null }))} editing={editing} meals={tierById(trip.tier).mealPlan} className="mt-8" />
        </div>
      </div>
    </TripStep>
  );
}
