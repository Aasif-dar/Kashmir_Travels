"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Photo } from "@/components/ui/photo";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/states";
import { seasons, travelStyles } from "@/data/rules";
import { experienceGroups, experienceLabel, type ExperienceGroupId } from "@/lib/experience-groups";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/store/catalog-context";
import type { Activity } from "@/types/activity";

/** Tile sizes repeat in blocks of five: one large, four small — a gallery, not a grid of identical cards. */
const rhythm = ["lg:col-span-6 lg:row-span-2", "lg:col-span-3", "lg:col-span-3", "lg:col-span-3", "lg:col-span-3"];
const priceText = (a: Activity) => `${formatINR(a.price)} ${a.priceUnit === "person" ? "per person" : "per group of up to 5"}`;

export function ActivityBrowser() {
  const catalog = useCatalog();
  const [group, setGroup] = useState<ExperienceGroupId | "all">("all");
  const [dest, setDest] = useState("");
  const [season, setSeason] = useState("");
  const [style, setStyle] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  /* Deep links (#gulmarg-gondola) and ?destination= / ?category= open in place. */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("destination")) setDest(p.get("destination")!);
    if (p.get("season")) setSeason(p.get("season")!);
    if (p.get("style")) setStyle(p.get("style")!);
    const hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (hash && catalog.activities.some((a) => a.id === hash)) setOpenId(hash);
  }, [catalog]);

  const list = useMemo(() => {
    const s = seasons.find((x) => x.id === season);
    const g = experienceGroups.find((x) => x.id === group);
    return catalog.activities.filter((a) => (!g || g.test(a)) && (!dest || a.destinationIds.includes(dest)) && (!s || a.months.some((m) => s.months.includes(m))) && (!style || a.styles.includes(style)));
  }, [catalog, group, dest, season, style]);
  const dn = (id: string) => catalog.destinations.find((d) => d.id === id)?.name ?? id;
  const clear = () => { setGroup("all"); setDest(""); setSeason(""); setStyle(""); };
  const filtered = group !== "all" || dest || season || style;
  const open = catalog.activities.find((a) => a.id === openId) ?? null;
  const planHref = (a: Activity) => `/plan-your-trip?destination=${catalog.destinations.find((d) => d.id === a.destinationIds[0])?.slug ?? ""}`;

  return (
    <div>
      <div className="border-b border-line pb-5">
        <div role="group" aria-label="Experience group" className="no-scrollbar -mx-1 flex gap-x-7 overflow-x-auto px-1">
          {[{ id: "all" as const, label: "All" }, ...experienceGroups].map((g) => (
            <button key={g.id} type="button" aria-pressed={group === g.id} onClick={() => setGroup(g.id)} className={cn("min-h-11 shrink-0 border-b-2 pb-1 font-display text-[1.5rem] leading-none transition-colors", group === g.id ? "border-forest text-forest" : "border-transparent text-muted hover:text-forest")}>
              {g.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:max-w-3xl">
          <div><label htmlFor="f-dest" className="sr-only">Destination</label><Select id="f-dest" value={dest} onChange={(e) => setDest(e.target.value)} className="h-10 text-[14px]"><option value="">Any destination</option>{catalog.destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></div>
          <div><label htmlFor="f-season" className="sr-only">Season</label><Select id="f-season" value={season} onChange={(e) => setSeason(e.target.value)} className="h-10 text-[14px]"><option value="">Any season</option>{seasons.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.label}</option>)}</Select></div>
          <div><label htmlFor="f-style" className="sr-only">Travel style</label><Select id="f-style" value={style} onChange={(e) => setStyle(e.target.value)} className="h-10 text-[14px]"><option value="">Any travel style</option>{travelStyles.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</Select></div>
        </div>
      </div>

      <p className="mt-5 text-[13px] text-muted" aria-live="polite">
        <span className="font-semibold text-forest">{list.length}</span> {list.length === 1 ? "experience" : "experiences"}
        {filtered && <button type="button" onClick={clear} className="ml-3 text-forest underline underline-offset-4">Clear filters</button>}
      </p>

      {list.length === 0 ? (
        <EmptyState className="mt-6" title="No experiences match" description="Try a different season or destination." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} />
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:auto-rows-[290px] lg:grid-cols-12">
          {list.map((a, i) => {
            const slot = i % rhythm.length;
            const big = slot === 0 && list.length > 3;
            return (
              <button key={a.id} id={a.id} type="button" onClick={() => setOpenId(a.id)} aria-label={`${a.name} — details`} className={cn("group relative isolate block aspect-[4/5] scroll-mt-28 overflow-hidden rounded-[3px] bg-forest text-left sm:aspect-[4/3] lg:aspect-auto", rhythm[slot], slot === 0 && "sm:col-span-2")}>
                <Photo k={a.image} zoom sizes={big ? "(min-width:1024px) 60vw, (min-width:640px) 100vw, 140vw" : "(min-width:1024px) 42vw, (min-width:640px) 60vw, 140vw"} />
                <div className={cn("absolute inset-0", big ? "scrim-caption" : "scrim-tile")} aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="t-label !text-[10px] text-brass-soft">{experienceLabel(a)} · {a.destinationIds.slice(0, 2).map(dn).join(" / ")}</p>
                  <h3 className={cn("mt-1.5 font-display leading-[1.02] !text-ivory", big ? "text-[clamp(2rem,3vw,2.8rem)]" : "text-[1.55rem]")}>{a.name}</h3>
                  <p className="mt-1.5 text-[12.5px] text-ivory/80">{a.duration} · <span className="capitalize">{a.difficulty}</span> · from {formatINR(a.price)}</p>
                  {big && <p className="mt-2 max-w-[44ch] text-[13.5px] leading-snug text-ivory/85">{a.description}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
      <p className="mt-10 text-[12.5px] text-muted">Prices are indicative demo figures. Availability depends on season, weather and operators, and is confirmed by our team.</p>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)} title={open?.name ?? "Experience"} description={open ? `${experienceLabel(open)} · ${open.destinationIds.map(dn).join(" · ")}` : undefined} side="right" className="!w-[min(96vw,480px)]">
        {open && (
          <div>
            <div className="relative aspect-[16/10] bg-forest"><Photo k={open.image} sizes="480px" /></div>
            <div className="p-6">
              <p className="text-[15px] leading-relaxed text-ink/85">{open.description}</p>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5">
                {[["Duration", open.duration], ["Difficulty", open.difficulty], ["Season", open.season], ["Price (demo)", priceText(open)]].map(([k, v]) => (
                  <div key={k}><dt className="t-label !text-[10px] text-brass">{k}</dt><dd className="mt-1 text-[14px] first-letter:uppercase">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href={planHref(open)} caps>Plan with this</ButtonLink>
                <Button variant="outline" onClick={() => setOpenId(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
