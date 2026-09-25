import { Clock, Gauge, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { Photo } from "@/components/ui/photo";
import { Badge } from "@/components/ui/section";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Activity } from "@/types/activity";

const categoryLabel: Record<Activity["category"], string> = { snow: "Snow", adventure: "Adventure", water: "Water", nature: "Nature", culture: "Culture", spiritual: "Spiritual" };

export function priceLabel(a: Pick<Activity, "price" | "priceUnit">) {
  return `${formatINR(a.price)} ${a.priceUnit === "person" ? "per person" : "per group (up to 5)"}`;
}

export function ActivityCard({ activity, destinationNames, action, reasons, className, id, layout = "vertical" }: { activity: Activity; destinationNames?: string; action?: ReactNode; reasons?: string[]; className?: string; id?: string; layout?: "vertical" | "horizontal" }) {
  const horizontal = layout === "horizontal";
  return (
    <article id={id} className={cn("group scroll-mt-28 bg-paper", horizontal ? "grid sm:grid-cols-[220px_1fr]" : "flex flex-col", className)}>
      <div className={cn("relative overflow-hidden bg-forest", horizontal ? "aspect-[16/10] sm:aspect-auto sm:min-h-full" : "aspect-[4/3]")}>
        <Photo k={activity.image} zoom sizes={horizontal ? "220px" : "(min-width:1024px) 25vw, (min-width:640px) 45vw, 100vw"} />
        <div className="absolute left-3 top-3">
          <Badge tone="light">{categoryLabel[activity.category]}</Badge>
        </div>
      </div>
      <div className={cn("flex flex-1 flex-col border border-line p-4 sm:p-5", horizontal ? "max-sm:border-t-0 sm:border-l-0" : "border-t-0")}>
        <h3 className="font-display text-[1.5rem] leading-tight">{activity.name}</h3>
        {destinationNames && <p className="mt-1 text-[12.5px] uppercase tracking-[0.12em] text-brass">{destinationNames}</p>}
        <p className="mt-2 text-[14px] leading-relaxed text-muted">{activity.description}</p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink/75">
          <li className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-forest" aria-hidden />{activity.duration}</li>
          <li className="inline-flex items-center gap-1.5 capitalize"><Gauge className="h-3.5 w-3.5 text-forest" aria-hidden />{activity.difficulty}</li>
          <li className="inline-flex items-center gap-1.5"><Sun className="h-3.5 w-3.5 text-forest" aria-hidden />{activity.season}</li>
        </ul>
        {reasons && reasons.length > 0 && (
          <p className="mt-3 text-[12.5px] font-medium text-pine">{reasons.join(" · ")}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-[13.5px] font-semibold text-forest">{priceLabel(activity)}</p>
          {action}
        </div>
      </div>
    </article>
  );
}
