import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking/booking-form";
import { Eyebrow } from "@/components/ui/section";
import { LoadingBlock } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Request this journey",
  description: "Review your Kashmir journey and send a request. Our travel team confirms availability and finalises the details — no payment is taken online.",
  alternates: { canonical: "/book" },
  robots: { index: false },
};

export default function BookPage() {
  return (
    <div className="pt-[68px] lg:pt-[76px]">
      <header className="border-b border-line">
        <div className="container-x py-7 sm:py-9">
          <Eyebrow>Journey request</Eyebrow>
          <h1 className="t-h2 mt-2">Request this journey</h1>
        </div>
      </header>
      <Suspense fallback={<div className="container-x min-h-[100svh] py-12"><LoadingBlock /></div>}>
        <BookingForm />
      </Suspense>
    </div>
  );
}
