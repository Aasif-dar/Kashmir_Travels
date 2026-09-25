import { Check, Star } from "lucide-react";
import type { ReactNode } from "react";
import { Photo } from "@/components/ui/photo";
import { Badge } from "@/components/ui/section";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { HOTEL_CATEGORY_LABEL, type Hotel } from "@/types/hotel";

export function HotelCard({ hotel, destinationName, selected, action, reason, className, showDemo = true }: { hotel: Hotel; destinationName?: string; selected?: boolean; action?: ReactNode; reason?: string | null; className?: string; showDemo?: boolean }) {
  const cat = HOTEL_CATEGORY_LABEL[hotel.category];
  return (
    <article className={cn("grid bg-paper sm:grid-cols-[minmax(180px,38%)_1fr]", selected ? "ring-2 ring-forest" : "border border-line", className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-forest sm:aspect-auto sm:min-h-[220px]">
        <Photo k={hotel.image} sizes="(min-width:1024px) 22vw, (min-width:640px) 38vw, 100vw" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone="light">{cat.stars} {cat.name}</Badge>
          {selected && <Badge tone="forest"><Check className="h-3 w-3" aria-hidden /> Selected</Badge>}
        </div>
      </div>
      <div className="flex flex-col p-4 sm:p-5">
        {destinationName && <p className="eyebrow">{destinationName}</p>}
        <div className="mt-1 flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.6rem] leading-tight">{hotel.name}</h3>
          <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-forest">
            <Star className="h-3.5 w-3.5 fill-brass text-brass" aria-hidden />
            {hotel.rating.toFixed(1)}
          </span>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">{hotel.description}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {hotel.amenities.slice(0, 5).map((a) => (
            <li key={a} className="rounded-[2px] border border-line px-2 py-0.5 text-[11.5px] text-ink/75">{a}</li>
          ))}
        </ul>
        <p className="mt-2 text-[12.5px] text-muted">Rooms: {hotel.roomTypes.join(" · ")}</p>
        {reason && <p className="mt-2 text-[12.5px] font-medium text-pine">✓ {reason}</p>}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div>
            <p className="font-display text-2xl text-forest">{formatINR(hotel.pricePerNight)}<span className="ml-1 font-sans text-xs text-muted">/ room / night</span></p>
            {showDemo && <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Demo inventory · illustrative photo</p>}
          </div>
          {action}
        </div>
      </div>
    </article>
  );
}
