import type { Metadata } from "next";
import { FaqSection } from "@/components/home/faq-and-cta";
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
  { title: "Getting there", body: "Fly into Srinagar (SXR), Leh (IXL) or Jammu (IXJ). Katra has its own railway station with direct trains from Delhi. Our packages start from the airport or station." },
  { title: "What to pack", body: "Layers, always. Even summer evenings in Gulmarg and Pahalgam are cool. For Ladakh add sunscreen, lip balm, a warm hat and comfortable shoes. Winter needs thermals and waterproof boots." },
  { title: "Altitude in Ladakh", body: "Leh is at 3,500 m. Rest on day one, drink water, avoid alcohol and go up gradually — our planner requires two nights in Leh before Nubra, Pangong or Tso Moriri." },
  { title: "ID and permits", body: "Carry a government photo ID everywhere. Protected-area permits for Nubra, Pangong and Tso Moriri are arranged by our team; foreign nationals may need additional documentation." },
  { title: "Money & connectivity", body: "ATMs are in the main towns; carry cash for ponies and small shops. Only postpaid mobile connections work in Jammu & Kashmir; expect patchy coverage in remote valleys." },
  { title: "Roads & weather", body: "Landslides, snow and pass closures happen. Build a spare day into any Ladakh trip and travel insurance is wise. We share road updates before every departure." },
];

export default async function TravelGuidePage() {
  const destinations = await getDestinations();
  return (
    <>
      <PageHeader eyebrow="Travel guide" title={<>Know before <span className="italic text-forest">you go</span></>} lede="The practical side of Kashmir, Jammu and Ladakh — seasons, altitude, packing and paperwork." />

      <section id="best-time" className="container-x scroll-mt-20 py-20 lg:py-24">
        <Eyebrow>Best time to visit</Eyebrow>
        <h2 className="display-md mt-3">Month by month</h2>
        <p className="mt-3 max-w-2xl text-muted">A general guide to when each destination suits travellers. It is based on typical seasons — never live weather or availability.</p>
        <div className="mt-8 overflow-x-auto border border-line">
          <table className="w-full min-w-[820px] border-collapse text-center">
            <caption className="sr-only">Months that suit each destination</caption>
            <thead>
              <tr className="bg-parchment/50">
                <th scope="col" className="w-44 p-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">Destination</th>
                {MONTHS_SHORT.map((m) => <th key={m} scope="col" className="p-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {destinations.map((d) => (
                <tr key={d.id} className="border-t border-line">
                  <th scope="row" className="p-3 text-left font-normal">{d.name}</th>
                  {MONTHS_SHORT.map((m, i) => {
                    const best = d.bestMonths.includes(i);
                    const restricted = d.restrictedMonths?.includes(i);
                    return (
                      <td key={m} className="p-1.5">
                        <span className={cn("block h-6 rounded-[2px]", best ? "bg-pine/80" : restricted ? "bg-burgundy/25" : "bg-stone/40")} title={best ? "Suits this month" : restricted ? "Access typically limited" : "Possible, not ideal"}>
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
          <li className="flex items-center gap-2"><span className="h-3 w-6 rounded-[2px] bg-pine/80" /> Suits this month</li>
          <li className="flex items-center gap-2"><span className="h-3 w-6 rounded-[2px] bg-stone/40" /> Possible, not ideal</li>
          <li className="flex items-center gap-2"><span className="h-3 w-6 rounded-[2px] bg-burgundy/25" /> Access typically limited</li>
        </ul>
      </section>

      <SeasonalGuide className="border-t border-line bg-parchment/30" heading={false} />

      <section className="container-x py-20 lg:py-24">
        <Eyebrow>Practical advice</Eyebrow>
        <h2 className="display-md mt-3">Six things worth knowing</h2>
        <div className="mt-10 grid gap-x-16 gap-y-10 md:grid-cols-2">
          {tips.map((t, i) => (
            <div key={t.title} className="grid grid-cols-[48px_1fr] gap-4 border-t border-line pt-5">
              <span className="font-display text-3xl text-brass">{String(i + 1).padStart(2, "0")}</span>
              <div><h3 className="font-display text-2xl">{t.title}</h3><p className="mt-1.5 text-[15px] leading-relaxed text-muted">{t.body}</p></div>
            </div>
          ))}
        </div>
      </section>
      <FaqSection />
    </>
  );
}
