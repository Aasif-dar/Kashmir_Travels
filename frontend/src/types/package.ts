import type { Region } from "./destination";
import type { Tier, TripStop } from "./trip";

export type PackageCategory = "Signature" | "Winter" | "Pilgrimage" | "Adventure" | "Honeymoon" | "Family";

export interface TourPackage {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: PackageCategory;
  days: number;
  nights: number;
  regions: Region[];
  stops: TripStop[];
  tier: Tier;
  activityIds: string[];
  meals: string;
  inclusions: string[];
  exclusions: string[];
  image: string;
  /** 0-based months this package is best suited to. */
  bestMonths: number[];
  seasonLabel: string;
  style?: string;
}

export interface TierDefinition {
  id: Tier;
  name: string;
  tagline: string;
  audience: string;
  hotelCategory: "comfort" | "premium" | "luxury";
  hotelLabel: string;
  vehicleLabel: string;
  vehicleType: "sedan" | "suv" | "premium-suv";
  meals: string;
  /** Meals covered on each overnight day, for the itinerary timeline. */
  mealPlan: string[];
  activities: string;
  transfers: string;
  support: string;
  customisation: string;
  inclusions: string[];
  /** Package-services charge, per traveller per day (INR). */
  servicePerPersonPerDay: number;
  /** Meals charge, per traveller per night (INR). */
  mealsPerPersonPerNight: number;
  mealsLabel: string;
}
