import type { Metadata } from "next";
import { WhyTravelWithUs } from "@/components/home/why-and-stories";
import { FinalCta } from "@/components/home/faq-and-cta";
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
      <PageHeader eyebrow="About" title={<>Travel planned by people <span className="italic text-forest">who know the roads</span></>} lede="We are a small Srinagar team that believes a good holiday in the mountains is about pace, not checklists." />
      <section className="container-x grid gap-14 py-20 lg:grid-cols-2 lg:gap-24 lg:py-28">
        <div className="relative aspect-[4/5] overflow-hidden bg-forest"><Photo k="srinagar" sizes="(min-width:1024px) 45vw, 100vw" /></div>
        <div className="flex flex-col justify-center">
          <Eyebrow>Our approach</Eyebrow>
          <h2 className="display-md mt-3">Fewer places, better days</h2>
          <div className="mt-6 space-y-5 text-[17px] leading-[1.75] text-ink/85">
            <p>Kashmir rewards slowness. The best afternoon of a trip is often the unplanned one — a kahwa stall in the old city, a pony ride that ran longer than expected, a lake that turned pink at 6 pm.</p>
            <p>So our planner is built to protect that time. It knows how long the road from Srinagar to Pahalgam really takes, why you shouldn&apos;t go up to Pangong on your first day in Leh, and which months a pass is likely to be closed.</p>
            <p>We show you an honest estimate as you plan, confirm availability with the hotels and drivers we work with, and only then finalise your trip. No fake urgency, no hidden extras.</p>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
            {[["3", "regions covered"], ["15", "destinations"], ["24×7", "trip support in season"]].map(([n, l]) => (
              <div key={l}><dd className="font-display text-5xl text-forest">{n}</dd><dt className="mt-1 text-[12px] uppercase tracking-[0.14em] text-muted">{l}</dt></div>
            ))}
          </dl>
        </div>
      </section>
      <WhyTravelWithUs />
      <FinalCta />
    </>
  );
}
