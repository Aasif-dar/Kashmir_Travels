import type { Region } from "@/types/destination";
import type { TierDefinition } from "@/types/package";
import type { TravelStyle, Tier } from "@/types/trip";
import type { HotelCategory } from "@/types/hotel";
import type { ActivityCategory } from "@/types/activity";

/* ------------------------------------------------------------------ */
/* Tiers                                                               */
/* ------------------------------------------------------------------ */
export const tiers: TierDefinition[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Honest, well-run travel on a sensible budget",
    audience: "Budget-conscious travellers who want the essentials done properly.",
    hotelCategory: "comfort",
    hotelLabel: "3-star comfort stays",
    vehicleLabel: "Standard vehicle (sedan / SUV)",
    vehicleType: "sedan",
    meals: "Breakfast at select stays",
    activities: "Selected sightseeing",
    transfers: "Airport and inter-city transfers",
    support: "Basic support by phone / WhatsApp",
    customisation: "Standard itinerary, limited changes",
    mealPlan: ["Breakfast at select stays"],
    inclusions: ["3-star accommodation", "Standard vehicle with driver", "Selected sightseeing", "Basic trip support"],
    servicePerPersonPerDay: 600,
    mealsPerPersonPerNight: 0,
    mealsLabel: "Meals not included (breakfast available at most stays)",
  },
  {
    id: "comfort",
    name: "Comfort",
    tagline: "The well-judged middle — comfortable rooms, smooth logistics",
    audience: "Couples and families who want more comfort and a few curated extras.",
    hotelCategory: "premium",
    hotelLabel: "4-star premium stays",
    vehicleLabel: "SUV (Ertiga or similar)",
    vehicleType: "suv",
    meals: "Daily breakfast",
    activities: "Selected activities included in the plan",
    transfers: "Airport and inter-city transfers",
    support: "Trip assistance with a named coordinator",
    customisation: "Flexible activities and pacing",
    mealPlan: ["Breakfast"],
    inclusions: ["4-star accommodation", "Premium vehicle with driver", "Daily breakfast", "Selected activities", "Trip assistance"],
    servicePerPersonPerDay: 1100,
    mealsPerPersonPerNight: 500,
    mealsLabel: "Daily breakfast",
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Unhurried, private and quietly luxurious",
    audience: "Travellers who want luxury stays, a private vehicle and curated experiences.",
    hotelCategory: "luxury",
    hotelLabel: "Luxury and boutique stays",
    vehicleLabel: "Premium SUV (Innova Crysta or similar)",
    vehicleType: "premium-suv",
    meals: "Breakfast and dinner",
    activities: "Curated private experiences",
    transfers: "Private airport and inter-city transfers",
    support: "Priority assistance, dedicated expert on call",
    customisation: "Fully flexible, day by day",
    mealPlan: ["Breakfast", "Dinner"],
    inclusions: ["Luxury / boutique accommodation", "Premium SUV with driver", "Breakfast and dinner", "Curated experiences", "Priority assistance", "Flexible itinerary"],
    servicePerPersonPerDay: 2200,
    mealsPerPersonPerNight: 1400,
    mealsLabel: "Breakfast and dinner",
  },
];

export const tierById = (id: Tier) => tiers.find((t) => t.id === id) ?? tiers[1];

/* ------------------------------------------------------------------ */
/* Road network — approximate driving hours between neighbouring stops */
/* Demo values; used by the itinerary engine and transport pricing.    */
/* ------------------------------------------------------------------ */
/** [from, to, driving hours, approx. km] */
export const roadEdges: [string, string, number, number][] = [
  ["srinagar", "gulmarg", 2.5, 50],
  ["srinagar", "pahalgam", 3, 95],
  ["srinagar", "sonamarg", 3, 80],
  ["srinagar", "doodhpathri", 2.5, 42],
  ["srinagar", "yusmarg", 2, 47],
  ["srinagar", "gurez", 7, 128],
  ["gulmarg", "doodhpathri", 3.5, 78],
  ["srinagar", "patnitop", 5.5, 190],
  ["patnitop", "jammu", 3.5, 112],
  ["patnitop", "katra", 2.5, 90],
  ["jammu", "katra", 1.5, 50],
  ["sonamarg", "leh", 9.5, 340],
  ["leh", "sham-valley", 2.5, 90],
  ["leh", "nubra", 5, 120],
  ["leh", "pangong", 5, 160],
  ["leh", "tso-moriri", 8, 215],
  ["nubra", "pangong", 6, 165],
  ["pangong", "tso-moriri", 7, 210],
];

