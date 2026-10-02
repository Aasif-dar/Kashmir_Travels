import type { Metadata } from "next";
import { FinalCta } from "@/components/home/faq-and-cta";
import { WhyTravelWithUs } from "@/components/home/why-and-stories";
import { Photo } from "@/components/ui/photo";
import { Eyebrow, PageHeader } from "@/components/ui/section";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About us — a Srinagar travel company",
  description: `${site.name} plans Kashmir, Jammu, Katra and Ladakh journeys from Srinagar — honest estimates, realistic itineraries and real people on WhatsApp.`,
  alternates: { canonical: "/about" },
  openGraph: { title: `About ${site.name}`, description: "Local, honest, unhurried travel planning.", images: ["/images/floating-market.jpg"] },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title="Travel planned by people who know the roads" lede="We are a small team in Srinagar, and we think a good holiday in the mountains is about pace, not checklists." image="shah-hamadan" />
      <section className="section container-x grid gap-14 lg:grid-cols-2 lg:gap-24">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-forest"><Photo k="srinagar" sizes="(min-width:1024px) 45vw, 100vw" /></div>
        <div className="flex flex-col justify-center">
          <Eyebrow>Our approach</Eyebrow>
          <h2 className="t-h2 mt-3">Fewer places, better days</h2>
          <div className="mt-6 space-y-5 text-[17px] leading-[1.75] text-ink/85 measure">
            <p>Kashmir rewards slowness. The best afternoon of a trip is often the unplanned one — a kahwa stall in the old city, a pony ride that ran longer than expected, a lake that turned pink at six.</p>
            <p>So our planner is built to protect that time. It knows how long the road from Srinagar to Pahalgam really takes, why you shouldn&apos;t go up to Pangong on your first day in Leh, and which months a pass is likely to be closed.</p>
            <p>We show you an honest estimate as you plan, confirm availability with the hotels and drivers we work with, and only then finalise your trip. No false urgency, no hidden extras.</p>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line-strong pt-7">
            {[["3", "regions"], ["15", "destinations"], ["24×7", "trip support in season"]].map(([n, l]) => (
              <div key={l}><dd className="t-price text-[2.6rem] text-forest">{n}</dd><dt className="t-label mt-1.5 !text-[10px] text-muted">{l}</dt></div>
            ))}
          </dl>
        </div>
      </section>
      <WhyTravelWithUs />
      <FinalCta />
    </>
  );
}
