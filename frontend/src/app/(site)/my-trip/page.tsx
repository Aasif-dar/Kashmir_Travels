import type { Metadata } from "next";
import { LookupForm } from "@/components/booking/lookup-form";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "My trip — find your booking",
  description: "Look up your booking request with your reference number to see your itinerary, hotels, vehicle, activities and status.",
  robots: { index: false },
};

export default function MyTripLookupPage() {
  return (
    <>
      <PageHeader eyebrow="My trip" title={<>Find your <span className="italic text-forest">journey</span></>} lede="Enter the reference from your confirmation page to see your itinerary, stays, vehicle and booking status." />
      <section className="container-x grid gap-16 py-16 lg:grid-cols-[1fr_1fr] lg:py-24">
        <LookupForm />
        <div className="border-l-2 border-brass pl-6 text-[15px] leading-relaxed text-muted">
          <p className="font-display text-2xl text-charcoal">Haven&apos;t booked yet?</p>
          <p className="mt-2">Build a trip in a few minutes and send a request — you&apos;ll get a reference right away.</p>
          <ButtonLink href="/plan-your-trip" className="mt-5">Plan My Trip</ButtonLink>
          <p className="mt-8 text-sm">Demo tip: the sample bookings that appear in the admin area can be opened here too, for example <strong className="text-forest">KT-2026-1032</strong>.</p>
        </div>
      </section>
    </>
  );
}
