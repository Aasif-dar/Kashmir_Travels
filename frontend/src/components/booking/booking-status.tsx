import { Check } from "lucide-react";
import { CUSTOMER_STATUSES, customerStatusOf, type AdminStatus, type CustomerStatus } from "@/types/booking";
import { cn } from "@/lib/utils";

const tone: Record<CustomerStatus, string> = {
  "Inquiry Received": "border-himalaya/50 bg-himalaya/10 text-[#3f5a70]",
  "Under Review": "border-brass/50 bg-brass/10 text-[#6b4f1b]",
  Confirmed: "border-pine/50 bg-pine/10 text-pine",
  Completed: "border-forest bg-forest text-ivory",
  Cancelled: "border-burgundy/40 bg-burgundy/10 text-burgundy",
};

export function CustomerStatusBadge({ status, className }: { status: CustomerStatus; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-[2px] border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]", tone[status], className)}>{status}</span>;
}

const adminTone: Record<AdminStatus, string> = {
  New: "border-himalaya/50 bg-himalaya/10 text-[#3f5a70]",
  Contacted: "border-brass/50 bg-brass/10 text-[#6b4f1b]",
  Confirmed: "border-pine/50 bg-pine/10 text-pine",
  Paid: "border-pine bg-pine text-ivory",
  Completed: "border-forest bg-forest text-ivory",
  Cancelled: "border-burgundy/40 bg-burgundy/10 text-burgundy",
};
export function AdminStatusBadge({ status }: { status: AdminStatus }) {
  return <span className={cn("inline-flex items-center rounded-[2px] border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.12em]", adminTone[status])}>{status}</span>;
}

/** Horizontal progress through the customer-facing statuses. */
export function StatusTracker({ status }: { status: AdminStatus }) {
  const current = customerStatusOf(status);
  if (current === "Cancelled") {
    return <p className="border border-burgundy/40 bg-burgundy/[0.05] px-4 py-3 text-sm text-burgundy">This booking was cancelled. Contact our team if you&apos;d like to plan again.</p>;
  }
  const flow = CUSTOMER_STATUSES.filter((s) => s !== "Cancelled");
  const idx = flow.indexOf(current);
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Booking progress">
      {flow.map((s, i) => {
        const done = i < idx;
        const on = i === idx;
        return (
          <li key={s} aria-current={on ? "step" : undefined}>
            <span className={cn("block h-1", done || on ? "bg-forest" : "bg-stone")} />
            <span className={cn("mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase leading-tight tracking-[0.1em]", on ? "text-forest" : done ? "text-pine" : "text-muted")}>
              {done && <Check className="h-3 w-3" aria-hidden />}
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
