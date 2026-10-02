"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { tiers } from "@/data/rules";
import { site } from "@/data/site";
import { whatsappLink } from "@/lib/booking";
import { formatINR, MONTHS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TourPackage } from "@/types/package";
import type { Tier } from "@/types/trip";
import { useCustomizePackage } from "./use-customize";

/** Sticky panel on the package page. "Customize This Package" opens the planner with the package preloaded. */
export function PackagePanel({ pkg, tierPrices, bestMonths }: { pkg: TourPackage; tierPrices: Record<Tier, number>; bestMonths: number[] }) {
  const customize = useCustomizePackage();
  const [tier, setTier] = useState<Tier>(pkg.tier);
  const [month, setMonth] = useState<number | null>(null);

  return (
    <div className="shadow-float rounded-[3px] border border-line bg-paper p-6">
      <p className="eyebrow">Choose your level</p>
      <div role="radiogroup" aria-label="Package level" className="mt-3 divide-y divide-line border-y border-line">
        {tiers.map((t) => {
          const on = t.id === tier;
          return (
            <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => setTier(t.id)} className={cn("flex min-h-[66px] w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors", on ? "bg-forest text-ivory" : "hover:bg-parchment/50")}>
              <span>
                <span className="block font-display text-[1.6rem] leading-none">{on && <span aria-hidden className="mr-1.5 text-[1.1rem]">✓</span>}{t.name}</span>
                <span className={cn("mt-1 block text-[12.5px]", on ? "text-ivory/75" : "text-muted")}>{t.hotelLabel}</span>
              </span>
              <span className="text-right">
                <span className="t-price block text-[1.5rem]">{formatINR(tierPrices[t.id])}</span>
                <span className={cn("text-[11px]", on ? "text-ivory/65" : "text-muted")}>per person · demo</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <label htmlFor="pkg-month" className="t-label mb-1.5 block !text-[10.5px] text-forest">Travel month (optional)</label>
        <Select id="pkg-month" value={month ?? ""} onChange={(e) => setMonth(e.target.value === "" ? null : Number(e.target.value))}>
          <option value="">I&apos;m flexible</option>
          {MONTHS.map((m, i) => <option key={m} value={i}>{m}{bestMonths.includes(i) ? " · suits this journey" : ""}</option>)}
        </Select>
      </div>

      <Button size="lg" caps className="mt-6 w-full" onClick={() => customize(pkg, { tier, month })}>
        Customize this package <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
      </Button>
      <ButtonLink href={whatsappLink(`Hello ${site.short}! I'm interested in the ${pkg.name} (${pkg.days} days). Could you help me plan it?`)} variant="outline" size="lg" caps className="mt-3 w-full">
        Ask a travel expert
      </ButtonLink>
      <p className="mt-4 text-[12px] leading-relaxed text-muted">Prices are estimates per person for two adults and change with your choices. Nothing is charged online — our team confirms availability first.</p>
    </div>
  );
}
