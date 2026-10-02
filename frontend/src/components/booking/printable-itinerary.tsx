"use client";

import { Printer } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ItineraryTimeline } from "@/components/itinerary/itinerary-timeline";
import { LogoMark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingBlock } from "@/components/ui/states";
import { tierById } from "@/data/rules";
import { site } from "@/data/site";
import { addDays, formatDate, formatINR } from "@/lib/format";
import { plural } from "@/lib/utils";
import { customerStatusOf } from "@/types/booking";
import { useBooking } from "./use-booking";

const groups = [
  ["hotels", "Hotels"],
  ["transport", "Transport"],
  ["activities", "Activities"],
  ["services", "Package services"],
  ["meals", "Meals"],
  ["taxes", "Taxes & fees"],
] as const;

/** A4 print layout. `?auto=1` opens the browser print dialog (Save as PDF) automatically. */
export function PrintableItinerary({ bookingId }: { bookingId: string }) {
  const { state } = useBooking(bookingId);
  const auto = useSearchParams().get("auto") === "1";
  const ready = state.status === "ready";

  useEffect(() => {
    if (!auto || !ready) return;
    const t = setTimeout(() => window.print(), 900);
    return () => clearTimeout(t);
  }, [auto, ready]);

  if (state.status === "loading") return <div className="container-x min-h-[100svh] pb-24 pt-32"><LoadingBlock label="Preparing your itinerary…" /></div>;
  if (state.status !== "ready") {
    return <div className="container-x pb-24 pt-32"><ErrorState title="Itinerary not available" description="We couldn't find this booking in this browser." action={<Link href="/my-trip" className="underline">Look up a booking</Link>} /></div>;
  }
  const b = state.booking;
  const t = b.trip;
  const end = addDays(b.customer.travelDate, t.config.days - 1);
  const stays = t.hotels.map((h) => ({ destinationId: h.destinationId, hotel: { name: h.name, category: h.category } }));

  return (
    <div className="bg-parchment/40 px-4 pb-16 pt-24 print:bg-white print:p-0 sm:px-8">
      <div className="no-print mx-auto mb-5 flex max-w-[860px] flex-wrap items-center justify-between gap-3">
        <Link href={`/my-trip/${b.id}`} className="text-sm text-forest underline underline-offset-4">← Back to my trip</Link>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden /> Print / Save as PDF</Button>
      </div>

      <article className="print-page mx-auto max-w-[860px] border border-line bg-white p-8 text-[13.5px] text-ink shadow-sm sm:p-12">
        {/* Letterhead */}
        <header className="flex items-start justify-between gap-6 border-b-2 border-forest pb-5">
          <div className="flex items-center gap-3 text-forest">
            <LogoMark className="h-9 w-9 text-brass" />
            <div>
              <p className="font-display text-3xl font-semibold leading-none">{site.name}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">Kashmir · Jammu · Ladakh</p>
            </div>
          </div>
          <div className="text-right text-[12px] leading-snug text-muted">
            <p>{site.address}</p>
            <p>{site.phone} · {site.email}</p>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-brass">Trip itinerary</p>
            <h1 className="mt-1 font-display text-4xl leading-tight">{t.packageName}</h1>
          </div>
          <div className="text-right">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted">Booking ID</p>
            <p className="font-display text-3xl text-forest">{b.id}</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Status: {customerStatusOf(b.status)}</p>
          </div>
        </div>

        <dl className="avoid-break mt-6 grid grid-cols-2 gap-x-8 gap-y-3 border-y border-line py-4 sm:grid-cols-4">
          {[
            ["Guest", b.customer.fullName],
            ["Travel dates", `${formatDate(b.customer.travelDate)} – ${formatDate(end)}`],
            ["Travellers", `${plural(b.customer.adults, "adult")}${b.customer.children ? `, ${plural(b.customer.children, "child", "children")}` : ""}`],
            ["Level", `${t.tierName} · ${t.config.days} days`],
            ["Route", t.destinations.map((d) => `${d.name} (${d.nights}N)`).join(" → ")],
            ["Pickup", b.customer.pickupLocation],
            ["Vehicle", t.vehicle ? `${t.vehicle.name}${t.vehicle.count > 1 ? ` × ${t.vehicle.count}` : ""}` : "To be arranged"],
            ["Contact", `${b.customer.phone}`],
          ].map(([k, v]) => (
            <div key={k} className={k === "Route" ? "col-span-2" : undefined}><dt className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-brass">{k}</dt><dd className="mt-0.5">{v}</dd></div>
          ))}
        </dl>

        <h2 className="mt-8 font-display text-3xl">Day-by-day itinerary</h2>
        <ItineraryTimeline days={t.itinerary} stays={stays} meals={tierById(t.config.tier).mealPlan} startDate={b.customer.travelDate} print className="mt-5" />

        <div className="avoid-break mt-8 grid gap-8 sm:grid-cols-2">
          <section>
            <h2 className="font-display text-2xl">Hotels</h2>
            <table className="mt-2 w-full border-collapse text-[12.5px]">
              <tbody>
                {t.hotels.map((h) => (
                  <tr key={h.destinationId} className="border-b border-line align-top"><td className="py-1.5 pr-3 text-muted">{h.destinationName}<br />{plural(h.nights, "night")}</td><td className="py-1.5 font-medium">{h.name}<br /><span className="font-normal text-muted">{h.roomType}</span></td></tr>
                ))}
              </tbody>
            </table>
          </section>
          <section>
            <h2 className="font-display text-2xl">Activities</h2>
            {t.activities.length ? <ul className="mt-2 space-y-1 text-[12.5px]">{t.activities.map((a) => <li key={a.id} className="border-b border-line py-1.5">{a.name} <span className="text-muted">· {a.destinationName}</span></li>)}</ul> : <p className="mt-2 text-muted">None selected.</p>}
          </section>
        </div>

        <div className="avoid-break mt-8 grid gap-8 sm:grid-cols-2">
          <section>
            <h2 className="font-display text-2xl">Included</h2>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[12.5px]">{t.inclusions.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
          <section>
            <h2 className="font-display text-2xl">Not included</h2>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[12.5px] text-ink/80">{t.exclusions.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
        </div>

        <section className="avoid-break mt-8">
          <h2 className="font-display text-2xl">Price summary <span className="font-sans text-[11px] font-normal uppercase tracking-[0.14em] text-muted">Estimated · demo</span></h2>
          <table className="mt-2 w-full border-collapse text-[13px]">
            <tbody>
              {groups.map(([k, label]) => t.price[k] > 0 && (
                <tr key={k} className="border-b border-line"><td className="py-1.5">{label}</td><td className="py-1.5 text-right tabular-nums">{formatINR(t.price[k])}</td></tr>
              ))}
              <tr className="border-t-2 border-forest"><td className="pt-2 font-semibold">Estimated total</td><td className="pt-2 text-right font-display text-2xl tabular-nums">{formatINR(t.price.total)}</td></tr>
              <tr><td className="text-muted">Per person ({t.price.travellers} {t.price.travellers === 1 ? "traveller" : "travellers"})</td><td className="text-right tabular-nums text-muted">{formatINR(t.price.perPerson)}</td></tr>
            </tbody>
          </table>
          <p className="mt-2 text-[11px] leading-snug text-muted">This is an estimate, not a confirmed quote. Availability and final pricing are confirmed by our travel team.</p>
        </section>

        <footer className="avoid-break mt-8 border-t-2 border-forest pt-4 text-[12px] leading-relaxed text-muted">
          <p className="font-medium text-ink">Questions? Quote {b.id} when you contact us.</p>
          <p>{site.phone} · WhatsApp {site.phone} · {site.email} · {site.address}</p>
          <p>{site.hours}. Carry a government photo ID during your trip.</p>
        </footer>
      </article>
    </div>
  );
}
