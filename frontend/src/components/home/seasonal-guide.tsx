"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Eyebrow } from "@/components/ui/section";
import { seasonForMonth, seasons } from "@/data/rules";
import { MONTHS_SHORT } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/store/catalog-context";

/** Rule-based seasonal guidance — never live weather or availability. */
export function SeasonalGuide({ className, heading = true }: { className?: string; heading?: boolean }) {
  const catalog = useCatalog();
  const [activeId, setActiveId] = useState(seasons[0].id);
  const [thisMonth, setThisMonth] = useState<number | null>(null);

  useEffect(() => {
    const m = new Date().getMonth();
    setThisMonth(m);
    setActiveId(seasonForMonth(m)?.id ?? seasons[0].id);
  }, []);

  const season = seasons.find((s) => s.id === activeId) ?? seasons[0];
  const activities = season.activityIds.map((id) => catalog.activities.find((a) => a.id === id)).filter(Boolean);
  const dests = season.destinationIds.map((id) => catalog.destinations.find((d) => d.id === id)).filter(Boolean);
  const planMonth = season.months[0];

  return (
    <section aria-labelledby="seasons-title" className={cn("py-20 lg:py-28", className)}>
      <div className="container-x">
        {heading && (
          <div className="max-w-3xl">
            <Eyebrow>Seasonal travel guide</Eyebrow>
            <h2 id="seasons-title" className="display-lg mt-3">When you go <span className="italic text-forest">changes what you find</span></h2>
            <p className="lede mt-5">General seasonal patterns to help you choose — not live weather or availability. We confirm conditions before every departure.</p>
          </div>
        )}

        {/* month ribbon */}
        <div className="mt-10 grid grid-cols-12 gap-px" role="img" aria-label={`Months suited to ${season.name}: ${season.label}`}>
          {MONTHS_SHORT.map((m, i) => {
            const on = season.months.includes(i);
            return (
              <div key={m} className={cn("relative border-t-2 pt-2 text-center text-[11px] font-semibold uppercase tracking-wider", on ? "border-brass text-forest" : "border-line text-muted")}>
                {m}
                {thisMonth === i && <span className="absolute -top-[9px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-burgundy" title="This month" aria-hidden />}
              </div>
            );
          })}
        </div>

        <div role="tablist" aria-label="Seasons" className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-b border-line">
          {seasons.map((s) => (
            <button
              key={s.id}
              role="tab"
              id={`season-tab-${s.id}`}
              aria-selected={s.id === activeId}
              aria-controls="season-panel"
              onClick={() => setActiveId(s.id)}
              className={cn("relative -mb-px min-h-11 border-b-2 pb-2 font-display text-2xl transition-colors", s.id === activeId ? "border-forest text-forest" : "border-transparent text-muted hover:text-forest")}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div id="season-panel" role="tabpanel" aria-labelledby={`season-tab-${season.id}`} className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div key={season.id} className="anim-fade relative aspect-[4/3] overflow-hidden bg-forest">
            <Photo k={season.image} sizes="(min-width:1024px) 50vw, 100vw" />
            <div className="img-scrim-bottom absolute inset-0" aria-hidden />
            <p className="absolute bottom-5 left-5 font-display text-4xl !text-ivory">{season.label}</p>
          </div>
          <div>
            <h3 className="display-md">{season.headline}</h3>
            <p className="mt-4 text-[15.5px] leading-relaxed text-muted">{season.description}</p>
            <p className="eyebrow mt-8">Suits</p>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {activities.map((a) => a && (
                <li key={a.id}>
                  <Link href={`/activities#${a.id}`} className="flex items-baseline justify-between gap-4 py-3 hover:text-forest">
                    <span className="font-display text-xl">{a.name}</span>
                    <span className="text-xs text-muted">{a.duration}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mt-8">Best places</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {dests.map((d) => d && (
                <li key={d.id}>
                  <Link href={`/destinations/${d.slug}`} className="inline-flex min-h-9 items-center border border-line px-3 text-sm hover:border-forest hover:text-forest">{d.name}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/plan-your-trip?month=${planMonth}`}>Plan your {season.name.toLowerCase()} trip</ButtonLink>
              <ButtonLink href={`/packages?season=${season.id}`} variant="outline">See {season.name.toLowerCase()} packages</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
