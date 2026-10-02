import type { TourPackage } from "@/types/package";

/** "Handpicked stays · Private vehicle · Daily breakfast · Selected experiences" */
export const includesLine = (p: TourPackage) => ["Handpicked stays", "Private vehicle", p.meals, p.activityIds.length ? "Selected experiences" : null].filter(Boolean).join(" · ");
