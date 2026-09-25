export type Region = "kashmir" | "jammu" | "ladakh";
export type Hub = "srinagar" | "jammu" | "leh";

/** A plain sightseeing line, or an optional experience linked to an activity (shown as an add-on until chosen). */
export type PlanItem = string | { text: string; activity: string };

export interface DayPlan {
  title: string;
  items: PlanItem[];
}

export interface Spot {
  name: string;
  note: string;
  image?: string;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  region: Region;
  tagline: string;
  /** Editorial paragraphs shown on the destination page. */
  description: string[];
  /** Image registry key (see data/images.ts). */
  image: string;
  gallery: string[];
  recommendedDays: string;
  recommendedNights: number;
  minNights: number;
  maxNights: number;
  bestSeason: string;
  /** 0-based months that suit the destination. */
  bestMonths: number[];
  /** 0-based months when access is typically restricted (road/weather). Informational only — not live. */
  restrictedMonths?: number[];
  restrictionNote?: string;
  altitude: string;
  highlights: string[];
  spots: Spot[];
  activityIds: string[];
  /** Sightseeing plan per day of stay, used by the itinerary engine. */
  dayPlans: DayPlan[];
  nearby: string[];
  /** Nearest arrival/departure hub. */
  hub: Hub;
  permitFeePerPerson?: number;
  travelInfo: { label: string; value: string }[];
}
