"use client";

import { ArrowRight, Check, ChevronDown, Compass, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { originCities } from "@/data/site";
import { travelStyles } from "@/data/rules";
import { formatINR, MONTHS, roundEstimate } from "@/lib/format";
import { computePrice } from "@/lib/pricing";
import { pickStops, recommendTier } from "@/lib/recommendations";
import { autoPlan, defaultTrip } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/store/catalog-context";
import { STEP, useTripStore } from "@/store/trip-store";
import type { Region } from "@/types/destination";
import type { TravelStyle } from "@/types/trip";

const REGIONS: { id: Region; label: string; code: string }[] = [
  { id: "kashmir", label: "Kashmir", code: "SXR" },
  { id: "jammu", label: "Jammu & Katra", code: "IXJ" },
  { id: "ladakh", label: "Ladakh", code: "IXL" },
];
const DAYS = [3, 4, 5, 6, 7, 10];
const STYLES: TravelStyle[] = ["family", "couple", "adventure", "luxury", "friends"];

function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-[3px] border px-4 text-[14px] transition-all duration-150",
        selected
          ? "border-forest bg-forest text-ivory shadow-[0_2px_10px_-2px_rgba(27,58,44,0.45)]"
          : "border-line-strong bg-paper text-ink hover:border-forest hover:bg-parchment/40",
      )}
    >
      {children}
    </button>
  );
}

/**
 * "Plan your escape" — a staged planning module, styled as a travel dossier: a route-line progress
 * indicator up top, a perforated divider before the summary stub, one question open at a time.
 */
