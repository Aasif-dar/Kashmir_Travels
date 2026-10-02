"use client";

import { Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { ErrorState, LoadingBlock } from "@/components/ui/states";
import { Reveal } from "@/components/ui/motion";
import { whatsappEnquiryForBooking } from "@/lib/booking";
import { formatDate, formatINR } from "@/lib/format";
import { customerStatusOf } from "@/types/booking";
import { plural } from "@/lib/utils";
import { useCatalog } from "@/store/catalog-context";
import { CustomerStatusBadge } from "./booking-status";
import { useBooking } from "./use-booking";

export function BookingConfirmation({ bookingId }: { bookingId: string }) {
  const { state, reload } = useBooking(bookingId);
  const catalog = useCatalog();
  const [copied, setCopied] = useState(false);

  if (state.status === "loading") return <div className="container-x min-h-[100svh] pb-24 pt-36"><LoadingBlock label="Loading your request…" /></div>;
  if (state.status === "missing") {
    return (
      <div className="container-x min-h-[100svh] pb-24 pt-36">
        <ErrorState title="We couldn't find that request" description={`There's no request with reference ${bookingId} saved in this browser. In this demo, requests are stored on the device where they were made.`} action={<><ButtonLink href="/my-trip">Look up a journey</ButtonLink><ButtonLink variant="outline" href="/plan-your-trip">Build a journey</ButtonLink></>} />
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="container-x min-h-[100svh] pb-24 pt-36">
        <ErrorState description={state.message} action={<button onClick={() => void reload()} className="text-sm underline">Try again</button>} />
      </div>
    );
  }
  const b = state.booking;
  const status = customerStatusOf(b.status);
  const cover = catalog.destinations.find((d) => d.id === b.trip.destinations[0]?.id)?.image ?? "hero-dal";
  const copy = async () => {
    try { await navigator.clipboard.writeText(b.id); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  const rows: [string, string][] = [
    ["Customer", `${b.customer.fullName} · ${b.customer.email}`],
    ["Travel dates", `${formatDate(b.customer.travelDate, { day: "numeric", month: "long", year: "numeric" })} · ${b.trip.config.days} days`],
    ["Travellers", `${plural(b.customer.adults, "adult")}${b.customer.children ? `, ${plural(b.customer.children, "child", "children")}` : ""}`],
    ["Journey", `${b.trip.packageName} · ${b.trip.tierName} level`],
    ["Destinations", b.trip.destinations.map((d) => `${d.name} (${d.nights}N)`).join(" → ")],
    ["Stays", b.trip.hotels.map((h) => `${h.name} (${h.destinationName})`).join(" · ")],
    ["Vehicle", b.trip.vehicle ? `${b.trip.vehicle.name}${b.trip.vehicle.count > 1 ? ` × ${b.trip.vehicle.count}` : ""}` : "To be arranged"],
    ["Experiences", b.trip.activities.length ? b.trip.activities.map((a) => a.name).join(", ") : "None added"],
  ];

  return (
    <div className="pb-24 pt-[68px] lg:pt-[76px]">
      <section className="band-forest relative isolate overflow-hidden">
        {/* the first place on the route, fading into the panel */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[46%] lg:block">
          <Photo k={cover} alt="" sizes="46vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/50 to-forest/5" />
        </div>
        <div className="container-x section">
          <p className="eyebrow !text-brass-soft">Request received</p>
          <h1 className="t-h1 mt-4 max-w-4xl !text-ivory">Your Kashmir journey is taking shape.</h1>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ivory/85">Our travel team will contact you shortly to confirm availability and finalize your booking.</p>
          <div className="mt-10 flex flex-wrap items-end gap-x-14 gap-y-6">
            <div>
              <p className="t-label !text-[10.5px] text-ivory/65">Your journey reference</p>
              <p className="mt-1 flex items-center gap-3 font-display text-[clamp(2.6rem,5vw,3.8rem)] leading-none tracking-wide text-ivory" data-testid="booking-ref">
                {b.id}
                <button type="button" onClick={copy} className="grid h-10 w-10 place-items-center rounded-full border border-white/30 text-ivory transition-colors hover:bg-white/10" aria-label="Copy your journey reference"><Copy className="h-4 w-4" /></button>
              </p>
              <p role="status" className="mt-1 h-4 text-xs text-brass-soft">{copied ? "Reference copied" : ""}</p>
            </div>
            <div>
              <p className="t-label !text-[10.5px] text-ivory/65">Status</p>
              <CustomerStatusBadge status={status} className="mt-2 !border-brass-soft !bg-transparent !text-brass-soft" />
            </div>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href={whatsappEnquiryForBooking(b)} variant="gold" size="lg" caps>WhatsApp us</ButtonLink>
            <ButtonLink href={`/my-trip/${b.id}`} variant="onDark" size="lg" caps>View my trip</ButtonLink>
            <ButtonLink href={`/my-trip/${b.id}/print?auto=1`} variant="onDark" size="lg" caps>Print itinerary</ButtonLink>
          </div>
        </div>
      </section>

      <div className="container-x grid gap-14 py-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-20 lg:py-20">
        <Reveal>
          <h2 className="font-display text-[2rem] leading-none">Your request</h2>
          <dl className="mt-6 divide-y divide-line border-y border-line-strong text-[15px]">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6">
                <dt className="t-label !text-[10.5px] text-brass">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <div className="grid gap-1 py-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6">
              <dt className="t-label !text-[10.5px] text-brass">Estimated value</dt>
              <dd><span className="t-price text-[2rem] text-forest">{formatINR(b.trip.price.total)}</span> <span className="text-[13px] text-muted">· {formatINR(b.trip.price.perPerson)} per person · an estimate, to be confirmed by our team</span></dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="font-display text-[2rem] leading-none">What happens next</h2>
          <ol className="mt-6 space-y-6 border-t border-line-strong pt-6">
            {[
              ["Our team reviews", "We check stays, vehicle and experiences for your dates."],
              ["We contact you", "Expect a call or WhatsApp — usually within one working day."],
              ["You decide", "We share the final quote. Nothing is booked or charged until you agree."],
            ].map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[34px_minmax(0,1fr)] gap-3">
                <span className="font-display text-[1.6rem] leading-none text-brass">{i + 1}</span>
                <div><p className="font-medium">{t}</p><p className="mt-0.5 text-[14px] leading-snug text-muted">{d}</p></div>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-[13px] leading-relaxed text-muted">Keep your reference handy — you can open your trip any time from <Link href="/my-trip" className="underline">My trip</Link>, or <Link href={`/contact?booking=${b.id}`} className="underline">contact a travel expert</Link>. In this demo, requests are stored in your browser.</p>
        </Reveal>
      </div>
    </div>
  );
}
