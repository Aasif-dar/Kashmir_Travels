import type { Metadata } from "next";
import { HotelBrowser } from "@/components/hotels/hotel-browser";
import { PageHeader } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Hotels & stays — houseboats, lodges and camps",
  description: "Comfort, premium and luxury stays for every destination — from Dal Lake houseboats to Nubra camps. Demo inventory with estimated nightly rates.",
  alternates: { canonical: "/hotels" },
  openGraph: { title: "Handpicked stays across Kashmir, Jammu & Ladakh", description: "Comfort, premium and luxury options for every destination.", images: ["/images/hotel-houseboat.jpg"] },
};

export default function HotelsPage() {
  return (
    <>
      <PageHeader eyebrow="Stays" title={<>A bed that belongs <span className="italic text-forest">to the place</span></>} lede="Every destination has a comfort, premium and luxury option. Names, rates and photos here are demo inventory for illustration — availability is always confirmed by our team." />
      <section className="container-x py-12 lg:py-16"><HotelBrowser /></section>
    </>
  );
}
