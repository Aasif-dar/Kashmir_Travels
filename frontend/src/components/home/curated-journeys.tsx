import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PackageRow } from "@/components/packages/package-row";
import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/motion";
import { Eyebrow } from "@/components/ui/section";
import { formatINR } from "@/lib/format";
import { packageStartingPrice } from "@/lib/starting-price";
import type { TourPackage } from "@/types/package";
import type { Catalog } from "@/types/trip";

export function CuratedJourneys({ packages, catalog }: { packages: TourPackage[]; catalog: Catalog }) {
  const featured = packages.find((p) => p.slug === "kashmir-grand-journey") ?? packages[0];
  const rest = packages.filter((p) => p.id !== featured.id).slice(0, 5);
  const nameOf = (id: string) => catalog.destinations.find((d) => d.id === id)?.name ?? id;
  return (
    <section aria-labelledby="journeys-title" className="pb-20 lg:pb-28">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Curated journeys</Eyebrow>
            <h2 id="journeys-title" className="display-lg mt-3">Start from a route we know well</h2>
          </div>
          <Link href="/packages" className="group inline-flex items-center gap-2 text-sm font-medium text-forest">
            <span className="border-b border-forest/40 pb-0.5">All journeys</span> <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>

        <Reveal className="mt-12 grid overflow-hidden bg-forest text-ivory lg:grid-cols-[1.15fr_1fr]">
          <div className="relative min-h-[320px] lg:min-h-[560px]">
            <Photo k={featured.image} sizes="(min-width:1024px) 55vw, 100vw" />
            <div className="img-scrim-bottom absolute inset-0 lg:hidden" aria-hidden />
          </div>
          <div className="relative flex flex-col justify-center p-7 sm:p-12">
            <div className="absolute inset-0 bg-jaali-light opacity-50" aria-hidden />
            <div className="relative">
              <p className="eyebrow !text-brass-soft">Featured · {featured.days} days / {featured.nights} nights</p>
              <h3 className="mt-3 font-display text-5xl leading-none !text-ivory sm:text-6xl">{featured.name}</h3>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ivory/80">{featured.description}</p>
              <ol className="mt-8 space-y-0">
                {featured.stops.map((s, i) => (
                  <li key={s.destinationId} className="relative flex items-baseline gap-4 border-t border-white/15 py-3 first:border-t-0">
                    <span className="w-6 font-display text-lg text-brass-soft">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 font-display text-2xl">{nameOf(s.destinationId)}</span>
                    <span className="text-sm text-ivory/60">{s.nights}N</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ivory/60">From (demo) per person</p>
                  <p className="font-display text-4xl text-ivory">{formatINR(packageStartingPrice(featured, catalog))}</p>
                </div>
                <ButtonLink href={`/packages/${featured.slug}`} variant="gold" size="lg">View Journey</ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 border-t border-line">
          {rest.map((p) => <PackageRow key={p.id} pkg={p} catalog={catalog} />)}
        </div>
      </div>
    </section>
  );
}
