import { roadEdges } from "@/data/rules";

/** Tiny road-network helper. Demo hours only — not live routing. */
const adjacency = new Map<string, Map<string, number>>();
for (const [a, b, h] of roadEdges) {
  if (!adjacency.has(a)) adjacency.set(a, new Map());
  if (!adjacency.has(b)) adjacency.set(b, new Map());
  adjacency.get(a)!.set(b, h);
  adjacency.get(b)!.set(a, h);
}

const cache = new Map<string, { hours: number; path: string[] }>();

function dijkstra(from: string, to: string): { hours: number; path: string[] } {
  if (from === to) return { hours: 0, path: [from] };
  const dist = new Map<string, number>([[from, 0]]);
  const prev = new Map<string, string>();
  const queue = new Set<string>(adjacency.keys());
  while (queue.size) {
    let u: string | null = null;
    let best = Infinity;
    for (const n of queue) {
      const d = dist.get(n) ?? Infinity;
      if (d < best) {
        best = d;
        u = n;
      }
    }
    if (u === null || best === Infinity) break;
    queue.delete(u);
    if (u === to) break;
    for (const [v, w] of adjacency.get(u) ?? []) {
      const alt = best + w;
      if (alt < (dist.get(v) ?? Infinity)) {
        dist.set(v, alt);
        prev.set(v, u);
      }
    }
  }
  const hours = dist.get(to) ?? Infinity;
  if (hours === Infinity) return { hours, path: [] };
  const path = [to];
  while (path[0] !== from) path.unshift(prev.get(path[0])!);
  return { hours, path };
}

function lookup(from: string, to: string) {
  const key = `${from}>${to}`;
  let r = cache.get(key);
  if (!r) {
    r = dijkstra(from, to);
    cache.set(key, r);
  }
  return r;
}

export const roadHours = (from: string, to: string) => lookup(from, to).hours;
export const roadPath = (from: string, to: string) => lookup(from, to).path;
