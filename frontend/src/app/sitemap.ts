import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getDestinations, getPackages } from "@/services/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [destinations, packages] = await Promise.all([getDestinations(), getPackages()]);
  const now = new Date();
  const fixed = ["", "/destinations", "/packages", "/plan-your-trip", "/activities", "/hotels", "/vehicles", "/travel-guide", "/about", "/contact"];
  return [
    ...fixed.map((p) => ({ url: `${site.url}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })),
    ...destinations.map((d) => ({ url: `${site.url}/destinations/${d.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...packages.map((p) => ({ url: `${site.url}/packages/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
