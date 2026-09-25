import { HUB_LOCAL_HOURS, hubInfo } from "@/data/rules";
import type { Catalog, ItineraryDay, ItineraryItem, TripConfig, TripStop } from "@/types/trip";
import type { DayPlan, Destination } from "@/types/destination";
import { roadHours } from "./geo";
import { formatHours } from "./format";

export const nightsForDays = (days: number) => Math.max(1, days - 1);

export function findDestination(catalog: Catalog, id: string): Destination | undefined {
  return catalog.destinations.find((d) => d.id === id);
}

/* ------------------------------------------------------------------ */
/* Route + nights                                                      */
/* ------------------------------------------------------------------ */
export interface RouteLeg {
  fromId: string;
  toId: string;
  hours: number;
}
export interface RouteSummary {
  arrival: { hubId: string; toId: string; hours: number } | null;
  departure: { hubId: string; fromId: string; hours: number } | null;
  legs: RouteLeg[];
  totalHours: number;
  unreachable: boolean;
}

const hubNode = (d: Destination) => hubInfo[d.hub].node;

export function summariseRoute(stops: TripStop[], catalog: Catalog): RouteSummary {
  const resolved = stops.map((s) => findDestination(catalog, s.destinationId)).filter(Boolean) as Destination[];
  if (!resolved.length) return { arrival: null, departure: null, legs: [], totalHours: 0, unreachable: false };
  const first = resolved[0];
  const last = resolved[resolved.length - 1];
  const hoursFromHub = (d: Destination) => {
    const h = roadHours(hubNode(d), d.id);
    return h === 0 ? HUB_LOCAL_HOURS : h;
  };
  const arrival = { hubId: hubNode(first), toId: first.id, hours: hoursFromHub(first) };
  const departure = { hubId: hubNode(last), fromId: last.id, hours: hoursFromHub(last) };
  const legs: RouteLeg[] = [];
  for (let i = 1; i < resolved.length; i++) {
    legs.push({ fromId: resolved[i - 1].id, toId: resolved[i].id, hours: roadHours(resolved[i - 1].id, resolved[i].id) });
  }
  const all = [arrival.hours, departure.hours, ...legs.map((l) => l.hours)];
  const unreachable = all.some((h) => !Number.isFinite(h));
  return { arrival, departure, legs, totalHours: unreachable ? Infinity : all.reduce((a, b) => a + b, 0), unreachable };
}

function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const out: T[][] = [];
  arr.forEach((x, i) => {
    for (const rest of permutations([...arr.slice(0, i), ...arr.slice(i + 1)])) out.push([x, ...rest]);
  });
  return out;
}

const HIGH_ALT = new Set(["nubra", "pangong", "tso-moriri"]);

/** Lower is better: road hours plus penalties for unrealistic ordering (not arriving at a hub, skipping Leh acclimatisation). */
export function routeCost(order: string[], catalog: Catalog): number {
  const dests = order.map((id) => findDestination(catalog, id)).filter(Boolean) as Destination[];
  const r = summariseRoute(order.map((id) => ({ destinationId: id, nights: 1 })), catalog);
  let cost = Number.isFinite(r.totalHours) ? r.totalHours : 1000;
  // Arrive at the hub city itself when it is part of the plan (e.g. Srinagar before Gulmarg), rather than a spoke.
  const first = dests[0];
  if (first && hubNode(first) !== first.id && dests.some((d) => d.id === hubNode(first))) cost += 6;
  const lehIdx = order.indexOf("leh");
  order.forEach((id, i) => {
    if (HIGH_ALT.has(id) && lehIdx !== -1 && i < lehIdx) cost += 50;
  });
  return cost;
}

/**
 * Orders destinations to keep road time low. Rules baked in: arrive at a hub city when one is in the plan,
 * and always reach Leh before the high-altitude Ladakh stops.
 */
export function optimiseOrder(ids: string[], catalog: Catalog): string[] {
  const unique = Array.from(new Set(ids)).filter((id) => findDestination(catalog, id));
  if (unique.length <= 1) return unique;
  const candidates = unique.length <= 7 ? permutations(unique) : [unique];
  let best = unique;
  let bestCost = Infinity;
  for (const order of candidates) {
    // tie-break: keep the caller's order stable
    const cost = routeCost(order, catalog) + order.reduce((acc, id, i) => acc + Math.abs(unique.indexOf(id) - i) * 0.001, 0);
    if (cost < bestCost) {
      bestCost = cost;
      best = order;
    }
  }
  return best;
}

