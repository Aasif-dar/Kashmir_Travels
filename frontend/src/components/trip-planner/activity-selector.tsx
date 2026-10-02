"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Photo } from "@/components/ui/photo";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { experienceGroups, experienceLabel, type ExperienceGroupId } from "@/lib/experience-groups";
import { formatINR } from "@/lib/format";
import { recommendActivities, type ActivityRecommendation } from "@/lib/recommendations";
import { cn } from "@/lib/utils";
import type { TripApi } from "./use-trip";

const price = (a: { price: number; priceUnit: "person" | "group" }) => `${formatINR(a.price)} ${a.priceUnit === "person" ? "per person" : "per group"}`;

/** Ranked for the route, the style and the month; the top few are shown large, the rest as a quiet list. */
export function ActivitySelector({ api }: { api: TripApi }) {
  const { trip, catalog, actions } = api;
  const { notify } = useToast();
  const [group, setGroup] = useState<ExperienceGroupId | "all">("all");
  const recs = useMemo(() => recommendActivities(trip, catalog), [trip, catalog]);
  const chosen = new Set(trip.activities.map((a) => a.activityId));
  const stopIds = trip.stops.map((s) => s.destinationId);
  const dn = (id: string) => catalog.destinations.find((d) => d.id === id)?.name ?? id;
  const where = (a: ActivityRecommendation["activity"]) => a.destinationIds.filter((d) => stopIds.includes(d)).map(dn).join(" · ");

  const visible = recs.filter((r) => group === "all" || experienceGroups.find((g) => g.id === group)?.test(r.activity));
  const featured = visible.slice(0, 3);
  const rest = visible.slice(3);
  const elsewhere = catalog.activities.filter((a) => !a.destinationIds.some((d) => stopIds.includes(d)));

  const toggle = (id: string, name: string) => {
    if (chosen.has(id)) {
      actions.removeActivity(id);
      notify(`${name} removed`);
    } else {
      actions.addActivity(id);
      notify(`${name} added to your journey`);
    }
  };

  const AddButton = ({ id, name, light, className }: { id: string; name: string; light?: boolean; className?: string }) => {
    const added = chosen.has(id);
    return (
      <button
        type="button"
        aria-pressed={added}
        aria-label={`${added ? "Remove" : "Add"} ${name}`}
        onClick={() => toggle(id, name)}
        className={cn(
          "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[3px] border px-4 text-[11.5px] font-semibold uppercase tracking-[0.16em] transition-colors",
          added ? (light ? "border-ivory bg-ivory text-forest" : "border-forest bg-forest text-ivory") : light ? "border-white/70 text-ivory hover:bg-white/15" : "border-forest text-forest hover:bg-forest hover:text-ivory",
          className
        )}
      >
        {added ? <><Check className="h-3.5 w-3.5" aria-hidden /> Added</> : "Add activity"}
      </button>
    );
  };

  return (
    <div>
      <div role="group" aria-label="Filter experiences" className="mb-7 flex flex-wrap gap-x-6 gap-y-1">
        {[{ id: "all" as const, label: "All" }, ...experienceGroups].map((g) => (
          <button key={g.id} type="button" aria-pressed={group === g.id} onClick={() => setGroup(g.id)} className={cn("min-h-11 border-b-2 pb-1 font-display text-[1.4rem] leading-none transition-colors", group === g.id ? "border-forest text-forest" : "border-transparent text-muted hover:text-forest")}>
            {g.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Nothing here for this route yet" description="Try another group, or add a destination with more to do — Gulmarg, Pahalgam and Srinagar have plenty." />
      ) : (
        <>
          {featured.length > 0 && (
            <div>
              <p className="t-label mb-3 !text-[10.5px] text-forest">{group === "all" ? "Recommended for your journey" : "Best matches"}</p>
              <div className="grid gap-3 md:grid-cols-3 md:grid-rows-2">
                {featured.map(({ activity: a, reasons }, i) => (
                  <article key={a.id} className={cn("group relative isolate overflow-hidden rounded-[3px] bg-forest", i === 0 ? "aspect-[4/3] md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[440px]" : "aspect-[4/3] md:aspect-auto md:min-h-[214px]", chosen.has(a.id) && "ring-2 ring-forest ring-offset-2 ring-offset-ivory")}>
                    <Photo k={a.image} zoom sizes={i === 0 ? "(min-width:1024px) 45vw, 100vw" : "(min-width:1024px) 22vw, (min-width:768px) 33vw, 100vw"} />
                    <div className="scrim-caption absolute inset-0" aria-hidden />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <p className="t-label !text-[10px] text-brass-soft">{experienceLabel(a)} · {where(a)}</p>
                      <h3 className={cn("mt-1.5 font-display leading-[1.02] !text-ivory", i === 0 ? "text-[2.2rem]" : "text-[1.6rem]")}>{a.name}</h3>
                      <p className="mt-1.5 text-[12.5px] text-ivory/80">{a.duration} · <span className="capitalize">{a.difficulty}</span> · {price(a)}</p>
                      {(reasons[0] || i === 0) && <p className="mt-1 text-[12.5px] text-ivory/90">{reasons[0] ?? "Recommended for your trip"}</p>}
                      <AddButton id={a.id} name={a.name} light className="mt-3" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div className="mt-12">
              <p className="t-label !text-[10.5px] text-forest">More experiences</p>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {rest.map(({ activity: a, reasons }) => (
                  <li key={a.id} className="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-4 py-4 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:gap-6">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-forest"><Photo k={a.image} sizes="120px" /></div>
                    <div className="min-w-0">
                      <p className="t-label !text-[10px] text-brass">{experienceLabel(a)} · {where(a)}</p>
                      <p className="mt-0.5 font-display text-[1.45rem] leading-tight">{a.name}</p>
                      <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-muted">{a.description}</p>
                      <p className="mt-1 text-[12.5px] text-ink/80">{a.duration} · <span className="capitalize">{a.difficulty}</span> · {price(a)}{reasons[0] ? <span className="text-pine"> · {reasons[0]}</span> : null}</p>
                    </div>
                    <AddButton id={a.id} name={a.name} className="col-span-2 sm:col-span-1" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {elsewhere.length > 0 && (
        <details className="mt-12 border-t border-line pt-5">
          <summary className="cursor-pointer text-[12px] font-semibold uppercase tracking-[0.14em] text-forest">Not on your route ({elsewhere.length})</summary>
          <ul className="mt-4 grid gap-x-10 text-[14px] sm:grid-cols-2">
            {elsewhere.map((a) => (
              <li key={a.id} className="flex items-baseline justify-between gap-3 border-b border-line py-2">
                <span>{a.name}</span>
                <span className="text-[12.5px] text-muted">{a.destinationIds.slice(0, 2).map(dn).join(" · ")}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-muted">Add one of these places to your journey to unlock its experiences.</p>
        </details>
      )}
    </div>
  );
}