export function QuickPlanner({ className, tone = "hero" }: { className?: string; tone?: "hero" | "page" }) {
  const catalog = useCatalog();
  const router = useRouter();
  const replace = useTripStore((s) => s.replace);
  const uid = useId();

  const [open, setOpen] = useState<0 | 1 | 2 | -1>(0);
  const [region, setRegion] = useState<Region | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [style, setStyle] = useState<TravelStyle | null>(null);
  const [more, setMore] = useState(false);
  const [from, setFrom] = useState<string>("Delhi");
  const [adults, setAdults] = useState(2);
  const [month, setMonth] = useState<number | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const effRegion = region ?? "kashmir";
  const effDays = days ?? 6;

  const plan = useMemo(() => {
    const ids = picked.length ? picked : pickStops(effDays, effRegion, style, month, catalog);
    const base = { ...defaultTrip(), days: effDays, startingFrom: from, region: effRegion, travelMonth: month, adults, style, tier: style ? recommendTier(style) : ("comfort" as const) };
    const trip = autoPlan(base, catalog, ids);
    return { trip, price: computePrice(trip, catalog) };
  }, [picked, effDays, effRegion, style, month, from, adults, catalog]);

  const routeNames = plan.trip.stops.map((s) => catalog.destinations.find((d) => d.id === s.destinationId)?.name).filter(Boolean);
  const answeredCount = [region, days, style].filter((v) => v !== null).length;
  const answered = answeredCount > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    replace(plan.trip, STEP.itinerary);
    router.push("/plan-your-trip");
  };

  const regionDestinations = catalog.destinations.filter((d) => d.region === effRegion);
  const rows = [
    {
      n: "01",
      q: "Where are you going?",
      value: region ? REGIONS.find((r) => r.id === region)?.label : null,
      body: (
        <div role="radiogroup" aria-label="Region" className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <Choice key={r.id} selected={region === r.id} onClick={() => { setRegion(r.id); setPicked([]); setOpen(days === null ? 1 : style === null ? 2 : -1); }}>{r.label}</Choice>
          ))}
        </div>
      ),
    },
    {
      n: "02",
      q: "How many days?",
      value: days ? `${days}${days === 10 ? "+" : ""} days` : null,
      body: (
        <div role="radiogroup" aria-label="Number of days" className="flex flex-wrap gap-2">
          {DAYS.map((d) => (
            <Choice key={d} selected={days === d} onClick={() => { setDays(d); setOpen(style === null ? 2 : -1); }}>{d === 10 ? "10+" : d}</Choice>
          ))}
        </div>
      ),
    },
    {
      n: "03",
      q: "Travel style",
      value: style ? travelStyles.find((s) => s.id === style)?.label : null,
      optional: true,
      body: (
        <div role="radiogroup" aria-label="Travel style" className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <Choice key={s} selected={style === s} onClick={() => { setStyle(style === s ? null : s); setOpen(-1); }}>{travelStyles.find((x) => x.id === s)?.label}</Choice>
          ))}
        </div>
      ),
    },
  ];

  return (
    <form
      onSubmit={submit}
      aria-label="Plan your escape"
      className={cn(
        "relative overflow-hidden rounded-[4px] p-5 text-ink sm:p-6",
        tone === "hero"
          ? "border border-ivory/60 bg-ivory/95 shadow-[0_28px_70px_-24px_rgba(15,30,22,0.5)] backdrop-blur-md"
          : "border border-line bg-ivory",
        className,
      )}
    >
      {/* ghost mark, top-right — texture, not decoration for its own sake */}
      <Compass className="pointer-events-none absolute -right-4 -top-6 h-28 w-28 text-forest/[0.05]" strokeWidth={0.6} aria-hidden />

      <div className="relative flex items-center justify-between">
        <p className="eyebrow">Plan your escape</p>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted/70">
          {REGIONS.map((r) => r.code).join(" · ")}
        </p>
      </div>
      <p className="t-meta relative mt-0.5 text-muted">{answered ? "Adjust any answer" : "Takes about 30 seconds"}</p>

      {/* route-line progress: three waypoints, filled as questions are answered */}
      <div className="relative mt-4 flex items-center" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-1 items-center last:flex-none">
            <span className={cn("h-2 w-2 shrink-0 rounded-full border-2 transition-colors", i < answeredCount ? "border-forest bg-forest" : "border-line-strong bg-ivory")} />
            {i < 2 && <span className={cn("mx-1.5 h-px flex-1 transition-colors", i < answeredCount - 1 ? "bg-forest" : "bg-line-strong")} />}
          </div>
        ))}
      </div>

      <ol className="relative mt-4 divide-y divide-line border-y border-line">
        {rows.map((r, i) => {
          const isOpen = open === i;
          return (
            <li key={r.n} className={cn("transition-colors", isOpen && "bg-parchment/30")}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${uid}-q${i}`}
                onClick={() => setOpen(isOpen ? -1 : (i as 0 | 1 | 2))}
                className={cn(
                  "flex min-h-[52px] w-full items-center justify-between gap-3 py-2 pl-3 pr-1 text-left transition-colors",
                  isOpen ? "border-l-2 border-brass" : "border-l-2 border-transparent",
                )}
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-display text-[15px] text-brass">{r.n}</span>
                  <span className={cn("font-display text-[1.3rem] leading-none", isOpen ? "text-charcoal" : "text-charcoal/80")}>{r.q}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[13px]">
                  {r.value ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-forest">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                      {r.value}
                    </span>
                  ) : (
                    <span className="text-muted">{r.optional ? "Optional" : "Choose"}</span>
                  )}
                  <ChevronDown className={cn("h-4 w-4 text-forest transition-transform", isOpen && "rotate-180")} aria-hidden />
                </span>
              </button>
              {isOpen && (
                <div id={`${uid}-q${i}`} className="anim-fade pb-4 pl-[30px] pt-1">
                  {r.body}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* perforated stub divider */}
      <div className="relative my-4 h-px border-t border-dashed border-line-strong">
        <span className="absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest/95" aria-hidden />
        <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-forest/95" aria-hidden />
      </div>

      <div className="relative min-h-[76px]" aria-live="polite">
        {answered ? (
          <div className="anim-fade">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass" aria-hidden />
              <div>
                <p className="t-label !text-[10.5px] text-muted">Suggested route</p>
                <p className="mt-0.5 font-display text-[1.15rem] leading-snug text-charcoal">{routeNames.join(" → ")}</p>
              </div>
            </div>
            <p className="mt-2 text-[12.5px] text-muted">
              {plan.trip.days} days · from about{" "}
              <span className="rounded-full bg-forest/10 px-2 py-0.5 font-semibold text-forest">{formatINR(roundEstimate(plan.price.perPerson))}</span>{" "}
              per person <span className="text-muted/70">(demo estimate)</span>
            </p>
          </div>
        ) : (
          <p className="text-[13.5px] leading-relaxed text-muted">Choose where and for how long — we&apos;ll suggest a realistic route and show what it might cost.</p>
        )}
      </div>

      <div className="group/cta relative mt-4 overflow-hidden rounded-[3px]">
        <Button type="submit" variant="gold" size="lg" caps className="group relative z-10 w-full">
          Build my journey <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Button>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 z-20 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 ease-out group-hover/cta:left-full group-hover/cta:opacity-100"
        />
      </div>

      <button type="button" onClick={() => setMore((m) => !m)} aria-expanded={more} className="relative mt-3 inline-flex min-h-9 items-center gap-1.5 text-[12.5px] text-forest underline decoration-forest/30 underline-offset-4 hover:decoration-forest">
        {more ? "Fewer options" : "Starting city, month, travellers, places"}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", more && "rotate-180")} aria-hidden />
      </button>

      {more && (
        <div className="anim-fade relative mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="t-label !text-[10.5px] text-forest">Starting from</span>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 h-10 w-full rounded-[3px] border border-line bg-paper px-2.5 text-[14px] transition-colors focus:border-forest">
              {originCities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="t-label !text-[10.5px] text-forest">Travel month</span>
            <select value={month ?? ""} onChange={(e) => setMonth(e.target.value === "" ? null : Number(e.target.value))} className="mt-1 h-10 w-full rounded-[3px] border border-line bg-paper px-2.5 text-[14px] transition-colors focus:border-forest">
              <option value="">Flexible</option>
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="t-label !text-[10.5px] text-forest">Travellers</span>
            <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="mt-1 h-10 w-full rounded-[3px] border border-line bg-paper px-2.5 text-[14px] transition-colors focus:border-forest">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? "adult" : "adults"}</option>)}
            </select>
          </label>
          <div>
            <span className="t-label !text-[10.5px] text-forest">Places</span>
            <button type="button" onClick={() => setPickerOpen(true)} className="mt-1 flex h-10 w-full items-center justify-between rounded-[3px] border border-line bg-paper px-2.5 text-left text-[14px] transition-colors hover:border-forest">
              <span className="truncate">{picked.length ? `${picked.length} chosen` : "Suggest for me"}</span>
              <ChevronDown className="h-4 w-4 text-forest" aria-hidden />
            </button>
          </div>
        </div>
      )}

      <Sheet open={pickerOpen} onOpenChange={setPickerOpen} title="Choose places" description="Leave empty and we'll suggest a route that suits your days." side="center">
        <ul className="grid gap-px bg-line sm:grid-cols-2">
          {regionDestinations.map((d) => {
            const on = picked.includes(d.id);
            return (
              <li key={d.id} className="bg-ivory">
                <button type="button" aria-pressed={on} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== d.id) : [...p, d.id]))} className={cn("flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors", on ? "bg-forest text-ivory" : "hover:bg-parchment/60")}>
                  <span>
                    <span className="block font-display text-xl leading-none">{d.name}</span>
                    <span className={cn("text-xs", on ? "text-ivory/70" : "text-muted")}>{d.recommendedDays}</span>
                  </span>
                  {on && <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">✓ Added</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-line bg-ivory p-4">
          <button type="button" onClick={() => setPicked([])} className="text-sm text-forest underline underline-offset-4">Clear</button>
          <Button onClick={() => setPickerOpen(false)}>Done</Button>
        </div>
      </Sheet>
    </form>
  );
}