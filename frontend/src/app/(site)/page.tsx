import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { BuildYourOwn } from "@/components/home/build-your-own";
import { CuratedJourneys } from "@/components/home/curated-journeys";
import { FaqSection, FinalCta } from "@/components/home/faq-and-cta";
import { HandpickedStays } from "@/components/home/handpicked-stays";
import { PlannerPreview } from "@/components/home/planner-preview";
import { RegionExplorer } from "@/components/home/region-explorer";
import { SeasonalGuide } from "@/components/home/seasonal-guide";
import { SignatureExperiences } from "@/components/home/signature-experiences";
import { VehicleShowcase } from "@/components/home/vehicle-showcase";
import { TravellerStories, WhyTravelWithUs } from "@/components/home/why-and-stories";
import { JsonLd } from "@/components/layout/json-ld";
import { faqs } from "@/data/content";
import { site } from "@/data/site";
import { getCatalog, getPackages } from "@/services/catalog";

export const metadata: Metadata = {
  title: { absolute: `${site.name} — Kashmir, Jammu, Katra & Ladakh tour packages` },
  description: "Curated Kashmir, Jammu, Katra and Ladakh journeys. Build your own itinerary, pick hotels, vehicles and experiences, see a transparent estimated price and request your booking.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [catalog, packages] = await Promise.all([getCatalog(), getPackages()]);
  const destName = (id: string) => catalog.destinations.find((d) => d.id === id)?.name ?? id;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "TravelAgency", name: site.name, url: site.url, description: site.tagline, telephone: site.phone, email: site.email, address: { "@type": "PostalAddress", streetAddress: "Boulevard Road", addressLocality: "Srinagar", addressRegion: "Jammu & Kashmir", addressCountry: "IN" }, areaServed: ["Kashmir", "Jammu", "Ladakh"] },
            { "@type": "WebSite", name: site.name, url: site.url },
            { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
          ],
        }}
      />
      <Hero />
      <PlannerPreview />
      <RegionExplorer destinations={catalog.destinations} />
      <CuratedJourneys packages={packages} catalog={catalog} />
      <BuildYourOwn />
      <SignatureExperiences activities={catalog.activities} destinationName={destName} />
      <HandpickedStays hotels={catalog.hotels} destinations={catalog.destinations} />
      <VehicleShowcase vehicles={catalog.vehicles} />
      <SeasonalGuide />
      <WhyTravelWithUs />
      <TravellerStories />
      <FaqSection limit={6} />
      <FinalCta />
    </>
  );
}
