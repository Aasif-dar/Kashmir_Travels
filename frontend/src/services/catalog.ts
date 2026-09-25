/**
 * Catalogue service. Today it reads static demo data; to go live, replace the bodies of these functions with
 * fetch() calls to a Node/Express (or any REST) API — component code and the pure engines keep working as-is.
 */
import { activities } from "@/data/activities";
import { destinations } from "@/data/destinations";
import { hotels } from "@/data/hotels";
import { packages } from "@/data/packages";
import { vehicles } from "@/data/vehicles";
import type { Activity, ActivityCategory } from "@/types/activity";
import type { Destination, Region } from "@/types/destination";
import type { Hotel, HotelCategory } from "@/types/hotel";
import type { TourPackage } from "@/types/package";
import type { Catalog } from "@/types/trip";
import type { Vehicle } from "@/types/vehicle";

const tick = <T,>(v: T): Promise<T> => Promise.resolve(v);

export async function getDestinations(filter: { region?: Region } = {}): Promise<Destination[]> {
  return tick(destinations.filter((d) => !filter.region || d.region === filter.region));
}

export async function getDestination(slug: string): Promise<Destination | undefined> {
  return tick(destinations.find((d) => d.slug === slug || d.id === slug));
}

export async function getPackages(filter: { region?: Region; category?: string } = {}): Promise<TourPackage[]> {
  return tick(packages.filter((p) => (!filter.region || p.regions.includes(filter.region)) && (!filter.category || p.category === filter.category)));
}

export async function getPackage(slug: string): Promise<TourPackage | undefined> {
  return tick(packages.find((p) => p.slug === slug || p.id === slug));
}

export async function getHotels(filter: { destinationId?: string; category?: HotelCategory } = {}): Promise<Hotel[]> {
  return tick(hotels.filter((h) => (!filter.destinationId || h.destinationId === filter.destinationId) && (!filter.category || h.category === filter.category)));
}

export async function getVehicles(): Promise<Vehicle[]> {
  return tick(vehicles);
}

export async function getActivities(filter: { destinationId?: string; category?: ActivityCategory } = {}): Promise<Activity[]> {
  return tick(activities.filter((a) => (!filter.destinationId || a.destinationIds.includes(filter.destinationId)) && (!filter.category || a.category === filter.category)));
}

/** Everything the planner and engines need, in one call. */
export async function getCatalog(): Promise<Catalog> {
  const [d, h, v, a] = await Promise.all([getDestinations(), getHotels(), getVehicles(), getActivities()]);
  return { destinations: d, hotels: h, vehicles: v, activities: a };
}
