export type HotelCategory = "comfort" | "premium" | "luxury";

export interface RoomType {
  name: string;
  /** Price multiplier relative to the listed pricePerNight (base room). */
  multiplier: number;
}

export interface Hotel {
  id: string;
  destinationId: string;
  name: string;
  category: HotelCategory;
  description: string;
  rating: number;
  image: string;
  amenities: string[];
  roomTypes: string[];
  /** Demo price per room per night (INR), before taxes. */
  pricePerNight: number;
  /** Used by the recommendation engine to match travel styles. */
  tags: string[];
}

export const HOTEL_CATEGORY_LABEL: Record<HotelCategory, { name: string; stars: string }> = {
  comfort: { name: "Comfort", stars: "3★" },
  premium: { name: "Premium", stars: "4★" },
  luxury: { name: "Luxury", stars: "5★" },
};
