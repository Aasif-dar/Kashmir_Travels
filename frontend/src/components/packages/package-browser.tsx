"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PackageCard } from "@/components/packages/package-row";
import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/states";
import { seasons } from "@/data/rules";
import { packageStartingPrice } from "@/lib/starting-price";
import { cn } from "@/lib/utils";
import { useCatalog, usePackages } from "@/store/catalog-context";

interface Filters {
  region: string;
  duration: string;
  budget: string;
  category: string;
  season: string;
  activities: string[];
}
const empty: Filters = { region: "", duration: "", budget: "", category: "", season: "", activities: [] };

const budgets = [
  { id: "u20", label: "Under ₹20,000", test: (p: number) => p < 20000 },
  { id: "20-40", label: "₹20,000 – ₹40,000", test: (p: number) => p >= 20000 && p < 40000 },
  { id: "40-60", label: "₹40,000 – ₹60,000", test: (p: number) => p >= 40000 && p < 60000 },
  { id: "60p", label: "₹60,000+", test: (p: number) => p >= 60000 },
];
const durations = [
  { id: "short", label: "3 – 5 days", test: (d: number) => d <= 5 },
  { id: "mid", label: "6 – 7 days", test: (d: number) => d >= 6 && d <= 7 },
  { id: "long", label: "8+ days", test: (d: number) => d >= 8 },
];
const regions = [
  { id: "kashmir", label: "Kashmir" },
  { id: "jammu", label: "Jammu & Katra" },
  { id: "ladakh", label: "Ladakh" },
];

