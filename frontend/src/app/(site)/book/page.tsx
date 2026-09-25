import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking/booking-form";
import { Eyebrow } from "@/components/ui/section";
import { LoadingBlock } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Request your booking",
  description: "Review your Kashmir trip and send a booking request. Our travel team confirms availability and finalises the details — no payment is taken online.",
  alternates: { canonical: "/book" },
  robots: { index: false },
};

export default function BookPage() {
  return (
    <div className="pt-[60px] lg:pt-16">
      <header className="border-b border-line bg-parchment/50 bg-jaali">
        <div className="container-x py-8 sm:py-10">
          <Eyebrow>Booking request</Eyebrow>
          <h1 className="display-md mt-2">Request your booking</h1>
        </div>
      </header>
      <Suspense fallback={<div className="container-x py-12"><LoadingBlock /></div>}>
        <BookingForm />
      </Suspense>
    </div>
  );
}
