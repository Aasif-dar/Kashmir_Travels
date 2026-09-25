"use client";

import Link from "next/link";
import { AdminStatusBadge } from "@/components/booking/booking-status";
import { bookingMetrics, useBookings } from "@/components/admin/use-bookings";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ErrorState, LoadingBlock } from "@/components/ui/states";
import { formatDate, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ADMIN_STATUSES } from "@/types/booking";

const barTone: Record<string, string> = { New: "bg-himalaya", Contacted: "bg-brass", Confirmed: "bg-pine", Paid: "bg-forest", Completed: "bg-moss", Cancelled: "bg-burgundy/70" };

export default function AdminDashboard() {
  const { bookings, error, reload } = useBookings();
  if (error) return <ErrorState description={error} action={<button className="underline" onClick={() => void reload()}>Retry</button>} />;
  if (!bookings) return <LoadingBlock label="Loading dashboard…" />;
  const m = bookingMetrics(bookings);
  const counts = ADMIN_STATUSES.map((s) => ({ s, n: bookings.filter((b) => b.status === s).length }));
  const byDest = new Map<string, number>();
  bookings.filter((b) => b.status !== "Cancelled").forEach((b) => b.trip.destinations.forEach((d) => byDest.set(d.name, (byDest.get(d.name) ?? 0) + 1)));
  const top = [...byDest.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxDest = Math.max(1, ...top.map((t) => t[1]));
  const upcoming = bookings.filter((b) => ["Confirmed", "Paid"].includes(b.status) && b.customer.travelDate >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.customer.travelDate.localeCompare(b.customer.travelDate)).slice(0, 5);

  const metrics = [
    ["Total bookings", String(m.total)],
    ["New enquiries", String(m.newEnquiries)],
    ["Pending enquiries", String(m.pending)],
    ["Confirmed trips", String(m.confirmed)],
    ["Upcoming trips", String(m.upcoming)],
    ["Estimated booking value", formatINR(m.value)],
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader title="Dashboard" description="An overview of enquiries and trips. Figures are computed from the bookings stored in this browser." />
      <dl className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map(([k, v]) => (
          <div key={k} className="bg-ivory p-5">
            <dt className="text-[10.5px] font-semibold uppercase leading-tight tracking-[0.14em] text-brass">{k}</dt>
            <dd className="mt-2 font-display text-4xl leading-none text-forest" data-testid={`metric-${k}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-10 xl:grid-cols-2">
        <section aria-labelledby="pipe">
          <h2 id="pipe" className="font-display text-3xl">Pipeline</h2>
          <div className="mt-4 flex h-3 overflow-hidden bg-stone/40" role="img" aria-label={counts.map((c) => `${c.s}: ${c.n}`).join(", ")}>
            {counts.map((c) => c.n > 0 && <span key={c.s} className={barTone[c.s]} style={{ width: `${(c.n / Math.max(1, m.total)) * 100}%` }} />)}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[14px] sm:grid-cols-3">
            {counts.map((c) => <li key={c.s} className="flex items-center justify-between gap-2 border-b border-line py-1.5"><span className="flex items-center gap-2"><span className={cn("h-2.5 w-2.5", barTone[c.s])} />{c.s}</span><span className="tabular-nums">{c.n}</span></li>)}
          </ul>
        </section>
        <section aria-labelledby="dest">
          <h2 id="dest" className="font-display text-3xl">Most requested destinations</h2>
          <ul className="mt-4 space-y-3">
            {top.length === 0 && <li className="text-sm text-muted">No bookings yet.</li>}
            {top.map(([n, c]) => (
              <li key={n}><div className="flex justify-between text-[14px]"><span>{n}</span><span className="tabular-nums text-muted">{c}</span></div><div className="mt-1 h-1.5 bg-stone/40"><div className="h-full bg-forest" style={{ width: `${(c / maxDest) * 100}%` }} /></div></li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-10 xl:grid-cols-2">
        <section aria-labelledby="recent">
          <div className="flex items-baseline justify-between"><h2 id="recent" className="font-display text-3xl">Latest enquiries</h2><Link href="/admin/bookings" className="text-sm text-forest underline underline-offset-4">All bookings</Link></div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {bookings.slice(0, 5).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0"><p className="truncate font-medium">{b.customer.fullName}</p><p className="truncate text-[13px] text-muted">{b.id} · {b.trip.packageName}</p></div>
                <div className="shrink-0 text-right"><AdminStatusBadge status={b.status} /><p className="mt-1 text-[12px] text-muted">{formatINR(b.trip.price.total)}</p></div>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="upc">
          <h2 id="upc" className="font-display text-3xl">Upcoming trips</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {upcoming.length === 0 && <li className="py-4 text-sm text-muted">No confirmed upcoming trips.</li>}
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0"><p className="truncate font-medium">{b.customer.fullName}</p><p className="truncate text-[13px] text-muted">{b.trip.destinations.map((d) => d.name).join(" → ")}</p></div>
                <p className="shrink-0 text-sm tabular-nums text-forest">{formatDate(b.customer.travelDate)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
