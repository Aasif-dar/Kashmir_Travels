"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ActivityCard } from "@/components/activities/activity-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/states";
import { seasons, travelStyles } from "@/data/rules";
import { useCatalog } from "@/store/catalog-context";
import type { ActivityCategory } from "@/types/activity";

const categories: { id: ActivityCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "snow", label: "Snow" },
  { id: "adventure", label: "Adventure" },
  { id: "water", label: "Water" },
  { id: "nature", label: "Nature" },
  { id: "culture", label: "Culture" },
  { id: "spiritual", label: "Spiritual" },
];

export function ActivityBrowser() {
  const catalog = useCatalog();
  const params = useSearchParams();
  const [cat, setCat] = useState<ActivityCategory | "all">((params.get("category") as ActivityCategory) || "all");
  const [dest, setDest] = useState(params.get("destination") ?? "");
  const [season, setSeason] = useState(params.get("season") ?? "");
  const [style, setStyle] = useState(params.get("style") ?? "");

  const list = useMemo(() => {
    const s = seasons.find((x) => x.id === season);
    return catalog.activities.filter((a) => (cat === "all" || a.category === cat) && (!dest || a.destinationIds.includes(dest)) && (!s || a.months.some((m) => s.months.includes(m))) && (!style || a.styles.includes(style)));
  }, [catalog, cat, dest, season, style]);
  const dn = (id: string) => catalog.destinations.find((d) => d.id === id)?.name ?? id;
  const clear = () => { setCat("all"); setDest(""); setSeason(""); setStyle(""); };
  const filtered = cat !== "all" || dest || season || style;

  return (
    <div>
      <div className="border-y border-line py-5">
        <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
          {categories.map((c) => <Chip key={c.id} selected={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</Chip>)}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div><label htmlFor="f-dest" className="sr-only">Destination</label><Select id="f-dest" value={dest} onChange={(e) => setDest(e.target.value)}><option value="">Any destination</option>{catalog.destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></div>
          <div><label htmlFor="f-season" className="sr-only">Season</label><Select id="f-season" value={season} onChange={(e) => setSeason(e.target.value)}><option value="">Any season</option>{seasons.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.label}</option>)}</Select></div>
          <div><label htmlFor="f-style" className="sr-only">Travel style</label><Select id="f-style" value={style} onChange={(e) => setStyle(e.target.value)}><option value="">Any travel style</option>{travelStyles.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</Select></div>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">{list.length} {list.length === 1 ? "experience" : "experiences"}</p>
      {list.length === 0 ? (
        <EmptyState className="mt-6" title="No experiences match" description="Try a different season or destination." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} />
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <ActivityCard
              key={a.id}
              id={a.id}
              activity={a}
              destinationNames={a.destinationIds.slice(0, 3).map(dn).join(" · ")}
              action={<Link href={`/plan-your-trip?destination=${catalog.destinations.find((d) => d.id === a.destinationIds[0])?.slug ?? ""}`} className="text-[13px] font-medium text-forest underline underline-offset-4">Plan with this →</Link>}
            />
          ))}
        </div>
      )}
      {filtered && list.length > 0 && <div className="mt-8"><Button variant="ghost" onClick={clear}>Clear filters</Button></div>}
      <p className="mt-10 text-xs text-muted">Prices are indicative demo figures. Availability depends on season, weather and operators, and is confirmed by our team.</p>
      <div className="mt-6"><ButtonLink href="/plan-your-trip" size="lg">Add experiences in the planner</ButtonLink></div>
    </div>
  );
}
