"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { packageToTrip, withTier } from "@/lib/trip";
import { STEP, useTripStore } from "@/store/trip-store";
import type { TourPackage } from "@/types/package";
import type { Tier } from "@/types/trip";

/** "Customize This Package": preloads the package into the planner and opens it on the itinerary. */
export function useCustomizePackage() {
  const router = useRouter();
  const replace = useTripStore((s) => s.replace);
  return useCallback(
    (pkg: TourPackage, opts: { tier?: Tier; month?: number | null } = {}) => {
      const base = packageToTrip(pkg);
      const trip = opts.tier ? withTier(base, opts.tier) : base;
      replace({ ...trip, travelMonth: opts.month ?? null }, STEP.itinerary);
      router.push("/plan-your-trip");
    },
    [replace, router]
  );
}
