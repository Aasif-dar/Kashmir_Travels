import type { Metadata } from "next";
import { Suspense } from "react";
import { ActivityBrowser } from "@/components/activities/activity-browser";
import { FinalCta } from "@/components/home/faq-and-cta";
import { JsonLd } from "@/components/layout/json-ld";
import { PageHeader } from "@/components/ui/section";
import { LoadingBlock } from "@/components/ui/states";
import { site } from "@/data/site";
import { getActivities } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Experiences & activities in Kashmir, Jammu & Ladakh",
  description: "Gulmarg Gondola, skiing, snowboarding, shikara rides, horse riding, river rafting, ATV, paragliding, camping, hot-air balloon and more — with seasons, difficulty and estimated prices.",
  alternates: { canonical: "/activities" },
  openGraph: { title: "Experiences across Kashmir, Jammu & Ladakh", description: "Gondolas, shikaras, rafting, treks and camps.", images: ["/images/act-gondola.jpg"] },
};

export default async function ActivitiesPage() {
  const activities = await getActivities();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: "Experiences", itemListElement: activities.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/activities#${a.id}`, name: a.name })) }} />
      <PageHeader eyebrow="Experiences" title="Things worth getting up for" lede="From a gondola over the Gulmarg bowl to a shikara at dawn. Browse by season, place or travel style — then add them to your journey in the planner." image="act-horse" />
      <section className="container-x py-10 lg:py-14">
        <Suspense fallback={<div className="min-h-[100svh]"><LoadingBlock /></div>}>
          <ActivityBrowser />
        </Suspense>
      </section>
      <FinalCta />
    </>
  );
}
