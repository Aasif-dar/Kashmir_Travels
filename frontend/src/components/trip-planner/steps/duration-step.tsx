"use client";

import { Field, Select, Stepper } from "@/components/ui/form";
import { originCities } from "@/data/site";
import { MONTHS } from "@/lib/format";
import { DurationSelector } from "../duration-selector";
import { SubHeading, TripStep } from "../trip-step";
import type { TripApi } from "../use-trip";

export function DurationStep({ api }: { api: TripApi }) {
  const { trip, actions } = api;
  return (
    <TripStep index={0} title="How long do you have?" lede="Start with the length of your trip. Pace, places and price all follow from it.">
      <div className="space-y-12">
        <div>
          <SubHeading>Duration</SubHeading>
          <DurationSelector days={trip.days} onChange={actions.setDays} />
        </div>

        <div>
          <SubHeading hint="Children under 12 are priced at a lower rate. The month is used for seasonal advice and pricing.">Who&apos;s travelling</SubHeading>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-forest">Adults</p>
              <Stepper label="adults" value={trip.adults} min={1} max={20} onChange={actions.setAdults} />
            </div>
            <div>
              <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-forest">Children (under 12)</p>
              <Stepper label="children" value={trip.children} min={0} max={10} onChange={actions.setChildren} />
            </div>
            <Field label="Travel month" htmlFor="month">
              <Select id="month" value={trip.travelMonth ?? ""} onChange={(e) => actions.setMonth(e.target.value === "" ? null : Number(e.target.value))}>
                <option value="">I&apos;m flexible</option>
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </Select>
            </Field>
            <Field label="Starting from" htmlFor="from">
              <Select id="from" value={trip.startingFrom} onChange={(e) => actions.setStartingFrom(e.target.value)}>
                {originCities.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      </div>
    </TripStep>
  );
}
