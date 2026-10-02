"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { defaultTrip } from "@/lib/trip";
import type { TripConfig } from "@/types/trip";

export const STEPS = ["Duration", "Destinations", "Style", "Itinerary", "Stay", "Vehicle", "Experiences", "Review"] as const;

/** Step indices, so callers never hard-code a number. */
export const STEP = { duration: 0, destinations: 1, style: 2, itinerary: 3, stay: 4, vehicle: 5, experiences: 6, review: 7 } as const;

interface TripState {
  trip: TripConfig;
  step: number;
  hydrated: boolean;
  /** Apply a pure trip transformation. */
  update: (fn: (t: TripConfig) => TripConfig) => void;
  replace: (trip: TripConfig, step?: number) => void;
  setStep: (step: number) => void;
  reset: () => void;
  markHydrated: () => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trip: defaultTrip(),
      step: 0,
      hydrated: false,
      update: (fn) => set((s) => ({ trip: fn(s.trip) })),
      replace: (trip, step = 0) => set({ trip, step }),
      setStep: (step) => set({ step: Math.max(0, Math.min(STEPS.length - 1, step)) }),
      reset: () => set({ trip: defaultTrip(), step: 0 }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "zj.trip.v1",
      version: 2,
      // v1 had no separate Style step: everything from Itinerary onwards shifts by one.
      migrate: (persisted, version) => {
        const p = persisted as { trip?: TripConfig; step?: number };
        if (version < 2 && typeof p.step === "number" && p.step >= 2) return { ...p, step: p.step + 1 };
        return p;
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ trip: s.trip, step: s.step }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    }
  )
);

/** Call once near the app root (client) to restore a saved plan after hydration. */
export function rehydrateTripStore() {
  const done = () => useTripStore.getState().markHydrated();
  try {
    Promise.resolve(useTripStore.persist.rehydrate()).then(done, done);
  } catch {
    done();
  }
}
