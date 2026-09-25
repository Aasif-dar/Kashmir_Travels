"use client";

import { useCallback, useMemo } from "react";
import { buildItinerary, distributeNights, nightsForDays, optimiseOrder } from "@/lib/itinerary-engine";
import { computePrice, resolveStays, resolveVehicle } from "@/lib/pricing";
import { buildTripSnapshot } from "@/lib/booking";
import { addStop, autoPlan, moveStop, packageToTrip, pruneTrip, removeStop, replaceStop, shiftNight, withDays, withStyle, withTier } from "@/lib/trip";
import { canAddDestination, hasErrors, validateTrip } from "@/lib/validation";
import { useCatalog, usePackages } from "@/store/catalog-context";
import { STEPS, useTripStore } from "@/store/trip-store";
import type { TourPackage } from "@/types/package";
import type { Region } from "@/types/destination";
import type { Tier, TravelStyle } from "@/types/trip";
import { clamp } from "@/lib/utils";

/** The one hook the planner UI talks to: state + derived engine results + actions. */
export function useTrip() {
  const catalog = useCatalog();
  const packages = usePackages();
  const { trip, step, hydrated, update, replace, setStep, reset } = useTripStore();

  const itinerary = useMemo(() => buildItinerary(trip, catalog), [trip, catalog]);
  const price = useMemo(() => computePrice(trip, catalog), [trip, catalog]);
  const issues = useMemo(() => validateTrip(trip, catalog), [trip, catalog]);
  const stays = useMemo(() => resolveStays(trip, catalog), [trip, catalog]);
  const vehicle = useMemo(() => resolveVehicle(trip, catalog), [trip, catalog]);
  const snapshot = useCallback(() => buildTripSnapshot(trip, catalog), [trip, catalog]);
  const blocked = hasErrors(issues);

  const actions = useMemo(
    () => ({
      setDays: (days: number) => update((t) => withDays(t, days, catalog)),
      setStartingFrom: (startingFrom: string) => update((t) => ({ ...t, startingFrom })),
      setRegion: (region: Region | "any") => update((t) => ({ ...t, region })),
      setMonth: (travelMonth: number | null) => update((t) => ({ ...t, travelMonth })),
      setAdults: (adults: number) => update((t) => ({ ...t, adults: clamp(adults, 1, 20) })),
      setChildren: (children: number) => update((t) => ({ ...t, children: clamp(children, 0, 10) })),
      setStyle: (style: TravelStyle | null) => update((t) => withStyle(t, style)),
      setTier: (tier: Tier) => update((t) => withTier(t, tier)),
      /** Returns a reason string if the destination cannot be added realistically. */
      addDestination: (id: string): string | null => {
        const check = canAddDestination(trip, id, catalog);
        if (!check.ok) return check.reason ?? "This combination isn't realistic for your dates.";
        update((t) => addStop(t, id, catalog));
        return null;
      },
      removeDestination: (id: string) => update((t) => removeStop(t, id, catalog)),
      setDestinations: (ids: string[]) => update((t) => pruneTrip({ ...t, stops: distributeNights(optimiseOrder(ids, catalog), nightsForDays(t.days), catalog) }, catalog)),
      moveStop: (index: number, dir: -1 | 1) => update((t) => moveStop(t, index, dir)),
      shiftNight: (from: number, to: number) => update((t) => shiftNight(t, from, to, catalog)),
      replaceStop: (index: number, destinationId: string) => update((t) => replaceStop(t, index, destinationId, catalog)),
      optimise: () => update((t) => ({ ...t, stops: distributeNights(optimiseOrder(t.stops.map((s) => s.destinationId), catalog), nightsForDays(t.days), catalog) })),
      rebalance: () => update((t) => ({ ...t, stops: distributeNights(t.stops.map((s) => s.destinationId), nightsForDays(t.days), catalog) })),
      selectHotel: (destinationId: string, hotelId: string) => update((t) => ({ ...t, hotels: { ...t.hotels, [destinationId]: hotelId } })),
      selectVehicle: (vehicleId: string | null) => update((t) => ({ ...t, vehicleId })),
      addActivity: (activityId: string, stayDay?: number) =>
        update((t) => (t.activities.some((a) => a.activityId === activityId) ? t : { ...t, activities: [...t.activities, { activityId, stayDay }] })),
      removeActivity: (activityId: string) => update((t) => ({ ...t, activities: t.activities.filter((a) => a.activityId !== activityId) })),
      setActivityDay: (activityId: string, stayDay: number | undefined) => update((t) => ({ ...t, activities: t.activities.map((a) => (a.activityId === activityId ? { ...a, stayDay } : a)) })),
      setDayNote: (key: string, text: string) => update((t) => ({ ...t, dayNotes: { ...t.dayNotes, [key]: text } })),
      loadPackage: (pkg: TourPackage, toStep = 1) => replace(packageToTrip(pkg), toStep),
      autoPlan: (stopIds: string[], base?: Partial<ReturnType<typeof useTripStore.getState>["trip"]>) => update((t) => autoPlan({ ...t, ...base }, catalog, stopIds)),
      clearAll: () => reset(),
    }),
    [update, replace, reset, catalog, trip]
  );

  return { trip, step, setStep, hydrated, catalog, packages, itinerary, price, issues, blocked, stays, vehicle, snapshot, actions, STEPS };
}

export type TripApi = ReturnType<typeof useTrip>;
