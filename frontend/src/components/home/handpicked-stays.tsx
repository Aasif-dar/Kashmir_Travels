import Link from "next/link";
import { TextLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Eyebrow } from "@/components/ui/section";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Destination } from "@/types/destination";
import { HOTEL_CATEGORY_LABEL, type Hotel } from "@/types/hotel";

const picks: { id: string; aspect: string; offset: string }[] = [
  { id: "srinagar-luxury", aspect: "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[5/6]", offset: "" },
  { id: "sonamarg-premium", aspect: "aspect-[4/5]", offset: "lg:mt-16" },
  { id: "nubra-luxury", aspect: "aspect-[4/5]", offset: "lg:mt-32" },
];

const firstSentence = (s: string) => (s.split(". ")[0] + (s.includes(". ") ? "." : "")).replace(/\.\.$/, ".");

/** Three stays, staggered like a magazine spread, with captions set below the photographs. */
export function HandpickedStays({ hotels, destinations }: { hotels: Hotel[]; destinations: Destination[] }) {
  const items = picks.map((p) => ({ ...p, hotel: hotels.find((h) => h.id === p.id) })).filter((p): p is (typeof picks)[number] & { hotel: Hotel } => !!p.hotel);
  const dn = (id: string) => destinations.find((d) => d.id === id)?.name ?? id;
  return (
    <section aria-labelledby="stays-title" className="section">
      <div className="container-x">
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <Eyebrow>Stays</Eyebrow>
            <h2 id="stays-title" className="t-h2 mt-3 max-w-2xl">Handpicked stays across the valley</h2>
            <p className="t-lede mt-4 max-w-xl">Places chosen to complement your journey — a carved-cedar houseboat, a riverside resort, a tent in the high desert. Swap them in the planner and watch the estimate move.</p>
          </div>
          <TextLink href="/hotels">See all stays</TextLink>
        </div>

        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:items-start">
          {items.map(({ hotel: h, aspect, offset }, i) => (
            <Link key={h.id} href="/hotels" className={cn("group block", offset, i === 0 && "sm:col-span-2 lg:col-span-1")}>
              <div className={cn("relative overflow-hidden rounded-[3px] bg-forest", aspect)}>
                <Photo k={h.image} zoom sizes={i === 0 ? "(min-width:1024px) 64vw, 100vw" : "(min-width:1024px) 45vw, (min-width:640px) 72vw, 140vw"} />
              </div>
              <p className="t-label mt-4 !text-[10.5px] text-brass">{dn(h.destinationId)} · {HOTEL_CATEGORY_LABEL[h.category].name}</p>
              <h3 className="mt-1.5 font-display text-[1.65rem] leading-tight text-charcoal transition-colors group-hover:text-forest">{h.name}</h3>
              <p className="mt-1.5 max-w-[42ch] text-[14px] leading-snug text-muted">{firstSentence(h.description)}</p>
              <p className="mt-2 text-[13px] text-ink">From {formatINR(h.pricePerNight)} a night</p>
            </Link>
          ))}
        </div>
        <p className="mt-12 text-[12.5px] text-muted">Hotel names, rates and photographs are demo inventory for illustration — never live availability.</p>
      </div>
    </section>
  );
}
