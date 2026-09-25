"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { ErrorState } from "@/components/ui/states";
import { whatsappLink } from "@/lib/booking";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { createEnquiry } from "@/services/enquiries";
import { site } from "@/data/site";

export function ContactForm() {
  const ref = useSearchParams().get("booking") ?? undefined;
  const [sent, setSent] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, getValues } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: ref ? `Regarding booking ${ref}: ` : "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      const e = await createEnquiry({ ...values, bookingRef: ref });
      setSent(e.id);
      reset();
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  });

  if (sent) {
    return (
      <div role="status" className="border border-pine/40 bg-pine/[0.06] p-8">
        <CheckCircle2 className="h-8 w-8 text-pine" aria-hidden />
        <h2 className="mt-4 font-display text-3xl">Thank you — message received</h2>
        <p className="mt-2 text-[15px] text-muted">Reference {sent}. A member of our travel team will reply within one working day. For something urgent, message us on WhatsApp.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={whatsappLink(`Hello ${site.short}! I just sent an enquiry (${sent}).`)} variant="gold">WhatsApp us</ButtonLink>
          <Button variant="outline" onClick={() => setSent(null)}>Send another message</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Contact form" className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name" htmlFor="c-name" error={errors.name?.message} required><Input id="c-name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "c-name-error" : undefined} {...register("name")} /></Field>
        <Field label="Email" htmlFor="c-email" error={errors.email?.message} required><Input id="c-email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "c-email-error" : undefined} {...register("email")} /></Field>
      </div>
      <Field label="Phone / WhatsApp (optional)" htmlFor="c-phone" error={errors.phone?.message}><Input id="c-phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "c-phone-error" : undefined} {...register("phone")} /></Field>
      <Field label="How can we help?" htmlFor="c-message" error={errors.message?.message} required>
        <Textarea id="c-message" rows={6} aria-invalid={!!errors.message} aria-describedby={errors.message ? "c-message-error" : undefined} {...register("message")} />
      </Field>
      {failure && <ErrorState title="We couldn't send your message" description={failure} action={<ButtonLink href={whatsappLink(`Hello ${site.short}! ${getValues("message") || "I have a question."}`)} variant="outline">Message on WhatsApp</ButtonLink>} />}
      <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />} Send message</Button>
    </form>
  );
}
