/**
 * Demo-only admin edits. Changes made in /admin are stored in this browser's localStorage and layered on top
 * of the static catalogue. In production these become real API writes (PUT/POST/DELETE) to your database.
 */
import { readJSON, writeJSON } from "./storage";
import type { Catalog } from "@/types/trip";
import type { TourPackage } from "@/types/package";

export const OVERRIDES_KEY = "zj.admin.overrides.v1";

export type EntityKind = "destinations" | "packages" | "hotels" | "vehicles" | "activities";

interface Patch<T> {
  upserts: T[];
  deleted: string[];
}
export type Overrides = { [K in EntityKind]?: Patch<{ id: string }> };

export const readOverrides = (): Overrides => readJSON<Overrides>(OVERRIDES_KEY, {});

function mergeList<T extends { id: string }>(base: T[], patch?: Patch<T>): T[] {
  if (!patch) return base;
  const deleted = new Set(patch.deleted);
  const map = new Map(base.filter((b) => !deleted.has(b.id)).map((b) => [b.id, b]));
  for (const u of patch.upserts) if (!deleted.has(u.id)) map.set(u.id, u);
  return Array.from(map.values());
}

export function applyCatalogOverrides(base: Catalog, o: Overrides = readOverrides()): Catalog {
  return {
    destinations: mergeList(base.destinations, o.destinations as Patch<Catalog["destinations"][number]> | undefined),
    hotels: mergeList(base.hotels, o.hotels as Patch<Catalog["hotels"][number]> | undefined),
    vehicles: mergeList(base.vehicles, o.vehicles as Patch<Catalog["vehicles"][number]> | undefined),
    activities: mergeList(base.activities, o.activities as Patch<Catalog["activities"][number]> | undefined),
  };
}

export function applyPackageOverrides(base: TourPackage[], o: Overrides = readOverrides()): TourPackage[] {
  return mergeList(base, o.packages as Patch<TourPackage> | undefined);
}

export function upsertEntity(kind: EntityKind, item: { id: string }) {
  const o = readOverrides();
  const patch = o[kind] ?? { upserts: [], deleted: [] };
  patch.upserts = [...patch.upserts.filter((x) => x.id !== item.id), item];
  patch.deleted = patch.deleted.filter((id) => id !== item.id);
  writeJSON(OVERRIDES_KEY, { ...o, [kind]: patch });
}

export function deleteEntity(kind: EntityKind, id: string) {
  const o = readOverrides();
  const patch = o[kind] ?? { upserts: [], deleted: [] };
  patch.upserts = patch.upserts.filter((x) => x.id !== id);
  if (!patch.deleted.includes(id)) patch.deleted.push(id);
  writeJSON(OVERRIDES_KEY, { ...o, [kind]: patch });
}

export function resetOverrides() {
  writeJSON(OVERRIDES_KEY, {});
}
