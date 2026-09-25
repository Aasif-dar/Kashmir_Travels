"use client";

import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { useBookings } from "@/components/admin/use-bookings";
import { AdminStatusBadge } from "@/components/booking/booking-status";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/ui/states";
import { formatDate, formatINR } from "@/lib/format";
import { deleteBooking, updateBooking } from "@/services/bookings";
import { ADMIN_STATUSES, customerStatusOf, type AdminStatus, type Booking } from "@/types/booking";

export default function AdminBookingsPage() {
  const { bookings, error, reload } = useBookings();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AdminStatus | "">("");
  const [open, setOpen] = useState<Booking | null>(null);
  const [note, setNote] = useState("");
  const [toDelete, setToDelete] = useState<Booking | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (bookings ?? []).filter((b) => (!status || b.status === status) && (!term || `${b.id} ${b.customer.fullName} ${b.customer.email} ${b.trip.packageName} ${b.trip.destinations.map((d) => d.name).join(" ")}`.toLowerCase().includes(term)));
  }, [bookings, q, status]);

  if (error) return <ErrorState description={error} action={<button className="underline" onClick={() => void reload()}>Retry</button>} />;
  if (!bookings) return <LoadingBlock label="Loading bookings…" />;

  const view = (b: Booking) => { setOpen(b); setNote(b.adminNote ?? ""); };
  const live = open ? bookings.find((b) => b.id === open.id) ?? open : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Bookings" description="Every booking request from the website. Change a status and the customer's My Trip page updates too." />
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-72"><label htmlFor="bq" className="sr-only">Search bookings</label><Input id="bq" placeholder="Search ID, customer, destination…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="w-full sm:w-48"><label htmlFor="bs" className="sr-only">Filter by status</label><Select id="bs" value={status} onChange={(e) => setStatus(e.target.value as AdminStatus | "")}><option value="">All statuses</option>{ADMIN_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></div>
        <p className="text-sm text-muted" aria-live="polite">{list.length} of {bookings.length}</p>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No bookings match" description="Change the search or status filter." />
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[980px] border-collapse text-left text-[14px]">
            <caption className="sr-only">Booking requests</caption>
            <thead className="bg-parchment/50">
              <tr>{["Booking ID", "Customer", "Travel date", "Destinations", "Package", "Amount", "Status", "Actions"].map((h) => <th key={h} scope="col" className="whitespace-nowrap p-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brass">{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id} className="border-t border-line align-top hover:bg-parchment/25">
                  <td className="p-3 font-medium text-forest">{b.id}</td>
                  <td className="p-3"><p>{b.customer.fullName}</p><p className="text-[12px] text-muted">{b.customer.email}</p></td>
                  <td className="whitespace-nowrap p-3">{formatDate(b.customer.travelDate)}</td>
                  <td className="max-w-[220px] p-3 text-[13px]">{b.trip.destinations.map((d) => d.name).join(" → ")}</td>
                  <td className="p-3 text-[13px]">{b.trip.packageName}<br /><span className="text-muted">{b.trip.tierName}</span></td>
                  <td className="whitespace-nowrap p-3 tabular-nums">{formatINR(b.trip.price.total)}</td>
                  <td className="p-3">
                    <label className="sr-only" htmlFor={`st-${b.id}`}>Status for {b.id}</label>
                    <select id={`st-${b.id}`} value={b.status} onChange={(e) => void updateBooking(b.id, { status: e.target.value as AdminStatus })} className="h-9 border border-line bg-paper px-2 text-[13px]">{ADMIN_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                  </td>
                  <td className="whitespace-nowrap p-3">
                    <button type="button" onClick={() => view(b)} className="inline-flex h-9 items-center gap-1.5 px-2 text-forest hover:bg-forest/5" aria-label={`View ${b.id}`}><Eye className="h-4 w-4" /> View</button>
                    <button type="button" onClick={() => setToDelete(b)} className="inline-flex h-9 w-9 items-center justify-center text-burgundy hover:bg-burgundy/5" aria-label={`Delete ${b.id}`}><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={!!live} onOpenChange={(o) => !o && setOpen(null)} title={live?.id ?? "Booking"} description={live ? `${live.customer.fullName} · ${live.trip.packageName}` : undefined} side="right" className="!w-[min(96vw,560px)]">
        {live && (
          <div className="space-y-6 p-5 text-[14.5px]">
            <div className="flex items-center justify-between"><AdminStatusBadge status={live.status} /><span className="text-[12px] text-muted">Customer sees: {customerStatusOf(live.status)}</span></div>
            <div><label htmlFor="d-status" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.14em] text-forest">Update status</label><Select id="d-status" value={live.status} onChange={(e) => void updateBooking(live.id, { status: e.target.value as AdminStatus })}>{ADMIN_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></div>
            <dl className="divide-y divide-line border-y border-line">
              {[["Customer", `${live.customer.fullName}\n${live.customer.email}\n${live.customer.phone}`], ["Travel date", formatDate(live.customer.travelDate)], ["Travellers", `${live.customer.adults} adults, ${live.customer.children} children`], ["Pickup", live.customer.pickupLocation], ["Requests", live.customer.specialRequests || "—"], ["Route", live.trip.destinations.map((d) => `${d.name} (${d.nights}N)`).join(" → ")], ["Hotels", live.trip.hotels.map((h) => `${h.name} — ${h.destinationName}`).join("\n")], ["Vehicle", live.trip.vehicle ? `${live.trip.vehicle.name} × ${live.trip.vehicle.count}` : "—"], ["Activities", live.trip.activities.map((a) => a.name).join(", ") || "—"], ["Estimated", `${formatINR(live.trip.price.total)} (${formatINR(live.trip.price.perPerson)} pp)`]].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[92px_1fr] gap-3 py-2.5"><dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brass">{k}</dt><dd className="whitespace-pre-line break-words">{v}</dd></div>
              ))}
            </dl>
            <div>
              <label htmlFor="d-note" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.14em] text-forest">Internal note</label>
              <Textarea id="d-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Only visible in admin" />
              <Button className="mt-3" size="sm" onClick={() => void updateBooking(live.id, { adminNote: note })}>Save note</Button>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-line pt-4">
              <Link href={`/my-trip/${live.id}`} className="text-sm text-forest underline underline-offset-4" target="_blank">Open customer view</Link>
              <Link href={`/my-trip/${live.id}/print`} className="text-sm text-forest underline underline-offset-4" target="_blank">Printable itinerary</Link>
            </div>
          </div>
        )}
      </Sheet>

      <Sheet open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Delete booking?" description={toDelete ? `${toDelete.id} · ${toDelete.customer.fullName}` : undefined} side="center">
        <div className="flex justify-end gap-3 p-5">
          <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="burgundy" onClick={async () => { if (toDelete) await deleteBooking(toDelete.id); setToDelete(null); }}>Delete</Button>
        </div>
      </Sheet>
    </div>
  );
}
