"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingBlock } from "@/components/ui/states";
import { Sheet } from "@/components/ui/sheet";
import { STEP, STEPS } from "@/store/trip-store";
import { cn } from "@/lib/utils";
import { MobileSummaryBar, TripSummary } from "./trip-summary";
import { useTrip, type TripApi } from "./use-trip";
import { DestinationStep } from "./steps/destination-step";
import { DurationStep } from "./steps/duration-step";
import { ItineraryStep } from "./steps/itinerary-step";
import { ReviewStep } from "./steps/review-step";
import { ActivityStep, HotelStep, VehicleStep } from "./steps/simple-steps";
import { StyleStep } from "./steps/style-step";
import type { TravelStyle, Tier } from "@/types/trip";

const VEHICLE_CODES = ["VEHICLE_UNSUPPORTED", "NO_VEHICLE"];
const StepViews = [DurationStep, DestinationStep, StyleStep, ItineraryStep, HotelStep, VehicleStep, ActivityStep, ReviewStep];

/** Whether Continue should be disabled at a given step (only real blockers — never warnings). */
function stepBlocked(step: number, api: TripApi) {
  const errors = api.issues.filter((i) => i.severity === "error");
  if (step === STEP.duration) return errors.some((e) => e.code === "NO_ADULT" || e.code === "TOO_MANY");
  if (step === STEP.style) return false;
  if (step <= STEP.stay) return api.trip.stops.length === 0 || errors.some((e) => !VEHICLE_CODES.includes(e.code));
  return api.trip.stops.length === 0 || errors.length > 0;
}

/** Numbered progress: a hairline per step (filled = done, brass = here), numeral and name beneath. */
function Stepper({ step, setStep }: { step: number; setStep: (n: number) => void }) {
  return (
    <nav aria-label="Trip planner progress" className="border-b border-line bg-ivory/[0.97]">
      {/* phones */}
      <div className="container-x py-3 md:hidden">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-[1.5rem] leading-none text-forest"><span className="mr-2 text-brass">{String(step + 1).padStart(2, "0")}</span>{STEPS[step]}</p>
          <p className="t-label !text-[10px] text-muted">{step + 1} / {STEPS.length}</p>
        </div>
        <ol className="mt-2.5 grid grid-cols-8 gap-1">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button type="button" onClick={() => setStep(i)} aria-label={`Go to step ${i + 1}: ${s}`} aria-current={i === step ? "step" : undefined} className="block w-full py-2">
                <span className={cn("block h-[3px] transition-colors", i < step ? "bg-forest" : i === step ? "bg-brass" : "bg-stone")} />
              </button>
            </li>
          ))}
        </ol>
      </div>
      {/* tablet + desktop */}
      <ol className="container-x hidden gap-3 md:flex">
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={s} className="min-w-0 flex-1">
              <button type="button" onClick={() => setStep(i)} aria-current={current ? "step" : undefined} className={cn("group block w-full border-t-[3px] pb-3 pt-2.5 text-left transition-colors", current ? "border-brass" : done ? "border-forest" : "border-stone hover:border-forest/50")}>
                <span className={cn("block font-display text-[1.05rem] leading-none", current ? "text-brass" : done ? "text-forest" : "text-muted")}>{done ? "✓" : String(i + 1).padStart(2, "0")}</span>
                <span className={cn("mt-1.5 block truncate text-[10.5px] font-semibold uppercase tracking-[0.14em] lg:text-[11px]", current ? "text-forest" : "text-muted group-hover:text-forest", !current && "max-lg:sr-only")}>{s}</span>
              </button>
            </li>
          );
        })}
      </ol>
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
      if (pkg) { actions.loadPackage(pkg, STEP.itinerary); touched = true; }
    } else if (dest) {
      const d = api.catalog.destinations.find((x) => x.slug === dest || x.id === dest);
      if (d) { actions.addDestination(d.id); setStep(STEP.destinations); touched = true; }
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
      <div className="container-x min-h-[100svh] pb-24 pt-12">
        <LoadingBlock label="Loading your journey…" />
      </div>
    );
  }

  const blockedHere = stepBlocked(step, api);
  const isLast = step === STEPS.length - 1;
  const StepView = StepViews[step];

  const nav = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="lg" caps onClick={() => setStep(step - 1)} disabled={step === 0} aria-label="Back to previous step" className="px-4 sm:px-6">
        <ArrowLeft className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Back</span>
      </Button>
      {!isLast && (
        <Button size="lg" caps onClick={() => setStep(step + 1)} disabled={blockedHere} className="px-5 sm:px-8">
          Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <div ref={topRef} className="scroll-mt-[58px]" />
      <div className="sticky top-[58px] z-30"><Stepper step={step} setStep={setStep} /></div>

      <div className="container-x grid gap-10 pb-40 pt-9 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 lg:pb-24 lg:pt-14">
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.26, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <StepView api={api} />
            </motion.div>
          </AnimatePresence>

          <div className="mt-14 hidden items-center justify-between border-t border-line pt-6 lg:flex">
            {nav}
            <div className="flex items-center gap-4">
              {blockedHere && step > STEP.duration && trip.stops.length > 0 && <p role="alert" className="text-sm text-burgundy">Resolve the items marked “Needs attention” to continue.</p>}
              <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex min-h-11 items-center gap-1.5 text-[13px] text-muted hover:text-forest"><RotateCcw className="h-3.5 w-3.5" aria-hidden /> Start over</button>
            </div>
          </div>
          <button type="button" onClick={() => setConfirmReset(true)} className="mt-10 inline-flex min-h-11 items-center gap-1.5 text-[13px] text-muted hover:text-forest lg:hidden"><RotateCcw className="h-3.5 w-3.5" aria-hidden /> Start over</button>
        </div>

        <div className="hidden lg:block"><TripSummary api={api} /></div>
      </div>

      <MobileSummaryBar api={api}>{nav}</MobileSummaryBar>

      <Sheet open={confirmReset} onOpenChange={setConfirmReset} title="Start over?" description="This clears your destinations, stays and experiences." side="center">
        <div className="flex justify-end gap-3 p-5">
          <Button variant="outline" onClick={() => setConfirmReset(false)}>Keep my journey</Button>
          <Button variant="burgundy" onClick={() => { actions.clearAll(); setConfirmReset(false); }}>Clear and restart</Button>
        </div>
      </Sheet>
    </div>
  );
}
