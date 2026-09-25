import type { Vehicle } from "@/types/vehicle";

const ALL_DEST = ["srinagar", "gulmarg", "pahalgam", "sonamarg", "doodhpathri", "yusmarg", "gurez", "jammu", "katra", "patnitop", "leh", "nubra", "pangong", "sham-valley", "tso-moriri"];
const NO_HIGH = ALL_DEST.filter((d) => !["gurez", "nubra", "pangong", "tso-moriri"].includes(d));
const NO_REMOTE = ALL_DEST.filter((d) => !["gurez", "tso-moriri"].includes(d));

/** Demo fleet. Never presented as live availability. */
export const vehicles: Vehicle[] = [
  {
    id: "sedan-dzire",
    name: "Sedan — Dzire or similar",
    type: "sedan",
    model: "Maruti Suzuki Dzire or similar",
    passengers: 4,
    luggage: "2 medium bags",
    features: ["Air-conditioned", "Experienced local driver", "Fuel & tolls included", "Up to 4 guests"],
    pricePerDay: 2800,
    supportedDestinations: NO_HIGH,
    image: "veh-sedan",
    description: "A comfortable, economical choice for couples and small families on the Valley circuits. Not recommended for high passes or rough roads.",
  },
  {
    id: "suv-ertiga",
    name: "SUV — Ertiga or similar",
    type: "suv",
    model: "Maruti Suzuki Ertiga or similar",
    passengers: 6,
    luggage: "3 medium bags",
    features: ["Air-conditioned", "More legroom", "Fuel & tolls included", "Up to 6 guests"],
    pricePerDay: 3600,
    supportedDestinations: ALL_DEST,
    image: "veh-suv",
    description: "A roomy people-carrier for families or small groups, suited to every route in the catalogue.",
  },
  {
    id: "premium-innova",
    name: "Premium SUV — Innova Crysta",
    type: "premium-suv",
    model: "Toyota Innova Crysta or similar",
    passengers: 6,
    luggage: "4 medium bags",
    features: ["Captain seats (select)", "Superior suspension", "Fuel & tolls included", "Up to 6 guests", "Preferred for Ladakh"],
    pricePerDay: 5200,
    supportedDestinations: ALL_DEST,
    image: "veh-premium",
    description: "Our most comfortable everyday vehicle — smooth on the long Ladakh and Gurez roads and the usual choice for premium journeys.",
  },
  {
    id: "tempo-traveller",
    name: "Tempo Traveller — 12 seater",
    type: "tempo",
    model: "Force Traveller 12-seater",
    passengers: 12,
    luggage: "8 medium bags",
    features: ["Air-conditioned", "Push-back seats", "Fuel & tolls included", "Up to 12 guests"],
    pricePerDay: 6800,
    supportedDestinations: NO_REMOTE,
    image: "veh-tempo",
    description: "For larger families and groups travelling together. Not suited to the narrowest mountain roads.",
  },
];
