import Link from "next/link";
import { HScroller } from "@/components/ui/h-scroller";
import { Photo } from "@/components/ui/photo";
import { Eyebrow } from "@/components/ui/section";
import { formatINR } from "@/lib/format";
import type { Activity } from "@/types/activity";

const featured = ["shikara-ride", "gulmarg-gondola", "skiing", "horse-riding", "river-rafting", "camel-safari", "paragliding", "aru-camp-night", "houseboat-dinner", "hot-air-balloon"];

export function SignatureExperiences({ activities, destinationName }: { activities: Activity[]; destinationName: (id: string) => string }) {
  const list = featured.map((id) => activities.find((a) => a.id === id)).filter(Boolean) as Activity[];
  return (
    <section aria-labelledby="experiences-title" className="overflow-hidden bg-charcoal py-20 text-ivory lg:py-28">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow light>Signature experiences</Eyebrow>
            <h2 id="experiences-title" className="display-lg mt-3 max-w-3xl !text-ivory">
              Moments worth <span className="italic text-brass-soft">building a trip around</span>
            </h2>
          </div>
          <Link href="/activities" className="text-sm font-medium text-brass-soft underline underline-offset-8 decoration-brass-soft/40 hover:decoration-brass-soft">
            All experiences →
          </Link>
        </div>
        <div className="mt-10">
          <HScroller label="signature experiences" light>
            {list.map((a) => (
              <Link key={a.id} href={`/activities#${a.id}`} className="group relative block aspect-[3/4] w-[74vw] shrink-0 snap-start overflow-hidden bg-forest sm:w-[300px] lg:w-[330px]">
                <Photo k={a.image} zoom sizes="330px" />
                <div className="img-scrim absolute inset-0" aria-hidden />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/85">
                  <span>{a.destinationIds.slice(0, 2).map(destinationName).join(" · ")}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-3xl leading-tight !text-ivory">{a.name}</h3>
                  <p className="mt-2 text-[13px] text-ivory/75">{a.duration} · from {formatINR(a.price)}</p>
                </div>
              </Link>
            ))}
          </HScroller>
        </div>
      </div>
    </section>
  );
}
