import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationCard } from "@/components/destinations/destination-card";
import { FinalCta } from "@/components/home/faq-and-cta";
import { JsonLd } from "@/components/layout/json-ld";
import { PackageRow } from "@/components/packages/package-row";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { HScroller } from "@/components/ui/h-scroller";
import { Reveal } from "@/components/ui/motion";
import { Photo } from "@/components/ui/photo";
import { Eyebrow } from "@/components/ui/section";
import { img } from "@/data/images";
import { site } from "@/data/site";
import { experienceLabel } from "@/lib/experience-groups";
import { formatINR } from "@/lib/format";
import { hotelsFor } from "@/lib/recommendations";
import { destinationStartingPrice } from "@/lib/starting-price";
import { cn } from "@/lib/utils";
import { getCatalog, getDestination, getDestinations, getPackages } from "@/services/catalog";
import { HOTEL_CATEGORY_LABEL } from "@/types/hotel";

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

const regionLabel = { kashmir: "Kashmir", jammu: "Jammu & Katra", ladakh: "Ladakh" } as const;

/** Grid slot for the n-th "look closer" tile so any count (1–4) fills its rows without leaving a hole. */
function spotSlot(i: number, n: number) {
  if (n === 1) return "aspect-[16/9] md:col-span-12 md:aspect-[21/9]";
  if (n === 2) return "aspect-[4/3] md:col-span-6";
  if (i === 0) return "aspect-[4/3] md:col-span-7 md:row-span-2 md:aspect-auto md:min-h-[420px]";
  if (i === 3) return "aspect-[16/9] md:col-span-12";
  return "aspect-[4/3] md:col-span-5";
}

/** Column count for the "pair it with" row, keyed by number of tiles (Tailwind needs the full class names). */
const nearbyCols: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };

