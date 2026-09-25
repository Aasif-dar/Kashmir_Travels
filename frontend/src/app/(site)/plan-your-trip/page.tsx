import type { Metadata } from "next";
import { Suspense } from "react";
import { TripPlanner } from "@/components/trip-planner/trip-planner";
import { LoadingBlock } from "@/components/ui/states";
import { Eyebrow } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Plan your Kashmir trip — build your itinerary",
  description: "Build your own Kashmir, Jammu, Katra or Ladakh itinerary in seven steps: duration, destinations, day-by-day plan, hotels, vehicle and activities — with a live estimated price.",
  alternates: { canonical: "/plan-your-trip" },
  openGraph: { title: "Plan your Kashmir trip", description: "A personal trip planner for Kashmir, Jammu, Katra and Ladakh with live estimates.", images: ["/images/hero-dal.jpg"] },
};

export default function PlanYourTripPage() {
  return (
    <div className="pt-[60px] lg:pt-16">
      <header className="border-b border-line bg-parchment/50 bg-jaali">
        <div className="container-x flex flex-wrap items-end justify-between gap-4 py-8 sm:py-10">
          <div>
            <Eyebrow>Trip planner</Eyebrow>
            <h1 className="display-md mt-2">Build your Kashmir holiday</h1>
          </div>
          <p className="max-w-md text-sm text-muted">Your plan saves automatically in this browser. Prices are demo estimates — nothing is charged and nothing is booked until our team confirms.</p>
        </div>
      </header>
      <Suspense fallback={<div className="container-x py-12"><LoadingBlock label="Loading planner…" /></div>}>
        <TripPlanner />
      </Suspense>
    </div>
  );
}
