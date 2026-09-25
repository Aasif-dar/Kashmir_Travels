import type { ItineraryDay, PriceBreakdown, TripConfig } from "./trip";

export type AdminStatus = "New" | "Contacted" | "Confirmed" | "Paid" | "Completed" | "Cancelled";
export type CustomerStatus = "Inquiry Received" | "Under Review" | "Confirmed" | "Completed" | "Cancelled";

export const ADMIN_STATUSES: AdminStatus[] = ["New", "Contacted", "Confirmed", "Paid", "Completed", "Cancelled"];
export const CUSTOMER_STATUSES: CustomerStatus[] = ["Inquiry Received", "Under Review", "Confirmed", "Completed", "Cancelled"];

export const customerStatusOf = (s: AdminStatus): CustomerStatus =>
  ({ New: "Inquiry Received", Contacted: "Under Review", Confirmed: "Confirmed", Paid: "Confirmed", Completed: "Completed", Cancelled: "Cancelled" } as const)[s];

export interface Customer {
  fullName: string;
  email: string;
  phone: string;
  adults: number;
  children: number;
  travelDate: string; // ISO yyyy-mm-dd
  pickupLocation: string;
  specialRequests?: string;
}

/** A frozen copy of the trip as requested, so later catalogue edits never change a booking. */
export interface TripSnapshot {
  config: TripConfig;
  packageName: string;
  tierName: string;
  itinerary: ItineraryDay[];
  price: PriceBreakdown;
  destinations: { id: string; name: string; nights: number }[];
  hotels: { destinationId: string; destinationName: string; nights: number; name: string; category: string; roomType?: string }[];
  vehicle: { name: string; count: number; type: string } | null;
  activities: { id: string; name: string; destinationName: string }[];
  inclusions: string[];
  exclusions: string[];
}

export interface Booking {
  id: string;
  createdAt: string;
  status: AdminStatus;
  customer: Customer;
  trip: TripSnapshot;
  /** Internal note, admin only. */
  adminNote?: string;
}

export interface BookingInput {
  customer: Customer;
  trip: TripSnapshot;
}
