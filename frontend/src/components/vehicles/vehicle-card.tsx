import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { Photo } from "@/components/ui/photo";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";

const spec = (label: string, value: string) => (
  <div>
    <dt className="t-label !text-[10px] text-brass">{label}</dt>
    <dd className="mt-0.5 text-[13.5px] text-ink">{value}</dd>
  </div>
);

/**
 * One vehicle: photograph, what it seats and carries, and its price. Used on the /vehicles page and inside the
 * planner, where it also carries a selected state and an action.
 */
export function VehicleCard({ vehicle: v, selected, recommended, note, action, priceLabel, price, className, priority }: { vehicle: Vehicle; selected?: boolean; recommended?: boolean; note?: string; action?: ReactNode; priceLabel?: string; price?: number; className?: string; priority?: boolean }) {
  return (
    <article className={cn("@container flex flex-col overflow-hidden rounded-[3px] bg-paper", selected ? "ring-2 ring-forest" : "border border-line", className)}>
      <div className="relative aspect-[16/9] overflow-hidden bg-parchment">
        <Photo k={v.image} priority={priority} sizes="(min-width:768px) 40vw, 100vw" />
        {selected && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-[2px] bg-forest px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory"><Check className="h-3 w-3" aria-hidden /> Selected</span>}
        {!selected && recommended && <span className="absolute left-3 top-3 rounded-[2px] bg-charcoal/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory">Recommended</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[1.7rem] uppercase leading-none tracking-[0.03em]">{v.name.split(" — ")[0]}</h3>
        <p className="mt-1.5 text-[12.5px] text-muted">{v.model}</p>
        <p className="mb-4 mt-3 text-[14px] leading-relaxed text-muted">{v.description}</p>
        <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 @lg:grid-cols-4">
          {spec("Guests", `Up to ${v.passengers}`)}
          {spec("Luggage", v.luggage.replace(" medium bags", " bags"))}
          {spec("Comfort", "Air-conditioned")}
          {spec("Driver", "Included")}
        </dl>
        {note && <p role="note" className="mt-3 text-[12.5px] font-medium text-burgundy">{note}</p>}
        <div className="flex flex-wrap items-end justify-between gap-3 pt-5">
          <div>
            <p className="t-label !text-[10px] text-muted">{priceLabel ?? "Indicative rate"}</p>
            <p className="t-price mt-1 text-[1.6rem] text-forest">{formatINR(price ?? v.pricePerDay)}{price == null && <span className="ml-1.5 font-sans text-[12px] text-muted">per day</span>}</p>
          </div>
          {action}
        </div>
      </div>
    </article>
  );
}
