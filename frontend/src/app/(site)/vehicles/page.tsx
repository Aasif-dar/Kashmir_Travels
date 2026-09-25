import type { Metadata } from "next";
import Link from "next/link";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/section";
import { getDestinations, getVehicles } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Vehicles — sedan, SUV, Innova Crysta & Tempo Traveller",
  description: "Private vehicles with experienced local drivers for Kashmir, Jammu and Ladakh: Dzire sedan, Ertiga SUV, Innova Crysta premium SUV and 12-seater Tempo Traveller.",
  alternates: { canonical: "/vehicles" },
  openGraph: { title: "Choose your ride in Kashmir", description: "Sedan, SUV, premium SUV and tempo traveller with a local driver.", images: ["/images/veh-premium.jpg"] },
};

export default async function VehiclesPage() {
  const [vehicles, destinations] = await Promise.all([getVehicles(), getDestinations()]);
  const dn = (id: string) => destinations.find((d) => d.id === id)?.name ?? id;
  return (
    <>
      <PageHeader eyebrow="Vehicles" title={<>The right vehicle for <span className="italic text-forest">the road ahead</span></>} lede="Every trip includes a private vehicle with an experienced local driver — fuel, tolls and parking included. Rates are indicative daily prices; we never show live cab availability." />
      <section className="container-x space-y-4 py-12 lg:py-16">
        {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
      </section>
      <section aria-labelledby="sup" className="container-x pb-24">
        <h2 id="sup" className="display-md">Where each vehicle goes</h2>
        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
            <caption className="sr-only">Supported destinations by vehicle</caption>
            <thead><tr className="bg-parchment/50"><th scope="col" className="p-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">Destination</th>{vehicles.map((v) => <th key={v.id} scope="col" className="p-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">{v.name.split(" — ")[0]}</th>)}</tr></thead>
            <tbody>
              {destinations.map((d) => (
                <tr key={d.id} className="border-t border-line">
                  <th scope="row" className="p-3 font-normal"><Link href={`/destinations/${d.slug}`} className="hover:text-forest">{dn(d.id)}</Link></th>
                  {vehicles.map((v) => <td key={v.id} className="p-3">{v.supportedDestinations.includes(d.id) ? <span aria-label="Supported">✓</span> : <span className="text-muted" aria-label="Not recommended">—</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8"><ButtonLink href="/plan-your-trip" size="lg">Pick a vehicle in the planner</ButtonLink></div>
      </section>
    </>
  );
}
