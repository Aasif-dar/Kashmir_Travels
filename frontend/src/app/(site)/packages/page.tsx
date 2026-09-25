import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageBrowser } from "@/components/packages/package-browser";
import { PackageComparison } from "@/components/packages/package-comparison";
import { FinalCta } from "@/components/home/faq-and-cta";
import { PageHeader, Eyebrow } from "@/components/ui/section";
import { LoadingBlock } from "@/components/ui/states";
import { packageTierPrice } from "@/lib/starting-price";
import { getCatalog, getPackage } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Kashmir, Jammu, Katra & Ladakh tour packages",
  description: "Curated Kashmir packages — Essentials, Winter Escape, Grand Journey, Kashmir + Katra, Ladakh Explorer and more. Filter by region, duration, budget and season, then customise any journey.",
  alternates: { canonical: "/packages" },
  openGraph: { title: "Curated journeys across Kashmir, Jammu & Ladakh", description: "Start from a proven route, then customise it in the planner.", images: ["/images/pahalgam.jpg"] },
};

export default async function PackagesPage() {
  const [catalog, sample] = await Promise.all([getCatalog(), getPackage("kashmir-grand-journey")]);
  const prices = sample ? { basic: packageTierPrice(sample, catalog, "basic"), comfort: packageTierPrice(sample, catalog, "comfort"), premium: packageTierPrice(sample, catalog, "premium") } : undefined;
  return (
    <>
      <PageHeader eyebrow="Packages" title={<>Journeys we&apos;d take <span className="italic text-forest">ourselves</span></>} lede="Every package is a starting point. Open one, change anything — destinations, hotels, vehicle, activities — and the price moves with you." />
      <section className="container-x py-12 lg:py-16">
        <Suspense fallback={<LoadingBlock label="Loading journeys…" />}>
          <PackageBrowser />
        </Suspense>
      </section>
      <section aria-labelledby="compare-title" className="border-t border-line bg-parchment/40 py-20 lg:py-28">
        <div className="container-x">
          <Eyebrow>Compare levels</Eyebrow>
          <h2 id="compare-title" className="display-lg mt-3 max-w-3xl">Basic, Comfort or Premium?</h2>
          <p className="lede mt-4 max-w-2xl">The same route at three levels of comfort. Example prices below are for the {sample?.name ?? "Kashmir Grand Journey"}, two adults.</p>
          <PackageComparison className="mt-10" prices={prices} priceLabel={`${sample?.name ?? "Example"} · per person`} />
        </div>
      </section>
      <FinalCta />
    </>
  );
}
