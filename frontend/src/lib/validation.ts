import { z } from "zod";
import { rules } from "@/data/rules";
import type { Region } from "@/types/destination";
import type { Catalog, TripConfig, TripIssue } from "@/types/trip";
import { findDestination, nightsForDays, insertStop, distributeNights, summariseRoute } from "./itinerary-engine";
import { resolveVehicle, travellersOf } from "./pricing";
import { MONTHS, formatHours } from "./format";
import { plural } from "./utils";

const HIGH_ALT = ["nubra", "pangong", "tso-moriri"];

/* ------------------------------------------------------------------ */
/* Trip realism                                                        */
/* ------------------------------------------------------------------ */
export function validateTrip(config: TripConfig, catalog: Catalog): TripIssue[] {
  const issues: TripIssue[] = [];
  const add = (code: string, severity: TripIssue["severity"], message: string) => issues.push({ code, severity, message });
  const nights = nightsForDays(config.days);
  const dests = config.stops.map((s) => findDestination(catalog, s.destinationId)).filter(Boolean) as NonNullable<ReturnType<typeof findDestination>>[];

  if (config.adults < 1) add("NO_ADULT", "error", "At least one adult traveller is needed.");
  if (travellersOf(config) > rules.maxTravellers) add("TOO_MANY", "error", `For groups above ${rules.maxTravellers}, please contact our team directly.`);

  if (!dests.length) {
    add("NO_STOPS", "error", "Choose at least one destination.");
    return issues;
  }

  /* Minimum time */
  const minNights = dests.reduce((a, d) => a + d.minNights, 0);
  if (minNights > nights) {
    add(
      "TOO_MANY_STOPS",
      "error",
      `${dests.map((d) => d.name).join(", ")} need at least ${plural(minNights, "night")} together, but a ${config.days}-day trip has ${plural(nights, "night")}. Remove a destination or add days.`
    );
  }
  const stayed = config.stops.reduce((a, s) => a + s.nights, 0);
  if (stayed !== nights && minNights <= nights) add("NIGHTS_MISMATCH", "warning", "Nights per stop don't add up to the trip length — use Rebalance.");

  const recommended = dests.reduce((a, d) => a + d.recommendedNights, 0);
  if (minNights <= nights && nights < recommended) add("RUSHED", "info", "This is a brisk pace — each place gets less than the recommended time.");
  for (const s of config.stops) {
    const d = findDestination(catalog, s.destinationId);
    if (d && s.nights > d.maxNights) add(`LONG_STAY_${d.id}`, "info", `${s.nights} nights in ${d.name} is more than most travellers need (${d.maxNights}).`);
  }

  /* Region rules */
  const regions = Array.from(new Set(dests.map((d) => d.region)));
  for (const combo of rules.unsupportedCombos) {
    if (combo.regions.every((r) => regions.includes(r)) && !regions.includes("kashmir")) add("UNSUPPORTED_COMBO", "error", combo.message);
  }
  for (const combo of rules.regionCombos) {
    if (combo.regions.every((r: Region) => regions.includes(r)) && nights < combo.minNights) add(`COMBO_${combo.regions.join("_")}`, "error", combo.message);
  }

  /* Ladakh altitude */
  const hasLeh = dests.some((d) => d.id === "leh");
  if (dests.some((d) => HIGH_ALT.includes(d.id)) && !hasLeh) add("NEEDS_LEH", "error", "Nubra, Pangong and Tso Moriri are reached from Leh — add Leh first so you can acclimatise.");
  if (hasLeh) {
    let lehNights = 0;
    for (const s of config.stops) {
      if (["leh", "sham-valley"].includes(s.destinationId)) lehNights += s.nights;
      else if (HIGH_ALT.includes(s.destinationId) && lehNights < rules.lehAcclimatisationNights) {
        add(
          "ACCLIMATISE",
          "error",
          `Spend at least ${plural(rules.lehAcclimatisationNights, "night")} in Leh (3,500 m) before going up to ${findDestination(catalog, s.destinationId)?.name}. Move Leh earlier or give it more time.`
        );
        break;
      }
    }
  }

  /* Roads */
  const route = summariseRoute(config.stops, catalog);
  if (route.unreachable) add("UNREACHABLE", "error", "These destinations aren't connected by a road route we can plan.");
  else {
    for (const leg of route.legs) {
      const from = findDestination(catalog, leg.fromId)?.name;
      const to = findDestination(catalog, leg.toId)?.name;
      if (leg.hours > rules.maxTransferHours) add(`LEG_${leg.fromId}_${leg.toId}`, "error", `${from} → ${to} is about ${formatHours(leg.hours)} by road — too long for one day.`);
      else if (leg.hours > rules.longTransferHours) add(`LONG_${leg.fromId}_${leg.toId}`, "warning", `${from} → ${to} is a long drive (about ${formatHours(leg.hours)}). Plan a very early start.`);
    }
    if (route.totalHours > nights * rules.packedHoursPerNight && nights > 0) {
      add("PACKED", "warning", `About ${formatHours(route.totalHours)} of driving across ${plural(nights, "night")} — a lot of time on the road. Consider fewer destinations or more days.`);
    }
  }

  /* Seasonality (informational — never a live claim) */
  if (config.travelMonth != null) {
    for (const d of dests) {
      if (d.restrictedMonths?.includes(config.travelMonth)) {
        add(`SEASON_${d.id}`, "warning", `${d.name} is typically hard to reach in ${MONTHS[config.travelMonth]}. ${d.restrictionNote ?? ""} We confirm feasibility before you pay anything.`.trim());
      }
    }
    for (const ta of config.activities) {
      const act = catalog.activities.find((a) => a.id === ta.activityId);
      if (act && !act.months.includes(config.travelMonth)) add(`OFFSEASON_${act.id}`, "warning", `${act.name} is usually offered ${act.season.toLowerCase()} — not typically in ${MONTHS[config.travelMonth]}.`);
    }
  }

  /* Vehicle */
  const { vehicle, count } = resolveVehicle(config, catalog);
  if (!vehicle) add("NO_VEHICLE", "error", "No vehicle in our demo fleet covers every destination on this route.");
  else {
    const unsupported = dests.filter((d) => !vehicle.supportedDestinations.includes(d.id));
    if (unsupported.length) add("VEHICLE_UNSUPPORTED", "error", `${vehicle.name} isn't suitable for ${unsupported.map((d) => d.name).join(", ")}. Choose an SUV or premium SUV.`);
    if (count > 1) add("VEHICLE_COUNT", "info", `${plural(travellersOf(config), "traveller")} need ${count} × ${vehicle.name}.`);
  }
  if (dests.some((d) => d.region === "ladakh")) add("ALTITUDE", "info", "Ladakh is high altitude. Keep the first day light, hydrate, and ask your doctor if you have heart, lung or blood-pressure conditions.");

  return issues;
}

