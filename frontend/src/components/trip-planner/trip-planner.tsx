"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingBlock } from "@/components/ui/states";
import { Sheet } from "@/components/ui/sheet";
import { STEPS } from "@/store/trip-store";
import { cn } from "@/lib/utils";
import { MobileSummaryBar, TripSummary } from "./trip-summary";
import { useTrip, type TripApi } from "./use-trip";
import { DestinationStep } from "./steps/destination-step";
import { DurationStep } from "./steps/duration-step";
import { ItineraryStep } from "./steps/itinerary-step";
import { ReviewStep } from "./steps/review-step";
import { ActivityStep, HotelStep, VehicleStep } from "./steps/simple-steps";
import type { TravelStyle, Tier } from "@/types/trip";

const VEHICLE_CODES = ["VEHICLE_UNSUPPORTED", "NO_VEHICLE"];

/** Whether the Continue button should be disabled at a given step (only real blockers — never warnings). */
function stepBlocked(step: number, api: TripApi) {
  const errors = api.issues.filter((i) => i.severity === "error");
  if (step === 0) return errors.some((e) => e.code === "NO_ADULT" || e.code === "TOO_MANY");
  if (step <= 3) return api.trip.stops.length === 0 || errors.some((e) => !VEHICLE_CODES.includes(e.code));
  return api.trip.stops.length === 0 || errors.length > 0;
}

function Stepper({ step, setStep, api }: { step: number; setStep: (n: number) => void; api: TripApi }) {
  return (
    <nav aria-label="Trip planner progress" className="border-b border-line bg-ivory/95 backdrop-blur">
      {/* phones */}
      <div className="container-x py-3 md:hidden">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-2xl leading-none text-forest">{STEPS[step]}</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Step {step + 1} of {STEPS.length}</p>
        </div>
        <div className="mt-2.5 grid grid-cols-7 gap-1" role="list">
          {STEPS.map((s, i) => (
            <button key={s} type="button" role="listitem" onClick={() => setStep(i)} aria-label={`Go to step ${i + 1}: ${s}`} aria-current={i === step ? "step" : undefined} className="group py-1.5">
              <span className={cn("block h-[3px] transition-colors", i < step ? "bg-forest" : i === step ? "bg-brass" : "bg-stone")} />
            </button>
          ))}
        </div>
      </div>
      {/* tablet + desktop */}
      <ol className="container-x hidden items-center gap-2 py-4 md:flex">
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={s} className="flex flex-1 items-center gap-2 last:flex-none">
              <button type="button" onClick={() => setStep(i)} aria-current={current ? "step" : undefined} className="group flex min-h-11 items-center gap-2.5 text-left">
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[12px] font-semibold transition-colors", current ? "border-forest bg-forest text-ivory" : done ? "border-forest bg-forest/10 text-forest" : "border-stone text-muted group-hover:border-forest/60")}>
                  {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
                </span>
                <span className={cn("text-[13px] font-medium tracking-wide", current ? "text-forest" : "hidden text-muted group-hover:text-forest lg:inline")}>{s}</span>
              </button>
              {i < STEPS.length - 1 && <span aria-hidden className={cn("h-px flex-1", done ? "bg-forest" : "bg-stone")} />}
            </li>
          );
        })}
      </ol>
      <span className="sr-only" aria-live="polite">{api.trip.stops.length ? "" : "Choose destinations to continue"}</span>
    </nav>
  );
}

export function TripPlanner() {
  const api = useTrip();
  const { trip, step, setStep, hydrated, actions, packages } = api;
  const router = useRouter();
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const appliedParams = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  /* Deep links: ?package= &destination= &month= &style= &tier= */
  useEffect(() => {
    if (!hydrated || appliedParams.current) return;
    appliedParams.current = true;
    const pkgSlug = params.get("package");
    const dest = params.get("destination");
    const month = params.get("month");
    const style = params.get("style");
    const tier = params.get("tier");
    let touched = false;
    if (pkgSlug) {
      const pkg = packages.find((p) => p.slug === pkgSlug);
      if (pkg) { actions.loadPackage(pkg, 2); touched = true; }
    } else if (dest) {
      const d = api.catalog.destinations.find((x) => x.slug === dest || x.id === dest);
      if (d) { actions.addDestination(d.id); setStep(1); touched = true; }
    }
    if (month && /^\d{1,2}$/.test(month) && Number(month) < 12) { actions.setMonth(Number(month)); touched = true; }
    if (style && ["family", "couple", "friends", "adventure", "luxury", "photography", "spiritual", "relaxed"].includes(style)) { actions.setStyle(style as TravelStyle); touched = true; }
    if (tier && ["basic", "comfort", "premium"].includes(tier)) { actions.setTier(tier as Tier); touched = true; }
    if (touched || params.toString()) router.replace("/plan-your-trip", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  /* Move focus to the step heading when the step changes (a11y) and keep the top in view. */
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = document.getElementById(`step-${step}-title`);
    el?.focus({ preventScroll: true });
    topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [step, reduce]);

  if (!hydrated) {
    return (
      <div className="container-x pb-24 pt-32">
        <LoadingBlock label="Loading your trip…" />
      </div>
    );
  }

  const blockedHere = stepBlocked(step, api);
  const isLast = step === STEPS.length - 1;
  const stepView = [DurationStep, DestinationStep, ItineraryStep, HotelStep, VehicleStep, ActivityStep, ReviewStep][step];
  const StepView = stepView;

  const nav = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="lg" onClick={() => setStep(step - 1)} disabled={step === 0} aria-label="Back to previous step" className="px-4 sm:px-6">
        <ArrowLeft className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Back</span>
      </Button>
      {!isLast && (
        <Button size="lg" onClick={() => setStep(step + 1)} disabled={blockedHere} className="px-5 sm:px-8">
          Continue <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <div ref={topRef} className="scroll-mt-14" />
      <div className="sticky top-[60px] z-30 lg:top-16"><Stepper step={step} setStep={setStep} api={api} /></div>

      <div className="container-x grid gap-10 pb-40 pt-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 lg:pb-24 lg:pt-12">
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <StepView api={api} />
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 hidden items-center justify-between border-t border-line pt-6 lg:flex">
            {nav}
            <div className="flex items-center gap-4">
              {blockedHere && step > 0 && trip.stops.length > 0 && <p role="alert" className="text-sm text-burgundy">Resolve the items marked “Needs attention” to continue.</p>}
              <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex min-h-11 items-center gap-1.5 text-[13px] text-muted hover:text-forest"><RotateCcw className="h-3.5 w-3.5" aria-hidden /> Start over</button>
            </div>
          </div>
          <button type="button" onClick={() => setConfirmReset(true)} className="mt-10 inline-flex min-h-11 items-center gap-1.5 text-[13px] text-muted hover:text-forest lg:hidden"><RotateCcw className="h-3.5 w-3.5" aria-hidden /> Start over</button>
        </div>

        <div className="hidden lg:block"><TripSummary api={api} /></div>
      </div>

      <MobileSummaryBar api={api}>{nav}</MobileSummaryBar>

      <Sheet open={confirmReset} onOpenChange={setConfirmReset} title="Start over?" description="This clears your destinations, hotel and activity choices." side="center">
        <div className="flex justify-end gap-3 p-5">
          <Button variant="outline" onClick={() => setConfirmReset(false)}>Keep my plan</Button>
          <Button variant="burgundy" onClick={() => { actions.clearAll(); setConfirmReset(false); }}>Clear and restart</Button>
        </div>
      </Sheet>
    </div>
  );
}
