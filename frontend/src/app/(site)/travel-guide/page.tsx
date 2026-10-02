import type { Metadata } from "next";
import { FaqSection, FinalCta } from "@/components/home/faq-and-cta";
import { SeasonalGuide } from "@/components/home/seasonal-guide";
import { Eyebrow, PageHeader } from "@/components/ui/section";
import { getDestinations } from "@/services/catalog";
import { MONTHS_SHORT } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Travel guide — best time to visit Kashmir, Jammu & Ladakh",
  description: "When to go, how to get there, what to pack and how to handle altitude. A practical guide to Kashmir, Jammu, Katra and Ladakh with month-by-month suitability and FAQs.",
  alternates: { canonical: "/travel-guide" },
  openGraph: { title: "Kashmir travel guide", description: "Best time to visit, altitude tips and practical advice.", images: ["/images/pahalgam.jpg"] },
};

const tips = [
  { title: "Getting there", body: "Fly into Srinagar (SXR), Leh (IXL) or Jammu (IXJ). Katra has its own railway station with direct trains from Delhi. Our journeys start from the airport or station." },
  { title: "What to pack", body: "Layers, always. Even summer evenings in Gulmarg and Pahalgam are cool. For Ladakh add sunscreen, lip balm, a warm hat and comfortable shoes. Winter needs thermals and waterproof boots." },
  { title: "Altitude in Ladakh", body: "Leh is at 3,500 m. Rest on day one, drink water, avoid alcohol and go up gradually — the planner asks for two nights in Leh before Nubra, Pangong or Tso Moriri." },
  { title: "ID and permits", body: "Carry a government photo ID everywhere. Protected-area permits for Nubra, Pangong and Tso Moriri are arranged by our team; foreign nationals may need additional documentation." },
  { title: "Money and connectivity", body: "ATMs are in the main towns; carry cash for ponies and small shops. Only postpaid mobile connections work in Jammu & Kashmir; expect patchy coverage in remote valleys." },
  { title: "Roads and weather", body: "Landslides, snow and pass closures happen. Build a spare day into any Ladakh trip, and take travel insurance. We share road updates before every departure." },
];

export default async function TravelGuidePage() {
  const destinations = await getDestinations();
  return (
    <>
      <PageHeader eyebrow="Travel guide" title="Know before you go" lede="The practical side of Kashmir, Jammu and Ladakh — seasons, altitude, packing and paperwork." image="tulip" />

      <section id="best-time" className="section container-x scroll-mt-20">
        <Eyebrow>Best time to visit</Eyebrow>
        <h2 className="t-h2 mt-3">Month by month</h2>
        <p className="t-lede mt-3 measure">A general guide to when each destination suits travellers, based on typical seasons — never live weather or availability.</p>
        {/* `relative` makes this the containing block for the screen-reader-only text, so nothing escapes the scroller. */}
        <div role="region" aria-label="Best months by destination — scrolls sideways on small screens" tabIndex={0} className="relative mt-8 overflow-x-auto border-y border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">
          <table className="w-full min-w-[820px] border-collapse text-center">
            <caption className="sr-only">Months that suit each destination</caption>
            <thead>
              <tr className="border-b border-line-strong">
                <th scope="col" className="t-label sticky left-0 z-10 w-44 bg-ivory p-3 pl-0 text-left !text-[10.5px] text-brass">Destination</th>
                {MONTHS_SHORT.map((m) => <th key={m} scope="col" className="t-label p-2 !text-[10.5px] text-muted">{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {destinations.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-b-0">
                  <th scope="row" className="sticky left-0 z-10 bg-ivory p-3 pl-0 text-left text-[14.5px] font-normal">{d.name}</th>
                  {MONTHS_SHORT.map((m, i) => {
                    const best = d.bestMonths.includes(i);
                    const restricted = d.restrictedMonths?.includes(i);
                    return (
                      <td key={m} className="p-1.5">
                        <span className={cn("flex h-6 items-center justify-center rounded-[2px] text-[12px] font-semibold leading-none", best ? "bg-pine/80 text-ivory" : restricted ? "bg-burgundy/25 text-burgundy" : "bg-stone/40")} title={best ? "Suits this month" : restricted ? "Access typically limited" : "Possible, not ideal"}>
                          <span aria-hidden>{best ? "✓" : restricted ? "×" : ""}</span>
                          <span className="sr-only">{best ? "Suits" : restricted ? "Limited" : "Possible"}</span>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] text-muted">
          <li className="flex items-center gap-2"><span aria-hidden className="flex h-4 w-7 items-center justify-center rounded-[2px] bg-pine/80 text-[10px] font-semibold text-ivory">✓</span> Suits this month</li>
          <li className="flex items-center gap-2"><span aria-hidden className="h-4 w-7 rounded-[2px] bg-stone/40" /> Possible, not ideal</li>
          <li className="flex items-center gap-2"><span aria-hidden className="flex h-4 w-7 items-center justify-center rounded-[2px] bg-burgundy/25 text-[11px] font-semibold text-burgundy">×</span> Access typically limited</li>
        </ul>
      </section>

      <SeasonalGuide className="band-parchment border-y border-line" heading={false} />

      <section className="section container-x">
        <Eyebrow>Practical advice</Eyebrow>
        <h2 className="t-h2 mt-3">Six things worth knowing</h2>
        <dl className="mt-10 grid gap-x-16 gap-y-9 md:grid-cols-2">
          {tips.map((t) => (
            <div key={t.title} className="border-t border-line-strong pt-4">
              <dt className="font-display text-[1.6rem] leading-tight">{t.title}</dt>
              <dd className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-muted">{t.body}</dd>
            </div>
          ))}
        </dl>
      </section>
      <FaqSection />
      <FinalCta />
    </>
  );
}
