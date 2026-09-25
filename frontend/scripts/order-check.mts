import { getCatalog, getPackages } from "../src/services/catalog.ts";
import { optimiseOrder, summariseRoute, routeCost } from "../src/lib/itinerary-engine.ts";
const catalog = await getCatalog();
for (const p of await getPackages()) {
  const ids = p.stops.map(s=>s.destinationId);
  const best = optimiseOrder(ids, catalog);
  const cur = routeCost(ids, catalog), b = routeCost(best, catalog);
  console.log(p.slug.padEnd(30), cur.toFixed(1), b.toFixed(1), cur - b > 0.5 ? "-> " + best.join(",") : "ok");
}
