import type { Hotel, HotelCategory } from "@/types/hotel";

/**
 * DEMO INVENTORY. Hotel names, ratings and rates are illustrative placeholders — not live availability.
 * Photos are illustrative and may not depict the named property.
 */
const AMENITIES: Record<HotelCategory, string[]> = {
  comfort: ["Breakfast available", "Room heater / AC", "Hot water", "Wi-Fi (limited)"],
  premium: ["Breakfast included", "Room heater / AC", "Restaurant", "Wi-Fi", "Airport-style pickup help"],
  luxury: ["Breakfast & dinner options", "Spa / wellness", "Fine-dining restaurant", "Concierge", "Wi-Fi", "Private balconies"],
};
const ROOMS: Record<HotelCategory, string[]> = {
  comfort: ["Standard Double", "Family Room"],
  premium: ["Deluxe Double", "Family Suite", "Valley View Room"],
  luxury: ["Executive Suite", "Signature Suite", "Private Cottage"],
};

type Row = [
  destinationId: string,
  category: HotelCategory,
  name: string,
  description: string,
  rating: number,
  image: string,
  pricePerNight: number,
  tags: string[],
  extraAmenities?: string[],
];

const rows: Row[] = [
  // Srinagar
  ["srinagar", "comfort", "Nagin Cedar Houseboat", "A family-run cedar-wood houseboat on the Nagin side of Dal, with carved ceilings, a sun deck and home-cooked Kashmiri meals.", 4.1, "hotel-houseboat-3", 3800, ["houseboat", "lakeview", "family", "heritage"], ["Sun deck", "Home-cooked meals"]],
  ["srinagar", "premium", "Zabarwan Lakeview Hotel", "A four-star hotel on Boulevard Road with lake-facing rooms, a rooftop café and easy access to the ghats.", 4.4, "hotel-suite", 7800, ["lakeview", "family", "couple", "central"], ["Rooftop café"]],
  ["srinagar", "luxury", "Jehangir Heritage Houseboats", "A fleet of restored heirloom houseboats with hand-carved walnut interiors, a private shikara and butler-style service.", 4.8, "hotel-houseboat", 17500, ["houseboat", "heritage", "romantic", "luxury", "lakeview"], ["Private shikara", "Butler service"]],
  // Gulmarg
  ["gulmarg", "comfort", "Khilanmarg Snow Lodge", "A simple, warm timber lodge a short walk from the gondola base, popular with skiers on a budget.", 4.0, "hotel-snow-hut", 4200, ["ski-in", "family", "friends"], ["Ski-gear storage"]],
  ["gulmarg", "premium", "Apharwat Pine Resort", "A four-star resort with heated rooms, a log-fire lounge and a ski-hire desk near the gondola.", 4.4, "hotel-suite-2", 9200, ["ski-in", "couple", "family", "boutique"], ["Ski-hire desk", "Log-fire lounge"]],
  ["gulmarg", "luxury", "Kongdoori Alpine Chalets", "Private timber chalets with mountain views, fireplaces and an in-house restaurant at the edge of the meadow.", 4.8, "gulmarg-meadow", 21000, ["romantic", "luxury", "ski-in", "boutique"], ["Private chalets", "Fireplaces"]],
  // Pahalgam
  ["pahalgam", "comfort", "Lidder Riverside Inn", "A friendly guest house on the Lidder with garden seating and views of the pines.", 4.0, "hotel-cottage", 3600, ["riverside", "family", "friends"], ["Garden seating"]],
  ["pahalgam", "premium", "Baisaran Valley Resort", "A resort of stone-and-timber cottages set amid apple trees, with river-facing terraces and an all-day restaurant.", 4.5, "hotel-cottage-2", 8200, ["riverside", "couple", "family", "boutique"], ["Cottage rooms", "River terrace"]],
  ["pahalgam", "luxury", "Aru Pine Retreat", "A secluded boutique retreat with cedar-wood suites, a spa and a wraparound view of the Lidder valley.", 4.8, "hotel-suite-2", 19500, ["romantic", "luxury", "boutique", "riverside"], ["Spa", "Valley-view suites"]],
  // Sonamarg
  ["sonamarg", "comfort", "Thajiwas View Lodge", "A no-frills lodge with hot rooms, home-style meals and views up towards the glacier.", 3.9, "hotel-camp-2", 3400, ["riverside", "family", "friends"]],
  ["sonamarg", "premium", "Sindh Valley Resort", "A four-star riverside resort with heated rooms, a lawn and a restaurant serving trout in season.", 4.3, "hotel-resort", 7400, ["riverside", "family", "couple"], ["Lawn", "Trout in season"]],
  ["sonamarg", "luxury", "Zojila Alpine Lodge", "A boutique lodge with mountain-facing suites, log-burners and an outdoor deck for stargazing.", 4.7, "hotel-suite", 16500, ["romantic", "luxury", "boutique"], ["Stargazing deck"]],
  // Doodhpathri
  ["doodhpathri", "comfort", "Shaliganga Guest House", "A simple guest house at the meadow's edge, with warm rooms and farm-fresh meals.", 3.9, "hotel-wilderness", 3200, ["family", "friends", "riverside"]],
  ["doodhpathri", "premium", "Doodhpathri Meadow Cottages", "Wood-panelled cottages a short walk from the stream, with a bonfire area and a small restaurant.", 4.3, "hotel-cottage", 6800, ["family", "couple", "boutique"], ["Bonfire area"]],
  ["doodhpathri", "luxury", "Pine Hollow Retreat", "A small luxury lodge in the pines with heated suites, a private lounge and guided nature walks.", 4.6, "hotel-cottage-2", 15000, ["romantic", "luxury", "boutique"], ["Guided nature walks"]],
  // Yusmarg
  ["yusmarg", "comfort", "Nilnag Guest House", "A humble guest house close to Nilnag lake, with hearty home cooking.", 3.8, "hotel-snow-hut", 3000, ["family", "friends"]],
  ["yusmarg", "premium", "Yusmarg Green Lodge", "A tidy, timber-fronted lodge on the meadow with comfortable rooms and a garden restaurant.", 4.2, "hotel-cottage", 6400, ["family", "couple"], ["Garden restaurant"]],
  ["yusmarg", "luxury", "Yusmarg Forest Retreat", "A quiet forest retreat of private cottages with fireplaces, tailor-made walks and a chef's table.", 4.6, "hotel-suite-2", 14000, ["romantic", "luxury", "boutique"], ["Chef's table"]],
  // Gurez
  ["gurez", "comfort", "Habba Khatoon Homestay", "A local homestay run by a Dard family, with traditional meals and warm, simple rooms.", 3.9, "hotel-wilderness", 3000, ["homestay", "friends", "adventure"], ["Local family hosts"]],
  ["gurez", "premium", "Kishanganga Camp & Lodge", "A comfortable riverside camp of heated tents and a small lodge, with hot showers and hearty dinners.", 4.2, "hotel-camp-2", 6200, ["riverside", "adventure", "friends"], ["Heated tents"]],
  ["gurez", "luxury", "Tulail Valley Camp", "A premium tented camp with proper beds, private bathrooms, a dining tent and campfire evenings.", 4.5, "hotel-camp", 12500, ["luxury", "adventure", "photography"], ["Private bathrooms"]],
  // Jammu
  ["jammu", "comfort", "Tawi Riverside Inn", "A practical, clean city hotel near the station with air-conditioned rooms and an in-house restaurant.", 4.0, "hotel-suite", 3000, ["central", "family", "spiritual"]],
  ["jammu", "premium", "Bahu Heights Hotel", "A four-star business-style hotel with a rooftop restaurant and views towards the fort.", 4.3, "hotel-suite-2", 6500, ["central", "family", "spiritual"], ["Rooftop restaurant"]],
  ["jammu", "luxury", "Amar Residency Palace", "A heritage-style palace hotel with landscaped grounds, a pool and fine dining.", 4.7, "hotel-resort", 14500, ["heritage", "luxury", "family"], ["Pool", "Landscaped grounds"]],
  // Katra
  ["katra", "comfort", "Trikuta Pilgrim Inn", "A clean, no-fuss hotel within reach of the yatra registration, with vegetarian meals.", 4.0, "hotel-suite", 3200, ["spiritual", "family", "central"], ["Vegetarian kitchen"]],
  ["katra", "premium", "Vaishno Grand Hotel", "A four-star hotel with comfortable family rooms, a multi-cuisine restaurant and a travel desk.", 4.3, "hotel-suite-2", 6800, ["spiritual", "family", "central"], ["Travel desk"]],
  ["katra", "luxury", "Katra Heritage Resort & Spa", "A resort on the outskirts of Katra with landscaped courtyards, a spa and quiet suites for post-yatra rest.", 4.6, "hotel-resort", 13500, ["spiritual", "luxury", "family"], ["Spa", "Courtyards"]],
  // Patnitop
  ["patnitop", "comfort", "Nathatop Cottages", "Simple timber cottages in the pines with heaters and home-cooked food.", 4.0, "hotel-cottage", 3400, ["family", "friends", "couple"]],
  ["patnitop", "premium", "Sanasar Pine Resort", "A four-star resort near Sanasar with garden cottages, a bonfire area and a paragliding-desk tie-up.", 4.3, "hotel-cottage-2", 7200, ["adventure", "family", "couple"], ["Bonfire area"]],
  ["patnitop", "luxury", "Deodar Ridge Resort", "A ridge-top resort with panoramic suites, a heated pool and a fine restaurant.", 4.6, "hotel-resort", 14500, ["luxury", "romantic", "boutique"], ["Heated pool"]],
  // Leh
  ["leh", "comfort", "Indus View Guest House", "A family-run guest house with sunny courtyards, oxygen-support access and Ladakhi breakfasts.", 4.1, "hotel-leh-house", 3800, ["homestay", "family", "friends"], ["Sun-lit courtyard"]],
  ["leh", "premium", "Changspa Residency", "A four-star hotel at the edge of Leh with heated rooms, a rooftop terrace and a restaurant.", 4.4, "hotel-suite", 9000, ["central", "family", "couple"], ["Rooftop terrace", "Oxygen support on request"]],
  ["leh", "luxury", "Stok Heritage Resort", "A luxury resort with views of Stok Kangri, thoughtful altitude-acclimatisation support and a spa.", 4.8, "hotel-suite-2", 22000, ["luxury", "romantic", "boutique", "heritage"], ["Spa", "Acclimatisation support"]],
  // Nubra
  ["nubra", "comfort", "Hunder Dune Camp", "Twin-bed tents near the dunes with shared facilities and hearty Ladakhi dinners.", 3.9, "hotel-camp", 4200, ["adventure", "friends", "family"]],
  ["nubra", "premium", "Nubra Orchard Resort", "A comfortable resort set among apricot orchards with cottage rooms and a garden restaurant.", 4.3, "hotel-camp-2", 8600, ["family", "couple", "adventure"], ["Orchard garden"]],
  ["nubra", "luxury", "Shyok Luxury Tents", "Premium tents with private bathrooms, wooden floors and views across the valley.", 4.6, "hotel-tent-lux", 16500, ["luxury", "romantic", "photography"], ["Private bathrooms"]],
  // Pangong
  ["pangong", "comfort", "Lakeside Tent Camp", "Simple tents a short walk from the water, with shared bathrooms and hot meals.", 3.8, "hotel-camp-2", 4600, ["adventure", "friends", "photography"]],
  ["pangong", "premium", "Pangong Premium Camp", "Comfortable insulated tents with attached toilets, heaters on request and a dining tent.", 4.2, "hotel-camp", 9200, ["photography", "couple", "family"], ["Attached toilets"]],
  ["pangong", "luxury", "Changthang Luxury Camp", "Deluxe tents with proper beds, private toilets and a lounge tent, near the lakefront.", 4.5, "hotel-tent-lux", 17500, ["luxury", "romantic", "photography"], ["Lounge tent"]],
  // Sham Valley
  ["sham-valley", "comfort", "Alchi Village Homestay", "A traditional Ladakhi homestay with apricot-orchard views and simple, delicious meals.", 4.0, "hotel-leh-house", 3400, ["homestay", "family", "photography"]],
  ["sham-valley", "premium", "Likir Valley Resort", "A four-star riverside resort with garden cottages and a restaurant serving local dishes.", 4.3, "hotel-suite", 7600, ["family", "couple", "relaxed"]],
  ["sham-valley", "luxury", "Lamayuru Heritage Lodge", "A boutique lodge in traditional Ladakhi style with heated suites and a private courtyard.", 4.6, "hotel-tent-lux", 15500, ["luxury", "heritage", "photography"], ["Private courtyard"]],
  // Tso Moriri
  ["tso-moriri", "comfort", "Korzok Camp", "Basic tents with hot meals near the lakeshore, for the hardy and the curious.", 3.7, "hotel-camp-2", 4600, ["adventure", "friends", "photography"]],
  ["tso-moriri", "premium", "Rupshu Valley Camp", "Insulated tents with beds, attached toilets and a mess tent, close to Korzok village.", 4.1, "hotel-camp", 9000, ["photography", "adventure", "couple"], ["Attached toilets"]],
  ["tso-moriri", "luxury", "Rupshu Luxury Camp", "The most comfortable option at Tso Moriri — luxury tents with electric blankets and a lounge tent.", 4.4, "hotel-tent-lux", 17000, ["luxury", "romantic", "photography"], ["Electric blankets"]],
];

export const hotels: Hotel[] = rows.map(([destinationId, category, name, description, rating, image, pricePerNight, tags, extra = []]) => ({
  id: `${destinationId}-${category}`,
  destinationId,
  name,
  category,
  description,
  rating,
  image,
  amenities: [...AMENITIES[category], ...extra],
  roomTypes: ROOMS[category],
  pricePerNight,
  tags,
}));
