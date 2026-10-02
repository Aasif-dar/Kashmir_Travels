"use client";

import { useState } from "react";
import { TextLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Eyebrow } from "@/components/ui/section";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";

const short = (v: Vehicle) => v.name.split(" — ")[0];

/** A spec sheet you can read like a table; choosing a row swaps the photograph. */
export function VehicleShowcase({ vehicles }: { vehicles: Vehicle[] }) {
  const [active, setActive] = useState(vehicles[2]?.id ?? vehicles[0]?.id);
  const v = vehicles.find((x) => x.id === active) ?? vehicles[0];
  if (!v) return null;
  return (
    <section aria-labelledby="ride-title" className="section band-paper border-y border-line">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
        <div className="lg:order-2">
          <div key={v.id} className="anim-fade relative aspect-[3/2] overflow-hidden rounded-[3px] bg-parchment">
            <Photo k={v.image} sizes="(min-width:1024px) 52vw, 100vw" />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline">
            <p className="max-w-[52ch] text-[14.5px] leading-relaxed text-muted">{v.description}</p>
            <p className="text-[13px] text-ink">{v.features.slice(0, 3).join(" · ")}</p>
          </div>
        </div>

        <div className="lg:order-1">
          <Eyebrow>Choose your ride</Eyebrow>
          <h2 id="ride-title" className="t-h2 mt-3 max-w-md">The right vehicle for the road ahead</h2>
          <p className="t-lede mt-4 max-w-md">Every journey includes a private vehicle with an experienced local driver — fuel, tolls and parking included.</p>

          <div role="tablist" aria-orientation="vertical" aria-label="Vehicles" className="mt-8 border-t border-line-strong">
            {vehicles.map((x) => {
              const on = x.id === active;
              return (
                <button
                  key={x.id}
                  role="tab"
                  aria-selected={on}
                  aria-controls="vehicle-panel"
                  id={`tab-${x.id}`}
                  onClick={() => setActive(x.id)}
                  className="group grid min-h-[68px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-line py-3.5 text-left"
                >
                  <span>
                    <span className={cn("block font-display text-[1.6rem] leading-none transition-colors", on ? "text-charcoal" : "text-charcoal/75 group-hover:text-charcoal")}>{short(x)}</span>
                    <span className="mt-1.5 block text-[12.5px] text-muted">Up to {x.passengers} guests · {x.luggage}</span>
                  </span>
                  <span className="text-right">
                    <span className={cn("block text-[14px] font-semibold tabular-nums transition-colors", on ? "text-forest" : "text-ink/70")}>{formatINR(x.pricePerDay)}</span>
                    <span className="text-[11px] text-muted">per day</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p role="tabpanel" id="vehicle-panel" aria-labelledby={`tab-${v.id}`} className="mt-4 text-[12.5px] text-muted">Indicative daily rates. Vehicles are confirmed by our team — we never show live cab availability.</p>
          <div className="mt-6"><TextLink href="/vehicles">Compare all vehicles</TextLink></div>
        </div>
      </div>
    </section>
  );
}
