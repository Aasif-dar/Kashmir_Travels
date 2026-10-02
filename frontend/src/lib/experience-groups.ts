import type { Activity } from "@/types/activity";

/**
 * Presentation groups for experiences. They sit on top of the catalogue categories, so activity data
 * is untouched: "Winter" is snow, "Adventure" folds in water sports, "Culture" folds in spiritual, and so on.
 */
export type ExperienceGroupId = "signature" | "adventure" | "nature" | "culture" | "family" | "winter";

export const SIGNATURE_IDS = ["gulmarg-gondola", "shikara-ride", "houseboat-dinner", "hot-air-balloon", "camel-safari", "pangong-sunrise-shoot", "skiing", "paragliding"];

export const experienceGroups: { id: ExperienceGroupId; label: string; test: (a: Activity) => boolean }[] = [
  { id: "signature", label: "Signature", test: (a) => SIGNATURE_IDS.includes(a.id) },
  { id: "adventure", label: "Adventure", test: (a) => a.category === "adventure" || a.category === "water" },
  { id: "nature", label: "Nature", test: (a) => a.category === "nature" },
  { id: "culture", label: "Culture", test: (a) => a.category === "culture" || a.category === "spiritual" },
  { id: "family", label: "Family", test: (a) => a.styles.includes("family") },
  { id: "winter", label: "Winter", test: (a) => a.category === "snow" },
];

/** The single label shown on a tile (not the filter group). */
export function experienceLabel(a: Activity): string {
  if (a.category === "snow") return "Winter";
  if (a.category === "adventure" || a.category === "water") return "Adventure";
  if (a.category === "nature") return "Nature";
  return "Culture";
}
