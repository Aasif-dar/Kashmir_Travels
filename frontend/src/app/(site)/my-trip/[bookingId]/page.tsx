import type { Metadata } from "next";
import { MyTrip } from "@/components/booking/my-trip";

export const metadata: Metadata = {
  title: "My trip",
  description: "Your itinerary, stays, vehicle, activities and booking status.",
  robots: { index: false },
};

export default async function MyTripPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return <MyTrip bookingId={decodeURIComponent(bookingId)} />;
}
