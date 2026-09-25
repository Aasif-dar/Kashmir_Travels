"use client";

import { EntityManager, type FieldDef } from "@/components/admin/entity-manager";
import { imageOptions } from "@/components/admin/options";
import { useCatalog } from "@/store/catalog-context";
import type { Destination } from "@/types/destination";

const fields: FieldDef[] = [
  { key: "name", label: "Name", kind: "text", required: true },
  { key: "region", label: "Region", kind: "select", required: true, options: [{ value: "kashmir", label: "Kashmir" }, { value: "jammu", label: "Jammu & Katra" }, { value: "ladakh", label: "Ladakh" }] },
  { key: "hub", label: "Arrival hub", kind: "select", required: true, options: [{ value: "srinagar", label: "Srinagar" }, { value: "jammu", label: "Jammu" }, { value: "leh", label: "Leh" }] },
  { key: "tagline", label: "Tagline", kind: "text", required: true },
  { key: "description", label: "Description (one paragraph per line)", kind: "lines", required: true },
  { key: "image", label: "Hero image", kind: "select", required: true, options: imageOptions, help: "Images live in the central registry (data/images.ts)." },
  { key: "recommendedDays", label: "Recommended duration", kind: "text", required: true },
  { key: "recommendedNights", label: "Recommended nights", kind: "number", min: 1, max: 14, required: true },
  { key: "minNights", label: "Minimum nights", kind: "number", min: 1, max: 14, required: true },
  { key: "maxNights", label: "Maximum nights", kind: "number", min: 1, max: 21, required: true },
  { key: "bestSeason", label: "Best season", kind: "text", required: true },
  { key: "altitude", label: "Altitude", kind: "text" },
  { key: "highlights", label: "Highlights (one per line)", kind: "lines" },
];

export default function AdminDestinationsPage() {
  const { destinations } = useCatalog();
  return (
    <EntityManager<Destination>
      kind="destinations"
      singular="destination"
      title="Destinations"
      description="Places customers can add to a trip. Nested data (day plans, spots, travel info) is preserved when you edit."
      items={destinations}
      fields={fields}
      blank={() => ({ id: "", slug: "", name: "", region: "kashmir", tagline: "", description: [], image: "srinagar", gallery: [], recommendedDays: "1–2 nights", recommendedNights: 1, minNights: 1, maxNights: 3, bestSeason: "", bestMonths: [3, 4, 5, 6, 7, 8, 9, 10], altitude: "", highlights: [], spots: [], activityIds: [], dayPlans: [], nearby: [], hub: "srinagar", travelInfo: [] })}
      columns={[
        { header: "Name", cell: (d) => <span className="font-medium">{d.name}</span> },
        { header: "Region", cell: (d) => <span className="capitalize">{d.region}</span> },
        { header: "Nights (min/rec/max)", cell: (d) => `${d.minNights} / ${d.recommendedNights} / ${d.maxNights}` },
        { header: "Best season", cell: (d) => <span className="text-[13px] text-muted">{d.bestSeason}</span> },
        { header: "Altitude", cell: (d) => d.altitude },
      ]}
    />
  );
}
