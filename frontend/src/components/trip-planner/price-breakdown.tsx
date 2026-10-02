import { AnimatedNumber } from "@/components/ui/motion";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PriceBreakdown as Price, PriceLine } from "@/types/trip";

interface Row {
  label: string;
  amount: number;
  lines: PriceLine[];
}

/** The five lines customers see. "Other" folds package services, permits and taxes together. */
function rowsOf(p: Price): Row[] {
  return [
    { label: "Accommodation", amount: p.hotels, lines: p.lines.hotels },
    { label: "Transport", amount: p.transport, lines: p.lines.transport },
    { label: "Activities", amount: p.activities, lines: p.lines.activities },
    { label: "Meals", amount: p.meals, lines: p.lines.meals },
    { label: "Other", amount: p.services + p.taxes, lines: [...p.lines.services, ...p.lines.taxes] },
  ];
}

/**
 * Estimated trip value with a quiet five-line breakdown. Always framed as an estimate; never a headline price.
 * `showLines` lets each row open to its itemised detail (native <details>, works without JS).
 */
export function PriceBreakdown({ price, className, animated = true, showLines = true, dark }: { price: Price; className?: string; animated?: boolean; showLines?: boolean; dark?: boolean }) {
  const muted = dark ? "text-ivory/60" : "text-muted";
  if (price.total === 0) return <p className={cn("text-[14px]", muted, className)}>Choose destinations to see an estimated trip value.</p>;
  const rows = rowsOf(price);
  return (
    <div className={cn("text-[14px]", className)}>
      <p className={cn("t-label !text-[10.5px]", dark ? "text-brass-soft" : "text-brass")}>Estimated trip value</p>
      <p className="t-price mt-2 text-[2rem]">{animated ? <AnimatedNumber value={price.total} format={formatINR} /> : formatINR(price.total)}</p>
      <p className={cn("mt-1.5 text-[12.5px]", muted)}>
        {animated ? <AnimatedNumber value={price.perPerson} format={formatINR} /> : formatINR(price.perPerson)} per person · {price.travellers} {price.travellers === 1 ? "traveller" : "travellers"}
      </p>

      <ul className={cn("mt-5 divide-y border-y", dark ? "divide-white/15 border-white/15" : "divide-line border-line")}>
        {rows.map((r) => {
          const expandable = showLines && r.lines.length > 0;
          const head = (
            <>
              <span className="flex items-center gap-2">
                {expandable && <span aria-hidden className={cn("text-[9px] transition-transform group-open:rotate-90", muted)}>▶</span>}
                <span>{r.label}</span>
              </span>
              <span className={cn("tabular-nums", r.amount > 0 ? "font-medium" : muted)}>
                {r.amount > 0 ? formatINR(r.amount) : <><span aria-hidden>—</span><span className="sr-only">Nothing to add</span></>}
              </span>
            </>
          );
          return (
            <li key={r.label} className="py-2.5">
              {expandable ? (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 [&::-webkit-details-marker]:hidden">{head}</summary>
                  <ul className={cn("mt-2 space-y-1.5 pl-4 text-[12.5px]", muted)}>
                    {r.lines.map((l) => (
                      <li key={l.label} className="flex items-start justify-between gap-3">
                        <span>
                          {l.label}
                          {l.detail && <span className="block text-[11.5px] opacity-80">{l.detail}</span>}
                        </span>
                        <span className="shrink-0 tabular-nums">{formatINR(l.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <div className="flex items-baseline justify-between gap-3">{head}</div>
              )}
            </li>
          );
        })}
      </ul>
      {price.seasonNote && <p className={cn("mt-3 text-[11.5px] leading-snug", muted)}>{price.seasonNote}</p>}
      <p className={cn("mt-3 text-[11.5px] leading-snug", muted)}>Prices shown are estimates and will be confirmed by our travel team.</p>
    </div>
  );
}
