"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { HScroller } from "@/components/ui/h-scroller";
import { Photo } from "@/components/ui/photo";
import { useToast } from "@/components/ui/toast";
import { canAddDestination } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { Destination } from "@/types/destination";
import type { TripApi } from "./use-trip";

const regionLabel = { kashmir: "Kashmir", jammu: "Jammu & Katra", ladakh: "Ladakh" } as const;

/** Image-first choice: what it is, how long to stay, what to do — and an unmistakable added state. */
function DestinationOption({ d, api, onBlocked }: { d: Destination; api: TripApi; onBlocked: (id: string, reason: string) => void }) {
  const { trip, catalog, actions } = api;
  const { notify } = useToast();
  const selected = trip.stops.some((s) => s.destinationId === d.id);
  const check = selected ? { ok: true } : canAddDestination(trip, d.id, catalog);
  const experiences = d.activityIds.slice(0, 3).map((id) => catalog.activities.find((a) => a.id === id)?.name).filter(Boolean);
  const stop = trip.stops.find((s) => s.destinationId === d.id);

  const add = () => {
    const reason = actions.addDestination(d.id);
    if (reason) onBlocked(d.id, reason);
    else notify(`${d.name} added to your journey`);
  };
  const remove = () => {
    actions.removeDestination(d.id);
    notify(`${d.name} removed from your journey`);
  };

  return (
    <article className={cn("flex h-full flex-col overflow-hidden rounded-[3px] bg-paper transition-shadow", selected ? "ring-2 ring-forest" : "border border-line")}>
      <div className="relative aspect-[4/3] overflow-hidden bg-forest">
        <Photo k={d.image} sizes="(min-width:1280px) 24vw, (min-width:768px) 32vw, 80vw" />
        <div className="img-scrim-bottom absolute inset-0" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="t-label !text-[10px] text-ivory/80">{regionLabel[d.region]}</p>
          <h3 className="mt-1 font-display text-[1.9rem] leading-none !text-ivory">{d.name}</h3>
        </div>
        {selected && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-[2px] bg-forest px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory"><Check className="h-3 w-3" aria-hidden /> In your journey</span>}
      </div>
      <div className="flex flex-1 flex-col p-4 pt-3.5">
        <p className="t-label !text-[10.5px] text-brass">Stay {d.recommendedDays}</p>
        <p className="mt-2 text-[14px] leading-snug text-muted">{d.shortTagline ?? d.tagline}</p>
        {experiences.length > 0 && <p className="mt-2.5 text-[12.5px] leading-snug text-ink/80">{experiences.join(" · ")}</p>}
        <div className="mt-auto pt-4">
          {!check.ok && <p role="note" className="mb-2 text-[12.5px] leading-snug text-burgundy">{check.reason}</p>}
          {selected ? (
            <div className="flex items-center gap-3">
              <span className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[3px] bg-forest text-[11.5px] font-semibold uppercase tracking-[0.16em] text-ivory">
                <Check className="h-4 w-4" aria-hidden /> Added · {stop?.nights}N
              </span>
              <button type="button" onClick={remove} className="min-h-11 px-1 text-[12.5px] text-burgundy underline underline-offset-4" aria-label={`Remove ${d.name} from your journey`}>Remove</button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!check.ok}
              onClick={add}
              aria-label={`Add ${d.name} to your journey`}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[3px] border border-forest text-[11.5px] font-semibold uppercase tracking-[0.16em] text-forest transition-colors hover:bg-forest hover:text-ivory disabled:cursor-not-allowed disabled:border-line-strong disabled:text-muted disabled:hover:bg-transparent"
            >
              Add to journey
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

const REGIONS = ["kashmir", "jammu", "ladakh"] as const;

export function DestinationSelector({ api }: { api: TripApi }) {
  const [filter, setFilter] = useState<"all" | (typeof REGIONS)[number]>("all");
  const [blocked, setBlocked] = useState<{ id: string; reason: string } | null>(null);
  const list = api.catalog.destinations.filter((d) => filter === "all" || d.region === filter);

  return (
    <div>
      <div role="tablist" aria-label="Filter destinations by region" className="mb-6 flex flex-wrap gap-x-7 gap-y-1">
        {(["all", ...REGIONS] as const).map((r) => (
          <button key={r} role="tab" aria-selected={filter === r} onClick={() => setFilter(r)} className={cn("min-h-11 border-b-2 pb-1 font-display text-[1.5rem] leading-none transition-colors", filter === r ? "border-forest text-forest" : "border-transparent text-muted hover:text-forest")}>
            {r === "all" ? "All" : regionLabel[r]}
          </button>
        ))}
      </div>
      {blocked && (
        <p role="alert" className="mb-5 rounded-[3px] border border-burgundy/40 bg-burgundy/[0.05] px-4 py-3 text-sm text-burgundy">
          {blocked.reason}
        </p>
      )}

      {/* Phones: horizontal scroller. Larger screens: grid. */}
      <div className="md:hidden">
        <HScroller label="destinations" controlsClassName="hidden">
          {list.map((d) => (
            <div key={d.id} className="w-[78vw] shrink-0 snap-start"><DestinationOption d={d} api={api} onBlocked={(id, reason) => setBlocked({ id, reason })} /></div>
          ))}
        </HScroller>
      </div>
      <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => <DestinationOption key={d.id} d={d} api={api} onBlocked={(id, reason) => setBlocked({ id, reason })} />)}
      </div>
    </div>
  );
}
