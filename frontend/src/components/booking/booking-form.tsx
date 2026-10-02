"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ItineraryTimeline } from "@/components/itinerary/itinerary-timeline";
import { PriceBreakdown } from "@/components/trip-planner/price-breakdown";
import { MobileSummaryBar, TripSummary } from "@/components/trip-planner/trip-summary";
import { useTrip } from "@/components/trip-planner/use-trip";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Stepper, Textarea } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState, ErrorState, IssueList, LoadingBlock } from "@/components/ui/states";
import { bookingTerms } from "@/data/content";
import { hubInfo, styleById, tierById } from "@/data/rules";
import { buildTripSnapshot, tripTitle, whatsappEnquiryForTrip } from "@/lib/booking";
import { formatDate } from "@/lib/format";
import { bookingFormSchema, type BookingFormValues } from "@/lib/validation";
import { cn, plural } from "@/lib/utils";
import { createBooking } from "@/services/bookings";
import { useTripStore } from "@/store/trip-store";

const STEPS = ["Your journey", "About you", "Confirm"] as const;

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export function BookingForm() {
  const api = useTrip();
  const { trip, catalog, hydrated, price, issues, blocked, itinerary, stays, vehicle, actions } = api;
  const router = useRouter();
  const resetTrip = useTripStore((s) => s.reset);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);

  const gateway = useMemo(() => {
    const first = catalog.destinations.find((d) => d.id === trip.stops[0]?.destinationId);
    return first ? hubInfo[first.hub].gateway : "";
  }, [catalog, trip.stops]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", phone: "", adults: trip.adults, children: trip.children, travelDate: "", pickupLocation: "", specialRequests: "", terms: false },
  });
  const { register, control, handleSubmit, trigger, watch, setValue, formState: { errors } } = form;

  /* Seed pickup + counts once the persisted trip has loaded. */
  useEffect(() => {
    if (!hydrated) return;
    setValue("adults", trip.adults);
    setValue("children", trip.children);
    if (!form.getValues("pickupLocation") && gateway) setValue("pickupLocation", gateway);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const adults = watch("adults");
  const children = watch("children");
  const travelDate = watch("travelDate");
  useEffect(() => {
    if (!hydrated) return;
    if (adults !== trip.adults) actions.setAdults(Number(adults) || 1);
    if (children !== trip.children) actions.setChildren(Number(children) || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adults, children]);
  useEffect(() => {
    if (!hydrated || !travelDate) return;
    const m = new Date(travelDate).getMonth();
    if (!Number.isNaN(m) && m !== trip.travelMonth) actions.setMonth(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelDate]);

  if (!hydrated) return <div className="container-x min-h-[100svh] pb-24 pt-12"><LoadingBlock label="Loading your journey…" /></div>;

  if (!trip.stops.length) {
    return (
      <div className="container-x min-h-[100svh] pb-24 pt-12">
        <EmptyState title="There's no journey to request yet" description="Build your itinerary in the planner first — it only takes a couple of minutes." action={<ButtonLink href="/plan-your-trip" size="lg" caps>Build my journey</ButtonLink>} />
      </div>
    );
  }
  if (blocked) {
    return (
      <div className="container-x min-h-[100svh] pb-24 pt-12">
        <ErrorState title="This itinerary needs a change first" description="Something in your plan isn't realistic yet, so we can't send it as a request." action={<ButtonLink href="/plan-your-trip">Back to the planner</ButtonLink>} />
        <IssueList issues={issues.filter((i) => i.severity === "error")} className="mx-auto mt-6 max-w-2xl" />
      </div>
    );
  }

  const goNext = async () => {
    if (step === 1) {
      const ok = await trigger(["fullName", "email", "phone", "adults", "children", "travelDate", "pickupLocation", "specialRequests"]);
      if (!ok) return;
    }
    setStep((s) => Math.min(2, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setFailure(null);
    try {
      const config = { ...trip, adults: values.adults, children: values.children, travelMonth: new Date(values.travelDate).getMonth() };
      const booking = await createBooking({
        customer: { fullName: values.fullName, email: values.email, phone: values.phone, adults: values.adults, children: values.children, travelDate: values.travelDate, pickupLocation: values.pickupLocation, specialRequests: values.specialRequests || undefined },
        trip: buildTripSnapshot(config, catalog),
      });
      resetTrip();
      router.push(`/book/confirmation/${booking.id}`);
    } catch (e) {
      setFailure(e instanceof Error ? e.message : "We couldn't send your request. Please try again.");
      setSubmitting(false);
    }
  });

  const tier = tierById(trip.tier);
  const style = styleById(trip.style);
  const values = form.getValues();
  const timelineStays = stays.map((s) => ({ destinationId: s.destinationId, hotel: s.hotel ? { name: s.hotel.name, category: s.hotel.category } : null }));
  const activityNames = trip.activities.map((a) => catalog.activities.find((x) => x.id === a.activityId)?.name).filter(Boolean);

  const nav = (
    <div className="flex items-center gap-2">
      {step > 0 && <Button variant="outline" size="lg" onClick={() => setStep(step - 1)} aria-label="Back" className="px-4"><ArrowLeft className="h-4 w-4" aria-hidden /></Button>}
      {step < 2 ? (
        <Button size="lg" caps onClick={goNext} className="px-5">{step === 0 ? "Continue" : "Review"} <ArrowRight className="h-4 w-4" aria-hidden /></Button>
      ) : (
        <Button size="lg" caps onClick={onSubmit} disabled={submitting} className="px-5">{submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Request</Button>
      )}
    </div>
  );

  return (
    <div>
      <nav aria-label="Booking progress" className="border-b border-line">
        <ol className="container-x flex gap-3">
          {STEPS.map((s, i) => (
            <li key={s} className="min-w-0 flex-1">
              <button type="button" disabled={i > step} onClick={() => setStep(i)} aria-current={i === step ? "step" : undefined} className={cn("block w-full border-t-[3px] pb-3 pt-2.5 text-left transition-colors", i === step ? "border-brass" : i < step ? "border-forest" : "border-stone")}>
                <span className={cn("block font-display text-[1.05rem] leading-none", i === step ? "text-brass" : i < step ? "text-forest" : "text-muted")}>{i < step ? "✓" : String(i + 1).padStart(2, "0")}</span>
                <span className={cn("mt-1.5 block truncate text-[11px] font-semibold uppercase tracking-[0.14em]", i === step ? "text-forest" : "text-muted")}>{s}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="container-x grid gap-10 pb-40 pt-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 lg:pb-24 lg:pt-14">
        <form onSubmit={(e) => { e.preventDefault(); if (step === 2) void onSubmit(); else void goNext(); }} noValidate className="min-w-0" aria-label="Journey request">
          <p className="eyebrow">{String(step + 1).padStart(2, "0")} — {STEPS[step]}</p>
          <h2 className="t-h2 mt-3" tabIndex={-1}>{step === 0 ? "Your journey" : step === 1 ? "Tell us who's travelling" : "Confirm and request"}</h2>

          {/* 01 — the journey, as our travel team will read it */}
          {step === 0 && (
            <div className="mt-8 space-y-9">
              <p className="t-lede measure">This is the journey you built. If anything looks off, go back and change it — your choices are saved.</p>
              <div className="border-y border-line-strong py-6">
                <p className="t-label !text-[10.5px] text-brass">{trip.days} days · {tier.name}{style ? ` · ${style.label}` : ""}</p>
                <h3 className="t-h2 mt-2">{tripTitle(trip, catalog)}</h3>
                <p className="mt-3 text-[15px]">{trip.stops.map((s) => `${catalog.destinations.find((d) => d.id === s.destinationId)?.name} (${s.nights}N)`).join(" → ")}</p>
              </div>
              <dl className="grid gap-x-12 gap-y-7 sm:grid-cols-2">
                <div><dt className="t-label !text-[10.5px] text-brass">Stays</dt><dd className="mt-2 space-y-1.5 text-[15px]">{stays.map((s) => <p key={s.destinationId}>{s.hotel?.name ?? "To be confirmed"} <span className="text-muted">· {s.destinationName}</span></p>)}</dd></div>
                <div>
                  <dt className="t-label !text-[10.5px] text-brass">Vehicle</dt><dd className="mt-2 text-[15px]">{vehicle.vehicle?.name ?? "To be arranged"}{vehicle.count > 1 ? ` × ${vehicle.count}` : ""}</dd>
                  <dt className="t-label mt-5 !text-[10.5px] text-brass">Experiences</dt><dd className="mt-2 text-[15px]">{activityNames.length ? activityNames.join(", ") : "None added"}</dd>
                </div>
              </dl>
              <IssueList issues={issues.filter((i) => i.severity === "warning")} />
              <Link href="/plan-your-trip" className="inline-block text-[13.5px] font-medium text-forest underline underline-offset-4">Change my journey</Link>
            </div>
          )}

          {/* 02 — details */}
          {step === 1 && (
            <div className="mt-8 space-y-7">
              <p className="t-lede measure">So our team knows who to talk to. We only use these details to reply to your request.</p>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Full name" htmlFor="fullName" error={errors.fullName?.message} required>
                  <Input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "fullName-error" : undefined} {...register("fullName")} />
                </Field>
                <Field label="Email" htmlFor="email" error={errors.email?.message} required>
                  <Input id="email" type="email" autoComplete="email" inputMode="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />
                </Field>
                <Field label="Phone / WhatsApp" htmlFor="phone" error={errors.phone?.message} hint="We may reach you on WhatsApp." required>
                  <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+91 98xxx xxxxx" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} {...register("phone")} />
                </Field>
                <Field label="Travel date (arrival)" htmlFor="travelDate" error={errors.travelDate?.message} required>
                  <Input id="travelDate" type="date" min={tomorrow()} aria-invalid={!!errors.travelDate} aria-describedby={errors.travelDate ? "travelDate-error" : undefined} {...register("travelDate")} />
                </Field>
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-forest">Adults</p>
                  <Controller name="adults" control={control} render={({ field }) => <Stepper label="adults" value={field.value} min={1} max={20} onChange={field.onChange} />} />
                  {errors.adults && <p role="alert" className="mt-1.5 text-xs font-medium text-burgundy">{errors.adults.message}</p>}
                </div>
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-forest">Children (under 12)</p>
                  <Controller name="children" control={control} render={({ field }) => <Stepper label="children" value={field.value} min={0} max={10} onChange={field.onChange} />} />
                </div>
                <Field label="Pickup location" htmlFor="pickupLocation" error={errors.pickupLocation?.message} className="sm:col-span-2" hint="Usually the airport or station you arrive at." required>
                  <Input id="pickupLocation" aria-invalid={!!errors.pickupLocation} aria-describedby={errors.pickupLocation ? "pickupLocation-error" : undefined} {...register("pickupLocation")} />
                </Field>
                <Field label="Special requests" htmlFor="specialRequests" error={errors.specialRequests?.message} className="sm:col-span-2" hint="Dietary needs, celebrations, mobility, hotels you'd prefer…">
                  <Textarea id="specialRequests" maxLength={600} {...register("specialRequests")} />
                </Field>
              </div>
              <p className="text-[12.5px] text-muted">Changing adults or children updates the estimate at once.</p>
            </div>
          )}

          {/* 03 — confirm */}
          {step === 2 && (
            <div className="mt-8 space-y-12">
              <p className="t-lede measure">One last look. Sending this creates a journey <strong className="font-semibold text-ink">request</strong> with a reference number — it isn&apos;t a confirmed booking, and nothing is charged.</p>
              <dl className="grid gap-x-12 gap-y-5 border-y border-line-strong py-6 sm:grid-cols-2">
                <div><dt className="t-label !text-[10px] text-brass">Traveller</dt><dd className="mt-1 text-[15px]">{values.fullName}<br /><span className="text-muted">{values.email} · {values.phone}</span></dd></div>
                <div><dt className="t-label !text-[10px] text-brass">Arrival</dt><dd className="mt-1 text-[15px]">{values.travelDate ? formatDate(values.travelDate, { day: "numeric", month: "long", year: "numeric", weekday: "long" }) : "—"}<br /><span className="text-muted">Pickup: {values.pickupLocation}</span></dd></div>
                <div><dt className="t-label !text-[10px] text-brass">Travellers</dt><dd className="mt-1 text-[15px]">{plural(values.adults, "adult")}{values.children ? `, ${plural(values.children, "child", "children")}` : ""}</dd></div>
                {values.specialRequests && <div><dt className="t-label !text-[10px] text-brass">Special requests</dt><dd className="mt-1 text-[15px] text-muted">{values.specialRequests}</dd></div>}
              </dl>
              <div>
                <h3 className="font-display text-[1.7rem] leading-none">Itinerary</h3>
                <ItineraryTimeline days={itinerary} stays={timelineStays} meals={tier.mealPlan} startDate={values.travelDate || undefined} className="mt-7" />
              </div>
              <div className="rounded-[3px] border border-line bg-paper p-6"><PriceBreakdown price={price} /></div>

              <div className="rounded-[3px] border border-line-strong bg-parchment/40 p-5">
                <div className="flex items-start gap-3">
                  <input id="terms" type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#1d3a2f]" aria-invalid={!!errors.terms} aria-describedby={errors.terms ? "terms-error" : undefined} {...register("terms")} />
                  <label htmlFor="terms" className="text-[15px] leading-snug">
                    I agree to the <button type="button" onClick={() => setTermsOpen(true)} className="font-medium text-forest underline underline-offset-4">booking terms</button>. I understand this is a request that the travel team must confirm.
                  </label>
                </div>
                {errors.terms && <p id="terms-error" role="alert" className="mt-2 text-xs font-medium text-burgundy">{errors.terms.message}</p>}
              </div>

              {failure && (
                <ErrorState title="We couldn't send your request" description={failure} action={<><Button onClick={() => void onSubmit()}>Try again</Button><ButtonLink variant="outline" href={whatsappEnquiryForTrip(trip, catalog, { name: values.fullName })}>Send on WhatsApp instead</ButtonLink></>} />
              )}
            </div>
          )}

          <div className="mt-12 hidden items-center justify-between border-t border-line pt-6 lg:flex">
            <div>{step > 0 ? <Button variant="outline" size="lg" caps onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4" aria-hidden /> Back</Button> : <ButtonLink variant="ghost" size="lg" caps href="/plan-your-trip"><ArrowLeft className="h-4 w-4" aria-hidden /> Back to the planner</ButtonLink>}</div>
            {step < 2 ? (
              <Button size="lg" caps onClick={goNext}>{step === 0 ? "Continue" : "Review your request"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></Button>
            ) : (
              <Button size="lg" caps type="submit" disabled={submitting}>{submitting ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending…</> : <>Request this journey <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></>}</Button>
            )}
          </div>
          <p className="mt-4 text-[12.5px] text-muted">Our travel team will contact you to confirm availability. In this demo your request is saved in this browser.</p>
        </form>

        <div className="hidden lg:block"><TripSummary api={api} /></div>
      </div>

      <MobileSummaryBar api={api}>{nav}</MobileSummaryBar>

      <Sheet open={termsOpen} onOpenChange={setTermsOpen} title="Booking terms" description="Please read before requesting your journey." side="center">
        <ol className="list-decimal space-y-3 px-9 py-6 text-[14.5px] leading-relaxed text-ink/85">
          {bookingTerms.map((t) => <li key={t}>{t}</li>)}
        </ol>
        <div className="border-t border-line p-4 text-right"><Button onClick={() => { setValue("terms", true, { shouldValidate: true }); setTermsOpen(false); }}>I agree</Button></div>
      </Sheet>
    </div>
  );
}