export default async function DestinationPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const dest = await getDestination(slug);
  if (!dest) notFound();
  const [catalog, packages] = await Promise.all([getCatalog(), getPackages()]);
  const activities = dest.activityIds.map((id) => catalog.activities.find((a) => a.id === id)).filter((a) => !!a);
  const hotels = hotelsFor(dest.id, catalog);
  const itineraries = packages.filter((p) => p.stops.some((s) => s.destinationId === dest.id));
  const nearby = dest.nearby.map((id) => catalog.destinations.find((d) => d.id === id)).filter((d) => !!d);
  const spots = dest.spots.slice(0, 4);
  const price = destinationStartingPrice(dest, catalog);
  const facts = [
    ["Recommended stay", dest.recommendedDays],
    ["Best season", dest.bestSeason.split(" (")[0].split(";")[0]],
    ["Altitude", dest.altitude],
    ["From (demo estimate)", `${formatINR(price)} pp`],
  ];

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

      <section aria-labelledby="dest-title" className="on-dark relative isolate flex min-h-[72svh] items-end overflow-hidden bg-forest">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 animate-slow-zoom"><Photo k={dest.image} priority sizes="100vw" /></div>
          <div className="img-scrim absolute inset-0" aria-hidden />
        </div>
        <div className="container-x pb-10 pt-40 lg:pb-14">
          <nav aria-label="Breadcrumb" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/75">
            <Link href="/destinations" className="hover:text-ivory">Destinations</Link> <span aria-hidden>/</span> <Link href={`/destinations?region=${dest.region}`} className="hover:text-ivory">{regionLabel[dest.region]}</Link>
          </nav>
          <h1 id="dest-title" className="mt-4 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] !text-ivory">{dest.name}</h1>
          <p className="mt-3 max-w-2xl font-display text-[1.35rem] italic text-ivory/90 sm:text-[1.75rem]">{dest.tagline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href={`/plan-your-trip?destination=${dest.slug}`} variant="gold" size="lg" caps>Plan a journey with {dest.name}</ButtonLink>
            <TextLink href="#stays" onDark>See stays</TextLink>
          </div>
        </div>
      </section>

      <section aria-label="At a glance" className="band-paper border-b border-line">
        <dl className="container-x grid grid-cols-2 sm:grid-cols-4">
          {facts.map(([k, v], i) => (
            <div key={k} className={`py-5 sm:px-6 ${i === 0 ? "sm:pl-0" : ""} ${i > 0 ? "sm:border-l sm:border-line" : ""}`}>
              <dt className="t-label !text-[10px] text-brass">{k}</dt>
              <dd className="mt-1.5 font-display text-[1.5rem] leading-tight text-forest">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-x grid gap-14 py-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-24 lg:py-24">
        <div>
          <Eyebrow>{regionLabel[dest.region]}</Eyebrow>
          <h2 className="t-h2 mt-3">About {dest.name}</h2>
          <div className="mt-6 space-y-5 text-[17px] leading-[1.75] text-ink/85 measure-wide">
            {dest.description.map((p, i) => <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[4.6rem] first-letter:leading-[0.8] first-letter:text-forest" : ""}>{p}</p>)}
          </div>
          <h3 className="t-label mt-12 !text-[10.5px] text-brass">Highlights</h3>
          <ol className="mt-3 grid gap-x-10 border-t border-line-strong sm:grid-cols-2">
            {dest.highlights.map((h, i) => (
              <li key={h} className="flex items-baseline gap-4 border-b border-line py-3">
                <span className="font-display text-[1.05rem] text-brass">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[15px]">{h}</span>
              </li>
            ))}
          </ol>
        </div>
        <aside aria-label="Travel information" className="lg:pt-14">
          <h2 className="font-display text-[1.9rem] leading-none">Good to know</h2>
          <dl className="mt-4 divide-y divide-line border-y border-line-strong">
            {dest.travelInfo.map((t) => (
              <div key={t.label} className="py-3.5">
                <dt className="t-label !text-[10px] text-brass">{t.label}</dt>
                <dd className="mt-1 text-[14.5px] leading-relaxed text-ink/85">{t.value}</dd>
              </div>
            ))}
            <div className="py-3.5">
              <dt className="t-label !text-[10px] text-brass">Recommended nights</dt>
              <dd className="mt-1 text-[14.5px] text-ink/85">{dest.recommendedNights} ({dest.minNights}–{dest.maxNights} works)</dd>
            </div>
            {dest.restrictionNote && (
              <div className="py-3.5">
                <dt className="t-label !text-[10px] text-burgundy">Seasonal access</dt>
                <dd className="mt-1 text-[14.5px] leading-relaxed text-ink/85">{dest.restrictionNote}</dd>
              </div>
            )}
          </dl>
        </aside>
      </section>

      {spots.length > 0 && (
        <section aria-labelledby="spots-title" className="section band-charcoal">
          <div className="container-x">
            <Eyebrow light>Look closer</Eyebrow>
            <h2 id="spots-title" className="t-h2 mt-3 !text-ivory">Places worth the detour</h2>
            <Reveal className="mt-10 grid gap-3 md:grid-cols-12">
              {spots.map((s, i) => (
                <figure key={s.name} className={cn("relative overflow-hidden rounded-[3px] bg-forest", spotSlot(i, spots.length))}>
                  <Photo k={s.image ?? dest.image} zoom sizes="(min-width:768px) 55vw, 100vw" />
                  <div className="img-scrim-bottom absolute inset-0" aria-hidden />
                  <figcaption className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-display text-[1.7rem] leading-none !text-ivory">{s.name}</p>
                    <p className="mt-1.5 max-w-md text-[13.5px] text-ivory/80">{s.note}</p>
                  </figcaption>
                </figure>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {activities.length > 0 && (
        <section aria-labelledby="acts-title" className="section">
          <div className="container-x">
            <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div><Eyebrow>Things to do</Eyebrow><h2 id="acts-title" className="t-h2 mt-3">Experiences in {dest.name}</h2></div>
              <TextLink href="/activities">All experiences</TextLink>
            </div>
            <div className="mt-9">
              <HScroller label={`${dest.name} experiences`}>
                {activities.map((a) => a && (
                  <Link key={a.id} href={`/activities#${a.id}`} className="group relative block aspect-[3/4] w-[70vw] shrink-0 snap-start overflow-hidden rounded-[3px] bg-forest sm:w-[280px]">
                    <Photo k={a.image} zoom sizes="290px" />
                    <div className="scrim-caption absolute inset-0" aria-hidden />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="t-label !text-[10px] text-brass-soft">{experienceLabel(a)} · {a.duration}</p>
                      <h3 className="mt-1.5 font-display text-[1.6rem] leading-[1.05] !text-ivory">{a.name}</h3>
                      <p className="mt-1.5 text-[12.5px] text-ivory/75">from {formatINR(a.price)}{a.priceUnit === "group" ? " / group" : ""}</p>
                    </div>
                  </Link>
                ))}
              </HScroller>
            </div>
          </div>
        </section>
      )}

      <section id="stays" aria-labelledby="stays-title" className="section band-parchment scroll-mt-20 border-y border-line">
        <div className="container-x">
          <Eyebrow>Where to stay</Eyebrow>
          <h2 id="stays-title" className="t-h2 mt-3">Handpicked stays in {dest.name}</h2>
          <ul className="mt-10 divide-y divide-line-strong border-y border-line-strong">
            {hotels.map((h) => (
              <li key={h.id} className="grid gap-5 py-6 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto] sm:items-center sm:gap-8">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-forest"><Photo k={h.image} sizes="230px" /></div>
                <div>
                  <p className="t-label !text-[10.5px] text-brass">{HOTEL_CATEGORY_LABEL[h.category].stars} {HOTEL_CATEGORY_LABEL[h.category].name}</p>
                  <h3 className="mt-1 font-display text-[1.8rem] leading-tight">{h.name}</h3>
                  <p className="mt-1.5 max-w-[56ch] text-[14.5px] leading-relaxed text-muted">{h.description}</p>
                  <p className="mt-2 text-[12.5px] text-ink/80">{h.amenities.slice(0, 4).join(" · ")}</p>
                </div>
                <div className="sm:text-right">
                  <p className="t-price text-[1.7rem] text-forest">{formatINR(h.pricePerNight)}</p>
                  <p className="t-meta">per room, per night</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12.5px] text-muted">Demo inventory with illustrative photographs — never live availability.</p>
        </div>
      </section>

      <section aria-labelledby="its-title" className="section">
        <div className="container-x">
          <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div><Eyebrow>Journeys</Eyebrow><h2 id="its-title" className="t-h2 mt-3">Routes that include {dest.name}</h2></div>
            <TextLink href="/packages">All journeys</TextLink>
          </div>
          <div className="mt-8 border-t border-line">
            {itineraries.length ? itineraries.map((p) => <PackageRow key={p.id} pkg={p} catalog={catalog} />) : <p className="py-8 text-muted">No fixed journeys include {dest.name} yet — build your own in the planner.</p>}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <ButtonLink href={`/plan-your-trip?destination=${dest.slug}`} size="lg" caps>Add {dest.name} to a journey</ButtonLink>
            <span className="text-[13.5px] text-muted">From {formatINR(price)} per person (demo estimate, {dest.recommendedNights} {dest.recommendedNights === 1 ? "night" : "nights"}).</span>
          </div>
        </div>
      </section>

      {nearby.length > 0 && (
        <section aria-labelledby="near-title" className="container-x pb-20 lg:pb-24">
          <Eyebrow>Nearby</Eyebrow>
          <h2 id="near-title" className="t-h2 mt-3">Pair it with</h2>
          <div className={cn("mt-8 grid grid-cols-2 gap-3", nearbyCols[Math.min(nearby.length, 4)])}>
            {nearby.slice(0, 4).map((n) => n && <DestinationCard key={n.id} destination={n} size="sm" className="aspect-[4/5] max-md:last:odd:col-span-2 max-md:last:odd:aspect-[16/9]" />)}
          </div>
        </section>
      )}
      <FinalCta />
    </>
  );
}
