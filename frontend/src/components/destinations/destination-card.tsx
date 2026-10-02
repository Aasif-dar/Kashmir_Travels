import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { cn } from "@/lib/utils";
import type { Destination } from "@/types/destination";

const regionLabel = { kashmir: "Kashmir", jammu: "Jammu", ladakh: "Ladakh" } as const;

type Size = "lg" | "md" | "sm";

/**
 * Editorial destination tile. Photography carries it; the caption is deliberately quiet.
 * `size` controls how much text it shows so a mosaic can mix large, medium and small tiles.
 */
export function DestinationCard({ destination: d, size = "md", className, priority, sizes }: { destination: Destination; size?: Size; className?: string; priority?: boolean; sizes?: string }) {
  return (
    <Link href={`/destinations/${d.slug}`} className={cn("group relative block overflow-hidden rounded-[3px] bg-forest", className)}>
      <Photo k={d.image} zoom priority={priority} sizes={sizes ?? (size === "lg" ? "(min-width:1024px) 62vw, (min-width:640px) 100vw, 150vw" : "(min-width:1024px) 40vw, (min-width:640px) 60vw, 130vw")} />
      <div className="scrim-tile absolute inset-0" aria-hidden />
      <div className={cn("absolute inset-x-0 bottom-0", size === "sm" ? "p-3.5 sm:p-4" : "p-4 sm:p-6")}>
        <p className="t-label !text-[10px] text-ivory/80">
          {d.recommendedDays}
          {size !== "sm" && <> · {regionLabel[d.region]}</>}
        </p>
        <h3 className={cn("mt-1.5 font-display leading-[0.95] !text-ivory", size === "lg" ? "text-[clamp(2.4rem,4.2vw,3.75rem)]" : size === "md" ? "text-[clamp(1.9rem,2.6vw,2.4rem)]" : "text-[1.45rem] sm:text-[1.6rem]")}>{d.name}</h3>
        {size !== "sm" && <p className={cn("mt-2 text-ivory/85", size === "lg" ? "max-w-[30ch] text-[15px]" : "max-w-[28ch] text-[13.5px] leading-snug")}>{d.shortTagline ?? d.tagline}</p>}
        {size === "lg" && (
          <span className="mt-4 inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-ivory">
            Explore <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        )}
      </div>
    </Link>
  );
}
