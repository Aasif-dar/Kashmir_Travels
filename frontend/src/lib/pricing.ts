import { CHILD_FACTOR, EXTRA_BED_FACTOR, GST_RATE, seasonForMonth, seasonMultiplier, tierById } from "@/data/rules";
import type { Region } from "@/types/destination";
import type { Hotel } from "@/types/hotel";
import type { Catalog, PriceBreakdown, PriceLine, ResolvedStay, TripConfig } from "@/types/trip";
import type { Vehicle } from "@/types/vehicle";
import { findDestination, summariseRoute } from "./itinerary-engine";
import { recommendHotel, recommendVehicle } from "./recommendations";
import { clamp, plural } from "./utils";
import { MONTHS } from "./format";

/* All figures are DEMO estimates for illustration — never live rates. */

const r10 = (n: number) => Math.round(n / 10) * 10;

export const travellersOf = (c: Pick<TripConfig, "adults" | "children">) => c.adults + c.children;
/** Adult-equivalent count: children pay a share of per-person charges. */
export const personUnits = (c: Pick<TripConfig, "adults" | "children">) => c.adults + c.children * CHILD_FACTOR;
export const roomsFor = (c: Pick<TripConfig, "adults" | "children">) => Math.max(1, Math.ceil(c.adults / 2));

export function seasonFactor(region: Region, month: number | null) {
  return month == null ? 1 : seasonMultiplier[region][month] ?? 1;
}

/* ---------------- Hotels ---------------- */
export function resolveStays(config: TripConfig, catalog: Catalog): ResolvedStay[] {
  return config.stops.map((s) => {
    const dest = findDestination(catalog, s.destinationId);
    const explicit = config.hotels[s.destinationId];
    const hotel: Hotel | null = catalog.hotels.find((h) => h.id === explicit && h.destinationId === s.destinationId) ?? recommendHotel(s.destinationId, config, catalog);
    return { destinationId: s.destinationId, destinationName: dest?.name ?? s.destinationId, nights: s.nights, hotel };
  });
}

/* ---------------- Vehicles ---------------- */
export function resolveVehicle(config: TripConfig, catalog: Catalog): { vehicle: Vehicle | null; count: number } {
  const chosen = config.vehicleId ? catalog.vehicles.find((v) => v.id === config.vehicleId) : undefined;
  const vehicle = chosen ?? recommendVehicle(config, catalog);
  if (!vehicle) return { vehicle: null, count: 0 };
  return { vehicle, count: Math.max(1, Math.ceil(travellersOf(config) / vehicle.passengers)) };
}

/** Demo distance factor: longer average road time per day costs more. */
export function distanceMultiplier(totalHours: number, days: number) {
  if (!Number.isFinite(totalHours)) return 1.4;
  return clamp(0.9 + (totalHours / Math.max(days, 1)) * 0.08, 0.95, 1.4);
}

/* ---------------- Total ---------------- */
const emptyLines = () => ({ hotels: [], transport: [], activities: [], services: [], meals: [], taxes: [] });

