"use client";

import { Check, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ActivityCard } from "@/components/activities/activity-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { recommendActivities } from "@/lib/recommendations";
import { cn } from "@/lib/utils";
import type { TripApi } from "./use-trip";

export function ActivitySelector({ api }: { api: TripApi }) {
  const { trip, catalog, actions } = api;
  const [filter, setFilter] = useState<string>("all");
  const recs = useMemo(() => recommendActivities(trip, catalog), [trip, catalog]);
  const chosen = new Set(trip.activities.map((a) => a.activityId));
  const stopIds = trip.stops.map((s) => s.destinationId);
  const dn = (id: string) => catalog.destinations.find((d) => d.id === id)?.name ?? id;

  const visible = recs.filter((r) => filter === "all" || r.activity.destinationIds.includes(filter));
  const top = new Set(recs.filter((r) => r.score >= 8).slice(0, 4).map((r) => r.activity.id));
  const elsewhere = catalog.activities.filter((a) => !a.destinationIds.some((d) => stopIds.includes(d)));

  return (
    <div>
      <div role="tablist" aria-label="Filter by destination" className="mb-6 flex flex-wrap gap-2">
        {["all", ...stopIds].map((id) => (
          <button key={id} role="tab" aria-selected={filter === id} onClick={() => setFilter(id)} className={cn("min-h-11 border px-4 text-sm transition-colors", filter === id ? "border-forest bg-forest text-ivory" : "border-line bg-paper hover:border-forest/50")}>
            {id === "all" ? "All experiences" : dn(id)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No experiences for this route yet" description="Add a destination with activities — Gulmarg, Pahalgam and Srinagar have plenty." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map(({ activity: a, reasons }) => {
            const added = chosen.has(a.id);
            return (
              <ActivityCard
                key={a.id}
                activity={a}
                destinationNames={a.destinationIds.filter((d) => stopIds.includes(d)).map(dn).join(" · ")}
                reasons={top.has(a.id) && reasons.length === 0 ? ["Recommended for your trip"] : reasons}
                className={added ? "ring-2 ring-forest" : ""}
                action={
                  <Button variant={added ? "primary" : "outline"} size="sm" aria-pressed={added} onClick={() => (added ? actions.removeActivity(a.id) : actions.addActivity(a.id))}>
                    {added ? <><Check className="h-4 w-4" aria-hidden /> Added</> : <><Plus className="h-4 w-4" aria-hidden /> Add Activity</>}
                  </Button>
                }
              />
            );
          })}
        </div>
      )}

      {elsewhere.length > 0 && (
        <details className="mt-10 border-t border-line pt-6">
          <summary className="cursor-pointer text-[13px] font-semibold uppercase tracking-[0.14em] text-forest">Not on your route ({elsewhere.length})</summary>
          <ul className="mt-4 grid gap-x-8 gap-y-2 text-[14px] sm:grid-cols-2">
            {elsewhere.map((a) => (
              <li key={a.id} className="flex items-baseline justify-between gap-3 border-b border-line py-2">
                <span>{a.name}</span>
                <span className="text-[12.5px] text-muted">{a.destinationIds.slice(0, 2).map(dn).join(" · ")}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-muted">Add one of these destinations in step 2 to unlock its experiences.</p>
        </details>
      )}
    </div>
  );
}