function Group({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <legend className="eyebrow mb-3 !text-forest">{legend}</legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}

function Radio({ name, value, current, onChange, label }: { name: string; value: string; current: string; onChange: (v: string) => void; label: string }) {
  const on = current === value;
  return (
    <label className={cn("flex min-h-10 cursor-pointer items-center gap-3 text-[14.5px]", on ? "font-medium text-forest" : "text-ink/80")}>
      <input type="radio" name={name} checked={on} onChange={() => onChange(value)} className="h-4 w-4 accent-[#1d3a2f]" />
      {label}
    </label>
  );
}

export function PackageBrowser() {
  const catalog = useCatalog();
  const packages = usePackages();
  const params = useSearchParams();
  const [f, setF] = useState<Filters>({ ...empty, season: params.get("season") ?? "", region: params.get("region") ?? "" });
  const [sort, setSort] = useState("recommended");
  const [open, setOpen] = useState(false);

  const items = useMemo(() => packages.map((pkg) => ({ pkg, price: packageStartingPrice(pkg, catalog) })), [packages, catalog]);
  const categories = useMemo(() => Array.from(new Set(packages.map((p) => p.category))), [packages]);
  const activityOptions = useMemo(() => {
    const ids = Array.from(new Set(packages.flatMap((p) => p.activityIds)));
    return ids.map((id) => catalog.activities.find((a) => a.id === id)).filter((a) => !!a).map((a) => ({ id: a!.id, name: a!.name }));
  }, [packages, catalog]);

  const results = useMemo(() => {
    const season = seasons.find((s) => s.id === f.season);
    const out = items.filter(({ pkg, price }) => {
      if (f.region && !pkg.regions.includes(f.region as never)) return false;
      if (f.duration && !durations.find((d) => d.id === f.duration)?.test(pkg.days)) return false;
      if (f.budget && !budgets.find((b) => b.id === f.budget)?.test(price)) return false;
      if (f.category && pkg.category !== f.category) return false;
      if (season && !pkg.bestMonths.some((m) => season.months.includes(m))) return false;
      if (f.activities.length && !f.activities.every((a) => pkg.activityIds.includes(a))) return false;
      return true;
    });
    if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    if (sort === "duration") out.sort((a, b) => a.pkg.days - b.pkg.days);
    return out;
  }, [items, f, sort]);

  const activeCount = [f.region, f.duration, f.budget, f.category, f.season].filter(Boolean).length + f.activities.length;
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }));

  const panel = (
    <div>
      <Group legend="Region">
        <Radio name="region" value="" current={f.region} onChange={(v) => set("region", v)} label="Anywhere" />
        {regions.map((r) => <Radio key={r.id} name="region" value={r.id} current={f.region} onChange={(v) => set("region", v)} label={r.label} />)}
      </Group>
      <Group legend="Duration">
        <Radio name="duration" value="" current={f.duration} onChange={(v) => set("duration", v)} label="Any length" />
        {durations.map((d) => <Radio key={d.id} name="duration" value={d.id} current={f.duration} onChange={(v) => set("duration", v)} label={d.label} />)}
      </Group>
      <Group legend="Budget per person (demo)">
        <Radio name="budget" value="" current={f.budget} onChange={(v) => set("budget", v)} label="Any budget" />
        {budgets.map((b) => <Radio key={b.id} name="budget" value={b.id} current={f.budget} onChange={(v) => set("budget", v)} label={b.label} />)}
      </Group>
      <Group legend="Package type">
        <Radio name="category" value="" current={f.category} onChange={(v) => set("category", v)} label="All types" />
        {categories.map((c) => <Radio key={c} name="category" value={c} current={f.category} onChange={(v) => set("category", v)} label={c} />)}
      </Group>
      <Group legend="Season">
        <Radio name="season" value="" current={f.season} onChange={(v) => set("season", v)} label="Any season" />
        {seasons.map((s) => <Radio key={s.id} name="season" value={s.id} current={f.season} onChange={(v) => set("season", v)} label={`${s.name} · ${s.label.split(" – ").map((x) => x.slice(0, 3)).join("–")}`} />)}
      </Group>
      <Group legend="Includes activities">
        {activityOptions.map((a) => (
          <label key={a.id} className="flex min-h-10 cursor-pointer items-center gap-3 text-[14.5px] text-ink/80">
            <input type="checkbox" checked={f.activities.includes(a.id)} onChange={(e) => set("activities", e.target.checked ? [...f.activities, a.id] : f.activities.filter((x) => x !== a.id))} className="h-4 w-4 accent-[#1d3a2f]" />
            {a.name}
          </label>
        ))}
      </Group>
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-3">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-3xl">Filter</h2>
            {activeCount > 0 && <button type="button" onClick={() => setF(empty)} className="text-sm text-forest underline underline-offset-4">Clear all</button>}
          </div>
          {panel}
        </div>
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="text-sm text-muted" aria-live="polite"><span className="font-semibold text-forest">{results.length}</span> {results.length === 1 ? "journey" : "journeys"}{activeCount ? " match your filters" : ""}</p>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters{activeCount ? ` (${activeCount})` : ""}
            </Button>
            <div className="w-44">
              <label htmlFor="sort" className="sr-only">Sort journeys</label>
              <Select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 text-sm">
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="duration">Shortest first</option>
              </Select>
            </div>
          </div>
        </div>

        {activeCount > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
            {[
              f.region && regions.find((r) => r.id === f.region)?.label,
              f.duration && durations.find((r) => r.id === f.duration)?.label,
              f.budget && budgets.find((r) => r.id === f.budget)?.label,
              f.category,
              f.season && seasons.find((s) => s.id === f.season)?.name,
              ...f.activities.map((a) => activityOptions.find((x) => x.id === a)?.name),
            ].filter(Boolean).map((label) => (
              <li key={String(label)} className="inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1 text-[12.5px]">{label}</li>
            ))}
          </ul>
        )}

        {results.length === 0 ? (
          <EmptyState className="mt-8" title="No journeys match those filters" description="Loosen a filter or two — or build a custom trip and we'll price it live." action={<><Button variant="outline" onClick={() => setF(empty)}>Clear filters</Button><ButtonLink href="/plan-your-trip">Build my own trip</ButtonLink></>} />
        ) : (
          <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2">
            {results.map(({ pkg }, i) => <PackageCard key={pkg.id} pkg={pkg} catalog={catalog} priority={i < 2} />)}
          </div>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen} title="Filter journeys" side="bottom">
        <div className="px-5 py-4">{panel}</div>
        <div className="sticky bottom-0 flex gap-3 border-t border-line bg-ivory p-4">
          <Button variant="outline" className="flex-1" onClick={() => setF(empty)}><X className="h-4 w-4" aria-hidden /> Clear</Button>
          <Button className="flex-[2]" onClick={() => setOpen(false)}>Show {results.length} {results.length === 1 ? "journey" : "journeys"}</Button>
        </div>
      </Sheet>
    </div>
  );
}
