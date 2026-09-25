import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { Badge } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import type { Destination } from "@/types/destination";

const regionLabel = { kashmir: "Kashmir", jammu: "Jammu", ladakh: "Ladakh" } as const;

/** Tall photographic card — image first, text laid over the lower scrim. */
export function DestinationCard({ destination, className, tall = true, priority }: { destination: Destination; className?: string; tall?: boolean; priority?: boolean }) {
  return (
    <Link href={`/destinations/${destination.slug}`} className={cn("group relative block overflow-hidden bg-forest", tall ? "aspect-[4/5]" : "aspect-[4/3]", className)}>
      <Photo k={destination.image} zoom sizes="(min-width:1280px) 25vw, (min-width:640px) 45vw, 80vw" priority={priority} />
      <div className="img-scrim-bottom absolute inset-0" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <Badge tone="light">{regionLabel[destination.region]}</Badge>
        <h3 className="mt-3 flex items-end justify-between gap-3 font-display text-3xl leading-none !text-ivory">
          {destination.name}
          <ArrowUpRight className="mb-1 h-5 w-5 shrink-0 -translate-x-1 text-brass-soft opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
        </h3>
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-snug text-ivory/80">{destination.tagline}</p>
      </div>
    </Link>
  );
}
