"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { lookupSchema } from "@/lib/validation";
import { getBooking } from "@/services/bookings";
import type { z } from "zod";

type Values = z.infer<typeof lookupSchema>;

export function LookupForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(lookupSchema), defaultValues: { bookingId: "" } });

  const onSubmit = handleSubmit(async ({ bookingId }) => {
    setBusy(true);
    setNotFound(null);
    try {
      const b = await getBooking(bookingId);
      if (b) router.push(`/my-trip/${b.id}`);
      else { setNotFound(`We couldn't find ${bookingId.toUpperCase()} in this browser. Bookings are stored on the device where they were requested.`); setBusy(false); }
    } catch {
      setNotFound("Something went wrong while looking that up. Please try again.");
      setBusy(false);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl" aria-label="Find my trip">
      <Field label="Booking reference" htmlFor="bookingId" error={errors.bookingId?.message} hint="You'll find it on your confirmation page — e.g. KT-2026-1234." required>
        <Input id="bookingId" placeholder="KT-2026-1234" autoCapitalize="characters" autoComplete="off" aria-invalid={!!errors.bookingId} aria-describedby={errors.bookingId ? "bookingId-error" : undefined} {...register("bookingId")} />
      </Field>
      {notFound && <p role="alert" className="mt-4 border border-burgundy/30 bg-burgundy/[0.05] px-4 py-3 text-sm text-burgundy">{notFound}</p>}
      <Button type="submit" size="lg" className="mt-6" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} View my trip <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </form>
  );
}
