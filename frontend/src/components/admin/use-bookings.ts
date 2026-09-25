"use client";

import { useCallback, useEffect, useState } from "react";
import { BOOKINGS_KEY, listBookings } from "@/services/bookings";
import { subscribeStorage } from "@/services/storage";
import type { Booking } from "@/types/booking";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setBookings(await listBookings());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load bookings.");
    }
  }, []);
  useEffect(() => {
    void load();
    return subscribeStorage(BOOKINGS_KEY, () => void load());
  }, [load]);
  return { bookings, error, reload: load };
}

export function bookingMetrics(bookings: Booking[], now = new Date()) {
  const active = bookings.filter((b) => b.status !== "Cancelled");
  const today = now.toISOString().slice(0, 10);
  return {
    total: bookings.length,
    newEnquiries: bookings.filter((b) => b.status === "New").length,
    pending: bookings.filter((b) => b.status === "Contacted").length,
    confirmed: bookings.filter((b) => b.status === "Confirmed" || b.status === "Paid").length,
    upcoming: bookings.filter((b) => ["Confirmed", "Paid"].includes(b.status) && b.customer.travelDate >= today).length,
    value: active.reduce((a, b) => a + b.trip.price.total, 0),
  };
}
