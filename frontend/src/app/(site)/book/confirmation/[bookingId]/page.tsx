import type { Metadata } from "next";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";

export const metadata: Metadata = {
  title: "Booking request received",
  description: "Your booking request has been received. Our travel team will contact you shortly to confirm availability.",
  robots: { index: false },
};

export default async function ConfirmationPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return <BookingConfirmation bookingId={decodeURIComponent(bookingId)} />;
}
