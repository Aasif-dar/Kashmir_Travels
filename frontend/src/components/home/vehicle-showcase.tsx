"use client";

import { Briefcase, Users } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Eyebrow } from "@/components/ui/section";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";

export function VehicleShowcase({ vehicles }: { vehicles: Vehicle[] }) {
  const [active, setActive] = useState(vehicles[2]?.id ?? vehicles[0]?.id);
  const v = vehicles.find((x) => x.id === active) ?? vehicles[0];
  if (!v) return null;
  return (
    <section aria-labelledby="ride-title" className="border-y border-line bg-paper py-20 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <Eyebrow>Choose your ride</Eyebrow>
          <h2 id="ride-title" className="display-lg mt-3">Mountain roads deserve <span className="italic text-forest">the right vehicle</span></h2>
          <div role="tablist" aria-label="Vehicles" className="mt-10 border-t border-line">
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
                  className={cn("flex min-h-16 w-full items-center justify-between gap-4 border-b border-line px-1 py-4 text-left transition-colors", on ? "text-forest" : "text-ink/70 hover:text-forest")}
                >
                  <span>
                    <span className={cn("block font-display text-3xl leading-none", on && "italic")}>{x.name.split(" — ")[0]}</span>
                    <span className="mt-1 block text-[13px] text-muted">{x.model}</span>
                  </span>
                  <span className="text-right text-[13px] text-muted">
                    <span className="block font-semibold text-forest">{formatINR(x.pricePerDay)}/day</span>
                    Up to {x.passengers}
                  </span>
                </button>
              );
            })}
          </div>
          <ButtonLink href="/vehicles" variant="outline" className="mt-8">Compare all vehicles</ButtonLink>
        </div>
        <div id="vehicle-panel" role="tabpanel" aria-labelledby={`tab-${v.id}`}>
          <div key={v.id} className="anim-fade relative aspect-[4/3] overflow-hidden bg-parchment">
            <Photo k={v.image} sizes="(min-width:1024px) 55vw, 100vw" />
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto]">
            <p className="max-w-lg text-[15px] leading-relaxed text-muted">{v.description}</p>
            <ul className="space-y-1.5 text-sm text-ink/80">
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-forest" aria-hidden /> Up to {v.passengers} guests</li>
              <li className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-forest" aria-hidden /> {v.luggage}</li>
            </ul>
          </div>
          <p className="mt-4 text-xs text-muted">Indicative daily rate — vehicles are confirmed by the travel team, never shown as live availability.</p>
        </div>
      </div>
    </section>
  );
}
