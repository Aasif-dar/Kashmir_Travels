export type ActivityCategory = "snow" | "adventure" | "water" | "nature" | "culture" | "spiritual";
export type Difficulty = "easy" | "moderate" | "challenging";

export interface Activity {
  id: string;
  name: string;
  destinationIds: string[];
  category: ActivityCategory;
  duration: string;
  difficulty: Difficulty;
  /** Demo price (INR). See priceUnit. */
  price: number;
  priceUnit: "person" | "group";
  /** 0-based months when the activity is typically offered. */
  months: number[];
  season: string;
  image: string;
  description: string;
  /** Travel styles this activity suits (drives recommendations). */
  styles: string[];
}
