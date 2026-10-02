import Link from "next/link";
import { TextLink } from "@/components/ui/button";
import { HScroller } from "@/components/ui/h-scroller";
import { Photo } from "@/components/ui/photo";
import { Eyebrow } from "@/components/ui/section";
import { formatINR } from "@/lib/format";
import { experienceLabel } from "@/lib/experience-groups";
import { cn } from "@/lib/utils";
import type { Activity } from "@/types/activity";

const featured = ["gulmarg-gondola", "shikara-ride", "skiing", "horse-riding", "camel-safari", "paragliding", "river-rafting", "houseboat-dinner", "aru-camp-night", "hot-air-balloon"];

/** Dark, photographic interlude. Tiles vary in width so the scroller has a rhythm of its own. */
export function SignatureExperiences({ activities, destinationName }: { activities: Activity[]; destinationName: (id: string) => string }) {
  const list = featured.map((id) => activities.find((a) => a.id === id)).filter(Boolean) as Activity[];
  return (
    <section aria-labelledby="experiences-title" className="section band-charcoal overflow-hidden">
      <div className="container-x">
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <Eyebrow light>Signature experiences</Eyebrow>
            <h2 id="experiences-title" className="t-h2 mt-3 max-w-2xl !text-ivory">Moments worth building a trip around</h2>
          </div>
          <TextLink href="/activities" onDark>All experiences</TextLink>
        </div>
        <div className="mt-9">
          <HScroller label="signature experiences" light>
            {list.map((a, i) => (
              <Link key={a.id} href={`/activities#${a.id}`} className={cn("group relative block aspect-[3/4] shrink-0 snap-start overflow-hidden rounded-[3px] bg-forest", i === 0 ? "w-[82vw] sm:w-[440px] lg:w-[480px]" : "w-[68vw] sm:w-[290px] lg:w-[320px]")}>
                <Photo k={a.image} zoom sizes={i === 0 ? "960px" : "640px"} />
                <div className="scrim-caption absolute inset-0" aria-hidden />
                <p className="absolute left-5 top-4 font-display text-[1.05rem] text-ivory/80">{String(i + 1).padStart(2, "0")}</p>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="t-label !text-[10px] text-brass-soft">{experienceLabel(a)} · {a.destinationIds.slice(0, 2).map(destinationName).join(" / ")}</p>
                  <h3 className={cn("mt-2 font-display leading-[1.02] !text-ivory", i === 0 ? "text-[2.3rem]" : "text-[1.85rem]")}>{a.name}</h3>
                  <p className="mt-2 text-[13px] text-ivory/75">{a.duration} · from {formatINR(a.price)}{a.priceUnit === "group" ? " / group" : ""}</p>
                </div>
              </Link>
            ))}
          </HScroller>
        </div>
      </div>
    </section>
  );
}
