"use client";

import { Wand2 } from "lucide-react";
import { IssueList } from "@/components/ui/states";
import { styleById } from "@/data/rules";
import { suggestRoutes } from "@/lib/recommendations";
import { cn } from "@/lib/utils";
import { DestinationSelector } from "../destination-selector";
import { SubHeading, TripStep } from "../trip-step";
import type { TripApi } from "../use-trip";

export function DestinationStep({ api }: { api: TripApi }) {
  const { trip, catalog, actions, issues } = api;
  const routes = suggestRoutes(trip.days, trip.style, trip.travelMonth, catalog);
  const current = trip.stops.map((s) => s.destinationId).sort().join(",");
  const style = styleById(trip.style);

  return (
    <TripStep index={1} title="Where would you like to go?" lede={`Add the places you want. We'll check that the combination is realistic for ${trip.days} days — driving times, altitude and seasons included.`}>
      <div className="space-y-10">
        <div>
          <SubHeading hint={`Routes that work well for ${trip.days} days${style ? ` — ${style.label.toLowerCase()} styles first` : ""}. One tap fills the plan.`}>Suggested routes</SubHeading>
          <ul className="flex flex-wrap gap-2">
            {routes.map((r) => {
              const on = [...r.stops].sort().join(",") === current;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => actions.setDestinations(r.stops)}
                    aria-pressed={on}
                    className={cn("inline-flex min-h-11 items-center gap-2 border px-4 text-sm transition-colors", on ? "border-forest bg-forest text-ivory" : "border-line bg-paper hover:border-forest/50", !r.seasonOk && "opacity-60")}
                  >
                    <Wand2 className="h-3.5 w-3.5 text-brass" aria-hidden />
                    {r.label}
                    {r.styleMatch && <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brass">Fits your style</span>}
                    {!r.seasonOk && <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-burgundy">Off-season</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {issues.length > 0 && trip.stops.length > 0 && <IssueList issues={issues.filter((i) => ["TOO_MANY_STOPS", "COMBO", "UNSUPPORTED", "NEEDS_LEH", "ACCLIMATISE", "UNREACHABLE", "LEG_", "PACKED", "LONG_", "SEASON_", "RUSHED"].some((p) => i.code.startsWith(p)))} />}

        <DestinationSelector api={api} />
      </div>
    </TripStep>
  );
}
