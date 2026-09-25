export type VehicleType = "sedan" | "suv" | "premium-suv" | "tempo";

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  model: string;
  passengers: number;
  luggage: string;
  features: string[];
  /** Demo price per vehicle per day (INR). */
  pricePerDay: number;
  supportedDestinations: string[];
  image: string;
  description: string;
}
