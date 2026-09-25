"use client";

import { useCallback, useEffect, useState } from "react";
import { BOOKINGS_KEY, getBooking } from "@/services/bookings";
import { subscribeStorage } from "@/services/storage";
import type { Booking } from "@/types/booking";

type State = { status: "loading" } | { status: "ready"; booking: Booking } | { status: "missing" } | { status: "error"; message: string };

/** Loads one booking through the booking service (localStorage today, API tomorrow). */
export function useBooking(id: string) {
  const [state, setState] = useState<State>({ status: "loading" });
  const load = useCallback(async () => {
    try {
      const booking = await getBooking(id);
      setState(booking ? { status: "ready", booking } : { status: "missing" });
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : "Could not load this booking." });
    }
  }, [id]);
  useEffect(() => {
    void load();
    return subscribeStorage(BOOKINGS_KEY, () => void load());
  }, [load]);
  return { state, reload: load };
}
