import { getCatalog, getPackages } from "../src/services/catalog.ts";
import { packageToTrip, withDays, addStop, withDestinations } from "../src/lib/trip.ts";
import { buildItinerary } from "../src/lib/itinerary-engine.ts";
import { computePrice } from "../src/lib/pricing.ts";
import { validateTrip, canAddDestination } from "../src/lib/validation.ts";
import { formatINR } from "../src/lib/format.ts";
import { defaultTrip } from "../src/lib/trip.ts";

const catalog = await getCatalog();
const pkgs = await getPackages();
for (const p of pkgs) {
  const t = packageToTrip(p);
  const price = computePrice(t, catalog);
  const issues = validateTrip(t, catalog);
  const basic = computePrice({ ...t, tier: "basic", hotels: {}, vehicleId: null }, catalog);
  console.log(p.name.padEnd(34), `${p.days}D`, "total", formatINR(price.total), "pp", formatINR(price.perPerson), "| basic pp", formatINR(basic.perPerson), "|", issues.filter(i=>i.severity!=="info").map(i=>i.severity[0]+":"+i.code).join(","));
}
const t = packageToTrip(pkgs[0]);
console.log(buildItinerary(t, catalog).map(d => `D${d.day} ${d.title} [${d.items.map(i=>i.title).join(" | ")}]`).join("\n"));
// unrealistic checks
let base = { ...defaultTrip(), days: 3 };
for (const id of ["srinagar","gulmarg","pahalgam"]) { console.log("3d add", id, canAddDestination(base, id, catalog)); if (canAddDestination(base,id,catalog).ok) base = addStop(base,id,catalog); }
console.log(base.stops);
let b5 = { ...defaultTrip(), days: 5 };
for (const id of ["srinagar","gulmarg","pahalgam","leh"]) { const c = canAddDestination(b5,id,catalog); console.log("5d add", id, c); if (c.ok) b5 = addStop(b5,id,catalog); }
console.log(b5.stops);
let b9 = { ...defaultTrip(), days: 9 };
for (const id of ["nubra","srinagar","katra"]) { const c = canAddDestination(b9,id,catalog); console.log("9d add", id, c); if (c.ok) b9 = addStop(b9,id,catalog); }
console.log(b9.stops, validateTrip(b9, catalog).map(i=>i.code));
