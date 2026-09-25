"use client";

import { Compass, MapPin, Package, Search, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { travelStyles } from "@/data/rules";
import { useCatalog, usePackages } from "@/store/catalog-context";

interface Result {
  key: string;
  group: "Destinations" | "Packages" | "Activities" | "Travel styles";
  title: string;
  subtitle: string;
  href: string;
}

const groupIcon = { Destinations: MapPin, Packages: Package, Activities: Sparkles, "Travel styles": Users } as const;

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const catalog = useCatalog();
  const packages = usePackages();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const index = useMemo<Result[]>(
    () => [
      ...catalog.destinations.map((d) => ({ key: `d-${d.id}`, group: "Destinations" as const, title: d.name, subtitle: `${d.region[0].toUpperCase()}${d.region.slice(1)} · ${d.tagline}`, href: `/destinations/${d.slug}` })),
      ...packages.map((p) => ({ key: `p-${p.id}`, group: "Packages" as const, title: p.name, subtitle: `${p.days} days / ${p.nights} nights · ${p.tagline}`, href: `/packages/${p.slug}` })),
      ...catalog.activities.map((a) => ({ key: `a-${a.id}`, group: "Activities" as const, title: a.name, subtitle: `${a.category} · ${a.season}`, href: `/activities#${a.id}` })),
      ...travelStyles.map((s) => ({ key: `s-${s.id}`, group: "Travel styles" as const, title: `${s.label} trips`, subtitle: s.blurb, href: `/plan-your-trip?style=${s.id}` })),
    ],
    [catalog, packages]
  );

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return index.filter((r) => ["d-srinagar", "d-gulmarg", "d-leh", "p-kashmir-essentials", "p-ladakh-explorer", "s-adventure"].includes(r.key));
    const words = term.split(/\s+/);
    return index
      .map((r) => {
        const hay = `${r.title} ${r.subtitle}`.toLowerCase();
        const score = words.every((w) => hay.includes(w)) ? (r.title.toLowerCase().startsWith(term) ? 2 : r.title.toLowerCase().includes(term) ? 1.5 : 1) : 0;
        return { r, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 14)
      .map((x) => x.r);
  }, [q, index]);

  const grouped = (["Destinations", "Packages", "Activities", "Travel styles"] as const).map((g) => ({ g, items: results.filter((r) => r.group === g) })).filter((x) => x.items.length);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Search" description="Find a destination, package, activity or travel style" side="center" className="!top-[12dvh] !translate-y-0 !max-h-[76dvh]" hideTitle>
      <div className="border-b border-line px-5 py-4">
        <label htmlFor="global-search" className="sr-only">
          Search destinations, packages, activities and travel styles
        </label>
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-brass" aria-hidden />
          <input
            id="global-search"
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Try “Gulmarg”, “skiing”, “honeymoon” or “Ladakh”"
            className="h-11 w-full bg-transparent font-display text-2xl text-charcoal placeholder:text-muted/60 focus:outline-none"
          />
        </div>
      </div>
      <div className="max-h-[58dvh] overflow-y-auto px-2 pb-4 pt-2">
        {grouped.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Compass className="mx-auto h-6 w-6 text-brass" aria-hidden />
            <p className="mt-3 font-display text-2xl">Nothing matches “{q}”</p>
            <p className="mt-1 text-sm text-muted">Try a place name like Pahalgam, or an activity such as shikara or rafting.</p>
          </div>
        ) : (
          grouped.map(({ g, items }) => {
            const Icon = groupIcon[g];
            return (
              <section key={g} aria-label={g} className="mt-3">
                <h3 className="eyebrow px-3 pb-1">{g}</h3>
                <ul>
                  {items.map((r) => (
                    <li key={r.key}>
                      <Link href={r.href} onClick={() => onOpenChange(false)} className="flex items-start gap-3 rounded-[3px] px-3 py-2.5 hover:bg-parchment/70 focus-visible:bg-parchment/70">
                        <Icon className="mt-1 h-4 w-4 shrink-0 text-forest" aria-hidden />
                        <span>
                          <span className="block text-[15px] font-medium text-charcoal">{r.title}</span>
                          <span className="line-clamp-1 block text-[13px] text-muted">{r.subtitle}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </div>
    </Sheet>
  );
}
