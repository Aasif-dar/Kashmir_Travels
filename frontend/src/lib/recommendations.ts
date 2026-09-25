import { durationPresets, seasonForMonth, styleById, tierById, travelStyles, type RoutePreset } from "@/data/rules";
import type { Activity } from "@/types/activity";
import type { Hotel, HotelCategory } from "@/types/hotel";
import type { Catalog, Tier, TravelStyle, TripConfig } from "@/types/trip";
import type { Vehicle, VehicleType } from "@/types/vehicle";
import { findDestination } from "./itinerary-engine";
import { MONTHS } from "./format";

/* ------------------------------------------------------------------ */
/* Tier + style                                                        */
/* ------------------------------------------------------------------ */
export function recommendTier(style: TravelStyle | null): Tier {
  return styleById(style)?.tier ?? "comfort";
}

/* ------------------------------------------------------------------ */
/* Hotels                                                              */
/* ------------------------------------------------------------------ */
const CATEGORY_ORDER: HotelCategory[] = ["comfort", "premium", "luxury"];

export function hotelsFor(destinationId: string, catalog: Catalog): Hotel[] {
  return catalog.hotels
    .filter((h) => h.destinationId === destinationId)
    .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.pricePerNight - b.pricePerNight);
}

export function targetHotelCategory(config: Pick<TripConfig, "tier" | "style">): HotelCategory {
  const style = styleById(config.style);
  return style?.hotelCategory && config.tier === "premium" ? style.hotelCategory : tierById(config.tier).hotelCategory;
}

/** Best-matching hotel for a destination given the tier and travel style. */
export function recommendHotel(destinationId: string, config: Pick<TripConfig, "tier" | "style">, catalog: Catalog): Hotel | null {
  const options = hotelsFor(destinationId, catalog);
  if (!options.length) return null;
  const wanted = targetHotelCategory(config);
  const tags = styleById(config.style)?.hotelTags ?? [];
  const scored = options.map((h) => {
    const catDistance = Math.abs(CATEGORY_ORDER.indexOf(h.category) - CATEGORY_ORDER.indexOf(wanted));
    const tagScore = h.tags.filter((t) => tags.includes(t)).length;
    return { h, score: -catDistance * 10 + tagScore };
  });
  return scored.sort((a, b) => b.score - a.score)[0].h;
}

export function hotelReason(hotel: Hotel, config: Pick<TripConfig, "tier" | "style">): string | null {
  const style = styleById(config.style);
  const matched = style ? hotel.tags.filter((t) => style.hotelTags.includes(t)) : [];
  if (matched.length && style) return `Suits your ${style.label.toLowerCase()} style`;
  if (hotel.category === targetHotelCategory(config)) return `Matches your ${tierById(config.tier).name} level`;
  return null;
}

/* ------------------------------------------------------------------ */
/* Vehicles                                                            */
/* ------------------------------------------------------------------ */
const VEHICLE_ORDER: VehicleType[] = ["sedan", "suv", "premium-suv", "tempo"];

export function vehiclesSupporting(stopIds: string[], catalog: Catalog): Vehicle[] {
  return catalog.vehicles.filter((v) => stopIds.every((id) => v.supportedDestinations.includes(id)));
}

export function recommendVehicle(config: Pick<TripConfig, "tier" | "style" | "adults" | "children" | "stops">, catalog: Catalog): Vehicle | null {
  const stopIds = config.stops.map((s) => s.destinationId);
  const supported = vehiclesSupporting(stopIds, catalog);
  if (!supported.length) return null;
  const travellers = config.adults + config.children;
  const style = styleById(config.style);
  let wanted: VehicleType = tierById(config.tier).vehicleType;
  if (config.tier === "premium" && style?.preferredVehicle) wanted = style.preferredVehicle;
  if (travellers > 6) wanted = "tempo";
  else if (travellers > 4 && wanted === "sedan") wanted = "suv";
  const start = VEHICLE_ORDER.indexOf(wanted);
  for (let i = 0; i < VEHICLE_ORDER.length; i++) {
    for (const idx of [start + i, start - i]) {
      const type = VEHICLE_ORDER[idx];
      const v = type && supported.find((x) => x.type === type);
      if (v && (travellers <= 6 ? v.type !== "tempo" : true)) return v;
    }
  }
  return supported[0];
}

/* ------------------------------------------------------------------ */
/* Activities                                                          */
/* ------------------------------------------------------------------ */
export interface ActivityRecommendation {
  activity: Activity;
  score: number;
  reasons: string[];
}

