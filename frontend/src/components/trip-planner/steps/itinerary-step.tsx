"use client";

import { ArrowDown, ArrowUp, Minus, Plus, RefreshCcw, Route as RouteIcon, X } from "lucide-react";
import { ItineraryTimeline, type TimelineEditing } from "@/components/itinerary/itinerary-timeline";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, IssueList } from "@/components/ui/states";
import { formatHours } from "@/lib/format";
import { summariseRoute } from "@/lib/itinerary-engine";
import { plural } from "@/lib/utils";
import { SubHeading, TripStep } from "../trip-step";
import type { TripApi } from "../use-trip";

export function ItineraryStep({ api }: { api: TripApi }) {
  const { trip, catalog, actions, itinerary, stays, issues, setStep } = api;
  const route = summariseRoute(trip.stops, catalog);
  const nightsTotal = trip.stops.reduce((a, s) => a + s.nights, 0);
  const tripNights = Math.max(trip.days - 1, 1);

  if (!trip.stops.length) {
    return (
      <TripStep index={2} title="Your itinerary" lede="Pick destinations first and we'll draw the day-by-day plan.">
        <EmptyState title="No destinations yet" description="Choose at least one destination to see your itinerary." action={<Button onClick={() => setStep(1)}>Choose destinations</Button>} />
      </TripStep>
    );
  }

  const editing: TimelineEditing = {
    onRemoveActivity: actions.removeActivity,
    onAddActivity: actions.addActivity,
    onMoveActivity: actions.setActivityDay,
    onNote: actions.setDayNote,
    stayDaysFor: (id) => trip.stops.find((s) => s.destinationId === id)?.nights ?? 1,
  };

  return (
    <TripStep index={2} title="Shape your itinerary" lede="Here's a suggested day-by-day plan. Reorder places, shift nights between stops, swap a destination, add a note to any day or add optional experiences right in the timeline.">
      <div className="space-y-12">
        <IssueList issues={issues.filter((i) => !["VEHICLE_COUNT", "VEHICLE_UNSUPPORTED", "NO_VEHICLE"].includes(i.code))} />

        <div>
          <SubHeading hint={`${plural(nightsTotal, "night")} across ${plural(trip.stops.length, "stop")}${Number.isFinite(route.totalHours) ? ` · about ${formatHours(route.totalHours)} on the road in total` : ""}`}>Route & nights</SubHeading>
          <ol className="divide-y divide-line border-y border-line">
            {trip.stops.map((s, i) => {
              const d = catalog.destinations.find((x) => x.id === s.destinationId)!;
              const leg = i > 0 ? route.legs[i - 1] : null;
              const options = catalog.destinations.filter((x) => x.id === s.destinationId || !trip.stops.some((t) => t.destinationId === x.id));
              return (
                <li key={s.destinationId} className="grid gap-3 py-4 sm:grid-cols-[40px_1fr_auto] sm:items-center">
                  <span className="hidden font-display text-3xl text-brass sm:block">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <label htmlFor={`stop-${i}`} className="sr-only">Destination {i + 1}</label>
                    <select id={`stop-${i}`} value={s.destinationId} onChange={(e) => actions.replaceStop(i, e.target.value)} className="h-11 w-full max-w-xs border border-line bg-paper px-3 font-display text-2xl focus:border-forest focus:outline-none">
                      {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                    {leg && Number.isFinite(leg.hours) && <p className="mt-1 text-[12.5px] text-muted">{formatHours(leg.hours)} drive from {catalog.destinations.find((x) => x.id === leg.fromId)?.name}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex h-11 items-center border border-line bg-paper" role="group" aria-label={`Nights in ${d.name}`}>
                      <button type="button" aria-label={`Fewer nights in ${d.name}`} disabled={s.nights <= 1 || trip.stops.length < 2} onClick={() => actions.shiftNight(i, i === trip.stops.length - 1 ? i - 1 : i + 1)} className="grid h-11 w-10 place-items-center text-forest hover:bg-forest/5 disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                      <span className="min-w-[64px] text-center text-sm font-semibold tabular-nums">{s.nights} {s.nights === 1 ? "night" : "nights"}</span>
                      <button type="button" aria-label={`More nights in ${d.name}`} disabled={trip.stops.length < 2 || trip.stops.every((o, j) => j === i || o.nights <= 1)} onClick={() => { const donor = trip.stops.findIndex((o, j) => j !== i && o.nights > 1); if (donor >= 0) actions.shiftNight(donor, i); }} className="grid h-11 w-10 place-items-center text-forest hover:bg-forest/5 disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                    </div>
                    <button type="button" onClick={() => actions.moveStop(i, -1)} disabled={i === 0} aria-label={`Move ${d.name} earlier`} className="grid h-11 w-11 place-items-center border border-line bg-paper text-forest hover:bg-forest/5 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => actions.moveStop(i, 1)} disabled={i === trip.stops.length - 1} aria-label={`Move ${d.name} later`} className="grid h-11 w-11 place-items-center border border-line bg-paper text-forest hover:bg-forest/5 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" onClick={() => actions.removeDestination(d.id)} aria-label={`Remove ${d.name}`} className="grid h-11 w-11 place-items-center border border-line bg-paper text-burgundy hover:bg-burgundy hover:text-ivory"><X className="h-4 w-4" /></button>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={actions.optimise}><RouteIcon className="h-4 w-4" aria-hidden /> Optimise route</Button>
            <Button variant="outline" size="sm" onClick={actions.rebalance}><RefreshCcw className="h-4 w-4" aria-hidden /> Rebalance nights</Button>
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}><Plus className="h-4 w-4" aria-hidden /> Add destination</Button>
            <ButtonLink href="#day-by-day" variant="ghost" size="sm">Jump to timeline</ButtonLink>
          </div>
          {nightsTotal !== tripNights && <p className="mt-3 text-sm text-burgundy">Nights per stop add up to {nightsTotal}, but a {trip.days}-day trip has {tripNights}. Use “Rebalance nights”.</p>}
        </div>

        <div id="day-by-day" className="scroll-mt-24">
          <SubHeading hint="Add a personal note to any day, remove or move an experience, or add the optional ones.">Day by day</SubHeading>
          <ItineraryTimeline days={itinerary} stays={stays} editing={editing} className="mt-6" />
        </div>
      </div>
    </TripStep>
  );
}
