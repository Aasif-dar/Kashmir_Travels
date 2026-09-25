"use client";

import { EntityManager, type FieldDef } from "@/components/admin/entity-manager";
import { imageOptions } from "@/components/admin/options";
import { formatINR } from "@/lib/format";
import { useCatalog } from "@/store/catalog-context";
import type { Hotel } from "@/types/hotel";

export default function AdminHotelsPage() {
  const { hotels, destinations } = useCatalog();
  const fields: FieldDef[] = [
    { key: "name", label: "Name", kind: "text", required: true },
    { key: "destinationId", label: "Destination", kind: "select", required: true, options: destinations.map((d) => ({ value: d.id, label: d.name })) },
    { key: "category", label: "Category", kind: "select", required: true, options: [{ value: "comfort", label: "Comfort (3★)" }, { value: "premium", label: "Premium (4★)" }, { value: "luxury", label: "Luxury (5★)" }] },
    { key: "description", label: "Description", kind: "textarea", required: true },
    { key: "rating", label: "Rating (1–5)", kind: "number", min: 1, max: 5, required: true },
    { key: "pricePerNight", label: "Price per room per night (₹)", kind: "number", min: 500, required: true },
    { key: "image", label: "Image", kind: "select", required: true, options: imageOptions },
    { key: "amenities", label: "Amenities (one per line)", kind: "lines" },
    { key: "roomTypes", label: "Room types (one per line)", kind: "lines" },
    { key: "tags", label: "Style tags (one per line)", kind: "lines", help: "e.g. romantic, family, lakeview, ski-in, boutique" },
  ];
  return (
    <EntityManager<Hotel>
      kind="hotels"
      singular="hotel"
      title="Hotels"
      description="Demo hotel inventory. The planner recommends stays from here by tier and travel style."
      items={hotels}
      fields={fields}
      blank={() => ({ id: "", destinationId: "srinagar", name: "", category: "comfort", description: "", rating: 4, image: "hotel-suite", amenities: [], roomTypes: ["Standard Double"], pricePerNight: 4000, tags: [] })}
      columns={[
        { header: "Hotel", cell: (h) => <span className="font-medium">{h.name}</span> },
        { header: "Destination", cell: (h) => destinations.find((d) => d.id === h.destinationId)?.name ?? h.destinationId },
        { header: "Category", cell: (h) => <span className="capitalize">{h.category}</span> },
        { header: "Rating", cell: (h) => h.rating.toFixed(1) },
        { header: "Per night", cell: (h) => <span className="tabular-nums">{formatINR(h.pricePerNight)}</span> },
      ]}
    />
  );
}
