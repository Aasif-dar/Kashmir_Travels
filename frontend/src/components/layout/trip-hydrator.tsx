"use client";

import { useEffect } from "react";
import { rehydrateTripStore } from "@/store/trip-store";

/** Restores a saved trip plan from localStorage once the app is on the client. */
export function TripHydrator() {
  useEffect(() => {
    rehydrateTripStore();
  }, []);
  return null;
}
