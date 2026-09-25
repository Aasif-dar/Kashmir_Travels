import Link from "next/link";
import { Star } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/motion";
import { Eyebrow } from "@/components/ui/section";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { HOTEL_CATEGORY_LABEL, type Hotel } from "@/types/hotel";
import type { Destination } from "@/types/destination";

const picks = ["srinagar-luxury", "gulmarg-premium", "pahalgam-comfort", "nubra-premium", "gulmarg-comfort"];

export function HandpickedStays({ hotels, destinations }: { hotels: Hotel[]; destinations: Destination[] }) {
  const list = picks.map((id) => hotels.find((h) => h.id === id)).filter(Boolean) as Hotel[];
  const [lead, ...others] = list;
  const dn = (id: string) => destinations.find((d) => d.id === id)?.name ?? id;
  const Card = ({ h, className, big }: { h: Hotel; className?: string; big?: boolean }) => (
    <Link href="/hotels" className={cn("group relative block overflow-hidden bg-forest", className)}>
      <Photo k={h.image} zoom sizes={big ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"} />
      <div className="img-scrim-bottom absolute inset-0" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="eyebrow !text-brass-soft">{dn(h.destinationId)} · {HOTEL_CATEGORY_LABEL[h.category].name}</p>
        <h3 className={cn("mt-2 font-display leading-tight !text-ivory", big ? "text-4xl" : "text-2xl")}>{h.name}</h3>
        <p className="mt-1.5 flex items-center gap-3 text-[13px] text-ivory/80">
          <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-brass-soft text-brass-soft" aria-hidden />{h.rating.toFixed(1)}</span>
          <span>from {formatINR(h.pricePerNight)} / night</span>
        </p>
      </div>
    </Link>
  );
  return (
    <section aria-labelledby="stays-title" className="py-20 lg:py-28">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-end">
          <div>
            <Eyebrow>Handpicked stays</Eyebrow>
            <h2 id="stays-title" className="display-lg mt-3">A bed that belongs to the place</h2>
          </div>
          <p className="lede max-w-xl lg:justify-self-end">Carved-cedar houseboats, pine lodges, orchard camps. Every destination has a comfort, premium and luxury option — swap them in the planner and watch the price move.</p>
        </div>
        <Reveal className="mt-12 grid gap-3 lg:grid-cols-12 lg:grid-rows-2">
          {lead && <Card h={lead} big className="aspect-[4/3] lg:col-span-7 lg:row-span-2 lg:aspect-auto lg:min-h-[560px]" />}
          {others.slice(0, 2).map((h) => <Card key={h.id} h={h} className="aspect-[4/3] lg:col-span-5 lg:aspect-auto" />)}
        </Reveal>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {others.slice(2).map((h) => <Card key={h.id} h={h} className="aspect-[16/9]" />)}
        </div>
        <p className="mt-5 text-xs text-muted">Hotel names, rates and photos are demo inventory for illustration — not live availability.</p>
      </div>
    </section>
  );
}
