import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, Mountain, Sun } from "lucide-react";
import { ActivityCard } from "@/components/activities/activity-card";
import { DestinationCard } from "@/components/destinations/destination-card";
import { HotelCard } from "@/components/hotels/hotel-card";
import { JsonLd } from "@/components/layout/json-ld";
import { PackageRow } from "@/components/packages/package-row";
import { ButtonLink } from "@/components/ui/button";
import { HScroller } from "@/components/ui/h-scroller";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/motion";
import { Badge, Eyebrow } from "@/components/ui/section";
import { site } from "@/data/site";
import { formatINR } from "@/lib/format";
import { hotelsFor } from "@/lib/recommendations";
import { destinationStartingPrice } from "@/lib/starting-price";
import { getCatalog, getDestination, getDestinations, getPackages } from "@/services/catalog";
import { img } from "@/data/images";

type Params = { slug: string };

export async function generateStaticParams() {
  return (await getDestinations()).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDestination(slug);
  if (!d) return { title: "Destination not found" };
  const image = img(d.image).src;
  return {
    title: `${d.name} — travel guide, stays & experiences`,
    description: `${d.tagline}. Best season: ${d.bestSeason}. Recommended: ${d.recommendedDays}. Plan ${d.name} with curated stays, vehicles and activities.`,
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: { title: `${d.name} — ${d.tagline}`, description: d.description[0], images: [image] },
  };
}

const regionLabel = { kashmir: "Kashmir", jammu: "Jammu", ladakh: "Ladakh" } as const;