/** Inserts a destination at the cheapest position, preserving the traveller's existing order. */
export function insertStop(order: string[], id: string, catalog: Catalog): string[] {
  if (order.includes(id)) return order;
  let best = [...order, id];
  let bestCost = Infinity;
  for (let i = 0; i <= order.length; i++) {
    const trial = [...order.slice(0, i), id, ...order.slice(i)];
    const cost = routeCost(trial, catalog);
    if (cost < bestCost - 1e-9) {
      bestCost = cost;
      best = trial;
    }
  }
  return best;
}

/** Spreads the available nights across stops, honouring each destination's min / recommended / max. */
export function distributeNights(ids: string[], totalNights: number, catalog: Catalog): TripStop[] {
  const dests = ids.map((id) => findDestination(catalog, id)).filter(Boolean) as Destination[];
  const stops = dests.map((d) => ({ destinationId: d.id, nights: d.minNights }));
  let used = stops.reduce((a, s) => a + s.nights, 0);
  while (used < totalNights && stops.length) {
    const pool = stops.filter((s) => s.nights < (findDestination(catalog, s.destinationId)?.maxNights ?? 1));
    const candidates = pool.length ? pool : [stops[0]];
    let pick = candidates[0];
    let pickScore = -Infinity;
    for (const c of candidates) {
      const d = findDestination(catalog, c.destinationId)!;
      const score = (d.recommendedNights - c.nights) / d.recommendedNights + d.recommendedNights * 0.001;
      if (score > pickScore) {
        pick = c;
        pickScore = score;
      }
    }
    pick.nights += 1;
    used += 1;
  }
  return stops;
}

/* ------------------------------------------------------------------ */
/* Day-by-day itinerary                                                */
/* ------------------------------------------------------------------ */
interface DaySlot {
  overnightId: string;
  stayDay: number;
}

export function daySlots(stops: TripStop[]): DaySlot[] {
  const slots: DaySlot[] = [];
  for (const s of stops) for (let n = 1; n <= s.nights; n++) slots.push({ overnightId: s.destinationId, stayDay: n });
  return slots;
}

const noteKey = (destinationId: string, stayDay: number) => `${destinationId}:${stayDay}`;

/** Turns a destination day-plan into itinerary lines. Optional experiences the traveller has already added are skipped (they appear as activities). */
function planLines(plan: DayPlan, chosen: Set<string>, limit = Infinity, plainOnly = false): ItineraryItem[] {
  const out: ItineraryItem[] = [];
  for (const it of plan.items) {
    if (out.length >= limit) break;
    if (typeof it === "string") out.push({ kind: "sightseeing", title: it });
    else if (!chosen.has(it.activity) && !plainOnly) out.push({ kind: "sightseeing", title: it.text, optionalActivityId: it.activity });
  }
  return out;
}

