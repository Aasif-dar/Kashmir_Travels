import type { TourPackage } from "@/types/package";
import type { Destination } from "@/types/destination";
import type { Catalog } from "@/types/trip";
import { defaultTrip, packageToTrip, withTier } from "./trip";
import { computePrice } from "./pricing";

/** "From" price per person (Basic level, 2 adults, no season uplift). Demo estimate. */
export function packageStartingPrice(pkg: TourPackage, catalog: Catalog): number {
  const trip = withTier({ ...packageToTrip(pkg), adults: 2, children: 0 }, "basic");
  return computePrice(trip, catalog).perPerson;
}

export function packageTierPrice(pkg: TourPackage, catalog: Catalog, tier: "basic" | "comfort" | "premium"): number {
  const trip = withTier({ ...packageToTrip(pkg), adults: 2, children: 0 }, tier);
  return computePrice(trip, catalog).perPerson;
}

/** Cheapest sensible stay at a single destination for its recommended nights. */
export function destinationStartingPrice(dest: Destination, catalog: Catalog): number {
  const nights = dest.recommendedNights;
  const trip = withTier(
    { ...defaultTrip(), days: nights + 1, adults: 2, children: 0, stops: [{ destinationId: dest.id, nights }] },
    "basic"
  );
  return computePrice(trip, catalog).perPerson;
}
