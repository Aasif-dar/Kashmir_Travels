import { AnimatedNumber } from "@/components/ui/motion";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PriceBreakdown as Price, PriceLine } from "@/types/trip";

const groups: { key: keyof Price["lines"]; label: string; total: keyof Price }[] = [
  { key: "hotels", label: "Hotels", total: "hotels" },
  { key: "transport", label: "Transport", total: "transport" },
  { key: "activities", label: "Activities", total: "activities" },
  { key: "services", label: "Package services", total: "services" },
  { key: "meals", label: "Meals", total: "meals" },
  { key: "taxes", label: "Taxes & fees", total: "taxes" },
];

/**
 * Itemised estimate. Uses native <details> for the per-line breakdown so it works without JS and is keyboard accessible.
 * Always labelled as an estimated / demo price.
 */
export function PriceBreakdown({ price, className, animated = true, showLines = true, dark }: { price: Price; className?: string; animated?: boolean; showLines?: boolean; dark?: boolean }) {
  const muted = dark ? "text-ivory/60" : "text-muted";
  if (price.total === 0) return <p className={cn("text-[14px]", muted, className)}>Choose destinations to see your estimated price.</p>;
  return (
    <div className={cn("text-[14px]", className)}>
      <dl className={cn("divide-y", dark ? "divide-white/15" : "divide-line")}>
        {groups.map((g) => {
          const lines: PriceLine[] = price.lines[g.key];
          const amount = price[g.total] as number;
          if (!lines.length && !amount) return null;
          return (
            <div key={g.key} className="py-2.5">
              <details className="group" open={false}>
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 [&::-webkit-details-marker]:hidden">
                  <dt className="flex items-center gap-1.5">
                    {showLines && lines.length > 0 && <span aria-hidden className={cn("text-[10px] transition-transform group-open:rotate-90", muted)}>▶</span>}
                    {g.label}
                  </dt>
                  <dd className="font-medium tabular-nums">{formatINR(amount)}</dd>
                </summary>
                {showLines && lines.length > 0 && (
                  <ul className={cn("mt-2 space-y-1.5 pl-4 text-[12.5px]", muted)}>
                    {lines.map((l) => (
                      <li key={l.label} className="flex items-start justify-between gap-3">
                        <span>
                          {l.label}
                          {l.detail && <span className="block text-[11.5px] opacity-80">{l.detail}</span>}
                        </span>
                        <span className="shrink-0 tabular-nums">{formatINR(l.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            </div>
          );
        })}
      </dl>
      <div className={cn("mt-2 border-t-2 pt-4", dark ? "border-brass-soft/60" : "border-forest/70")}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em]", dark ? "text-brass-soft" : "text-brass")}>Estimated total (demo)</p>
          </div>
          <p className="font-display text-[2.1rem] leading-none tabular-nums">
            {animated ? <AnimatedNumber value={price.total} format={formatINR} /> : formatINR(price.total)}
          </p>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <p className={cn("text-[12.5px]", muted)}>Estimated per person · {price.travellers} {price.travellers === 1 ? "traveller" : "travellers"}</p>
          <p className="font-display text-xl tabular-nums">{animated ? <AnimatedNumber value={price.perPerson} format={formatINR} /> : formatINR(price.perPerson)}</p>
        </div>
      </div>
      {price.seasonNote && <p className={cn("mt-3 text-[11.5px] leading-snug", muted)}>{price.seasonNote}</p>}
      <p className={cn("mt-3 text-[11.5px] leading-snug", muted)}>Demo estimate — not live availability or a confirmed quote. Final price is confirmed by our travel team.</p>
    </div>
  );
}