/** Local transfer between a hub airport/station and the hub city itself. */
export const HUB_LOCAL_HOURS = 0.75;

export const hubInfo: Record<"srinagar" | "jammu" | "leh", { node: string; name: string; gateway: string }> = {
  srinagar: { node: "srinagar", name: "Srinagar", gateway: "Srinagar airport" },
  jammu: { node: "jammu", name: "Jammu", gateway: "Jammu airport / Jammu Tawi station" },
  leh: { node: "leh", name: "Leh", gateway: "Leh airport" },
};

/* ------------------------------------------------------------------ */
/* Realism rules                                                       */
/* ------------------------------------------------------------------ */
export const rules = {
  minDays: 2,
  maxDays: 21,
  maxTravellers: 20,
  /** A single overland leg above this is flagged as a long transfer day. */
  longTransferHours: 8,
  /** Above this, the leg is not realistic as a same-day transfer. */
  maxTransferHours: 13,
  /** Total road hours per night above this → “packed” warning. */
  packedHoursPerNight: 3.8,
  /** Ladakh acclimatisation: nights required in Leh before going higher. */
  lehAcclimatisationNights: 2,
  /** Nights needed when mixing regions overland. */
  regionCombos: [
    { regions: ["kashmir", "ladakh"], minNights: 8, message: "Combining Kashmir and Ladakh overland means a long Srinagar–Leh road journey; plan at least 9 days." },
    { regions: ["kashmir", "jammu"], minNights: 5, message: "Kashmir and Jammu / Katra are 6–8 hours apart by road; plan at least 6 days." },
  ] as { regions: Region[]; minNights: number; message: string }[],
  unsupportedCombos: [
    { regions: ["jammu", "ladakh"] as Region[], message: "Jammu / Katra and Ladakh are too far apart to combine sensibly without Kashmir in between." },
  ],
};

