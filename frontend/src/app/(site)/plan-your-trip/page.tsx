import type { Metadata } from "next";
import { Suspense } from "react";
import { TripPlanner } from "@/components/trip-planner/trip-planner";
import { LoadingBlock } from "@/components/ui/states";
import { Eyebrow } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Build your journey — plan your Kashmir trip",
  description: "Build your own Kashmir, Jammu, Katra or Ladakh itinerary in eight steps: duration, destinations, style, itinerary, stays, vehicle and experiences — with a live estimated price.",
  alternates: { canonical: "/plan-your-trip" },
  openGraph: { title: "Build your journey", description: "A personal trip planner for Kashmir, Jammu, Katra and Ladakh with live estimates.", images: ["/images/hero-dal.jpg"] },
};

export default function PlanYourTripPage() {
  return (
    <div className="pt-[68px] lg:pt-[76px]">
      <header className="border-b border-line">
        <div className="container-x flex flex-wrap items-end justify-between gap-x-10 gap-y-3 py-7 sm:py-9">
          <div>
            <Eyebrow>Build your journey</Eyebrow>
            <h1 className="t-h2 mt-2">Your route, your pace</h1>
          </div>
          <p className="max-w-md text-[13.5px] leading-relaxed text-muted">Your journey saves automatically in this browser. Prices are estimates — nothing is charged, and nothing is booked until our team confirms.</p>
        </div>
      </header>
      <Suspense fallback={<div className="container-x min-h-[100svh] py-12"><LoadingBlock label="Loading the planner…" /></div>}>
        <TripPlanner />
      </Suspense>
    </div>
  );
}
