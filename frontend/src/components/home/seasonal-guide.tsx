"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ButtonLink, TextLink } from "@/components/ui/button";
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
  const activities = season.activityIds.map((id) => catalog.activities.find((a) => a.id === id)).filter((a) => !!a);
  const dests = season.destinationIds.map((id) => catalog.destinations.find((d) => d.id === id)).filter((d) => !!d);

  return (
    <section aria-labelledby={heading ? "seasons-title" : undefined} aria-label={heading ? undefined : "Seasonal guide"} className={cn("section", className)}>
      <div className="container-x">
        {heading && (
          <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
            <div>
              <Eyebrow>Seasonal guide</Eyebrow>
              <h2 id="seasons-title" className="t-h2 mt-3 max-w-xl">When you go changes what you find</h2>
            </div>
            <p className="t-lede max-w-md lg:justify-self-end">General seasonal patterns, not live weather or availability. We confirm conditions before every departure.</p>
          </div>
        )}

        {/* the year at a glance */}
        <div className={heading ? "mt-10" : undefined}>
          <div className="grid grid-cols-12 gap-px" role="img" aria-label={`Months suited to ${season.name}: ${season.label}`}>
            {MONTHS_SHORT.map((m, i) => {
              const on = season.months.includes(i);
              return (
                <div key={m} className={cn("relative border-t-[3px] pt-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.1em] transition-colors sm:text-[11px]", on ? "border-brass text-forest" : "border-line text-muted")}>
                  {m}
                  {thisMonth === i && <span className="absolute -top-[10px] left-1/2 h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-burgundy" title="This month" aria-hidden />}
                </div>
              );
            })}
          </div>

          <div role="tablist" aria-label="Seasons" className="mt-6 flex flex-wrap gap-x-8 gap-y-1">
            {seasons.map((s) => (
              <button key={s.id} role="tab" id={`season-tab-${s.id}`} aria-selected={s.id === activeId} aria-controls="season-panel" onClick={() => setActiveId(s.id)} className={cn("min-h-11 border-b-2 pb-1 font-display text-[1.65rem] leading-none transition-colors", s.id === activeId ? "border-forest text-forest" : "border-transparent text-muted hover:text-forest")}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div id="season-panel" role="tabpanel" aria-labelledby={`season-tab-${season.id}`} className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div key={season.id} className="anim-fade relative aspect-[4/3] overflow-hidden rounded-[3px] bg-forest">
            <Photo k={season.image} sizes="(min-width:1024px) 52vw, 100vw" />
            <div className="img-scrim-bottom absolute inset-0" aria-hidden />
            <p className="absolute bottom-5 left-5 font-display text-[2rem] leading-none !text-ivory">{season.label}</p>
          </div>
          <div>
            <h3 className="t-h3">{season.headline}</h3>
            <p className="mt-4 max-w-[52ch] text-[15.5px] leading-relaxed text-muted">{season.description}</p>
            <p className="eyebrow mt-8">Suits</p>
            <ul className="mt-3 border-t border-line">
              {activities.map((a) => a && (
                <li key={a.id} className="border-b border-line">
                  <Link href={`/activities#${a.id}`} className="flex min-h-11 items-baseline justify-between gap-4 py-2.5 transition-colors hover:text-forest">
                    <span className="font-display text-[1.25rem] leading-tight">{a.name}</span>
                    <span className="text-[12px] text-muted">{a.duration}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mt-8">Best places</p>
            <p className="mt-2 text-[15px] leading-relaxed">
              {dests.map((d, i) => d && (
                <span key={d.id}>
                  <Link href={`/destinations/${d.slug}`} className="underline decoration-line-strong underline-offset-4 hover:text-forest hover:decoration-forest">{d.name}</Link>
                  {i < dests.length - 1 && <span className="text-muted"> · </span>}
                </span>
              ))}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <ButtonLink href={`/plan-your-trip?month=${season.months[0]}`} caps>Plan for {season.name.toLowerCase()}</ButtonLink>
              <TextLink href={`/packages?season=${season.id}`}>See {season.name.toLowerCase()} journeys</TextLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
