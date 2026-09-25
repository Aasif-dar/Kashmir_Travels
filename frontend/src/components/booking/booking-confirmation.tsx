"use client";

import { CheckCircle2, Copy, Download, Eye, Headset, MessageCircle } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState, LoadingBlock } from "@/components/ui/states";
import { Reveal } from "@/components/ui/motion";
import { whatsappEnquiryForBooking } from "@/lib/booking";
import { formatDate, formatINR } from "@/lib/format";
import { customerStatusOf } from "@/types/booking";
import { plural } from "@/lib/utils";
import { CustomerStatusBadge } from "./booking-status";
import { useBooking } from "./use-booking";

export function BookingConfirmation({ bookingId }: { bookingId: string }) {
  const { state, reload } = useBooking(bookingId);
  const [copied, setCopied] = useState(false);

  if (state.status === "loading") return <div className="container-x pb-24 pt-36"><LoadingBlock label="Loading your booking…" /></div>;
  if (state.status === "missing") {
    return (
      <div className="container-x pb-24 pt-36">
        <ErrorState title="We couldn't find that booking" description={`There's no booking with reference ${bookingId} saved in this browser. Requests are stored on the device where they were made in this demo.`} action={<><ButtonLink href="/my-trip">Look up a booking</ButtonLink><ButtonLink variant="outline" href="/plan-your-trip">Plan a trip</ButtonLink></>} />
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="container-x pb-24 pt-36">
        <ErrorState description={state.message} action={<button onClick={() => void reload()} className="text-sm underline">Try again</button>} />
      </div>
    );
  }
  const b = state.booking;
  const status = customerStatusOf(b.status);
  const copy = async () => {
    try { await navigator.clipboard.writeText(b.id); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  return (
    <div className="pb-24 pt-[60px] lg:pt-16">
      <section className="relative overflow-hidden bg-forest text-ivory">
        <div className="absolute inset-0 bg-jaali-light opacity-60" aria-hidden />
        <div className="container-x relative py-16 sm:py-24">
          <CheckCircle2 className="h-10 w-10 text-brass-soft" aria-hidden />
          <p className="eyebrow mt-6 !text-brass-soft">Request received</p>
          <h1 className="display-lg mt-3 max-w-4xl !text-ivory">Your Kashmir journey is taking shape.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory/85">Our travel team will contact you shortly to confirm availability and finalize your booking.</p>
          <div className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/60">Booking reference</p>
              <p className="mt-1 flex items-center gap-3 font-display text-5xl tracking-wide text-ivory sm:text-6xl" data-testid="booking-ref">
                {b.id}
                <button type="button" onClick={copy} className="grid h-10 w-10 place-items-center rounded-full border border-white/30 text-ivory hover:bg-white/10" aria-label="Copy booking reference"><Copy className="h-4 w-4" /></button>
              </p>
              <p role="status" className="mt-1 h-4 text-xs text-brass-soft">{copied ? "Reference copied" : ""}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/60">Status</p>
              <CustomerStatusBadge status={status} className="mt-2 !border-brass-soft !bg-transparent !text-brass-soft" />
            </div>
          </div>
        </div>
      </section>

      <div className="container-x grid gap-12 py-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <Reveal>
          <h2 className="font-display text-4xl">Your request</h2>
          <dl className="mt-6 divide-y divide-line border-y border-line text-[15px]">
            {[
              ["Customer", `${b.customer.fullName} · ${b.customer.email}`],
              ["Travel dates", `${formatDate(b.customer.travelDate, { day: "numeric", month: "long", year: "numeric" })} (${b.trip.config.days} days)`],
              ["Travellers", `${plural(b.customer.adults, "adult")}${b.customer.children ? `, ${plural(b.customer.children, "child", "children")}` : ""}`],
              ["Package", `${b.trip.packageName} · ${b.trip.tierName} level`],
              ["Destinations", b.trip.destinations.map((d) => `${d.name} (${d.nights}N)`).join(" → ")],
              ["Hotels", b.trip.hotels.map((h) => `${h.name} (${h.destinationName})`).join(" · ")],
              ["Vehicle", b.trip.vehicle ? `${b.trip.vehicle.name}${b.trip.vehicle.count > 1 ? ` × ${b.trip.vehicle.count}` : ""}` : "To be arranged"],
              ["Activities", b.trip.activities.length ? b.trip.activities.map((a) => a.name).join(", ") : "None added"],
            ].map(([k, v]) => (
              <div key={k} className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <div className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass">Estimated amount</dt>
              <dd><span className="font-display text-3xl text-forest">{formatINR(b.trip.price.total)}</span> <span className="text-sm text-muted">· {formatINR(b.trip.price.perPerson)} per person · demo estimate</span></dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.1} className="space-y-8">
          <div className="border border-line bg-paper p-6">
            <h2 className="font-display text-3xl">What happens next</h2>
            <ol className="mt-5 space-y-5">
              {[
                ["Our team reviews", "We check hotels, vehicle and activity availability for your dates."],
                ["We contact you", "Expect a call or WhatsApp — usually within one working day."],
                ["You confirm", "We share the final quote. Nothing is booked or charged until you agree."],
              ].map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[32px_1fr] gap-3">
                  <span className="font-display text-2xl leading-none text-brass">{i + 1}</span>
                  <div><p className="font-medium">{t}</p><p className="text-[14px] text-muted">{d}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <ButtonLink href={`/my-trip/${b.id}`} size="lg"><Eye className="h-4 w-4" aria-hidden /> View My Trip</ButtonLink>
            <ButtonLink href={`/my-trip/${b.id}/print?auto=1`} variant="outline" size="lg"><Download className="h-4 w-4" aria-hidden /> Download Itinerary</ButtonLink>
            <ButtonLink href={`/contact?booking=${b.id}`} variant="outline" size="lg"><Headset className="h-4 w-4" aria-hidden /> Contact Travel Expert</ButtonLink>
            <ButtonLink href={whatsappEnquiryForBooking(b)} variant="gold" size="lg"><MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp</ButtonLink>
          </div>
          <p className="text-xs text-muted">Keep your reference handy — you can open your trip anytime at <span className="font-medium">My Trip</span>. In this demo, requests are stored in your browser.</p>
        </Reveal>
      </div>
    </div>
  );
}
