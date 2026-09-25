import { packages } from "@/data/packages";
import type { AdminStatus, Booking } from "@/types/booking";
import type { Catalog } from "@/types/trip";
import { buildTripSnapshot } from "@/lib/booking";
import { packageToTrip, withTier } from "@/lib/trip";

/** Fictional demo customers so the admin area has something to show on first load. */
const seeds: { id: string; pkg: string; name: string; email: string; phone: string; adults: number; children: number; daysAhead: number; status: AdminStatus; created: number; city: string; tier?: "basic" | "comfort" | "premium"; note?: string }[] = [
  { id: "KT-2026-1041", pkg: "kashmir-essentials", name: "Rohan Mehta", email: "rohan.m@example.com", phone: "+91 98100 11122", adults: 2, children: 0, daysAhead: 41, status: "New", created: 1, city: "Delhi" },
  { id: "KT-2026-1038", pkg: "kashmir-honeymoon", name: "Ananya & Kabir Rao", email: "ananya.rao@example.com", phone: "+91 98450 33210", adults: 2, children: 0, daysAhead: 63, status: "Contacted", created: 3, city: "Bengaluru", note: "Anniversary — would like a quiet houseboat." },
  { id: "KT-2026-1032", pkg: "kashmir-family-holiday", name: "Sharma family", email: "vsharma@example.com", phone: "+91 99110 55667", adults: 2, children: 2, daysAhead: 88, status: "Confirmed", created: 6, city: "Chandigarh", tier: "comfort" },
  { id: "KT-2026-1027", pkg: "ladakh-explorer", name: "Imran Qureshi", email: "imran.q@example.com", phone: "+91 90040 87654", adults: 4, children: 0, daysAhead: 210, status: "Paid", created: 9, city: "Mumbai", tier: "premium" },
  { id: "KT-2026-1019", pkg: "kashmir-grand-journey", name: "Priya Nair", email: "priya.nair@example.com", phone: "+91 94470 12345", adults: 3, children: 0, daysAhead: 24, status: "Confirmed", created: 14, city: "Kochi" },
  { id: "KT-2026-1011", pkg: "kashmir-winter-escape", name: "David & Meera Thomas", email: "thomas.d@example.com", phone: "+91 98860 44556", adults: 2, children: 0, daysAhead: 95, status: "New", created: 0, city: "Hyderabad" },
  { id: "KT-2026-1004", pkg: "vaishno-devi-patnitop-yatra", name: "Gupta family", email: "agupta@example.com", phone: "+91 98730 90011", adults: 4, children: 1, daysAhead: 12, status: "Contacted", created: 2, city: "Delhi", tier: "basic" },
  { id: "KT-2026-0987", pkg: "kashmir-katra", name: "Neha Kulkarni", email: "neha.k@example.com", phone: "+91 98220 66778", adults: 2, children: 1, daysAhead: -18, status: "Completed", created: 60, city: "Pune" },
  { id: "KT-2026-0975", pkg: "kashmir-adventure-trail", name: "Arjun & friends", email: "arjun.s@example.com", phone: "+91 98999 12000", adults: 5, children: 0, daysAhead: 30, status: "Cancelled", created: 40, city: "Delhi" },
];

export function seedBookings(catalog: Catalog, now = new Date()): Booking[] {
  const out: Booking[] = [];
  for (const s of seeds) {
    const pkg = packages.find((p) => p.id === s.pkg);
    if (!pkg) continue;
    let config = packageToTrip(pkg);
    if (s.tier) config = withTier(config, s.tier);
    const travel = new Date(now);
    travel.setDate(travel.getDate() + s.daysAhead);
    config = { ...config, adults: s.adults, children: s.children, startingFrom: s.city, travelMonth: travel.getMonth() };
    const created = new Date(now);
    created.setDate(created.getDate() - s.created);
    out.push({
      id: s.id,
      createdAt: created.toISOString(),
      status: s.status,
      customer: {
        fullName: s.name,
        email: s.email,
        phone: s.phone,
        adults: s.adults,
        children: s.children,
        travelDate: travel.toISOString().slice(0, 10),
        pickupLocation: `${s.city} airport`,
        specialRequests: s.note,
      },
      trip: buildTripSnapshot(config, catalog),
    });
  }
  return out;
}
