"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { HScroller } from "@/components/ui/h-scroller";
import { Photo } from "@/components/ui/photo";
import { Badge } from "@/components/ui/section";
import { canAddDestination } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { Destination } from "@/types/destination";
import type { TripApi } from "./use-trip";

const regionLabel = { kashmir: "Kashmir", jammu: "Jammu & Katra", ladakh: "Ladakh" } as const;

function DestinationOption({ d, api, onBlocked }: { d: Destination; api: TripApi; onBlocked: (id: string, reason: string) => void }) {
  const { trip, catalog, actions } = api;
  const selected = trip.stops.some((s) => s.destinationId === d.id);
  const check = selected ? { ok: true } : canAddDestination(trip, d.id, catalog);
  const activityNames = d.activityIds.slice(0, 3).map((id) => catalog.activities.find((a) => a.id === id)?.name).filter(Boolean);
  const stop = trip.stops.find((s) => s.destinationId === d.id);

  return (
    <article className={cn("group flex h-full flex-col bg-paper", selected ? "ring-2 ring-forest" : "border border-line", !check.ok && "opacity-90")}>
      <div className="relative aspect-[16/10] overflow-hidden bg-forest">
        <Photo k={d.image} zoom sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 80vw" />
        <div className="img-scrim-bottom absolute inset-0" aria-hidden />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone="light">{regionLabel[d.region]}</Badge>
          {selected && <Badge tone="gold"><Check className="h-3 w-3" aria-hidden /> In your trip</Badge>}
        </div>
        <h3 className="absolute inset-x-0 bottom-0 p-4 font-display text-3xl leading-none !text-ivory">{d.name}</h3>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-brass">Recommended {d.recommendedNights} {d.recommendedNights === 1 ? "night" : "nights"} · {d.recommendedDays}</p>
        <p className="mt-2 text-[14px] leading-snug text-muted">{d.tagline}</p>
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink/80"><span className="font-semibold text-forest">Highlights:</span> {d.highlights.slice(0, 3).join(" · ")}</p>
        {activityNames.length > 0 && <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/80"><span className="font-semibold text-forest">Activities:</span> {activityNames.join(" · ")}</p>}
        <div className="mt-auto pt-4">
          {!check.ok && <p role="note" className="mb-2 text-[12.5px] leading-snug text-burgundy">{check.reason}</p>}
          {selected ? (
            <button type="button" onClick={() => actions.removeDestination(d.id)} className="flex min-h-11 w-full items-center justify-between border border-forest bg-forest/5 px-3 text-sm font-medium text-forest hover:bg-forest hover:text-ivory" aria-label={`Remove ${d.name} from your trip`}>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" aria-hidden /> Added · {stop?.nights}N</span>
              <span className="text-[12px] underline underline-offset-4">Remove</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!check.ok}
              onClick={() => { const reason = actions.addDestination(d.id); if (reason) onBlocked(d.id, reason); }}
              className="flex min-h-11 w-full items-center justify-center gap-2 border border-forest bg-transparent text-sm font-medium text-forest transition-colors hover:bg-forest hover:text-ivory disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
              aria-label={`Add ${d.name} to your trip`}
            >
              <Plus className="h-4 w-4" aria-hidden /> Add
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
      <div role="tablist" aria-label="Filter destinations by region" className="mb-6 flex flex-wrap gap-x-6 gap-y-1 border-b border-line">
        {(["all", ...REGIONS] as const).map((r) => (
          <button key={r} role="tab" aria-selected={filter === r} onClick={() => setFilter(r)} className={cn("-mb-px min-h-11 border-b-2 pb-1.5 font-display text-2xl transition-colors", filter === r ? "border-forest text-forest" : "border-transparent text-muted hover:text-forest")}>
            {r === "all" ? "All" : regionLabel[r]}
          </button>
        ))}
      </div>
      {blocked && (
        <p role="alert" className="mb-5 border border-burgundy/40 bg-burgundy/[0.05] px-4 py-3 text-sm text-burgundy">
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
