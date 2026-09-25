"use client";

import { EntityManager, type FieldDef } from "@/components/admin/entity-manager";
import { imageOptions } from "@/components/admin/options";
import { formatINR } from "@/lib/format";
import { useCatalog } from "@/store/catalog-context";
import type { Vehicle } from "@/types/vehicle";

export default function AdminVehiclesPage() {
  const { vehicles, destinations } = useCatalog();
  const fields: FieldDef[] = [
    { key: "name", label: "Name", kind: "text", required: true },
    { key: "model", label: "Model", kind: "text", required: true },
    { key: "type", label: "Type", kind: "select", required: true, options: [{ value: "sedan", label: "Sedan" }, { value: "suv", label: "SUV" }, { value: "premium-suv", label: "Premium SUV" }, { value: "tempo", label: "Tempo Traveller" }] },
    { key: "passengers", label: "Passengers", kind: "number", min: 1, max: 30, required: true },
    { key: "luggage", label: "Luggage", kind: "text" },
    { key: "pricePerDay", label: "Price per day (₹)", kind: "number", min: 500, required: true },
    { key: "description", label: "Description", kind: "textarea" },
    { key: "features", label: "Features (one per line)", kind: "lines" },
    { key: "supportedDestinations", label: "Supported destinations", kind: "multi", options: destinations.map((d) => ({ value: d.id, label: d.name })) },
    { key: "image", label: "Image", kind: "select", required: true, options: imageOptions },
  ];
  return (
    <EntityManager<Vehicle>
      kind="vehicles"
      singular="vehicle"
      title="Vehicles"
      description="Demo fleet. Supported destinations decide which vehicles the planner allows for a route."
      items={vehicles}
      fields={fields}
      blank={() => ({ id: "", name: "", type: "suv", model: "", passengers: 6, luggage: "3 medium bags", features: [], pricePerDay: 4000, supportedDestinations: destinations.map((d) => d.id), image: "veh-suv", description: "" })}
      columns={[
        { header: "Vehicle", cell: (v) => <span className="font-medium">{v.name}</span> },
        { header: "Type", cell: (v) => <span className="capitalize">{v.type.replace("-", " ")}</span> },
        { header: "Seats", cell: (v) => v.passengers },
        { header: "Per day", cell: (v) => <span className="tabular-nums">{formatINR(v.pricePerDay)}</span> },
        { header: "Destinations", cell: (v) => `${v.supportedDestinations.length} of ${destinations.length}` },
      ]}
    />
  );
}