export function computePrice(config: TripConfig, catalog: Catalog): PriceBreakdown {
  const travellers = travellersOf(config);
  if (!config.stops.length) {
    return { hotels: 0, transport: 0, activities: 0, services: 0, meals: 0, taxes: 0, total: 0, perPerson: 0, travellers, lines: emptyLines() };
  }
  const units = personUnits(config);
  const rooms = roomsFor(config);
  const nights = config.stops.reduce((a, s) => a + s.nights, 0);
  const tier = tierById(config.tier);
  const month = config.travelMonth;

  /* Hotels */
  const hotelLines: PriceLine[] = [];
  for (const stay of resolveStays(config, catalog)) {
    if (!stay.hotel) continue;
    const dest = findDestination(catalog, stay.destinationId);
    const factor = seasonFactor(dest?.region ?? "kashmir", month);
    const nightly = stay.hotel.pricePerNight * factor;
    const cost = stay.nights * (rooms * nightly + config.children * EXTRA_BED_FACTOR * nightly);
    hotelLines.push({
      label: `${stay.destinationName} — ${stay.hotel.name}`,
      detail: `${plural(stay.nights, "night")} · ${plural(rooms, "room")}${config.children ? ` · ${plural(config.children, "child extra bed", "children extra beds")}` : ""}`,
      amount: r10(cost),
    });
  }

  /* Transport */
  const transportLines: PriceLine[] = [];
  const { vehicle, count } = resolveVehicle(config, catalog);
  if (vehicle) {
    const route = summariseRoute(config.stops, catalog);
    const mult = distanceMultiplier(route.totalHours, config.days);
    transportLines.push({
      label: `${vehicle.name}${count > 1 ? ` × ${count}` : ""}`,
      detail: `${plural(config.days, "day")} · road-distance factor ×${mult.toFixed(2)}`,
      amount: r10(vehicle.pricePerDay * config.days * count * mult),
    });
  }

  /* Activities (only those whose destination is on the route) */
  const stopIds = config.stops.map((s) => s.destinationId);
  const activityLines: PriceLine[] = [];
  for (const ta of config.activities) {
    const act = catalog.activities.find((a) => a.id === ta.activityId);
    if (!act || !act.destinationIds.some((d) => stopIds.includes(d))) continue;
    const groups = Math.ceil(travellers / 5);
    const amount = act.priceUnit === "person" ? act.price * units : act.price * groups;
    activityLines.push({
      label: act.name,
      detail: act.priceUnit === "person" ? `${formatUnits(units)} × ₹${act.price.toLocaleString("en-IN")}` : `${plural(groups, "group")} × ₹${act.price.toLocaleString("en-IN")}`,
      amount: r10(amount),
    });
  }

  /* Package services + meals */
  const regionWeights = new Map<Region, number>();
  for (const s of config.stops) {
    const region = findDestination(catalog, s.destinationId)?.region ?? "kashmir";
    regionWeights.set(region, (regionWeights.get(region) ?? 0) + s.nights);
  }
  let avgFactor = 1;
  if (nights) {
    let sum = 0;
    regionWeights.forEach((n, region) => (sum += n * seasonFactor(region, month)));
    avgFactor = sum / nights;
  }
  const serviceLines: PriceLine[] = [
    {
      label: `${tier.name} package services`,
      detail: `Transfers, coordination, permits handling & trip support · ${formatUnits(units)} × ${plural(config.days, "day")}`,
      amount: r10(tier.servicePerPersonPerDay * units * config.days * avgFactor),
    },
  ];
  const mealLines: PriceLine[] = [];
  if (tier.mealsPerPersonPerNight > 0) {
    mealLines.push({ label: tier.mealsLabel, detail: `${formatUnits(units)} × ${plural(nights, "night")}`, amount: r10(tier.mealsPerPersonPerNight * units * nights) });
  }

  const sum = (l: PriceLine[]) => l.reduce((a, x) => a + x.amount, 0);
  const hotels = sum(hotelLines);
  const transport = sum(transportLines);
  const activities = sum(activityLines);
  const services = sum(serviceLines);
  const meals = sum(mealLines);

  /* Taxes & fees */
  const taxLines: PriceLine[] = [];
  let permits = 0;
  for (const s of config.stops) {
    const dest = findDestination(catalog, s.destinationId);
    if (dest?.permitFeePerPerson) permits += dest.permitFeePerPerson * travellers;
  }
  if (permits) taxLines.push({ label: "Permits & environmental fees (estimate)", detail: `${plural(travellers, "traveller")}`, amount: r10(permits) });
  const gst = r10((hotels + transport + activities + services + meals) * GST_RATE);
  taxLines.push({ label: `GST & taxes (${Math.round(GST_RATE * 100)}%)`, amount: gst });
  const taxes = sum(taxLines);

  const total = hotels + transport + activities + services + meals + taxes;
  const season = seasonForMonth(month);
  return {
    hotels,
    transport,
    activities,
    services,
    meals,
    taxes,
    total,
    perPerson: r10(total / Math.max(travellers, 1)),
    travellers,
    lines: { hotels: hotelLines, transport: transportLines, activities: activityLines, services: serviceLines, meals: mealLines, taxes: taxLines },
    seasonNote:
      month != null && season
        ? `Priced for ${MONTHS[month]} (${season.name.toLowerCase()} demand, average ×${avgFactor.toFixed(2)} on stays and services).`
        : undefined,
  };
}

function formatUnits(u: number) {
  return Number.isInteger(u) ? plural(u, "traveller") : `${u.toFixed(1)} traveller-equivalents`;
}
