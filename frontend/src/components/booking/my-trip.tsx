"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { ItineraryTimeline } from "@/components/itinerary/itinerary-timeline";
import { PriceBreakdown } from "@/components/trip-planner/price-breakdown";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState, LoadingBlock } from "@/components/ui/states";
import { Eyebrow } from "@/components/ui/section";
import { tierById } from "@/data/rules";
import { whatsappEnquiryForBooking } from "@/lib/booking";
import { addDays, formatDate } from "@/lib/format";
import { plural } from "@/lib/utils";
import { customerStatusOf, type Booking } from "@/types/booking";
import { CustomerStatusBadge, StatusTracker } from "./booking-status";
import { useBooking } from "./use-booking";

export function tripDates(b: Booking) {
  const start = b.customer.travelDate;
  const end = addDays(start, b.trip.config.days - 1);
  return { start: formatDate(start, { day: "numeric", month: "short", year: "numeric" }), end: formatDate(end, { day: "numeric", month: "short", year: "numeric" }) };
}

export function MyTrip({ bookingId }: { bookingId: string }) {
  const { state, reload } = useBooking(bookingId);
  if (state.status === "loading") return <div className="container-x min-h-[100svh] pb-24 pt-36"><LoadingBlock label="Loading your trip…" /></div>;
  if (state.status === "missing") {
    return (
      <div className="container-x min-h-[100svh] pb-24 pt-36">
        <ErrorState title="We couldn't find that trip" description={`No booking with reference ${bookingId} was found in this browser. In this demo, bookings are stored on the device where they were requested.`} action={<><ButtonLink href="/my-trip">Try another reference</ButtonLink><ButtonLink variant="outline" href="/plan-your-trip">Plan a trip</ButtonLink></>} />
      </div>
    );
  }
  if (state.status === "error") return <div className="container-x min-h-[100svh] pb-24 pt-36"><ErrorState description={state.message} action={<button className="underline" onClick={() => void reload()}>Try again</button>} /></div>;

  const b = state.booking;
  const t = b.trip;
  const dates = tripDates(b);
  const stays = t.hotels.map((h) => ({ destinationId: h.destinationId, hotel: { name: h.name, category: h.category } }));
  const meals = tierById(t.config.tier).mealPlan;

  return (
    <div className="pt-[68px] lg:pt-[76px]">
      <header className="border-b border-line">
        <div className="container-x py-10 sm:py-14">
          <Eyebrow>My trip · {b.id}</Eyebrow>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="t-h1 max-w-3xl">{t.packageName}</h1>
              <p className="mt-3 text-[17px] text-muted">{dates.start} – {dates.end} · {plural(t.config.days, "day")} · {plural(b.customer.adults + b.customer.children, "traveller")}</p>
            </div>
            <CustomerStatusBadge status={customerStatusOf(b.status)} className="text-[12px]" />
          </div>
          <div className="mt-8 max-w-3xl"><StatusTracker status={b.status} /></div>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={`/my-trip/${b.id}/print`} size="lg" caps>Print itinerary</ButtonLink>
            <ButtonLink href={whatsappEnquiryForBooking(b)} variant="gold" size="lg" caps>WhatsApp us</ButtonLink>
            <ButtonLink href={`/contact?booking=${b.id}`} variant="outline" size="lg" caps>Contact a travel expert</ButtonLink>
          </div>
          {customerStatusOf(b.status) === "Inquiry Received" && <p className="mt-5 max-w-2xl text-sm text-muted">Our travel team will contact you shortly to confirm availability and finalize your booking.</p>}
        </div>
      </header>

      <div className="container-x grid gap-14 py-14 lg:grid-cols-[1fr_380px] lg:gap-16 lg:py-20">
        <div className="min-w-0 space-y-16">
          <section aria-labelledby="ov-title">
            <h2 id="ov-title" className="t-h2">Overview</h2>
            <dl className="mt-6 grid gap-x-10 gap-y-6 border-y border-line py-6 sm:grid-cols-2">
              <div><dt className="eyebrow">Route</dt><dd className="mt-1.5 text-[15px]">{t.destinations.map((d) => `${d.name} (${d.nights}N)`).join(" → ")}</dd></div>
              <div><dt className="eyebrow">Level</dt><dd className="mt-1.5 text-[15px]">{t.tierName}</dd></div>
              <div><dt className="eyebrow">Vehicle</dt><dd className="mt-1.5 text-[15px]">{t.vehicle ? `${t.vehicle.name}${t.vehicle.count > 1 ? ` × ${t.vehicle.count}` : ""}` : "To be arranged"}</dd></div>
              <div><dt className="eyebrow">Pickup</dt><dd className="mt-1.5 text-[15px]">{b.customer.pickupLocation}</dd></div>
            </dl>
          </section>

          <section aria-labelledby="tl-title">
            <h2 id="tl-title" className="t-h2">Your itinerary</h2>
            <ItineraryTimeline days={t.itinerary} stays={stays} meals={meals} startDate={b.customer.travelDate} className="mt-8" />
          </section>

          <section aria-labelledby="st-title" className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 id="st-title" className="font-display text-[1.9rem] leading-none">Stays</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {t.hotels.map((h) => (
                  <li key={h.destinationId} className="py-3"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">{h.destinationName} · {plural(h.nights, "night")}</p><p className="font-display text-xl">{h.name}</p>{h.roomType && <p className="text-[13px] text-muted">{h.roomType}</p>}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-[1.9rem] leading-none">Experiences</h2>
              {t.activities.length ? (
                <ul className="mt-4 divide-y divide-line border-y border-line">{t.activities.map((a) => <li key={a.id} className="py-3"><p className="font-display text-xl">{a.name}</p><p className="text-[13px] text-muted">{a.destinationName}</p></li>)}</ul>
              ) : <p className="mt-4 text-sm text-muted">No activities added.</p>}
            </div>
          </section>

          <section aria-labelledby="inc-title" className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 id="inc-title" className="font-display text-3xl">Included</h2>
              <ul className="mt-4 space-y-2">{t.inclusions.map((x) => <li key={x} className="flex gap-2.5 text-[14.5px]"><Check className="mt-1 h-4 w-4 shrink-0 text-pine" aria-hidden />{x}</li>)}</ul>
            </div>
            <div>
              <h2 className="font-display text-3xl">Not included</h2>
              <ul className="mt-4 space-y-2">{t.exclusions.map((x) => <li key={x} className="flex gap-2.5 text-[14.5px] text-ink/80"><X className="mt-1 h-4 w-4 shrink-0 text-burgundy" aria-hidden />{x}</li>)}</ul>
            </div>
          </section>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line bg-paper p-6">
            <h2 className="font-display text-3xl">Traveller details</h2>
            <dl className="mt-4 divide-y divide-line text-[14.5px]">
              {[["Name", b.customer.fullName], ["Email", b.customer.email], ["Phone", b.customer.phone], ["Travellers", `${plural(b.customer.adults, "adult")}${b.customer.children ? `, ${plural(b.customer.children, "child", "children")}` : ""}`], ["Requested", formatDate(b.createdAt)], ...(b.customer.specialRequests ? [["Requests", b.customer.specialRequests]] : [])].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[86px_1fr] gap-3 py-2.5"><dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brass">{k}</dt><dd className="break-words">{v}</dd></div>
              ))}
            </dl>
          </div>
          <div className="border border-line bg-paper p-6">
            <h2 className="font-display text-3xl">Price summary</h2>
            <PriceBreakdown price={t.price} className="mt-4" animated={false} />
          </div>
          <p className="text-xs text-muted">Need a change? <Link href={`/contact?booking=${b.id}`} className="underline">Contact your travel expert</Link> — quote the reference {b.id}.</p>
        </aside>
      </div>
    </div>
  );
}
