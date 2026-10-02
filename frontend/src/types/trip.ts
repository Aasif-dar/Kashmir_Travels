import type { Activity } from "./activity";
import type { Destination, Region } from "./destination";
import type { Hotel } from "./hotel";
import type { Vehicle } from "./vehicle";

export type Tier = "basic" | "comfort" | "premium";
export type TravelStyle = "family" | "couple" | "friends" | "adventure" | "luxury" | "photography" | "spiritual" | "relaxed";

export interface TripStop {
  destinationId: string;
  nights: number;
}

export interface TripActivity {
  activityId: string;
  /** 1-based day of stay at the activity's destination; undefined lets the engine place it. */
  stayDay?: number;
}

export interface TripConfig {
  packageId?: string;
  days: number;
  startingFrom: string;
  region: Region | "any";
  travelMonth: number | null;
  adults: number;
  children: number;
  style: TravelStyle | null;
  tier: Tier;
  stops: TripStop[];
  /** destinationId -> hotelId (explicit selections; missing = recommended default). */
  hotels: Record<string, string>;
  vehicleId: string | null;
  activities: TripActivity[];
  /** key: `${destinationId}:${stayDay}` */
  dayNotes: Record<string, string>;
}

/** Everything the pure engines need. Comes from the service layer (static today, an API tomorrow). */
export interface Catalog {
  destinations: Destination[];
  hotels: Hotel[];
  vehicles: Vehicle[];
  activities: Activity[];
}

export type IssueSeverity = "error" | "warning" | "info";
export interface TripIssue {
  code: string;
  severity: IssueSeverity;
  message: string;
}

export type ItineraryItemKind = "arrival" | "transfer" | "sightseeing" | "activity" | "leisure" | "departure" | "checkin";

export interface ItineraryItem {
  kind: ItineraryItemKind;
  title: string;
  description?: string;
  activityId?: string;
  /** Set when this line is an optional experience the traveller has not added yet. */
  optionalActivityId?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  /** Destination the traveller sleeps in (null on the departure day). */
  overnightId: string | null;
  stayDay: number;
  isTransfer: boolean;
  transferHours?: number;
  /** Approximate road distance for the day’s transfer, in km. */
  transferKm?: number;
  transferFromId?: string;
  items: ItineraryItem[];
  noteKey: string;
  note?: string;
}

export interface PriceLine {
  label: string;
  detail?: string;
  amount: number;
}

export interface PriceBreakdown {
  hotels: number;
  transport: number;
  activities: number;
  services: number;
  meals: number;
  taxes: number;
  total: number;
  perPerson: number;
  travellers: number;
  lines: {
    hotels: PriceLine[];
    transport: PriceLine[];
    activities: PriceLine[];
    services: PriceLine[];
    meals: PriceLine[];
    taxes: PriceLine[];
  };
  seasonNote?: string;
}

export interface ResolvedStay {
  destinationId: string;
  destinationName: string;
  nights: number;
  hotel: Hotel | null;
}
