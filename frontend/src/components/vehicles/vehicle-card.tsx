import { Briefcase, Check, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Photo } from "@/components/ui/photo";
import { Badge } from "@/components/ui/section";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";

export function VehicleCard({ vehicle, selected, recommended, action, note, className }: { vehicle: Vehicle; selected?: boolean; recommended?: boolean; action?: ReactNode; note?: string; className?: string }) {
  return (
    <article className={cn("grid bg-paper sm:grid-cols-[minmax(180px,40%)_1fr]", selected ? "ring-2 ring-forest" : "border border-line", className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-parchment sm:aspect-auto sm:min-h-[200px]">
        <Photo k={vehicle.image} sizes="(min-width:1024px) 22vw, (min-width:640px) 38vw, 100vw" />
        <div className="absolute left-3 top-3 flex gap-2">
          {recommended && <Badge tone="gold">Recommended</Badge>}
          {selected && <Badge tone="forest"><Check className="h-3 w-3" aria-hidden /> Selected</Badge>}
        </div>
      </div>
      <div className="flex flex-col p-4 sm:p-5">
        <h3 className="font-display text-[1.6rem] leading-tight">{vehicle.name}</h3>
        <p className="mt-1 text-[12.5px] text-muted">{vehicle.model}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">{vehicle.description}</p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-ink/80">
          <li className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-forest" aria-hidden />Up to {vehicle.passengers}</li>
          <li className="inline-flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-forest" aria-hidden />{vehicle.luggage}</li>
        </ul>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {vehicle.features.map((f) => (
            <li key={f} className="rounded-[2px] border border-line px-2 py-0.5 text-[11.5px] text-ink/75">{f}</li>
          ))}
        </ul>
        {note && <p className="mt-3 text-[12.5px] font-medium text-burgundy">{note}</p>}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div>
            <p className="font-display text-2xl text-forest">{formatINR(vehicle.pricePerDay)}<span className="ml-1 font-sans text-xs text-muted">/ day (demo)</span></p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Indicative — not live availability</p>
          </div>
          {action}
        </div>
      </div>
    </article>
  );
}
