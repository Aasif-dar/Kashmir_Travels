"use client";

import { useMemo, useState } from "react";
import { useCustomizePackage } from "@/components/packages/use-customize";
import { Button, TextLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Eyebrow } from "@/components/ui/section";
import { formatINR } from "@/lib/format";
import { includesLine } from "@/lib/package-copy";
import { packageStartingPrice } from "@/lib/starting-price";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/store/catalog-context";
import type { TourPackage } from "@/types/package";

function Detail({ pkg, price, routeNames, onCustomize }: { pkg: TourPackage; price: number; routeNames: string[]; onCustomize: () => void }) {
  return (
    <div key={pkg.id} className="anim-fade">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[3px] bg-forest">
        <Photo k={pkg.image} sizes="(min-width:1024px) 55vw, 100vw" />
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <p className="t-label !text-[10.5px] text-brass">{pkg.days} days · {pkg.nights} nights · {pkg.category}</p>
          <p className="mt-2 font-display text-[1.5rem] leading-snug text-charcoal">{routeNames.join(" · ")}</p>
          <p className="mt-2 max-w-[52ch] text-[14.5px] leading-relaxed text-muted">{includesLine(pkg)}</p>
        </div>
        <div className="sm:text-right">
          <p className="t-label !text-[10px] text-muted">From (demo estimate)</p>
          <p className="t-price mt-1 text-[2rem] text-forest">{formatINR(price)}<span className="ml-1.5 font-sans text-[12px] text-muted">per person</span></p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-5">
        <TextLink href={`/packages/${pkg.slug}`}>View journey</TextLink>
        <Button variant="outline" size="sm" onClick={onCustomize} aria-label={`Customize ${pkg.name}`}>Customize</Button>
      </div>
    </div>
  );
}

/**
 * Popular journeys as a table of contents: pick a route on the left, see it as a photograph and a few plain
 * lines on the right. On phones each row opens in place.
 */
export function CuratedJourneys({ packages }: { packages: TourPackage[] }) {
  const catalog = useCatalog();
  const customize = useCustomizePackage();
  const list = useMemo(() => {
    const order = ["kashmir-essentials", "kashmir-winter-escape", "kashmir-grand-journey", "kashmir-katra", "ladakh-explorer", "kashmir-honeymoon"];
    return order.map((slug) => packages.find((p) => p.slug === slug)).filter((p): p is TourPackage => !!p);
  }, [packages]);
  const [activeId, setActiveId] = useState(list[0]?.id);
  const active = list.find((p) => p.id === activeId) ?? list[0];
  if (!active) return null;
  const nameOf = (id: string) => catalog.destinations.find((d) => d.id === id)?.name ?? id;
  const priceOf = (p: TourPackage) => packageStartingPrice(p, catalog);

  return (
    <section aria-labelledby="journeys-title" className="section band-parchment border-y border-line">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.3fr)] lg:gap-20">
        <div>
          <Eyebrow>Popular journeys</Eyebrow>
          <h2 id="journeys-title" className="t-h2 mt-3 max-w-md">Routes we know well</h2>
          <p className="t-lede mt-4 max-w-md">Start from a route that already works, then change anything — the places, the stays, the pace.</p>

          <ul className="mt-8 border-t border-line-strong">
            {list.map((p, i) => {
              const on = p.id === active.id;
              return (
                <li key={p.id} className="border-b border-line">
                  <button
                    type="button"
                    id={`journey-tab-${p.id}`}
                    aria-expanded={on}
                    onClick={() => setActiveId(p.id)}
                    onMouseEnter={() => window.matchMedia("(min-width:1024px)").matches && setActiveId(p.id)}
                    className="group flex min-h-[64px] w-full items-baseline gap-4 py-3.5 text-left"
                  >
                    <span className={cn("w-7 font-display text-[1.05rem] transition-colors", on ? "text-brass" : "text-muted")}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1">
                      <span className={cn("block font-display text-[1.65rem] leading-tight transition-colors", on ? "text-charcoal" : "text-charcoal/75 group-hover:text-charcoal")}>{p.name}</span>
                      <span className="mt-0.5 block text-[12.5px] text-muted">{p.days} days · {p.nights} nights</span>
                    </span>
                    <span className={cn("hidden h-px w-8 self-center transition-all sm:block", on ? "w-12 bg-brass" : "bg-line-strong")} aria-hidden />
                  </button>
                  {/* phones: open in place */}
                  {on && (
                    <div role="region" aria-labelledby={`journey-tab-${p.id}`} className="pb-6 lg:hidden">
                      <Detail pkg={p} price={priceOf(p)} routeNames={p.stops.map((s) => nameOf(s.destinationId))} onCustomize={() => customize(p)} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-6"><TextLink href="/packages">All journeys</TextLink></div>
        </div>

        <div role="region" aria-labelledby={`journey-tab-${active.id}`} className="hidden lg:block">
          <Detail pkg={active} price={priceOf(active)} routeNames={active.stops.map((s) => nameOf(s.destinationId))} onCustomize={() => customize(active)} />
        </div>
      </div>
    </section>
  );
}
