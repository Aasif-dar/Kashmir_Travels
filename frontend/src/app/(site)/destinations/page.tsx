import type { Metadata } from "next";
import Link from "next/link";
import { DestinationCard } from "@/components/destinations/destination-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { PageHeader } from "@/components/ui/section";
import { FinalCta } from "@/components/home/faq-and-cta";
import { cn } from "@/lib/utils";
import { getDestinations } from "@/services/catalog";
import type { Region } from "@/types/destination";

export const metadata: Metadata = {
  title: "Destinations — Kashmir, Jammu, Katra & Ladakh",
  description: "Explore Srinagar, Gulmarg, Pahalgam, Sonamarg, Doodhpathri, Yusmarg, Gurez, Jammu, Katra, Patnitop, Leh, Nubra Valley, Pangong Lake and more — with recommended stays, seasons and experiences.",
  alternates: { canonical: "/destinations" },
  openGraph: { title: "Destinations across Kashmir, Jammu & Ladakh", description: "Editorial guides to every place on the route, with recommended stays, seasons and experiences.", images: ["/images/srinagar.jpg"] },
};

const tabs: { id: Region | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "kashmir", label: "Kashmir" },
  { id: "jammu", label: "Jammu & Katra" },
  { id: "ladakh", label: "Ladakh" },
];

export default async function DestinationsPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams;
  const active = tabs.find((t) => t.id === region)?.id ?? "all";
  const all = await getDestinations();
  const list = active === "all" ? all : all.filter((d) => d.region === active);
  return (
    <>
      <PageHeader eyebrow="Destinations" title={<>Where the road <span className="italic text-forest">takes you</span></>} lede="Fifteen places across three regions, each with its own season, pace and character. Pick a few and the planner will make sure they fit together.">
        <nav aria-label="Filter by region" className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-b border-line">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={t.id === "all" ? "/destinations" : `/destinations?region=${t.id}`}
              aria-current={active === t.id ? "page" : undefined}
              className={cn("-mb-px min-h-11 border-b-2 pb-2 pt-2 font-display text-2xl transition-colors", active === t.id ? "border-forest text-forest" : "border-transparent text-muted hover:text-forest")}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </PageHeader>
      <section className="container-x py-14 lg:py-20">
        {list.length === 0 ? (
          <EmptyState title="No destinations here yet" description="Try another region." action={<ButtonLink href="/destinations">See all destinations</ButtonLink>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((d, i) => (
              <DestinationCard key={d.id} destination={d} priority={i < 4} className={i === 0 && list.length > 4 ? "lg:col-span-2 lg:row-span-2 lg:aspect-auto" : undefined} />
            ))}
          </div>
        )}
      </section>
      <FinalCta />
    </>
  );
}
