import { site } from "@/data/site";
import { tierById } from "@/data/rules";
import type { Booking, TripSnapshot } from "@/types/booking";
import type { Catalog, TripConfig } from "@/types/trip";
import { buildItinerary, findDestination } from "./itinerary-engine";
import { computePrice, resolveStays, resolveVehicle, travellersOf } from "./pricing";
import { formatDate, formatINR } from "./format";
import { packages } from "@/data/packages";

/** Human name for the trip: the package it started from, or a description of the route. */
export function tripTitle(config: TripConfig, catalog: Catalog): string {
  const pkg = packages.find((p) => p.id === config.packageId);
  if (pkg) return pkg.name;
  const names = config.stops.map((s) => findDestination(catalog, s.destinationId)?.name).filter(Boolean) as string[];
  if (names.length <= 3) return `${names.join(" · ")} — ${config.days} days`;
  return `Custom ${config.days}-day journey · ${names.length} destinations`;
}

export function buildTripSnapshot(config: TripConfig, catalog: Catalog): TripSnapshot {
  const tier = tierById(config.tier);
  const stays = resolveStays(config, catalog);
  const { vehicle, count } = resolveVehicle(config, catalog);
  // Optional add-ons the traveller did not choose are dropped from the frozen booking copy.
  const itinerary = buildItinerary(config, catalog).map((d) => ({ ...d, items: d.items.filter((i) => !i.optionalActivityId) }));
  const pkg = packages.find((p) => p.id === config.packageId);
  const stopIds = config.stops.map((s) => s.destinationId);
  const acts = config.activities
    .map((a) => catalog.activities.find((x) => x.id === a.activityId))
    .filter((a): a is NonNullable<typeof a> => !!a && a.destinationIds.some((d) => stopIds.includes(d)))
    .map((a) => ({ id: a.id, name: a.name, destinationName: findDestination(catalog, a.destinationIds.find((d) => stopIds.includes(d))!)?.name ?? "" }));
  return {
    config,
    packageName: tripTitle(config, catalog),
    tierName: tier.name,
    itinerary,
    price: computePrice(config, catalog),
    destinations: config.stops.map((s) => ({ id: s.destinationId, name: findDestination(catalog, s.destinationId)?.name ?? s.destinationId, nights: s.nights })),
    hotels: stays.map((s) => ({
      destinationId: s.destinationId,
      destinationName: s.destinationName,
      nights: s.nights,
      name: s.hotel?.name ?? "To be confirmed",
      category: s.hotel?.category ?? "",
      roomType: s.hotel?.roomTypes[0],
    })),
    vehicle: vehicle ? { name: vehicle.name, count, type: vehicle.type } : null,
    activities: acts,
    inclusions: [...(pkg?.inclusions ?? []), ...tier.inclusions.filter((i) => !(pkg?.inclusions ?? []).includes(i))].slice(0, 12),
    exclusions: pkg?.exclusions ?? [
      "Flights and train tickets",
      "Lunch and personal expenses",
      "Entry tickets and activities not listed",
      "Travel insurance",
      "Costs from weather, landslides or road closures",
    ],
  };
}

export function newBookingId(existing: string[], now = new Date()): string {
  for (let i = 0; i < 50; i++) {
    const id = `KT-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    if (!existing.includes(id)) return id;
  }
  return `KT-${now.getFullYear()}-${String(Date.now()).slice(-4)}`;
}

/* ---------------- WhatsApp ---------------- */
export function whatsappLink(message: string, number: string = site.whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function whatsappEnquiryForTrip(config: TripConfig, catalog: Catalog, opts: { name?: string; bookingId?: string } = {}) {
  const price = computePrice(config, catalog);
  const stops = config.stops.map((s) => `${findDestination(catalog, s.destinationId)?.name} (${s.nights}N)`).join(" → ");
  const lines = [
    `Hello ${site.short}! ${opts.bookingId ? `I'm following up on booking ${opts.bookingId}.` : "I'd like help with a trip I planned on your website."}`,
    "",
    `Trip: ${tripTitle(config, catalog)}`,
    `Route: ${stops || "Not chosen yet"}`,
    `Duration: ${config.days} days · Travellers: ${travellersOf(config)}`,
    `Level: ${tierById(config.tier).name}`,
    `Estimated (demo) price: ${formatINR(price.total)}`,
    opts.name ? `Name: ${opts.name}` : "",
  ].filter((l, i, a) => l !== "" || (i > 0 && a[i - 1] !== ""));
  return whatsappLink(lines.join("\n"));
}

export function whatsappEnquiryForBooking(b: Booking) {
  return whatsappLink(
    [
      `Hello ${site.short}! I'm following up on my enquiry ${b.id}.`,
      `Name: ${b.customer.fullName}`,
      `Trip: ${b.trip.packageName}`,
      `Travel date: ${formatDate(b.customer.travelDate)}`,
      `Estimated (demo) price: ${formatINR(b.trip.price.total)}`,
    ].join("\n")
  );
}

