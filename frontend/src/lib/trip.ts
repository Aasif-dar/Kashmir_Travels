import type { TourPackage } from "@/types/package";
import type { Catalog, Tier, TravelStyle, TripActivity, TripConfig } from "@/types/trip";
import { distributeNights, findDestination, insertStop, nightsForDays, optimiseOrder } from "./itinerary-engine";
import { recommendTier, suggestActivityIds } from "./recommendations";
import { rules } from "@/data/rules";
import { clamp } from "./utils";

export function defaultTrip(): TripConfig {
  return {
    days: 5,
    startingFrom: "Delhi",
    region: "any",
    travelMonth: null,
    adults: 2,
    children: 0,
    style: null,
    tier: "comfort",
    stops: [],
    hotels: {},
    vehicleId: null,
    activities: [],
    dayNotes: {},
  };
}

export function packageToTrip(pkg: TourPackage): TripConfig {
  return {
    ...defaultTrip(),
    packageId: pkg.id,
    days: pkg.days,
    region: pkg.regions[0],
    tier: pkg.tier,
    style: (pkg.style as TravelStyle | undefined) ?? null,
    stops: pkg.stops.map((s) => ({ ...s })),
    activities: pkg.activityIds.map((activityId) => ({ activityId })),
  };
}

/** Drops hotel picks, activities and notes that no longer belong to the route. */
export function pruneTrip(trip: TripConfig, catalog: Catalog): TripConfig {
  const ids = new Set(trip.stops.map((s) => s.destinationId));
  const hotels = Object.fromEntries(Object.entries(trip.hotels).filter(([d, hid]) => ids.has(d) && catalog.hotels.some((h) => h.id === hid && h.destinationId === d)));
  const activities = trip.activities.filter((a) => {
    const act = catalog.activities.find((x) => x.id === a.activityId);
    return !!act && act.destinationIds.some((d) => ids.has(d));
  });
  const dayNotes = Object.fromEntries(Object.entries(trip.dayNotes).filter(([k]) => k === "departure" || ids.has(k.split(":")[0])));
  const vehicleId = trip.vehicleId && catalog.vehicles.some((v) => v.id === trip.vehicleId) ? trip.vehicleId : null;
  return { ...trip, hotels, activities, dayNotes, vehicleId };
}

/** Re-flows nights across the current destinations after a duration change. */
export function withDays(trip: TripConfig, days: number, catalog: Catalog): TripConfig {
  const d = clamp(Math.round(days), rules.minDays, rules.maxDays);
  const ids = trip.stops.map((s) => s.destinationId);
  return { ...trip, days: d, stops: ids.length ? distributeNights(ids, nightsForDays(d), catalog) : [] };
}

/** Sets the destination set (ordering + nights derived by the engine). Auto-adds Leh for high-altitude Ladakh stops. */
export function withDestinations(trip: TripConfig, ids: string[], catalog: Catalog, opts: { keepOrder?: boolean } = {}): TripConfig {
  let list = Array.from(new Set(ids)).filter((id) => findDestination(catalog, id));
  const needsLeh = list.some((id) => ["nubra", "pangong", "tso-moriri"].includes(id));
  if (needsLeh && !list.includes("leh")) list = ["leh", ...list];
  const ordered = opts.keepOrder ? list : optimiseOrder(list, catalog);
  const next: TripConfig = { ...trip, stops: distributeNights(ordered, nightsForDays(trip.days), catalog) };
  return pruneTrip(next, catalog);
}

/** Adds a destination at its cheapest position (keeping the traveller's order) and re-flows nights. Auto-adds Leh for high-altitude stops. */
export function addStop(trip: TripConfig, id: string, catalog: Catalog): TripConfig {
  let order = trip.stops.map((s) => s.destinationId);
  if (["nubra", "pangong", "tso-moriri"].includes(id) && !order.includes("leh")) order = insertStop(order, "leh", catalog);
  order = insertStop(order, id, catalog);
  return withDestinations(trip, order, catalog, { keepOrder: true });
}

export function removeStop(trip: TripConfig, id: string, catalog: Catalog): TripConfig {
  return withDestinations(trip, trip.stops.map((s) => s.destinationId).filter((d) => d !== id), catalog, { keepOrder: true });
}

export function withTier(trip: TripConfig, tier: Tier): TripConfig {
  // Tier changes reset explicit hotel/vehicle picks so recommendations follow the new level.
  return { ...trip, tier, hotels: {}, vehicleId: null };
}

export function withStyle(trip: TripConfig, style: TravelStyle | null): TripConfig {
  return { ...trip, style, hotels: {}, vehicleId: null };
}

/** Builds a fresh trip from the hero quick-planner: duration, region, style, month. */
export function autoPlan(base: TripConfig, catalog: Catalog, stopIds: string[]): TripConfig {
  let trip = withDestinations({ ...base, hotels: {}, activities: [], dayNotes: {}, vehicleId: null }, stopIds, catalog);
  trip = { ...trip, tier: base.style ? recommendTier(base.style) : base.tier };
  const ids = suggestActivityIds(trip, catalog, 3);
  trip.activities = ids.map((activityId): TripActivity => ({ activityId }));
  return trip;
}

export function moveStop(trip: TripConfig, index: number, dir: -1 | 1): TripConfig {
  const j = index + dir;
  if (j < 0 || j >= trip.stops.length) return trip;
  const stops = [...trip.stops];
  [stops[index], stops[j]] = [stops[j], stops[index]];
  return { ...trip, stops };
}

/** Moves a night from one stop to another (adjust the day split). Total nights are preserved. */
export function shiftNight(trip: TripConfig, from: number, to: number, catalog: Catalog): TripConfig {
  if (from === to) return trip;
  const src = trip.stops[from];
  const dst = trip.stops[to];
  const dstDest = findDestination(catalog, dst.destinationId);
  const srcDest = findDestination(catalog, src.destinationId);
  if (!src || !dst || !dstDest || !srcDest) return trip;
  if (src.nights <= 1 || dst.nights >= dstDest.maxNights + 1) return trip;
  const stops = trip.stops.map((s, i) => (i === from ? { ...s, nights: s.nights - 1 } : i === to ? { ...s, nights: s.nights + 1 } : s));
  return { ...trip, stops };
}

export function replaceStop(trip: TripConfig, index: number, destinationId: string, catalog: Catalog): TripConfig {
  if (trip.stops.some((s, i) => i !== index && s.destinationId === destinationId)) return trip;
  const stops = trip.stops.map((s, i) => (i === index ? { destinationId, nights: s.nights } : s));
  const dest = findDestination(catalog, destinationId);
  if (dest) stops[index].nights = clamp(stops[index].nights, dest.minNights, Math.max(dest.maxNights, stops[index].nights));
  return pruneTrip({ ...trip, stops }, catalog);
}
