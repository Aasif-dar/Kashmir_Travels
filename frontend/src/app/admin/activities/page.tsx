"use client";

import { EntityManager, type FieldDef } from "@/components/admin/entity-manager";
import { imageOptions } from "@/components/admin/options";
import { formatINR } from "@/lib/format";
import { useCatalog } from "@/store/catalog-context";
import type { Activity } from "@/types/activity";

export default function AdminActivitiesPage() {
  const { activities, destinations } = useCatalog();
  const fields: FieldDef[] = [
    { key: "name", label: "Name", kind: "text", required: true },
    { key: "destinationIds", label: "Available at", kind: "multi", required: true, options: destinations.map((d) => ({ value: d.id, label: d.name })) },
    { key: "category", label: "Category", kind: "select", required: true, options: ["snow", "adventure", "water", "nature", "culture", "spiritual"].map((v) => ({ value: v, label: v })) },
    { key: "duration", label: "Duration", kind: "text", required: true },
    { key: "difficulty", label: "Difficulty", kind: "select", required: true, options: ["easy", "moderate", "challenging"].map((v) => ({ value: v, label: v })) },
    { key: "price", label: "Price (₹)", kind: "number", min: 0, required: true },
    { key: "priceUnit", label: "Price is per", kind: "select", required: true, options: [{ value: "person", label: "Person" }, { value: "group", label: "Group (up to 5)" }] },
    { key: "season", label: "Season (text)", kind: "text" },
    { key: "description", label: "Description", kind: "textarea", required: true },
    { key: "image", label: "Image", kind: "select", required: true, options: imageOptions },
  ];
  return (
    <EntityManager<Activity>
      kind="activities"
      singular="activity"
      title="Activities"
      description="Experiences customers can add to their trip. Months of operation and style tags are preserved when you edit."
      items={activities}
      fields={fields}
      blank={() => ({ id: "", name: "", destinationIds: ["srinagar"], category: "nature", duration: "2 hours", difficulty: "easy", price: 1500, priceUnit: "person", months: [3, 4, 5, 6, 7, 8, 9, 10], season: "April to November", image: "act-horse", description: "", styles: [] })}
      columns={[
        { header: "Activity", cell: (a) => <span className="font-medium">{a.name}</span> },
        { header: "Where", cell: (a) => <span className="text-[13px]">{a.destinationIds.map((id) => destinations.find((d) => d.id === id)?.name ?? id).join(" · ")}</span> },
        { header: "Category", cell: (a) => <span className="capitalize">{a.category}</span> },
        { header: "Difficulty", cell: (a) => <span className="capitalize">{a.difficulty}</span> },
        { header: "Price", cell: (a) => <span className="tabular-nums">{formatINR(a.price)} / {a.priceUnit}</span> },
      ]}
    />
  );
}
