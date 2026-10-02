"use client";

import { ArrowRight } from "lucide-react";
import { ItineraryTimeline } from "@/components/itinerary/itinerary-timeline";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, IssueList } from "@/components/ui/states";
import { styleById, tierById } from "@/data/rules";
import { tripTitle, whatsappEnquiryForTrip } from "@/lib/booking";
import { MONTHS } from "@/lib/format";
import { plural } from "@/lib/utils";
import { STEP } from "@/store/trip-store";
import { HOTEL_CATEGORY_LABEL } from "@/types/hotel";
import { PriceBreakdown } from "../price-breakdown";
import { TripStep } from "../trip-step";
import type { TripApi } from "../use-trip";

export function ReviewStep({ api }: { api: TripApi }) {
  const { trip, catalog, itinerary, stays, vehicle, issues, blocked, price, setStep } = api;
  if (!trip.stops.length) {
    return (
      <TripStep index={STEP.review} title="Your journey">
        <EmptyState title="Nothing to review yet" description="Build your route first." action={<Button onClick={() => setStep(STEP.destinations)}>Choose destinations</Button>} />
      </TripStep>
    );
  }
  const tier = tierById(trip.tier);
  const style = styleById(trip.style);
  const activities = trip.activities.map((a) => catalog.activities.find((x) => x.id === a.activityId)).filter((a) => a && a.destinationIds.some((d) => trip.stops.some((s) => s.destinationId === d)));
  const edit = (label: string, step: number) => (
    <button type="button" onClick={() => setStep(step)} className="min-h-8 text-[12.5px] font-medium text-forest underline underline-offset-4 hover:text-pine">{label}</button>
  );
  const routeLine = trip.stops.map((s) => `${catalog.destinations.find((d) => d.id === s.destinationId)?.name} (${s.nights}N)`).join(" → ");

  return (
    <TripStep index={STEP.review} title="Your journey" lede="Everything in one place. When you're happy with it, request this journey — our team will check availability and get back to you. Nothing is charged online.">
      <div className="space-y-14">
        <div className="border-y border-line-strong py-7">
          <p className="t-label !text-[10.5px] text-brass">{trip.days} days · {Math.max(trip.days - 1, 1)} nights · {tier.name}{style ? ` · ${style.label}` : ""}</p>
          <h3 className="t-h2 mt-2.5">{tripTitle(trip, catalog)}</h3>
          <p className="mt-3 text-[15px] text-ink">{routeLine}</p>
          <p className="mt-1.5 text-[13.5px] text-muted">
            {plural(trip.adults, "adult")}{trip.children ? ` + ${plural(trip.children, "child", "children")}` : ""} · from {trip.startingFrom}{trip.travelMonth != null ? ` · ${MONTHS[trip.travelMonth]}` : " · dates flexible"}
          </p>
        </div>

        <IssueList issues={issues} />

        <div className="grid gap-x-14 gap-y-10 md:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between border-b border-line-strong pb-2"><h3 className="font-display text-[1.7rem] leading-none">Stays</h3>{edit("Change", STEP.stay)}</div>
            <ul className="divide-y divide-line">
              {stays.map((s) => (
                <li key={s.destinationId} className="py-3">
                  <p className="t-label !text-[10px] text-brass">{s.destinationName} · {plural(s.nights, "night")}</p>
                  <p className="mt-0.5 font-display text-[1.3rem] leading-tight">{s.hotel?.name ?? "To be confirmed by our team"}</p>
                  {s.hotel && <p className="text-[13px] text-muted">{HOTEL_CATEGORY_LABEL[s.hotel.category].name} · {s.hotel.roomTypes[0]}</p>}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-10">
            <div>
              <div className="flex items-baseline justify-between border-b border-line-strong pb-2"><h3 className="font-display text-[1.7rem] leading-none">Vehicle</h3>{edit("Change", STEP.vehicle)}</div>
              <p className="mt-3 font-display text-[1.3rem] leading-tight">{vehicle.vehicle ? vehicle.vehicle.name : "To be arranged by our team"}{vehicle.count > 1 ? ` × ${vehicle.count}` : ""}</p>
              {vehicle.vehicle && <p className="text-[13px] text-muted">{vehicle.vehicle.model} · up to {vehicle.vehicle.passengers} guests · driver, fuel &amp; tolls included</p>}
            </div>
            <div>
              <div className="flex items-baseline justify-between border-b border-line-strong pb-2"><h3 className="font-display text-[1.7rem] leading-none">Experiences</h3>{edit("Change", STEP.experiences)}</div>
              {activities.length ? (
                <ul className="mt-3 space-y-1.5 text-[15px]">
                  {activities.map((a) => a && <li key={a.id}>{a.name} <span className="text-[13px] text-muted">· {a.duration}</span></li>)}
                </ul>
              ) : <p className="mt-3 text-sm text-muted">None added — you can add experiences later with our team too.</p>}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between border-b border-line-strong pb-2"><h3 className="font-display text-[1.7rem] leading-none">Itinerary</h3>{edit("Edit itinerary", STEP.itinerary)}</div>
          <ItineraryTimeline days={itinerary} stays={stays.map((s) => ({ destinationId: s.destinationId, hotel: s.hotel ? { name: s.hotel.name, category: s.hotel.category } : null }))} meals={tier.mealPlan} className="mt-8" />
        </div>

        <div className="grid gap-10 border-t border-line-strong pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h3 className="font-display text-[1.7rem] leading-none">Ready when you are</h3>
            <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-muted">Requesting a journey sends it to our travel team with a reference number. They&apos;ll confirm availability and finalise the details with you.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink href={blocked ? "#" : "/book"} size="lg" caps aria-disabled={blocked} className={blocked ? "pointer-events-none opacity-45" : ""}>
                Request this journey <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </ButtonLink>
              <ButtonLink href={whatsappEnquiryForTrip(trip, catalog)} variant="outline" size="lg" caps>Talk to an expert</ButtonLink>
            </div>
            {blocked && <p role="alert" className="mt-3 text-sm text-burgundy">Resolve the items marked “Needs attention” before requesting.</p>}
          </div>
          <div className="rounded-[3px] border border-line bg-paper p-6">
            <PriceBreakdown price={price} />
          </div>
        </div>
      </div>
    </TripStep>
  );
}
