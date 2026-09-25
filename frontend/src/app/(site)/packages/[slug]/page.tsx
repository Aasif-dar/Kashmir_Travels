import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X } from "lucide-react";
import { ActivityCard } from "@/components/activities/activity-card";
import { HotelCard } from "@/components/hotels/hotel-card";
import { ItineraryTimeline } from "@/components/itinerary/itinerary-timeline";
import { JsonLd } from "@/components/layout/json-ld";
import { PackageComparison } from "@/components/packages/package-comparison";
import { PackagePanel } from "@/components/packages/package-panel";
import { PackageRow } from "@/components/packages/package-row";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { Photo } from "@/components/ui/photo";
import { Badge, Eyebrow } from "@/components/ui/section";
import { img } from "@/data/images";
import { tierById } from "@/data/rules";
import { site } from "@/data/site";
import { formatINR, MONTHS_SHORT } from "@/lib/format";
import { buildItinerary } from "@/lib/itinerary-engine";
import { resolveStays, resolveVehicle } from "@/lib/pricing";
import { packageStartingPrice, packageTierPrice } from "@/lib/starting-price";
import { packageToTrip } from "@/lib/trip";
import { getCatalog, getPackage, getPackages } from "@/services/catalog";

type Params = { slug: string };

export async function generateStaticParams() {
  return (await getPackages()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPackage(slug);
  if (!p) return { title: "Package not found" };
  return {
    title: `${p.name} — ${p.days} days / ${p.nights} nights`,
    description: `${p.tagline}. ${p.description} Customise hotels, vehicle and activities and see an estimated price.`,
    alternates: { canonical: `/packages/${p.slug}` },
    openGraph: { title: `${p.name} · ${p.days} days`, description: p.tagline, images: [img(p.image).src] },
  };
}

export default async function PackagePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const pkg = await getPackage(slug);
  if (!pkg) notFound();
  const [catalog, all] = await Promise.all([getCatalog(), getPackages()]);
  const trip = packageToTrip(pkg);
  const itinerary = buildItinerary(trip, catalog);
  const stays = resolveStays(trip, catalog);
  const { vehicle } = resolveVehicle(trip, catalog);
  const from = packageStartingPrice(pkg, catalog);
  const tierPrices = { basic: packageTierPrice(pkg, catalog, "basic"), comfort: packageTierPrice(pkg, catalog, "comfort"), premium: packageTierPrice(pkg, catalog, "premium") };
  const acts = pkg.activityIds.map((id) => catalog.activities.find((a) => a.id === id)).filter((a) => !!a);
  const others = all.filter((p) => p.id !== pkg.id).slice(0, 3);
  const dn = (id: string) => catalog.destinations.find((d) => d.id === id)?.name ?? id;
  const tier = tierById(pkg.tier);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: pkg.name,
          description: pkg.description,
          url: `${site.url}/packages/${pkg.slug}`,
          image: `${site.url}${img(pkg.image).src}`,
          touristType: pkg.category,
          itinerary: { "@type": "ItemList", itemListElement: pkg.stops.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Place", name: dn(s.destinationId) } })) },
          offers: { "@type": "Offer", priceCurrency: "INR", price: from, availability: "https://schema.org/InStock", description: "Demo estimated starting price per person; final price confirmed by the travel team." },
          provider: { "@type": "TravelAgency", name: site.name },
        }}
      />
      <section aria-labelledby="pkg-title" className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-forest">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 animate-slow-zoom"><Photo k={pkg.image} priority sizes="100vw" /></div>
          <div className="img-scrim absolute inset-0" aria-hidden />
        </div>
        <div className="container-x pb-12 pt-40">
          <nav aria-label="Breadcrumb" className="text-[12px] uppercase tracking-[0.18em] text-ivory/70">
            <Link href="/packages" className="hover:text-ivory">Packages</Link> <span aria-hidden>/</span> {pkg.category}
          </nav>
          <h1 id="pkg-title" className="display-xl mt-4 !text-ivory">{pkg.name}</h1>
          <p className="mt-4 max-w-2xl font-display text-2xl italic text-ivory/90 sm:text-3xl">{pkg.tagline}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge tone="light">{pkg.days} days / {pkg.nights} nights</Badge>
            <Badge tone="light">{pkg.stops.map((s) => dn(s.destinationId)).join(" · ")}</Badge>
            <Badge tone="light">From {formatINR(from)} pp (demo)</Badge>
          </div>
        </div>
      </section>

      <div className="container-x grid gap-14 py-16 lg:grid-cols-[1fr_390px] lg:gap-16 lg:py-24">
        <div className="min-w-0">
          <Eyebrow>The journey</Eyebrow>
          <p className="mt-3 font-display text-[clamp(1.6rem,2.6vw,2.3rem)] leading-snug text-charcoal">{pkg.description}</p>

          {/* Route */}
          <div className="mt-10 border-y border-line py-6">
            <p className="eyebrow">Route</p>
            <ol className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-3">
              {pkg.stops.map((s, i) => (
                <li key={s.destinationId} className="flex items-center gap-3">
                  <Link href={`/destinations/${s.destinationId}`} className="group">
                    <span className="block font-display text-2xl leading-none group-hover:text-forest">{dn(s.destinationId)}</span>
                    <span className="text-[12px] text-muted">{s.nights} {s.nights === 1 ? "night" : "nights"}</span>
                  </Link>
                  {i < pkg.stops.length - 1 && <span aria-hidden className="text-brass">→</span>}
                </li>
              ))}
            </ol>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div><dt className="eyebrow">Level</dt><dd className="mt-1 font-medium">{tier.name}</dd></div>
              <div><dt className="eyebrow">Best months</dt><dd className="mt-1 font-medium">{pkg.seasonLabel}</dd></div>
              <div><dt className="eyebrow">Meals</dt><dd className="mt-1 font-medium">{pkg.meals}</dd></div>
              <div><dt className="eyebrow">Vehicle</dt><dd className="mt-1 font-medium">{vehicle?.name.split(" — ")[0]}</dd></div>
            </dl>
          </div>

          {/* Itinerary */}
          <section aria-labelledby="itin-title" className="mt-16">
            <Eyebrow>Day by day</Eyebrow>
            <h2 id="itin-title" className="display-md mt-3">Full itinerary</h2>
            <p className="mt-2 text-sm text-muted">Shown at the {tier.name} level. Customise it in the planner — reorder stops, add experiences or change stays.</p>
            <ItineraryTimeline days={itinerary} stays={stays} className="mt-10" />
          </section>

          {/* Inclusions */}
          <section aria-labelledby="inc-title" className="mt-16 grid gap-10 md:grid-cols-2">
            <div>
              <h2 id="inc-title" className="font-display text-3xl">Included</h2>
              <ul className="mt-4 space-y-2.5">
                {pkg.inclusions.map((x) => <li key={x} className="flex gap-3 text-[15px]"><Check className="mt-1 h-4 w-4 shrink-0 text-pine" aria-hidden />{x}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-3xl">Not included</h2>
              <ul className="mt-4 space-y-2.5">
                {pkg.exclusions.map((x) => <li key={x} className="flex gap-3 text-[15px] text-ink/80"><X className="mt-1 h-4 w-4 shrink-0 text-burgundy" aria-hidden />{x}</li>)}
              </ul>
            </div>
          </section>

          {/* Stays */}
          <section aria-labelledby="stay-title" className="mt-16">
            <Eyebrow>Where you&apos;ll stay</Eyebrow>
            <h2 id="stay-title" className="display-md mt-3">Stays at {tier.name} level</h2>
            <div className="mt-8 space-y-4">
              {stays.filter((s) => s.hotel).map((s) => <HotelCard key={s.destinationId} hotel={s.hotel!} destinationName={`${s.destinationName} · ${s.nights} ${s.nights === 1 ? "night" : "nights"}`} />)}
            </div>
          </section>

          {vehicle && (
            <section aria-labelledby="veh-title" className="mt-16">
              <Eyebrow>Getting around</Eyebrow>
              <h2 id="veh-title" className="display-md mt-3">Your vehicle</h2>
              <VehicleCard className="mt-8" vehicle={vehicle} />
            </section>
          )}

          {acts.length > 0 && (
            <section aria-labelledby="acts-title" className="mt-16">
              <Eyebrow>Experiences</Eyebrow>
              <h2 id="acts-title" className="display-md mt-3">Included in this plan</h2>
              <div className="mt-8 space-y-4">
                {acts.map((a) => a && <ActivityCard key={a.id} activity={a} layout="horizontal" destinationNames={a.destinationIds.filter((d) => pkg.stops.some((s) => s.destinationId === d)).map(dn).join(" · ")} />)}
              </div>
            </section>
          )}

          <section aria-labelledby="cmp-title" className="mt-16">
            <Eyebrow>Levels</Eyebrow>
            <h2 id="cmp-title" className="display-md mt-3">How the levels differ</h2>
            <PackageComparison className="mt-8" prices={tierPrices} priceLabel="This journey · per person" />
          </section>
        </div>

        <aside aria-label="Customise this package" className="order-first lg:order-none lg:sticky lg:top-24 lg:self-start">
          <PackagePanel pkg={pkg} tierPrices={tierPrices} bestMonths={pkg.bestMonths} />
          <p className="mt-4 text-center text-xs text-muted">Best in {pkg.bestMonths.map((m) => MONTHS_SHORT[m]).join(", ")}</p>
        </aside>
      </div>

      <section className="container-x pb-24">
        <Eyebrow>More journeys</Eyebrow>
        <div className="mt-4 border-t border-line">
          {others.map((p) => <PackageRow key={p.id} pkg={p} catalog={catalog} />)}
        </div>
      </section>
    </>
  );
}
