import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DestinationCard } from "@/components/destinations/destination-card";
import { HScroller } from "@/components/ui/h-scroller";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/motion";
import { Eyebrow } from "@/components/ui/section";
import type { Destination, Region } from "@/types/destination";

const regions: { id: Region; name: string; image: string; blurb: string }[] = [
  { id: "kashmir", name: "Kashmir", image: "pahalgam", blurb: "Lakes, meadows, snow and chinar gold." },
  { id: "jammu", name: "Jammu & Katra", image: "katra", blurb: "Temples, hill roads and the Vaishno Devi yatra." },
  { id: "ladakh", name: "Ladakh", image: "pangong", blurb: "High passes, monasteries and turquoise lakes." },
];

export function RegionExplorer({ destinations }: { destinations: Destination[] }) {
  return (
    <section id="explore" aria-labelledby="explore-title" className="scroll-mt-16 py-20 lg:py-28">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Explore</Eyebrow>
            <h2 id="explore-title" className="display-lg mt-3 max-w-3xl">
              Three regions. <span className="italic text-forest">One long conversation with the mountains.</span>
            </h2>
          </div>
          <Link href="/destinations" className="group inline-flex items-center gap-2 text-sm font-medium text-forest">
            <span className="border-b border-forest/40 pb-0.5">All destinations</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <Reveal className="mt-12 flex flex-col gap-3 lg:h-[560px] lg:flex-row">
          {regions.map((r) => {
            const list = destinations.filter((d) => d.region === r.id);
            return (
              <Link key={r.id} href={`/destinations?region=${r.id}`} className="group relative block min-h-[260px] flex-1 overflow-hidden bg-forest lg:min-h-0 lg:transition-[flex] lg:duration-[900ms] lg:ease-[var(--ease-calm)] lg:hover:flex-[1.8] lg:focus-visible:flex-[1.8]">
                <Photo k={r.image} zoom sizes="(min-width:1024px) 40vw, 100vw" />
                <div className="img-scrim absolute inset-0" aria-hidden />
                <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-8">
                  <span className="eyebrow !text-brass-soft">{list.length} destinations</span>
                  <div>
                    <h3 className="font-display text-5xl leading-none !text-ivory lg:text-6xl">{r.name}</h3>
                    <p className="mt-3 max-w-xs text-[15px] text-ivory/80">{r.blurb}</p>
                    <p className="mt-4 text-[13px] text-ivory/70">{list.slice(0, 4).map((d) => d.name).join(" · ")}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </Reveal>

        <div className="mt-16">
          <p className="eyebrow mb-4">Where to go</p>
          <HScroller label="destinations">
            {destinations.map((d) => (
              <div key={d.id} className="w-[68vw] shrink-0 snap-start sm:w-[300px] lg:w-[320px]">
                <DestinationCard destination={d} />
              </div>
            ))}
          </HScroller>
        </div>
      </div>
    </section>
  );
}
