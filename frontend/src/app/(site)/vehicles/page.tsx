import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/home/faq-and-cta";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, PageHeader } from "@/components/ui/section";
import { getDestinations, getVehicles } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Vehicles — sedan, SUV, Innova Crysta & Tempo Traveller",
  description: "Private vehicles with experienced local drivers for Kashmir, Jammu and Ladakh: Dzire sedan, Ertiga SUV, Innova Crysta premium SUV and 12-seater Tempo Traveller.",
  alternates: { canonical: "/vehicles" },
  openGraph: { title: "Choose your ride in Kashmir", description: "Sedan, SUV, premium SUV and tempo traveller with a local driver.", images: ["/images/veh-premium.jpg"] },
};

export default async function VehiclesPage() {
  const [vehicles, destinations] = await Promise.all([getVehicles(), getDestinations()]);
  return (
    <>
      <PageHeader eyebrow="Vehicles" title="The right vehicle for the road ahead" lede="Every journey includes a private vehicle with an experienced local driver — fuel, tolls and parking included. Rates are indicative daily prices; we never show live cab availability." image="magnetic-hill" />
      <section className="container-x grid gap-4 py-12 md:grid-cols-2 lg:py-16">
        {vehicles.map((v, i) => <VehicleCard key={v.id} vehicle={v} priority={i < 2} />)}
      </section>
      <section aria-labelledby="sup" className="container-x pb-20 lg:pb-28">
        <Eyebrow>Routes</Eyebrow>
        <h2 id="sup" className="t-h2 mt-3">Where each vehicle goes</h2>
        <p className="t-lede mt-3 measure">Higher passes and remote valleys need more ground clearance — the planner only offers vehicles that suit your route.</p>
        <div className="mt-8 overflow-x-auto border-y border-line-strong">
          <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-[14px]">
            <caption className="sr-only">Supported destinations by vehicle</caption>
            <thead>
              <tr className="border-b border-line-strong">
                <th scope="col" className="w-[28%] p-3 pl-0 t-label !text-[10.5px] text-brass">Destination</th>
                {vehicles.map((v) => <th key={v.id} scope="col" className="p-3 t-label !text-[10.5px] text-brass">{v.name.split(" — ")[0]}</th>)}
              </tr>
            </thead>
            <tbody>
              {destinations.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-b-0">
                  <th scope="row" className="p-3 pl-0 font-normal"><Link href={`/destinations/${d.slug}`} className="hover:text-forest">{d.name}</Link></th>
                  {vehicles.map((v) => <td key={v.id} className="p-3">{v.supportedDestinations.includes(d.id) ? <span aria-label="Supported" className="text-forest">✓</span> : <span className="text-muted" aria-label="Not recommended">—</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10"><ButtonLink href="/plan-your-trip" size="lg" caps>Build my journey</ButtonLink></div>
      </section>
      <FinalCta />
    </>
  );
}
