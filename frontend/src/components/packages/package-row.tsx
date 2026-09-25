import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { Badge } from "@/components/ui/section";
import { formatINR } from "@/lib/format";
import { packageStartingPrice } from "@/lib/starting-price";
import { cn } from "@/lib/utils";
import type { TourPackage } from "@/types/package";
import type { Catalog } from "@/types/trip";

const nameOf = (catalog: Catalog, id: string) => catalog.destinations.find((d) => d.id === id)?.name ?? id;

/** Editorial list row: thumbnail, name, route and price on hairlines — not a pricing card. */
export function PackageRow({ pkg, catalog, className }: { pkg: TourPackage; catalog: Catalog; className?: string }) {
  const price = packageStartingPrice(pkg, catalog);
  return (
    <Link href={`/packages/${pkg.slug}`} className={cn("group grid grid-cols-[88px_1fr] items-center gap-4 border-b border-line py-5 transition-colors hover:bg-parchment/40 sm:grid-cols-[132px_1fr_auto] sm:gap-7 sm:px-2", className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-forest">
        <Photo k={pkg.image} zoom sizes="140px" />
      </div>
      <div className="min-w-0">
        <p className="eyebrow">
          {pkg.days} days · {pkg.nights} nights · {pkg.category}
        </p>
        <h3 className="mt-1.5 font-display text-[1.65rem] leading-tight sm:text-3xl">{pkg.name}</h3>
        <p className="mt-1 truncate text-[13.5px] text-muted">{pkg.stops.map((s) => nameOf(catalog, s.destinationId)).join(" · ")}</p>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:block sm:text-right">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">From (demo)</p>
        <p className="font-display text-2xl text-forest">{formatINR(price)}<span className="ml-1 font-sans text-xs text-muted">pp</span></p>
        <span className="mt-1 hidden items-center gap-1.5 text-sm font-medium text-forest sm:inline-flex">
          View journey <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

/** Larger card used on the /packages index. */
export function PackageCard({ pkg, catalog, className, priority }: { pkg: TourPackage; catalog: Catalog; className?: string; priority?: boolean }) {
  const price = packageStartingPrice(pkg, catalog);
  return (
    <Link href={`/packages/${pkg.slug}`} className={cn("group flex flex-col bg-paper", className)}>
      <div className="relative aspect-[16/11] overflow-hidden bg-forest">
        <Photo k={pkg.image} zoom sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" priority={priority} />
        <div className="img-scrim-bottom absolute inset-0" aria-hidden />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge tone="light">{pkg.days}D / {pkg.nights}N</Badge>
          <Badge tone="light">{pkg.category}</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col border border-t-0 border-line p-5">
        <h3 className="font-display text-[1.9rem] leading-tight">{pkg.name}</h3>
        <p className="mt-1.5 text-[14px] leading-snug text-muted">{pkg.tagline}</p>
        <p className="mt-4 text-[13px] text-ink/80">{pkg.stops.map((s) => `${nameOf(catalog, s.destinationId)} ${s.nights}N`).join("  ·  ")}</p>
        <div className="mt-auto flex items-end justify-between border-t border-line pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">From (demo) per person</p>
            <p className="font-display text-3xl text-forest">{formatINR(price)}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-forest">
            View journey <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
