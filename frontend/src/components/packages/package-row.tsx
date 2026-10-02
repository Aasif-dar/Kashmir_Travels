import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { TextLink } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { includesLine } from "@/lib/package-copy";
import { packageStartingPrice } from "@/lib/starting-price";
import { cn } from "@/lib/utils";
import type { TourPackage } from "@/types/package";
import type { Catalog } from "@/types/trip";
import { CustomizeButton } from "./customize-button";

const nameOf = (catalog: Catalog, id: string) => catalog.destinations.find((d) => d.id === id)?.name ?? id;

/** Compact list row: thumbnail, name, route and price on hairlines. Used where journeys appear as a list. */
export function PackageRow({ pkg, catalog, className }: { pkg: TourPackage; catalog: Catalog; className?: string }) {
  const price = packageStartingPrice(pkg, catalog);
  return (
    <Link href={`/packages/${pkg.slug}`} className={cn("group grid grid-cols-[92px_minmax(0,1fr)] items-center gap-4 border-b border-line py-5 transition-colors hover:bg-parchment/40 sm:grid-cols-[136px_minmax(0,1fr)_auto] sm:gap-7 sm:px-2", className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-forest">
        <Photo k={pkg.image} zoom sizes="140px" />
      </div>
      <div className="min-w-0">
        <p className="t-label !text-[10px] text-brass">{pkg.days} days · {pkg.nights} nights · {pkg.category}</p>
        <h3 className="mt-1.5 font-display text-[1.6rem] leading-tight sm:text-[1.9rem]">{pkg.name}</h3>
        <p className="mt-1 truncate text-[13.5px] text-muted">{pkg.stops.map((s) => nameOf(catalog, s.destinationId)).join(" · ")}</p>
      </div>
      <div className="col-span-2 flex items-baseline justify-between gap-4 sm:col-span-1 sm:block sm:text-right">
        <p className="t-label !text-[10px] text-muted">From (demo)</p>
        <p className="t-price text-[1.5rem] text-forest">{formatINR(price)}<span className="ml-1 font-sans text-[11px] text-muted">pp</span></p>
      </div>
    </Link>
  );
}

/**
 * A journey, presented like a page from a travel magazine: the photograph leads, then the name, the route in plain
 * words, what's included and where it starts. Two clear actions — no pricing-card chrome.
 */
export function PackageCard({ pkg, catalog, className, priority, featured }: { pkg: TourPackage; catalog: Catalog; className?: string; priority?: boolean; featured?: boolean }) {
  const price = packageStartingPrice(pkg, catalog);
  const route = pkg.stops.map((s) => nameOf(catalog, s.destinationId));
  return (
    <article className={cn("group", featured ? "grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-12" : "flex flex-col", className)}>
      <Link href={`/packages/${pkg.slug}`} className={cn("relative block overflow-hidden rounded-[3px] bg-forest", featured ? "aspect-[16/11]" : "aspect-[4/3]")} aria-label={`View ${pkg.name}`}>
        <Photo k={pkg.image} zoom priority={priority} sizes={featured ? "(min-width:1024px) 55vw, 100vw" : "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"} />
      </Link>
      <div className={cn("flex flex-1 flex-col", !featured && "pt-5", featured && "lg:pb-2")}>
        <p className="t-label !text-[10.5px] text-brass">{pkg.days} days · {pkg.nights} nights · {pkg.category}</p>
        <h3 className={cn("mt-2 font-display leading-[1.04]", featured ? "text-[clamp(2.2rem,3.4vw,3.1rem)]" : "text-[2rem]")}>
          <Link href={`/packages/${pkg.slug}`} className="transition-colors hover:text-forest">{pkg.name}</Link>
        </h3>
        <p className="mt-2 max-w-[46ch] text-[14.5px] leading-snug text-muted">{pkg.tagline}</p>
        <p className="mt-4 font-display text-[1.25rem] leading-snug text-charcoal">{route.join(" · ")}</p>
        <p className="mb-5 mt-2 text-[13px] leading-snug text-muted">{includesLine(pkg)}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-t border-line pt-4">
          <div>
            <p className="t-label !text-[10px] text-muted">From (demo estimate)</p>
            <p className="t-price mt-1 text-[1.75rem] text-forest">{formatINR(price)}<span className="ml-1.5 font-sans text-[11.5px] text-muted">per person</span></p>
          </div>
          <div className="flex items-center gap-5">
            <TextLink href={`/packages/${pkg.slug}`}>View journey</TextLink>
            <CustomizeButton pkg={pkg} />
          </div>
        </div>
      </div>
    </article>
  );
}
