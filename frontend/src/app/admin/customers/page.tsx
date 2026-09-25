"use client";

import { useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { useBookings } from "@/components/admin/use-bookings";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/ui/states";
import { formatDate, formatINR } from "@/lib/format";

export default function AdminCustomersPage() {
  const { bookings, error, reload } = useBookings();
  const customers = useMemo(() => {
    const map = new Map<string, { name: string; email: string; phone: string; trips: number; value: number; last: string }>();
    for (const b of bookings ?? []) {
      const key = b.customer.email.toLowerCase();
      const cur = map.get(key) ?? { name: b.customer.fullName, email: b.customer.email, phone: b.customer.phone, trips: 0, value: 0, last: b.createdAt };
      cur.trips += 1;
      if (b.status !== "Cancelled") cur.value += b.trip.price.total;
      if (b.createdAt > cur.last) cur.last = b.createdAt;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => b.last.localeCompare(a.last));
  }, [bookings]);
  if (error) return <ErrorState description={error} action={<button className="underline" onClick={() => void reload()}>Retry</button>} />;
  if (!bookings) return <LoadingBlock />;
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Customers" description="Customers derived from booking requests, grouped by email." />
      {customers.length === 0 ? <EmptyState title="No customers yet" description="Customers appear here when someone requests a booking." /> : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
            <caption className="sr-only">Customers</caption>
            <thead className="bg-parchment/50"><tr>{["Name", "Email", "Phone", "Requests", "Est. value", "Last request"].map((h) => <th key={h} scope="col" className="p-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brass">{h}</th>)}</tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email} className="border-t border-line"><td className="p-3 font-medium">{c.name}</td><td className="p-3">{c.email}</td><td className="p-3 whitespace-nowrap">{c.phone}</td><td className="p-3 tabular-nums">{c.trips}</td><td className="p-3 tabular-nums">{formatINR(c.value)}</td><td className="p-3 whitespace-nowrap">{formatDate(c.last)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
