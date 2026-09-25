"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { tiers } from "@/data/rules";
import { whatsappLink } from "@/lib/booking";
import { formatINR, MONTHS } from "@/lib/format";
import { packageToTrip, withTier } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { useTripStore } from "@/store/trip-store";
import type { TourPackage } from "@/types/package";
import type { Tier } from "@/types/trip";
import { site } from "@/data/site";

/** Sticky panel on the package page. "Customize This Package" opens the planner with the package preloaded. */
export function PackagePanel({ pkg, tierPrices, bestMonths }: { pkg: TourPackage; tierPrices: Record<Tier, number>; bestMonths: number[] }) {
  const router = useRouter();
  const replace = useTripStore((s) => s.replace);
  const [tier, setTier] = useState<Tier>(pkg.tier);
  const [month, setMonth] = useState<number | null>(null);

  const customise = () => {
    replace({ ...withTier(packageToTrip(pkg), tier), travelMonth: month }, 2);
    router.push("/plan-your-trip");
  };

  return (
    <div className="border border-line bg-paper p-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.5)]">
      <p className="eyebrow">Choose your level</p>
      <div role="radiogroup" aria-label="Package level" className="mt-3 divide-y divide-line border-y border-line">
        {tiers.map((t) => {
          const on = t.id === tier;
          return (
            <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => setTier(t.id)} className={cn("flex min-h-[64px] w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors", on ? "bg-forest text-ivory" : "hover:bg-parchment/50")}>
              <span>
                <span className="block font-display text-2xl leading-none">{t.name}</span>
                <span className={cn("mt-1 block text-[12.5px]", on ? "text-ivory/70" : "text-muted")}>{t.hotelLabel}</span>
              </span>
              <span className="text-right">
                <span className="block font-display text-2xl leading-none">{formatINR(tierPrices[t.id])}</span>
                <span className={cn("text-[11px]", on ? "text-ivory/60" : "text-muted")}>pp · demo</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <label htmlFor="pkg-month" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.14em] text-forest">Travel month (optional)</label>
        <Select id="pkg-month" value={month ?? ""} onChange={(e) => setMonth(e.target.value === "" ? null : Number(e.target.value))}>
          <option value="">I&apos;m flexible</option>
          {MONTHS.map((m, i) => <option key={m} value={i}>{m}{bestMonths.includes(i) ? " · suits this journey" : ""}</option>)}
        </Select>
      </div>

      <Button size="lg" className="mt-6 w-full" onClick={customise}>
        Customize This Package <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
      <ButtonLink
        href={whatsappLink(`Hello ${site.short}! I'm interested in the ${pkg.name} (${pkg.days} days). Could you help me plan it?`)}
        variant="outline"
        size="lg"
        className="mt-3 w-full"
      >
        <MessageCircle className="h-4 w-4" aria-hidden /> Ask a travel expert
      </ButtonLink>
      <p className="mt-4 text-[12px] leading-relaxed text-muted">Prices are demo estimates per person for two adults and change with your choices. Nothing is charged online — our team confirms availability first.</p>
    </div>
  );
}