/** Rule-based ranking: destination fit → travel style → season. No AI or API involved. */
export function recommendActivities(config: Pick<TripConfig, "stops" | "style" | "travelMonth" | "children">, catalog: Catalog): ActivityRecommendation[] {
  const stopIds = config.stops.map((s) => s.destinationId);
  const style = styleById(config.style);
  const season = seasonForMonth(config.travelMonth);
  const results: ActivityRecommendation[] = [];
  for (const activity of catalog.activities) {
    const here = activity.destinationIds.filter((d) => stopIds.includes(d));
    if (!here.length) continue;
    let score = 0;
    const reasons: string[] = [];
    // Destination rule: appears in a destination's recommended list, weighted by rank.
    for (const id of here) {
      const dest = findDestination(catalog, id);
      const rank = dest?.activityIds.indexOf(activity.id) ?? -1;
      if (rank >= 0) {
        score += 6 - Math.min(rank, 5);
        reasons.push(`Popular at ${dest!.name}`);
        break;
      }
    }
    if (style) {
      if (style.activityIds.includes(activity.id)) {
        score += 5;
        reasons.push(`Fits your ${style.label} style`);
      } else if (style.activityCategories.includes(activity.category)) score += 2;
      if (activity.styles.includes(style.id)) score += 2;
    }
    if (config.travelMonth != null) {
      if (activity.months.includes(config.travelMonth)) {
        score += 2;
        if (season && season.activityIds.includes(activity.id)) {
          score += 3;
          reasons.push(`Great in ${MONTHS[config.travelMonth]}`);
        }
      } else score -= 8;
    }
    if (config.children > 0 && activity.difficulty === "challenging") score -= 4;
    results.push({ activity, score, reasons: Array.from(new Set(reasons)).slice(0, 2) });
  }
  return results.sort((a, b) => b.score - a.score);
}

/** Starter set of activities for a fresh trip (used by Auto-plan). */
export function suggestActivityIds(config: Pick<TripConfig, "stops" | "style" | "travelMonth" | "children">, catalog: Catalog, max = 3): string[] {
  return recommendActivities(config, catalog)
    .filter((r) => r.score >= 6 && (config.travelMonth == null || r.activity.months.includes(config.travelMonth)))
    .slice(0, max)
    .map((r) => r.activity.id);
}

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */
export interface RouteSuggestion extends RoutePreset {
  seasonOk: boolean;
  styleMatch: boolean;
}

export function suggestRoutes(days: number, style: TravelStyle | null, month: number | null, catalog: Catalog): RouteSuggestion[] {
  const preset = durationPresets.find((p) => days >= p.minDays && days <= p.maxDays) ?? durationPresets[durationPresets.length - 1];
  return preset.routes
    .map((r) => {
      const seasonOk =
        month == null ||
        r.stops.every((id) => {
          const d = findDestination(catalog, id);
          return !d?.restrictedMonths?.includes(month);
        });
      const styleMatch = !!style && !!r.styles?.includes(style);
      return { ...r, seasonOk, styleMatch };
    })
    .sort((a, b) => Number(b.seasonOk) - Number(a.seasonOk) || Number(b.styleMatch) - Number(a.styleMatch));
}

export const styleLabel = (id: TravelStyle) => travelStyles.find((s) => s.id === id)?.label ?? id;

/* ------------------------------------------------------------------ */
/* Route picking for the quick planner                                 */
/* ------------------------------------------------------------------ */
const REGION_PRIORITY: Record<string, string[]> = {
  kashmir: ["srinagar", "gulmarg", "pahalgam", "sonamarg", "doodhpathri", "yusmarg"],
  jammu: ["jammu", "katra", "patnitop"],
  ladakh: ["leh", "sham-valley", "nubra", "pangong", "tso-moriri"],
};

/** Chooses a realistic set of destinations for a duration / region / style / month. Rule-based. */
export function pickStops(days: number, region: string, style: TravelStyle | null, month: number | null, catalog: Catalog): string[] {
  const nights = Math.max(1, days - 1);
  const regionOk = (ids: string[]) => region === "any" || ids.every((id) => findDestination(catalog, id)?.region === region);
  const route = suggestRoutes(days, style, month, catalog).find((r) => regionOk(r.stops) && r.seasonOk);
  if (route) return route.stops;
  const priority = REGION_PRIORITY[region === "any" ? "kashmir" : region] ?? REGION_PRIORITY.kashmir;
  const boosted = style ? styleById(style)?.destinationBoost.filter((id) => priority.includes(id)) ?? [] : [];
  const ordered = Array.from(new Set([...priority.slice(0, 1), ...boosted, ...priority]));
  const picked: string[] = [];
  let used = 0;
  for (const id of ordered) {
    const d = findDestination(catalog, id);
    if (!d) continue;
    if (month != null && d.restrictedMonths?.includes(month)) continue;
    if (used + d.minNights <= nights) {
      picked.push(id);
      used += d.minNights;
    }
  }
  return picked.length ? picked : priority.slice(0, 1);
}