export function buildItinerary(config: TripConfig, catalog: Catalog): ItineraryDay[] {
  const slots = daySlots(config.stops);
  if (!slots.length) return [];
  const route = summariseRoute(config.stops, catalog);
  const dest = (id: string) => findDestination(catalog, id)!;
  const days: ItineraryDay[] = [];
  const chosen = new Set(config.activities.map((a) => a.activityId));

  slots.forEach((slot, idx) => {
    const day = idx + 1;
    const d = dest(slot.overnightId);
    const prev = idx > 0 ? slots[idx - 1] : null;
    const isTransfer = !!prev && prev.overnightId !== slot.overnightId;
    const items: ItineraryItem[] = [];
    let title = "";
    let transferHours: number | undefined;
    let transferFromId: string | undefined;
    const plan = d.dayPlans[slot.stayDay - 1];

    if (day === 1) {
      const hub = hubInfo[d.hub];
      const h = route.arrival?.hours ?? 0;
      const local = hub.node === d.id;
      title = local ? `Arrival in ${d.name}` : `Arrive ${hub.name} → ${d.name}`;
      items.push({
        kind: "arrival",
        title: local ? `Arrive at ${hub.gateway}` : `Arrive at ${hub.gateway} and drive to ${d.name}`,
        description: local
          ? `Meet your driver and transfer to your hotel (about ${formatHours(h)}).`
          : `Meet your driver and drive about ${formatHours(h)} to ${d.name}.`,
      });
      transferHours = local ? undefined : h;
      transferFromId = local ? undefined : hub.node;
      items.push({ kind: "checkin", title: "Hotel check-in", description: d.region === "ladakh" ? "Settle in and rest — taking it easy matters at altitude." : "Settle in and freshen up." });
      if (plan && h <= 3.5) {
        const first = planLines(plan, chosen, 1, true)[0];
        if (first) items.push({ ...first, description: "Easy first-evening outing, time permitting." });
      }
    } else if (isTransfer) {
      const from = dest(prev!.overnightId);
      const h = roadHours(from.id, d.id);
      transferHours = h;
      transferFromId = from.id;
      title = `${from.name} → ${d.name}`;
      items.push({
        kind: "transfer",
        title: `Drive from ${from.name} to ${d.name}`,
        description: Number.isFinite(h) ? `About ${formatHours(h)} by road${h > 8 ? " — a long day; the team plans comfort stops en route" : ""}.` : undefined,
      });
      items.push({ kind: "checkin", title: "Hotel check-in" });
      if (plan && h <= 5) items.push(...planLines(plan, chosen, h <= 3 ? 2 : 1));
      else items.push({ kind: "leisure", title: "Rest of the day at leisure", description: "After a long drive, the evening is kept free." });
    } else if (plan) {
      title = `${d.name} · ${plan.title}`;
      items.push(...planLines(plan, chosen));
    } else {
      title = `${d.name} · A day at leisure`;
      items.push({ kind: "leisure", title: "Free day to explore at your own pace", description: "Optional local experiences can be added in the planner." });
      const extra = d.highlights[(slot.stayDay - 1) % d.highlights.length];
      if (extra) items.push({ kind: "sightseeing", title: `Optional: ${extra}` });
    }

    days.push({
      day,
      title,
      overnightId: slot.overnightId,
      stayDay: slot.stayDay,
      isTransfer: isTransfer || day === 1,
      transferHours,
      transferFromId,
      items,
      noteKey: noteKey(slot.overnightId, slot.stayDay),
      note: config.dayNotes[noteKey(slot.overnightId, slot.stayDay)],
    });
  });

  /* Departure day */
  const lastDest = dest(config.stops[config.stops.length - 1].destinationId);
  const hub = hubInfo[lastDest.hub];
  const dh = route.departure?.hours ?? 0;
  const local = hub.node === lastDest.id;
  days.push({
    day: days.length + 1,
    title: local ? `Departure from ${lastDest.name}` : `${lastDest.name} → ${hub.name} · Departure`,
    overnightId: null,
    stayDay: 0,
    isTransfer: !local,
    transferHours: local ? undefined : dh,
    transferFromId: local ? undefined : lastDest.id,
    items: [
      { kind: "checkin", title: "Breakfast and hotel check-out" },
      {
        kind: "departure",
        title: local ? `Transfer to ${hub.gateway}` : `Drive to ${hub.gateway}`,
        description: `About ${formatHours(dh)} — timed to your onward journey. Travel home with memories.`,
      },
    ],
    noteKey: "departure",
    note: config.dayNotes["departure"],
  });

  /* Place chosen activities on suitable days */
  const load = new Map<number, number>();
  for (const ta of config.activities) {
    const act = catalog.activities.find((a) => a.id === ta.activityId);
    if (!act) continue;
    const candidates = days.filter((dd) => dd.overnightId && act.destinationIds.includes(dd.overnightId));
    if (!candidates.length) continue;
    let target = ta.stayDay ? candidates.find((c) => c.stayDay === ta.stayDay) : undefined;
    if (!target) {
      target = [...candidates].sort((a, b) => {
        const score = (x: ItineraryDay) => (load.get(x.day) ?? 0) * 10 + (x.isTransfer ? 4 : 0) + (x.day === 1 ? 3 : 0) + x.day * 0.01;
        return score(a) - score(b);
      })[0];
    }
    load.set(target.day, (load.get(target.day) ?? 0) + 1);
    target.items.push({
      kind: "activity",
      title: act.name,
      description: `${act.duration} · ${act.difficulty}`,
      activityId: act.id,
    });
  }
  return days;
}

export function getDayDate(startIso: string | undefined, day: number): Date | null {
  if (!startIso) return null;
  const d = new Date(startIso);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + day - 1);
  return d;
}
