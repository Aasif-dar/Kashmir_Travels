import Link from "next/link";
import { DestinationCard } from "@/components/destinations/destination-card";
import { TextLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/motion";
import { Eyebrow } from "@/components/ui/section";
import type { Destination } from "@/types/destination";

const byId = (list: Destination[], id: string) => list.find((d) => d.id === id);

function RegionPanel({ href, title, image, names, blurb }: { href: string; title: string; image: string; names: string[]; blurb: string }) {
  return (
    <Link href={href} className="group relative block aspect-[16/11] overflow-hidden rounded-[3px] bg-forest sm:aspect-[16/10]">
      <Photo k={image} zoom sizes="(min-width:1024px) 50vw, 100vw" />
      <div className="img-scrim-bottom absolute inset-0" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
        <p className="t-label !text-[10px] text-ivory/80">{names.join(" · ")}</p>
        <h3 className="mt-2 font-display text-[clamp(2rem,3.4vw,2.9rem)] leading-none !text-ivory">{title}</h3>
        <p className="mt-2 max-w-[34ch] text-[14px] text-ivory/85">{blurb}</p>
      </div>
    </Link>
  );
}

/**
 * Editorial destination mosaic — one large, one medium, two small tiles for the Valley, then two wider
 * panels for the regions beyond it. Deliberately not a row of identical cards.
 */
export function RegionExplorer({ destinations }: { destinations: Destination[] }) {
  const gulmarg = byId(destinations, "gulmarg");
  const pahalgam = byId(destinations, "pahalgam");
  const sonamarg = byId(destinations, "sonamarg");
  const doodh = byId(destinations, "doodhpathri");
  const regions = [
    { label: "Kashmir", items: destinations.filter((d) => d.region === "kashmir") },
    { label: "Jammu & Katra", items: destinations.filter((d) => d.region === "jammu") },
    { label: "Ladakh", items: destinations.filter((d) => d.region === "ladakh") },
  ];
  return (
    <section id="explore" aria-labelledby="explore-title" className="section scroll-mt-16">
      <div className="container-x">
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <Eyebrow>Kashmir · Jammu · Ladakh</Eyebrow>
            <h2 id="explore-title" className="t-h2 mt-3 max-w-2xl">Start with the place that calls to you</h2>
          </div>
          <TextLink href="/destinations">All 15 destinations</TextLink>
        </div>

        <Reveal className="mt-10 grid gap-3 lg:h-[680px] lg:grid-cols-12 lg:grid-rows-2">
          {gulmarg && <DestinationCard destination={gulmarg} size="lg" priority className="aspect-[4/5] lg:col-span-7 lg:row-span-2 lg:aspect-auto" />}
          {pahalgam && <DestinationCard destination={pahalgam} size="md" className="aspect-[16/10] lg:col-span-5 lg:aspect-auto" />}
          <div className="grid grid-cols-2 gap-3 lg:col-span-5">
            {sonamarg && <DestinationCard destination={sonamarg} size="sm" className="aspect-[4/5] lg:aspect-auto" />}
            {doodh && <DestinationCard destination={doodh} size="sm" className="aspect-[4/5] lg:aspect-auto" />}
          </div>
        </Reveal>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <RegionPanel href="/destinations?region=jammu" title="Jammu & Katra" image="katra" names={["Jammu", "Katra", "Patnitop"]} blurb="Temples, hill roads and the Vaishno Devi yatra." />
          <RegionPanel href="/destinations?region=ladakh" title="Ladakh" image="pangong" names={["Leh", "Nubra", "Pangong"]} blurb="High passes, monasteries and turquoise lakes." />
        </div>

        <nav aria-label="All destinations" className="mt-12 grid gap-x-10 gap-y-6 border-t border-line pt-6 sm:grid-cols-3">
          {regions.map((r) => (
            <div key={r.label}>
              <p className="t-label !text-[10.5px] text-brass">{r.label}</p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14.5px]">
                {r.items.map((d) => (
                  <li key={d.id}>
                    <Link href={`/destinations/${d.slug}`} className="inline-flex min-h-8 items-center text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-forest hover:decoration-forest">{d.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </section>
  );
}
