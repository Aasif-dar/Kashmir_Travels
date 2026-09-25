const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatINR(value: number) {
  return `₹${inr.format(Math.round(value))}`;
}

/** Rounds demo estimates to the nearest ₹100 so figures read as estimates. */
export function roundEstimate(value: number) {
  return Math.round(value / 100) * 100;
}

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

export function formatDate(iso: string | Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", opts);
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatHours(h: number) {
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  if (whole === 0) return `${mins} min`;
  return mins ? `${whole}h ${mins}m` : `${whole}h`;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}
