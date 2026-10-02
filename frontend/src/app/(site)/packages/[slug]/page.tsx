import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X } from "lucide-react";
import { FinalCta } from "@/components/home/faq-and-cta";
import { ItineraryTimeline } from "@/components/itinerary/itinerary-timeline";
import { JsonLd } from "@/components/layout/json-ld";
import { PackageComparison } from "@/components/packages/package-comparison";
import { PackagePanel } from "@/components/packages/package-panel";
import { PackageRow } from "@/components/packages/package-row";
import { Photo } from "@/components/ui/photo";
import { Eyebrow } from "@/components/ui/section";
import { img } from "@/data/images";
import { tierById } from "@/data/rules";
import { site } from "@/data/site";
import { formatINR, MONTHS_SHORT } from "@/lib/format";
import { buildItinerary } from "@/lib/itinerary-engine";
import { resolveStays, resolveVehicle } from "@/lib/pricing";
import { packageStartingPrice, packageTierPrice } from "@/lib/starting-price";
import { packageToTrip } from "@/lib/trip";
import { getCatalog, getPackage, getPackages } from "@/services/catalog";
import { HOTEL_CATEGORY_LABEL } from "@/types/hotel";

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
    description: `${p.tagline}. ${p.description} Customise stays, vehicle and experiences and see an estimated price.`,
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
  const timelineStays = stays.map((s) => ({ destinationId: s.destinationId, hotel: s.hotel ? { name: s.hotel.name, category: s.hotel.category } : null }));

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

      <section aria-labelledby="pkg-title" className="on-dark relative isolate flex min-h-[68svh] items-end overflow-hidden bg-forest">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 animate-slow-zoom"><Photo k={pkg.image} priority sizes="100vw" /></div>
          <div className="img-scrim absolute inset-0" aria-hidden />
        </div>
        <div className="container-x pb-10 pt-40 lg:pb-14">
          <nav aria-label="Breadcrumb" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/75">
            <Link href="/packages" className="hover:text-ivory">Journeys</Link> <span aria-hidden>/</span> {pkg.category}
          </nav>
          <h1 id="pkg-title" className="mt-4 max-w-4xl font-display text-[clamp(2.6rem,6.4vw,5.25rem)] leading-[0.98] !text-ivory">{pkg.name}</h1>
          <p className="mt-4 max-w-2xl font-display text-[1.35rem] italic text-ivory/90 sm:text-[1.7rem]">{pkg.tagline}</p>
          <p className="t-label mt-7 !text-[11px] text-ivory/85">
            {pkg.days} days · {pkg.nights} nights <span className="mx-2 text-brass-soft" aria-hidden>|</span> {pkg.stops.map((s) => dn(s.destinationId)).join(" · ")} <span className="mx-2 text-brass-soft" aria-hidden>|</span> From {formatINR(from)} pp (demo)
          </p>
        </div>
      </section>

      <div className="container-x grid gap-14 py-14 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-20 lg:py-20">
        <div className="min-w-0 space-y-20">
          <section aria-label="Overview">
            <Eyebrow>The journey</Eyebrow>
            <p className="mt-3 max-w-[40ch] font-display text-[clamp(1.6rem,2.5vw,2.25rem)] leading-[1.25] text-charcoal">{pkg.description}</p>
            <ol className="mt-8 flex flex-wrap items-stretch gap-y-4 border-y border-line-strong py-5">
              {pkg.stops.map((s, i) => (
                <li key={s.destinationId} className="flex items-center">
                  <Link href={`/destinations/${s.destinationId}`} className="group pr-5">
                    <span className="block font-display text-[1.5rem] leading-none transition-colors group-hover:text-forest">{dn(s.destinationId)}</span>
                    <span className="t-meta">{s.nights} {s.nights === 1 ? "night" : "nights"}</span>
                  </Link>
                  {i < pkg.stops.length - 1 && <span aria-hidden className="pr-5 text-brass">→</span>}
                </li>
              ))}
            </ol>
            <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
              {[["Level", tier.name], ["Best months", pkg.seasonLabel], ["Meals", pkg.meals], ["Vehicle", vehicle?.name.split(" — ")[0] ?? "—"]].map(([k, v]) => (
                <div key={k}><dt className="t-label !text-[10px] text-brass">{k}</dt><dd className="mt-1 text-[14.5px] text-ink">{v}</dd></div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="itin-title">
            <Eyebrow>Day by day</Eyebrow>
            <h2 id="itin-title" className="t-h2 mt-3">The itinerary</h2>
            <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-muted">Shown at the {tier.name} level. Customize it in the planner — reorder stops, add experiences or change stays.</p>
            <ItineraryTimeline days={itinerary} stays={timelineStays} meals={tier.mealPlan} className="mt-10" />
          </section>

          <section aria-labelledby="inc-title" className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 id="inc-title" className="font-display text-[1.9rem] leading-none">Included</h2>
              <ul className="mt-4 space-y-3 border-t border-line pt-4">
                {pkg.inclusions.map((x) => <li key={x} className="flex gap-3 text-[14.5px] leading-snug"><Check className="mt-0.5 h-4 w-4 shrink-0 text-pine" aria-hidden />{x}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-[1.9rem] leading-none">Not included</h2>
              <ul className="mt-4 space-y-3 border-t border-line pt-4">
                {pkg.exclusions.map((x) => <li key={x} className="flex gap-3 text-[14.5px] leading-snug text-ink/80"><X className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" aria-hidden />{x}</li>)}
              </ul>
            </div>
          </section>

          <section aria-labelledby="stay-title">
            <Eyebrow>Where you&apos;ll stay</Eyebrow>
            <h2 id="stay-title" className="t-h2 mt-3">Stays at {tier.name} level</h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {stays.filter((s) => s.hotel).map((s) => (
                <li key={s.destinationId} className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-4 py-4 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-6">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-forest"><Photo k={s.hotel!.image} sizes="140px" /></div>
                  <div className="min-w-0">
                    <p className="t-label !text-[10px] text-brass">{s.destinationName} · {s.nights} {s.nights === 1 ? "night" : "nights"} · {HOTEL_CATEGORY_LABEL[s.hotel!.category].name}</p>
                    <p className="mt-1 font-display text-[1.5rem] leading-tight">{s.hotel!.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-snug text-muted">{s.hotel!.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-muted">Demo inventory with illustrative photographs — swap any stay in the planner.</p>
          </section>

          {(vehicle || acts.length > 0) && (
            <section aria-labelledby="road-title" className="grid gap-12 md:grid-cols-2">
              {vehicle && (
                <div>
                  <Eyebrow>Getting around</Eyebrow>
                  <h2 id="road-title" className="mt-3 font-display text-[1.9rem] leading-none">Your vehicle</h2>
                  <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-[3px] bg-parchment"><Photo k={vehicle.image} sizes="(min-width:768px) 30vw, 100vw" /></div>
                  <p className="mt-3 font-display text-[1.35rem] leading-tight">{vehicle.name}</p>
                  <p className="mt-1 text-[13.5px] text-muted">Up to {vehicle.passengers} guests · {vehicle.luggage} · driver, fuel &amp; tolls included</p>
                </div>
              )}
              {acts.length > 0 && (
                <div>
                  <Eyebrow>Experiences</Eyebrow>
                  <h2 className="mt-3 font-display text-[1.9rem] leading-none">Included in this plan</h2>
                  <ul className="mt-5 divide-y divide-line border-y border-line">
                    {acts.map((a) => a && (
                      <li key={a.id} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 py-3">
                        <div className="relative aspect-square overflow-hidden rounded-[3px] bg-forest"><Photo k={a.image} sizes="72px" /></div>
                        <div>
                          <p className="font-display text-[1.25rem] leading-tight">{a.name}</p>
                          <p className="text-[12.5px] text-muted">{a.destinationIds.filter((d) => pkg.stops.some((s) => s.destinationId === d)).map(dn).join(" · ")} · {a.duration}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <section aria-labelledby="cmp-title">
            <Eyebrow>Levels</Eyebrow>
            <h2 id="cmp-title" className="t-h2 mt-3">How the levels differ</h2>
            <PackageComparison className="mt-8" prices={tierPrices} priceLabel="This journey · per person" />
          </section>
        </div>

        <aside aria-label="Customize this package" className="order-first lg:sticky lg:top-24 lg:order-none lg:self-start">
          <PackagePanel pkg={pkg} tierPrices={tierPrices} bestMonths={pkg.bestMonths} />
          <p className="mt-4 text-center text-[12px] text-muted">Best in {pkg.bestMonths.map((m) => MONTHS_SHORT[m]).join(", ")}</p>
        </aside>
      </div>

      <section className="container-x pb-20">
        <Eyebrow>More journeys</Eyebrow>
        <div className="mt-4 border-t border-line">
          {others.map((p) => <PackageRow key={p.id} pkg={p} catalog={catalog} />)}
        </div>
      </section>
      <FinalCta />
    </>
  );
}
