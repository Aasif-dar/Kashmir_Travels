"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { tiers } from "@/data/rules";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Tier } from "@/types/trip";

const rows: { label: string; key: keyof (typeof tiers)[number] }[] = [
  { label: "Hotel category", key: "hotelLabel" },
  { label: "Vehicle", key: "vehicleLabel" },
  { label: "Meals", key: "meals" },
  { label: "Activities", key: "activities" },
  { label: "Transfers", key: "transfers" },
  { label: "Trip support", key: "support" },
  { label: "Customisation", key: "customisation" },
];

/** A proper comparison table (not three pricing cards). Collapses to a tier switcher on phones. */
export function PackageComparison({ prices, priceLabel, selected, onSelect, className }: { prices?: Partial<Record<Tier, number>>; priceLabel?: string; selected?: Tier; onSelect?: (t: Tier) => void; className?: string }) {
  const [mobileTier, setMobileTier] = useState<Tier>(selected ?? "comfort");
  const active = tiers.find((t) => t.id === mobileTier) ?? tiers[1];

  return (
    <div className={className}>
      {/* Mobile: one tier at a time */}
      <div className="md:hidden">
        <div role="tablist" aria-label="Package level" className="grid grid-cols-3 border border-line">
          {tiers.map((t) => (
            <button key={t.id} role="tab" aria-selected={t.id === mobileTier} onClick={() => { setMobileTier(t.id); onSelect?.(t.id); }} className={cn("min-h-12 text-sm font-semibold uppercase tracking-[0.12em] transition-colors", t.id === mobileTier ? "bg-forest text-ivory" : "bg-paper text-forest")}>
              {t.name}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="mt-5">
          <p className="font-display text-2xl italic text-forest">{active.tagline}</p>
          <p className="mt-1 text-sm text-muted">{active.audience}</p>
          <dl className="mt-4 divide-y divide-line border-y border-line">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[110px_1fr] gap-3 py-3 text-[14px]">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">{r.label}</dt>
                <dd>{String(active[r.key])}</dd>
              </div>
            ))}
            {prices?.[active.id] != null && (
              <div className="grid grid-cols-[110px_1fr] gap-3 py-3 text-[14px]">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">{priceLabel ?? "Example price"}</dt>
                <dd className="font-display text-2xl text-forest">{formatINR(prices[active.id]!)} <span className="font-sans text-xs text-muted">pp (demo)</span></dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden border border-line md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Comparison of Basic, Comfort and Premium package levels</caption>
          <thead>
            <tr className="align-bottom">
              <th scope="col" className="w-[19%] border-b border-line bg-parchment/50 p-5" />
              {tiers.map((t) => (
                <th key={t.id} scope="col" className={cn("border-b border-l border-line p-5 align-top", t.id === "comfort" ? "bg-forest text-ivory" : "bg-paper")}>
                  <span className={cn("eyebrow", t.id === "comfort" && "!text-brass-soft")}>{t.id === "comfort" ? "Most chosen" : t.id === "premium" ? "Signature" : "Essential"}</span>
                  <span className={cn("mt-1 block font-display text-4xl leading-none", t.id === "comfort" ? "!text-ivory" : "text-forest")}>{t.name}</span>
                  <span className={cn("mt-2 block max-w-[24ch] text-[13px] font-normal leading-snug", t.id === "comfort" ? "text-ivory/75" : "text-muted")}>{t.tagline}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-line last:border-b-0">
                <th scope="row" className="bg-parchment/50 p-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">{r.label}</th>
                {tiers.map((t) => (
                  <td key={t.id} className={cn("border-l border-line p-4 align-top text-[14.5px] leading-snug", t.id === "comfort" && "bg-forest/[0.04]")}>
                    <span className="inline-flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-pine" aria-hidden />{String(t[r.key])}</span>
                  </td>
                ))}
              </tr>
            ))}
            {prices && (
              <tr className="border-t-2 border-forest/30 bg-parchment/40">
                <th scope="row" className="p-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">{priceLabel ?? "Example price"}</th>
                {tiers.map((t) => (
                  <td key={t.id} className="border-l border-line p-4">
                    {prices[t.id] != null && <><span className="font-display text-3xl text-forest">{formatINR(prices[t.id]!)}</span><span className="ml-1 text-xs text-muted">pp · demo</span></>}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Levels change hotels, vehicle, meals and services — and therefore the price. Estimates are demo figures; availability is confirmed by our team.</p>
    </div>
  );
}
