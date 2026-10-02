"use client";

import { IssueList } from "@/components/ui/states";
import { styleById } from "@/data/rules";
import { suggestRoutes } from "@/lib/recommendations";
import { cn } from "@/lib/utils";
import { DestinationSelector } from "../destination-selector";
import { SubHeading, TripStep } from "../trip-step";
import type { TripApi } from "../use-trip";

const ROUTE_CODES = ["TOO_MANY_STOPS", "COMBO", "UNSUPPORTED", "NEEDS_LEH", "ACCLIMATISE", "UNREACHABLE", "LEG_", "PACKED", "LONG_", "SEASON_", "RUSHED"];

export function DestinationStep({ api }: { api: TripApi }) {
  const { trip, catalog, actions, issues } = api;
  const routes = suggestRoutes(trip.days, trip.style, trip.travelMonth, catalog);
  const current = trip.stops.map((s) => s.destinationId).sort().join(",");
  const style = styleById(trip.style);

  return (
    <TripStep index={1} title="Where would you like to go?" lede={`Choose the places you want to see and we'll shape the route. We check the combination is realistic for ${trip.days} days — driving times, altitude and seasons included.`}>
      <div className="space-y-10">
        <div>
          <SubHeading hint={`Routes that work well for ${trip.days} days${style ? ` — ${style.label.toLowerCase()} journeys first` : ""}. One tap fills the plan.`}>Suggested routes</SubHeading>
          <ul className="flex flex-wrap gap-2">
            {routes.map((r) => {
              const on = [...r.stops].sort().join(",") === current;
              return (
                <li key={r.id}>
                  <button type="button" onClick={() => actions.setDestinations(r.stops)} aria-pressed={on} className={cn("inline-flex min-h-11 items-center gap-2 rounded-[3px] border px-4 text-[14px] transition-colors", on ? "border-forest bg-forest text-ivory" : "border-line-strong bg-paper hover:border-forest", !r.seasonOk && !on && "opacity-60")}>
                    {on && <span aria-hidden>✓</span>}
                    {r.label}
                    {r.styleMatch && <span className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", on ? "text-brass-soft" : "text-brass")}>Suits your style</span>}
                    {!r.seasonOk && <span className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", on ? "text-brass-soft" : "text-burgundy")}>Off-season</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {issues.length > 0 && trip.stops.length > 0 && <IssueList issues={issues.filter((i) => ROUTE_CODES.some((p) => i.code.startsWith(p)))} />}

        <DestinationSelector api={api} />
      </div>
    </TripStep>
  );
}
