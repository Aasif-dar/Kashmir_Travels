"use client";

import { EntityManager, type FieldDef } from "@/components/admin/entity-manager";
import { imageOptions } from "@/components/admin/options";
import { formatINR } from "@/lib/format";
import { packageStartingPrice } from "@/lib/starting-price";
import { useCatalog, usePackages } from "@/store/catalog-context";
import type { TourPackage } from "@/types/package";

export default function AdminPackagesPage() {
  const catalog = useCatalog();
  const packages = usePackages();
  const fields: FieldDef[] = [
    { key: "name", label: "Name", kind: "text", required: true },
    { key: "tagline", label: "Tagline", kind: "text", required: true },
    { key: "description", label: "Description", kind: "textarea", required: true },
    { key: "category", label: "Type", kind: "select", required: true, options: ["Signature", "Winter", "Pilgrimage", "Adventure", "Honeymoon", "Family"].map((v) => ({ value: v, label: v })) },
    { key: "days", label: "Days", kind: "number", min: 2, max: 21, required: true },
    { key: "nights", label: "Nights", kind: "number", min: 1, max: 20, required: true },
    { key: "tier", label: "Default level", kind: "select", required: true, options: [{ value: "basic", label: "Basic" }, { value: "comfort", label: "Comfort" }, { value: "premium", label: "Premium" }] },
    {
      key: "stops",
      label: "Route (one per line: destination-id:nights)",
      kind: "lines",
      required: true,
      help: `Destination ids: ${catalog.destinations.map((d) => d.id).join(", ")}`,
      format: (v) => (Array.isArray(v) ? (v as { destinationId: string; nights: number }[]).map((s) => `${s.destinationId}:${s.nights}`).join("\n") : ""),
      parse: (s) =>
        s
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => {
            const [destinationId, n] = l.split(":");
            return { destinationId: destinationId.trim(), nights: Math.max(1, Number(n) || 1) };
          })
          .filter((x) => catalog.destinations.some((d) => d.id === x.destinationId)),
    },
    { key: "activityIds", label: "Included activities", kind: "multi", options: catalog.activities.map((a) => ({ value: a.id, label: a.name })) },
    { key: "meals", label: "Meals", kind: "text" },
    { key: "seasonLabel", label: "Best months label", kind: "text" },
    { key: "image", label: "Hero image", kind: "select", required: true, options: imageOptions },
    { key: "inclusions", label: "Inclusions (one per line)", kind: "lines" },
    { key: "exclusions", label: "Exclusions (one per line)", kind: "lines" },
  ];
  return (
    <EntityManager<TourPackage>
      kind="packages"
      singular="package"
      title="Packages"
      description="Curated journeys shown on the site and preloaded into the planner."
      items={packages}
      fields={fields}
      blank={() => ({ id: "", slug: "", name: "", tagline: "", description: "", category: "Signature", days: 5, nights: 4, regions: ["kashmir"], stops: [{ destinationId: "srinagar", nights: 2 }, { destinationId: "gulmarg", nights: 2 }], tier: "comfort", activityIds: [], meals: "Daily breakfast", inclusions: [], exclusions: [], image: "srinagar", bestMonths: [3, 4, 5, 6, 7, 8, 9, 10], seasonLabel: "April – October" })}
      columns={[
        { header: "Package", cell: (p) => <span className="font-medium">{p.name}</span> },
        { header: "Duration", cell: (p) => `${p.days}D / ${p.nights}N` },
        { header: "Route", cell: (p) => <span className="text-[13px]">{p.stops.map((s) => catalog.destinations.find((d) => d.id === s.destinationId)?.name ?? s.destinationId).join(" · ")}</span> },
        { header: "Type", cell: (p) => p.category },
        { header: "From (pp, demo)", cell: (p) => { try { return formatINR(packageStartingPrice(p, catalog)); } catch { return "—"; } } },
      ]}
    />
  );
}
