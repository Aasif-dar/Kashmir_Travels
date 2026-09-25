/**
 * Booking service. Persists to the browser's localStorage so the whole flow works without a backend.
 * To go live, replace these functions with API calls (POST /bookings, GET /bookings/:id …).
 */
import { getCatalog } from "./catalog";
import { readJSON, writeJSON } from "./storage";
import { seedBookings } from "./seed-bookings";
import { newBookingId } from "@/lib/booking";
import type { AdminStatus, Booking, BookingInput } from "@/types/booking";

export const BOOKINGS_KEY = "zj.bookings.v1";

async function load(): Promise<Booking[]> {
  const existing = readJSON<Booking[] | null>(BOOKINGS_KEY, null);
  if (existing) return existing;
  // First visit: seed clearly-fictional demo bookings so the admin area isn't empty.
  const seeded = seedBookings(await getCatalog());
  writeJSON(BOOKINGS_KEY, seeded);
  return seeded;
}

const sortNewest = (list: Booking[]) => [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export async function listBookings(): Promise<Booking[]> {
  return sortNewest(await load());
}

export async function getBooking(id: string): Promise<Booking | null> {
  const wanted = id.trim().toUpperCase();
  return (await load()).find((b) => b.id.toUpperCase() === wanted) ?? null;
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  const all = await load();
  const booking: Booking = {
    id: newBookingId(all.map((b) => b.id)),
    createdAt: new Date().toISOString(),
    status: "New",
    customer: input.customer,
    trip: input.trip,
  };
  if (!writeJSON(BOOKINGS_KEY, [booking, ...all])) throw new Error("Could not save your request in this browser. Please enable storage or contact us on WhatsApp.");
  return booking;
}

export async function updateBooking(id: string, patch: Partial<Pick<Booking, "status" | "adminNote">>): Promise<Booking | null> {
  const all = await load();
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  const next = { ...all[idx], ...patch };
  all[idx] = next;
  writeJSON(BOOKINGS_KEY, all);
  return next;
}

export async function setBookingStatus(id: string, status: AdminStatus) {
  return updateBooking(id, { status });
}

export async function deleteBooking(id: string) {
  const all = await load();
  writeJSON(BOOKINGS_KEY, all.filter((b) => b.id !== id));
}