/** Suggested routes by duration. Data-driven: the UI only renders what is here. */
export interface RoutePreset {
  id: string;
  label: string;
  stops: string[];
  styles?: TravelStyle[];
}
export interface DurationPreset {
  minDays: number;
  maxDays: number;
  routes: RoutePreset[];
}
export const durationPresets: DurationPreset[] = [
  {
    minDays: 2,
    maxDays: 3,
    routes: [
      { id: "s-g", label: "Srinagar + Gulmarg", stops: ["srinagar", "gulmarg"], styles: ["adventure", "friends", "couple"] },
      { id: "s-p", label: "Srinagar + Pahalgam", stops: ["srinagar", "pahalgam"], styles: ["family", "relaxed", "photography", "couple"] },
    ],
  },
  {
    minDays: 4,
    maxDays: 4,
    routes: [
      { id: "s-g-p", label: "Srinagar + Gulmarg + Pahalgam", stops: ["srinagar", "gulmarg", "pahalgam"] },
      { id: "s-g-son", label: "Srinagar + Gulmarg + Sonamarg", stops: ["srinagar", "gulmarg", "sonamarg"], styles: ["adventure", "friends"] },
      { id: "j-k", label: "Jammu + Katra + Patnitop", stops: ["jammu", "katra", "patnitop"], styles: ["spiritual", "family"] },
    ],
  },
  {
    minDays: 5,
    maxDays: 5,
    routes: [
      { id: "s-g-p-5", label: "Srinagar + Gulmarg + Pahalgam", stops: ["srinagar", "gulmarg", "pahalgam"] },
      { id: "s-p-son", label: "Srinagar + Pahalgam + Sonamarg", stops: ["srinagar", "pahalgam", "sonamarg"], styles: ["photography", "family"] },
      { id: "k-katra-5", label: "Jammu + Katra + Patnitop + Srinagar", stops: ["jammu", "katra", "patnitop", "srinagar"], styles: ["spiritual"] },
    ],
  },
  {
    minDays: 6,
    maxDays: 7,
    routes: [
      { id: "s-g-p-son", label: "Srinagar + Gulmarg + Pahalgam + Sonamarg", stops: ["srinagar", "gulmarg", "pahalgam", "sonamarg"] },
      { id: "kk-7", label: "Srinagar + Gulmarg + Pahalgam + Katra", stops: ["srinagar", "gulmarg", "pahalgam", "katra"], styles: ["spiritual", "family"] },
      { id: "s-g-p-d", label: "Srinagar + Gulmarg + Pahalgam + Doodhpathri", stops: ["srinagar", "gulmarg", "pahalgam", "doodhpathri"], styles: ["photography", "relaxed", "couple"] },
    ],
  },
  {
    minDays: 8,
    maxDays: 9,
    routes: [
      { id: "grand", label: "Kashmir Grand Journey", stops: ["srinagar", "gulmarg", "pahalgam", "sonamarg", "doodhpathri"] },
      { id: "ladakh-8", label: "Leh + Nubra + Pangong + Sham Valley", stops: ["leh", "nubra", "pangong", "sham-valley"], styles: ["adventure", "photography", "friends"] },
      { id: "gurez", label: "Srinagar + Gulmarg + Pahalgam + Gurez", stops: ["srinagar", "gulmarg", "pahalgam", "gurez"], styles: ["photography", "adventure"] },
    ],
  },
  {
    minDays: 10,
    maxDays: 12,
    routes: [
      { id: "k-l-10", label: "Srinagar + Sonamarg + Leh + Nubra + Pangong", stops: ["srinagar", "sonamarg", "leh", "nubra", "pangong"], styles: ["adventure", "friends", "photography"] },
      { id: "k-grand-12", label: "Srinagar + Gulmarg + Pahalgam + Sonamarg + Katra", stops: ["srinagar", "gulmarg", "pahalgam", "sonamarg", "katra"], styles: ["family", "spiritual"] },
      { id: "ladakh-10", label: "Leh + Nubra + Pangong + Tso Moriri + Sham Valley", stops: ["leh", "nubra", "pangong", "tso-moriri", "sham-valley"], styles: ["adventure", "photography"] },
    ],
  },
  {
    minDays: 13,
    maxDays: 21,
    routes: [
      { id: "kl-14", label: "Kashmir & Ladakh overland", stops: ["srinagar", "gulmarg", "pahalgam", "sonamarg", "leh", "nubra", "pangong"], styles: ["adventure", "friends", "photography"] },
      { id: "kjl-14", label: "Jammu, Kashmir & Katra", stops: ["jammu", "katra", "patnitop", "srinagar", "gulmarg", "pahalgam", "sonamarg"], styles: ["spiritual", "family"] },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Travel styles                                                       */
/* ------------------------------------------------------------------ */
export interface StyleRule {
  id: TravelStyle;
  label: string;
  blurb: string;
  tier?: Tier;
  hotelTags: string[];
  activityCategories: ActivityCategory[];
  /** Activities that get an extra boost for this style. */
  activityIds: string[];
  pace: "relaxed" | "balanced" | "active";
  preferredVehicle?: "sedan" | "suv" | "premium-suv";
  hotelCategory?: HotelCategory;
  /** Destination ids to nudge into route suggestions. */
  destinationBoost: string[];
  note: string;
}

export const travelStyles: StyleRule[] = [
  { id: "family", label: "Family", blurb: "Comfortable stays, an easy pace, activities for all ages", tier: "comfort", hotelTags: ["family"], activityCategories: ["nature", "culture", "snow"], activityIds: ["gulmarg-gondola", "shikara-ride", "horse-riding", "ice-skating"], pace: "relaxed", preferredVehicle: "suv", destinationBoost: ["pahalgam", "gulmarg", "srinagar"], note: "Comfortable hotels, an unhurried pace and family-friendly activities." },
  { id: "couple", label: "Couple", blurb: "Scenic stays, private experiences, romantic settings", tier: "comfort", hotelTags: ["romantic", "lakeview", "boutique"], activityCategories: ["water", "culture", "nature"], activityIds: ["shikara-ride", "houseboat-dinner", "gulmarg-gondola", "hot-air-balloon"], pace: "balanced", preferredVehicle: "suv", destinationBoost: ["srinagar", "gulmarg", "pahalgam"], note: "Scenic, romantic stays with private experiences." },
  { id: "friends", label: "Friends", blurb: "Active days, shared adventures, lively evenings", tier: "basic", hotelTags: ["friends"], activityCategories: ["adventure", "snow", "water"], activityIds: ["atv-ride", "river-rafting", "aru-camp-night", "skiing"], pace: "active", preferredVehicle: "suv", destinationBoost: ["gulmarg", "pahalgam", "sonamarg"], note: "Social, active days with shared adventures." },
  { id: "adventure", label: "Adventure", blurb: "Trekking, rafting, ATV and skiing", tier: "comfort", hotelTags: ["adventure", "ski-in"], activityCategories: ["adventure", "snow", "water"], activityIds: ["alpather-trek", "pahalgam-meadow-trek", "river-rafting", "atv-ride", "skiing", "paragliding", "mountain-biking"], pace: "active", preferredVehicle: "suv", destinationBoost: ["gulmarg", "pahalgam", "leh", "nubra"], note: "High-energy days: trekking, rafting, ATV and skiing." },
  { id: "luxury", label: "Luxury", blurb: "Premium hotels, a premium vehicle, curated experiences", tier: "premium", hotelTags: ["luxury", "boutique"], activityCategories: ["culture", "water", "nature"], activityIds: ["houseboat-dinner", "shikara-ride", "hot-air-balloon", "gulmarg-gondola"], pace: "relaxed", preferredVehicle: "premium-suv", hotelCategory: "luxury", destinationBoost: ["srinagar", "gulmarg", "pahalgam"], note: "Luxury stays, a premium SUV and curated experiences." },
  { id: "photography", label: "Photography", blurb: "Golden-hour locations and unhurried mornings", tier: "comfort", hotelTags: ["photography", "lakeview", "riverside"], activityCategories: ["nature", "culture"], activityIds: ["shikara-ride", "mughal-gardens-circuit", "old-city-walk", "pangong-sunrise-shoot", "horse-riding"], pace: "balanced", preferredVehicle: "suv", destinationBoost: ["srinagar", "pahalgam", "doodhpathri", "pangong"], note: "Golden-hour locations and time to linger." },
  { id: "spiritual", label: "Spiritual", blurb: "Shrines, monasteries and quiet places", tier: "comfort", hotelTags: ["spiritual", "central"], activityCategories: ["spiritual", "culture"], activityIds: ["vaishno-devi-heli", "darshan-assistance", "monastery-circuit", "heritage-walk-jammu"], pace: "balanced", preferredVehicle: "suv", destinationBoost: ["katra", "jammu", "leh"], note: "Shrines, monasteries and helpful yatra support." },
  { id: "relaxed", label: "Relaxed", blurb: "Fewer stops, longer stays, slow mornings", tier: "comfort", hotelTags: ["relaxed", "lakeview", "riverside"], activityCategories: ["water", "culture", "nature"], activityIds: ["shikara-ride", "houseboat-dinner", "mughal-gardens-circuit"], pace: "relaxed", preferredVehicle: "suv", destinationBoost: ["srinagar", "pahalgam"], note: "Fewer stops and longer stays." },
];

export const styleById = (id: TravelStyle | null | undefined) => travelStyles.find((s) => s.id === id);

/* ------------------------------------------------------------------ */
/* Seasons                                                             */
/* ------------------------------------------------------------------ */
export interface Season {
  id: string;
  name: string;
  months: number[];
  label: string;
  headline: string;
  description: string;
  activityIds: string[];
  activityCategories: ActivityCategory[];
  destinationIds: string[];
  image: string;
}

export const seasons: Season[] = [
  { id: "winter", name: "Winter", months: [11, 0, 1], label: "December – February", headline: "Snow, gondolas and quiet lakes", description: "Gulmarg turns into a ski bowl, Srinagar goes hush and Dal Lake mists over. Roads to Gurez and Ladakh are typically closed.", activityIds: ["skiing", "snowboarding", "gulmarg-gondola", "ice-skating"], activityCategories: ["snow"], destinationIds: ["gulmarg", "srinagar", "patnitop", "katra"], image: "gulmarg" },
  { id: "spring", name: "Spring", months: [2, 3], label: "March – April", headline: "Tulips, blossoms and gardens", description: "Almond and cherry blossom arrive, the Tulip Garden opens in April and the Mughal gardens are at their best.", activityIds: ["mughal-gardens-circuit", "shikara-ride", "old-city-walk", "horse-riding"], activityCategories: ["culture", "nature"], destinationIds: ["srinagar", "pahalgam", "doodhpathri"], image: "tulip" },
  { id: "summer", name: "Summer", months: [4, 5], label: "May – June", headline: "Meadows, rivers and open roads", description: "Green meadows, trekking trails and rafting open up. Ladakh's roads begin to open for the season.", activityIds: ["river-rafting", "pahalgam-meadow-trek", "horse-riding", "atv-ride", "alpather-trek"], activityCategories: ["adventure", "water", "nature"], destinationIds: ["pahalgam", "sonamarg", "gulmarg", "leh"], image: "pahalgam" },
  { id: "highsummer", name: "High summer", months: [6, 7], label: "July – August", headline: "Ladakh at its best", description: "Kashmir stays green and cooler than the plains, while Ladakh is at its clearest and most accessible.", activityIds: ["monastery-circuit", "camel-safari", "mountain-biking", "river-rafting"], activityCategories: ["culture", "adventure"], destinationIds: ["leh", "nubra", "pangong", "sham-valley", "tso-moriri"], image: "pangong" },
  { id: "autumn", name: "Autumn", months: [8, 9, 10], label: "September – November", headline: "Chinar gold and clear light", description: "Chinar trees turn copper, skies clear and the light is perfect for photographers. Crowds thin out.", activityIds: ["shikara-ride", "old-city-walk", "mughal-gardens-circuit", "houseboat-dinner"], activityCategories: ["culture", "nature"], destinationIds: ["srinagar", "pahalgam", "gurez", "yusmarg"], image: "hotel-houseboat-3" },
];

export const seasonForMonth = (m: number | null | undefined) => (m == null ? undefined : seasons.find((s) => s.months.includes(m)));

/* ------------------------------------------------------------------ */
/* Seasonal price multipliers (demo)                                   */
/* ------------------------------------------------------------------ */
export const seasonMultiplier: Record<Region, number[]> = {
  //         J     F     M     A     M     J     J     A     S     O     N     D
  kashmir: [1.15, 1.15, 0.95, 1.15, 1.25, 1.25, 1.0, 0.95, 1.0, 1.1, 0.9, 1.2],
  jammu: [1.0, 0.95, 1.1, 1.1, 0.9, 0.9, 0.9, 0.9, 1.0, 1.15, 1.05, 1.1],
  ladakh: [0.75, 0.75, 0.8, 0.85, 1.15, 1.25, 1.25, 1.25, 1.1, 0.95, 0.8, 0.75],
};

/** GST on tour packages — demo value. */
export const GST_RATE = 0.05;
/** Child (under 12) share of an adult's per-person charges. */
export const CHILD_FACTOR = 0.6;
/** Extra-bed charge per child, as a share of the room's nightly rate. */
export const EXTRA_BED_FACTOR = 0.3;
