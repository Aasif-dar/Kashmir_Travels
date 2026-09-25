import type { Metadata } from "next";
import { Suspense } from "react";
import { PrintableItinerary } from "@/components/booking/printable-itinerary";
import { LoadingBlock } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Printable itinerary",
  description: "A print-friendly copy of your Kashmir itinerary.",
  robots: { index: false },
};

export default async function PrintPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return (
    <Suspense fallback={<div className="container-x pt-32"><LoadingBlock /></div>}>
      <PrintableItinerary bookingId={decodeURIComponent(bookingId)} />
    </Suspense>
  );
}