export const hasErrors = (issues: TripIssue[]) => issues.some((i) => i.severity === "error");

/** Checks whether a destination can be added to the current plan without making it unrealistic. */
export function canAddDestination(config: TripConfig, destinationId: string, catalog: Catalog): { ok: boolean; reason?: string } {
  const current = config.stops.map((s) => s.destinationId);
  if (current.includes(destinationId)) return { ok: true };
  let ordered = current;
  if (HIGH_ALT.includes(destinationId) && !ordered.includes("leh")) ordered = insertStop(ordered, "leh", catalog);
  ordered = insertStop(ordered, destinationId, catalog);
  const trial: TripConfig = { ...config, stops: distributeNights(ordered, nightsForDays(config.days), catalog) };
  const blocking = validateTrip(trial, catalog).find((i) => i.severity === "error" && !["NO_VEHICLE", "VEHICLE_UNSUPPORTED", "NIGHTS_MISMATCH"].includes(i.code));
  return blocking ? { ok: false, reason: blocking.message } : { ok: true };
}

/* ------------------------------------------------------------------ */
/* Booking form                                                        */
/* ------------------------------------------------------------------ */
export const travellerDetailsSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{8,14}$/, "Enter a valid phone number (with country code if outside India)"),
  adults: z.number({ error: "Enter the number of adults" }).int().min(1, "At least one adult").max(20, "Contact us for larger groups"),
  children: z.number({ error: "Enter the number of children" }).int().min(0).max(10),
  travelDate: z
    .string()
    .min(1, "Choose your travel date")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Enter a valid date")
    .refine((v) => new Date(v).getTime() > Date.now(), "Travel date must be in the future"),
  pickupLocation: z.string().trim().min(2, "Where should we pick you up?").max(120),
  specialRequests: z.string().trim().max(600, "Please keep this under 600 characters").optional(),
});
export type TravellerDetails = z.infer<typeof travellerDetailsSchema>;

export const bookingFormSchema = travellerDetailsSchema.extend({
  terms: z.boolean().refine((v) => v === true, "Please agree to the booking terms to continue"),
});
export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(8, "Enter a valid phone number").optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little about your trip (10+ characters)").max(1000),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const lookupSchema = z.object({
  bookingId: z.string().trim().regex(/^KT-\d{4}-\d{4}$/i, "Booking references look like KT-2026-1234"),
});
