import type { Metadata } from "next";
import { FinalCta } from "@/components/home/faq-and-cta";
import { HotelBrowser } from "@/components/hotels/hotel-browser";
import { PageHeader } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Stays — houseboats, lodges and camps",
  description: "Comfort, premium and luxury stays for every destination — from Dal Lake houseboats to Nubra camps. Demo inventory with estimated nightly rates.",
  alternates: { canonical: "/hotels" },
  openGraph: { title: "Handpicked stays across Kashmir, Jammu & Ladakh", description: "Comfort, premium and luxury options for every destination.", images: ["/images/hotel-houseboat.jpg"] },
};

export default function HotelsPage() {
  return (
    <>
      <PageHeader eyebrow="Stays" title="Handpicked stays across the valley" lede="Places chosen to complement your journey — three for every destination, from comfortable guest houses to heirloom houseboats and high-desert tents. Names, rates and photographs are demo inventory; availability is always confirmed by our team." image="hotel-cottage-2" />
      <section className="container-x py-10 lg:py-14"><HotelBrowser /></section>
      <FinalCta />
    </>
  );
}
