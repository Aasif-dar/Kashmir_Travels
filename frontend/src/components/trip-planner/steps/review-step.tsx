"use client";

import { ArrowRight, MessageCircle, Pencil } from "lucide-react";
import Link from "next/link";
import { ItineraryTimeline } from "@/components/itinerary/itinerary-timeline";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, IssueList } from "@/components/ui/states";
import { tierById } from "@/data/rules";
import { tripTitle, whatsappEnquiryForTrip } from "@/lib/booking";
import { MONTHS } from "@/lib/format";
import { HOTEL_CATEGORY_LABEL } from "@/types/hotel";
import { plural } from "@/lib/utils";
import { PriceBreakdown } from "../price-breakdown";
import { TripStep } from "../trip-step";
import type { TripApi } from "../use-trip";

export function ReviewStep({ api }: { api: TripApi }) {
  const { trip, catalog, itinerary, stays, vehicle, issues, blocked, price, setStep } = api;
  if (!trip.stops.length) {
    return (
      <TripStep index={6} title="Review your trip">
        <EmptyState title="Nothing to review yet" description="Build your route first." action={<Button onClick={() => setStep(1)}>Choose destinations</Button>} />
      </TripStep>
    );
  }
  const tier = tierById(trip.tier);
  const activities = trip.activities.map((a) => catalog.activities.find((x) => x.id === a.activityId)).filter((a) => a && a.destinationIds.some((d) => trip.stops.some((s) => s.destinationId === d)));
  const edit = (label: string, step: number) => (
    <button type="button" onClick={() => setStep(step)} className="inline-flex min-h-8 items-center gap-1 text-[12.5px] font-medium text-forest underline underline-offset-4"><Pencil className="h-3 w-3" aria-hidden />{label}</button>
  );

  return (
    <TripStep index={6} title="Review your journey" lede="Everything in one place. When you're happy, request your booking — our team will check availability and get back to you. Nothing is charged online.">
      <div className="space-y-12">
        <div className="border border-forest bg-forest p-6 text-ivory sm:p-8">
          <p className="eyebrow !text-brass-soft">{trip.days} days · {Math.max(trip.days - 1, 1)} nights · {tier.name} level</p>
          <h3 className="mt-2 font-display text-4xl leading-tight !text-ivory sm:text-5xl">{tripTitle(trip, catalog)}</h3>
          <p className="mt-3 text-[14.5px] text-ivory/80">
            {plural(trip.adults, "adult")}{trip.children ? ` + ${plural(trip.children, "child", "children")}` : ""} · from {trip.startingFrom}{trip.travelMonth != null ? ` · ${MONTHS[trip.travelMonth]}` : ""}
          </p>
        </div>

        <IssueList issues={issues} />

        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between border-b border-line pb-2"><h3 className="font-display text-3xl">Stays</h3>{edit("Change", 3)}</div>
            <ul className="divide-y divide-line">
              {stays.map((s) => (
                <li key={s.destinationId} className="py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">{s.destinationName} · {plural(s.nights, "night")}</p>
                  <p className="font-display text-xl">{s.hotel?.name ?? "To be confirmed by our team"}</p>
                  {s.hotel && <p className="text-[13px] text-muted">{HOTEL_CATEGORY_LABEL[s.hotel.category].stars} {HOTEL_CATEGORY_LABEL[s.hotel.category].name} · {s.hotel.roomTypes[0]}</p>}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-10">
            <div>
              <div className="flex items-baseline justify-between border-b border-line pb-2"><h3 className="font-display text-3xl">Vehicle</h3>{edit("Change", 4)}</div>
              <p className="mt-3 font-display text-xl">{vehicle.vehicle ? vehicle.vehicle.name : "To be arranged by our team"}{vehicle.count > 1 ? ` × ${vehicle.count}` : ""}</p>
              {vehicle.vehicle && <p className="text-[13px] text-muted">{vehicle.vehicle.model} · up to {vehicle.vehicle.passengers} guests · driver, fuel &amp; tolls included</p>}
            </div>
            <div>
              <div className="flex items-baseline justify-between border-b border-line pb-2"><h3 className="font-display text-3xl">Experiences</h3>{edit("Change", 5)}</div>
              {activities.length ? (
                <ul className="mt-3 space-y-1.5 text-[15px]">
                  {activities.map((a) => a && <li key={a.id}>{a.name} <span className="text-[13px] text-muted">· {a.duration}</span></li>)}
                </ul>
              ) : <p className="mt-3 text-sm text-muted">None added — you can add experiences later with our team too.</p>}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between border-b border-line pb-2"><h3 className="font-display text-3xl">Itinerary</h3>{edit("Edit itinerary", 2)}</div>
          <ItineraryTimeline days={itinerary} stays={stays} className="mt-8" />
        </div>

        <div className="border border-line bg-paper p-6 sm:p-8">
          <h3 className="font-display text-3xl">Price estimate</h3>
          <PriceBreakdown price={price} className="mt-4" />
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={blocked ? "#" : "/book"} size="lg" aria-disabled={blocked} className={blocked ? "pointer-events-none opacity-45" : ""}>
              Continue to booking request <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href={whatsappEnquiryForTrip(trip, catalog)} variant="outline" size="lg"><MessageCircle className="h-4 w-4" aria-hidden /> Talk to an expert</ButtonLink>
          </div>
          {blocked && <p role="alert" className="text-sm text-burgundy">Resolve the items marked “Needs attention” before requesting a booking.</p>}
        </div>
        <p className="text-xs text-muted">By continuing you&apos;ll send a booking <em>request</em>. It isn&apos;t a confirmed booking until our travel team contacts you. <Link href="/travel-guide#faq" className="underline">How it works</Link></p>
      </div>
    </TripStep>
  );
}
