"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HotelCard } from "@/components/hotels/hotel-card";
import { Button } from "@/components/ui/button";
import { Chip, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/states";
import { useCatalog } from "@/store/catalog-context";
import { HOTEL_CATEGORY_LABEL, type HotelCategory } from "@/types/hotel";

export function HotelBrowser() {
  const catalog = useCatalog();
  const [dest, setDest] = useState("");
  const [cat, setCat] = useState<HotelCategory | "all">("all");
  const list = useMemo(() => catalog.hotels.filter((h) => (!dest || h.destinationId === dest) && (cat === "all" || h.category === cat)), [catalog, dest, cat]);
  const dn = (id: string) => catalog.destinations.find((d) => d.id === id);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-y border-line py-5">
        <div className="w-full sm:w-64"><label htmlFor="h-dest" className="sr-only">Destination</label><Select id="h-dest" value={dest} onChange={(e) => setDest(e.target.value)}><option value="">All destinations</option>{catalog.destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></div>
        <div role="group" aria-label="Hotel category" className="flex flex-wrap gap-2">
          <Chip selected={cat === "all"} onClick={() => setCat("all")}>All</Chip>
          {(Object.keys(HOTEL_CATEGORY_LABEL) as HotelCategory[]).map((c) => <Chip key={c} selected={cat === c} onClick={() => setCat(c)}>{HOTEL_CATEGORY_LABEL[c].stars} {HOTEL_CATEGORY_LABEL[c].name}</Chip>)}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">{list.length} {list.length === 1 ? "stay" : "stays"} · demo inventory</p>
      {list.length === 0 ? (
        <EmptyState className="mt-6" title="No stays match" description="Try another destination or category." action={<Button variant="outline" onClick={() => { setDest(""); setCat("all"); }}>Clear filters</Button>} />
      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {list.map((h) => (
            <HotelCard key={h.id} hotel={h} destinationName={dn(h.destinationId)?.name} action={<Link href={`/plan-your-trip?destination=${dn(h.destinationId)?.slug}`} className="text-[13px] font-medium text-forest underline underline-offset-4">Plan a stay here →</Link>} />
          ))}
        </div>
      )}
    </div>
  );
}