export default async function DestinationPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const dest = await getDestination(slug);
  if (!dest) notFound();
  const [catalog, packages] = await Promise.all([getCatalog(), getPackages()]);
  const activities = dest.activityIds.map((id) => catalog.activities.find((a) => a.id === id)).filter((a) => !!a);
  const hotels = hotelsFor(dest.id, catalog);
  const itineraries = packages.filter((p) => p.stops.some((s) => s.destinationId === dest.id));
  const nearby = dest.nearby.map((id) => catalog.destinations.find((d) => d.id === id)).filter((d) => !!d);
  const price = destinationStartingPrice(dest, catalog);
  const dn = (id: string) => catalog.destinations.find((d) => d.id === id)?.name ?? id;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          name: dest.name,
          description: dest.description[0],
          url: `${site.url}/destinations/${dest.slug}`,
          image: `${site.url}${img(dest.image).src}`,
          touristType: ["Family", "Couples", "Adventure", "Photography"],
          containedInPlace: { "@type": "AdministrativeArea", name: dest.region === "ladakh" ? "Ladakh" : "Jammu and Kashmir" },
        }}
      />
      {/* Hero */}
      <section aria-labelledby="dest-title" className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-forest">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 animate-slow-zoom"><Photo k={dest.image} priority sizes="100vw" /></div>
          <div className="img-scrim absolute inset-0" aria-hidden />
        </div>
        <div className="container-x pb-12 pt-40">
          <nav aria-label="Breadcrumb" className="text-[12px] uppercase tracking-[0.18em] text-ivory/70">
            <Link href="/destinations" className="hover:text-ivory">Destinations</Link> <span aria-hidden>/</span> <Link href={`/destinations?region=${dest.region}`} className="hover:text-ivory">{regionLabel[dest.region]}</Link>
          </nav>
          <h1 id="dest-title" className="display-xl mt-4 !text-ivory">{dest.name}</h1>
          <p className="mt-4 max-w-2xl font-display text-2xl italic text-ivory/90 sm:text-3xl">{dest.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={`/plan-your-trip?destination=${dest.slug}`} variant="gold" size="lg">Plan a trip with {dest.name}</ButtonLink>
            <ButtonLink href="#stays" variant="outline" size="lg" className="!border-white/60 !text-ivory hover:!bg-white/10">See stays</ButtonLink>
          </div>
        </div>
      </section>

      {/* Fact strip */}
      <section aria-label="At a glance" className="border-b border-line bg-paper">
        <dl className="container-x grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
          {[
            { icon: Clock, label: "Recommended", value: dest.recommendedDays },
            { icon: CalendarDays, label: "Best season", value: dest.bestSeason.split(" (")[0].split(";")[0] },
            { icon: Mountain, label: "Altitude", value: dest.altitude },
            { icon: Sun, label: "Starting from (demo)", value: `${formatINR(price)} pp` },
          ].map((f) => (
            <div key={f.label} className="px-1 py-5 sm:px-6 sm:first:pl-0">
              <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted"><f.icon className="h-3.5 w-3.5 text-brass" aria-hidden />{f.label}</dt>
              <dd className="mt-1 font-display text-2xl leading-tight text-forest">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Editorial */}
      <section className="container-x grid gap-14 py-20 lg:grid-cols-[1.25fr_1fr] lg:gap-24 lg:py-28">
        <div>
          <Eyebrow>{regionLabel[dest.region]}</Eyebrow>
          <h2 className="display-md mt-3">About {dest.name}</h2>
          <div className="mt-6 space-y-5 text-[17px] leading-[1.75] text-ink/85">
            {dest.description.map((p, i) => <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-forest" : ""}>{p}</p>)}
          </div>
          <h3 className="eyebrow mt-12">Highlights</h3>
          <ol className="mt-4 grid gap-x-10 border-t border-line sm:grid-cols-2">
            {dest.highlights.map((h, i) => (
              <li key={h} className="flex items-baseline gap-4 border-b border-line py-3">
                <span className="font-display text-lg text-brass">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[15px]">{h}</span>
              </li>
            ))}
          </ol>
        </div>
        <aside aria-label="Travel information" className="lg:pt-10">
          <div className="border border-line bg-paper p-6 sm:p-8">
            <h3 className="font-display text-3xl">Travel information</h3>
            <dl className="mt-5 divide-y divide-line">
              {dest.travelInfo.map((t) => (
                <div key={t.label} className="py-3.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass">{t.label}</dt>
                  <dd className="mt-1 text-[14.5px] leading-relaxed text-ink/85">{t.value}</dd>
                </div>
              ))}
              <div className="py-3.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass">Recommended nights</dt>
                <dd className="mt-1 text-[14.5px] text-ink/85">{dest.recommendedNights} ({dest.minNights}–{dest.maxNights} works)</dd>
              </div>
              {dest.restrictionNote && (
                <div className="py-3.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-burgundy">Seasonal access</dt>
                  <dd className="mt-1 text-[14.5px] leading-relaxed text-ink/85">{dest.restrictionNote}</dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </section>

      {/* Spots gallery */}
      {dest.spots.length > 0 && (
        <section aria-labelledby="spots-title" className="bg-charcoal py-20 text-ivory lg:py-28">
          <div className="container-x">
            <Eyebrow light>Look closer</Eyebrow>
            <h2 id="spots-title" className="display-md mt-3 !text-ivory">Places worth the detour</h2>
            <Reveal className="mt-10 grid gap-3 md:grid-cols-12">
              {dest.spots.slice(0, 4).map((s, i) => (
                <figure key={s.name} className={`relative overflow-hidden bg-forest ${i === 0 ? "aspect-[4/3] md:col-span-7 md:row-span-2 md:aspect-auto md:min-h-[420px]" : i === 3 ? "aspect-[16/9] md:col-span-12" : "aspect-[4/3] md:col-span-5"}`}>
                  <Photo k={s.image ?? dest.image} zoom sizes="(min-width:768px) 55vw, 100vw" />
                  <div className="img-scrim-bottom absolute inset-0" aria-hidden />
                  <figcaption className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-display text-2xl !text-ivory">{s.name}</p>
                    <p className="mt-1 max-w-md text-[13.5px] text-ivory/75">{s.note}</p>
                  </figcaption>
                </figure>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* Activities */}
      {activities.length > 0 && (
        <section aria-labelledby="acts-title" className="container-x py-20 lg:py-28">
          <Eyebrow>Things to do</Eyebrow>
          <h2 id="acts-title" className="display-md mt-3">Experiences in {dest.name}</h2>
          <div className="mt-10">
            <HScroller label={`${dest.name} activities`}>
              {activities.map((a) => a && (
                <div key={a.id} className="w-[80vw] shrink-0 snap-start sm:w-[340px]">
                  <ActivityCard activity={a} destinationNames={a.destinationIds.map(dn).join(" · ")} className="h-full" />
                </div>
              ))}
            </HScroller>
          </div>
        </section>
      )}

      {/* Stays */}
      <section id="stays" aria-labelledby="stays-title" className="scroll-mt-20 border-y border-line bg-parchment/40 py-20 lg:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Where to stay</Eyebrow>
              <h2 id="stays-title" className="display-md mt-3">Suggested stays in {dest.name}</h2>
            </div>
            <Badge tone="gold">Demo inventory</Badge>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-1 xl:grid-cols-1">
            {hotels.map((h) => <HotelCard key={h.id} hotel={h} />)}
          </div>
        </div>
      </section>

      {/* Itineraries */}
      <section aria-labelledby="its-title" className="container-x py-20 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Suggested itineraries</Eyebrow>
            <h2 id="its-title" className="display-md mt-3">Journeys that include {dest.name}</h2>
          </div>
          <Link href="/packages" className="text-sm font-medium text-forest underline underline-offset-8 decoration-forest/30 hover:decoration-forest">All packages</Link>
        </div>
        <div className="mt-8 border-t border-line">
          {itineraries.length ? itineraries.map((p) => <PackageRow key={p.id} pkg={p} catalog={catalog} />) : <p className="py-8 text-muted">No fixed packages include {dest.name} yet — build your own in the planner.</p>}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <ButtonLink href={`/plan-your-trip?destination=${dest.slug}`} size="lg">Build my own with {dest.name}</ButtonLink>
          <span className="text-sm text-muted">From {formatINR(price)} per person (demo estimate, {dest.recommendedNights} {dest.recommendedNights === 1 ? "night" : "nights"}).</span>
        </div>
      </section>

      {/* Nearby */}
      {nearby.length > 0 && (
        <section aria-labelledby="near-title" className="container-x pb-24">
          <Eyebrow>Nearby</Eyebrow>
          <h2 id="near-title" className="display-md mt-3">Pair it with</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {nearby.slice(0, 4).map((n) => n && <DestinationCard key={n.id} destination={n} tall={false} className="aspect-[4/5] md:aspect-[3/4]" />)}
          </div>
          <div className="mt-10 text-center">
            <Link href="/destinations" className="inline-flex items-center gap-2 text-sm font-medium text-forest">All destinations <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
        </section>
      )}
    </>
  );
}
