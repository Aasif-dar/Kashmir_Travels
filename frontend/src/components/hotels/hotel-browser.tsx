"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { HScroller } from "@/components/ui/h-scroller";
import { Photo } from "@/components/ui/photo";
import { EmptyState } from "@/components/ui/states";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/store/catalog-context";
import { HOTEL_CATEGORY_LABEL, type Hotel, type HotelCategory } from "@/types/hotel";

const firstSentence = (s: string) => s.split(". ")[0].replace(/\.$/, "") + ".";
const regionTabs = [
  { id: "", label: "All" },
  { id: "kashmir", label: "Kashmir" },
  { id: "jammu", label: "Jammu & Katra" },
  { id: "ladakh", label: "Ladakh" },
];

function StayTile({ h }: { h: Hotel }) {
  return (
    <article className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-forest">
        <Photo k={h.image} zoom sizes="(min-width:1024px) 22vw, 80vw" />
      </div>
      <p className="t-label mt-3.5 !text-[10px] text-brass">{HOTEL_CATEGORY_LABEL[h.category].stars} {HOTEL_CATEGORY_LABEL[h.category].name}</p>
      <h4 className="mt-1 font-display text-[1.45rem] leading-tight">{h.name}</h4>
      <p className="mt-1.5 text-[13.5px] leading-snug text-muted">{firstSentence(h.description)}</p>
      <p className="mt-2 text-[12.5px] text-ink/80">{h.amenities.slice(0, 3).join(" · ")}</p>
      <p className="mt-2 text-[13.5px] text-ink">From <span className="font-semibold text-forest">{formatINR(h.pricePerNight)}</span> a night</p>
    </article>
  );
}

/** Stays grouped by destination: a quiet rail on the left, three stays on the right — like an index, not a marketplace. */
export function HotelBrowser() {
  const catalog = useCatalog();
  const [region, setRegion] = useState("");
  const [cat, setCat] = useState<HotelCategory | "all">("all");

  const groups = useMemo(
    () =>
      catalog.destinations
        .filter((d) => !region || d.region === region)
        .map((d) => ({ dest: d, stays: catalog.hotels.filter((h) => h.destinationId === d.id && (cat === "all" || h.category === cat)).sort((a, b) => a.pricePerNight - b.pricePerNight) }))
        .filter((g) => g.stays.length),
    [catalog, region, cat]
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-b border-line pb-5">
        <div role="tablist" aria-label="Region" className="no-scrollbar -mx-1 flex gap-x-7 overflow-x-auto px-1">
          {regionTabs.map((r) => (
            <button key={r.id || "all"} role="tab" aria-selected={region === r.id} onClick={() => setRegion(r.id)} className={cn("min-h-11 shrink-0 border-b-2 pb-1 font-display text-[1.5rem] leading-none transition-colors", region === r.id ? "border-forest text-forest" : "border-transparent text-muted hover:text-forest")}>
              {r.label}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Category" className="flex gap-x-5 text-[13px]">
          {(["all", "comfort", "premium", "luxury"] as const).map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={cn("min-h-11 border-b-2 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors", cat === c ? "border-forest text-forest" : "border-transparent text-muted hover:text-forest")}>
              {c === "all" ? "All stays" : `${HOTEL_CATEGORY_LABEL[c].stars} ${HOTEL_CATEGORY_LABEL[c].name}`}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState className="mt-8" title="No stays match" description="Try another region or category." action={<Button variant="outline" onClick={() => { setRegion(""); setCat("all"); }}>Clear filters</Button>} />
      ) : (
        <div className="divide-y divide-line">
          {groups.map(({ dest, stays }) => (
            <section key={dest.id} id={dest.id} aria-labelledby={`stays-${dest.id}`} className="grid scroll-mt-28 grid-cols-1 gap-6 py-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12 lg:py-12">
              <div>
                <p className="t-label !text-[10px] text-brass">{dest.region === "jammu" ? "Jammu & Katra" : dest.region[0].toUpperCase() + dest.region.slice(1)}</p>
                <h3 id={`stays-${dest.id}`} className="mt-1.5 font-display text-[2.2rem] leading-none">{dest.name}</h3>
                <p className="mt-2 max-w-[24ch] text-[13.5px] leading-snug text-muted">{dest.shortTagline ?? dest.tagline}</p>
                <Link href={`/plan-your-trip?destination=${dest.slug}`} className="mt-4 inline-flex min-h-9 items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-forest underline decoration-forest/30 underline-offset-8 hover:decoration-forest">Plan a stay here →</Link>
              </div>
              <div className="min-w-0">
                <div className="hidden gap-6 md:grid md:grid-cols-3">
                  {stays.map((h) => <StayTile key={h.id} h={h} />)}
                </div>
                <div className="md:hidden">
                  <HScroller label={`Stays in ${dest.name}`} controlsClassName="hidden">
                    {stays.map((h) => <div key={h.id} className="w-[78vw] shrink-0 snap-start"><StayTile h={h} /></div>)}
                  </HScroller>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
