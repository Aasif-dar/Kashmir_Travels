/**
 * Central image registry. Components and data files reference images by KEY only.
 * To replace a photo, drop a new file in /public/images and update `file` here (or point `src` at a CDN URL).
 * Photographs are sourced from Wikimedia Commons under open licences — see /credits and image-credits.json.
 */
export interface ImageEntry {
  file: string;
  alt: string;
  /** CSS object-position for cropping, e.g. "50% 30%". */
  focal?: string;
}

const e = (file: string, alt: string, focal?: string): ImageEntry => ({ file, alt, focal });

export const images = {
  "hero-dal": e("hero-dal.jpg", "A shikara gliding across Dal Lake at dusk with houseboats and the Zabarwan hills behind", "50% 60%"),
  srinagar: e("srinagar.jpg", "Shikaras crossing a still Dal Lake beneath snow-covered Zabarwan peaks", "50% 40%"),
  gulmarg: e("gulmarg.jpg", "Visitors walking across the snow bowl below Kongdoori station, Gulmarg", "50% 55%"),
  "gulmarg-meadow": e("gulmarg-meadow.jpg", "Timber huts on a green Gulmarg meadow below snowy peaks", "50% 60%"),
  pahalgam: e("pahalgam.jpg", "The pine-lined Lidder valley near Pahalgam under a cloudy sky", "50% 55%"),
  sonamarg: e("sonamarg.jpg", "Snow-dusted pine slopes and glaciated peaks at Thajiwas, Sonamarg", "50% 40%"),
  doodhpathri: e("doodhpathri.jpg", "Green meadows and pine forest at Doodhpathri", "50% 60%"),
  yusmarg: e("yusmarg.jpg", "The green Yusmarg bowl with wooden huts and pine forest", "50% 70%"),
  gurez: e("gurez.jpg", "The Kishanganga river winding through the Gurez valley", "50% 60%"),
  jammu: e("jammu.jpg", "Bahu Fort rising above its gardens and pond in Jammu", "50% 40%"),
  katra: e("katra.jpg", "The Vaishno Devi shrine complex climbing the Trikuta hillside above Katra", "50% 65%"),
  patnitop: e("patnitop.jpg", "Snow slope and deodar forest at Patnitop with skiers below", "50% 50%"),
  leh: e("leh.jpg", "Golden temple roofs above Leh with the Ladakh range in evening light", "50% 40%"),
  nubra: e("nubra.jpg", "White sand dunes of Hunder in Nubra Valley below the Karakoram", "50% 50%"),
  pangong: e("pangong.jpg", "Still blue water of Pangong Lake below brown Changthang mountains", "50% 50%"),
  "sham-valley": e("sham-valley.jpg", "Eroded moonland hills and a lone poplar in Sham Valley, Ladakh", "50% 55%"),
  "tso-moriri": e("tso-moriri.jpg", "The shore of Tso Moriri with arid Rupshu mountains", "50% 55%"),
  "khardung-la": e("khardung-la.jpg", "The Khardung La pass signboard and a truck at the high pass"),
  hanle: e("hanle.jpg", "Whitewashed houses at Hanle under snow-capped peaks", "50% 65%"),
  "magnetic-hill": e("magnetic-hill.jpg", "An empty tarmac road winding through golden Ladakh hills near Magnetic Hill", "50% 55%"),
  aru: e("aru.jpg", "Snow-covered Aru Valley with pines and peaks", "50% 50%"),
  betaab: e("betaab.jpg", "Lawns and pine forest at Betaab Valley, Pahalgam", "50% 55%"),
  chandanwari: e("chandanwari.jpg", "A stream running under the snow bridge at Chandanwari"),
  aharbal: e("aharbal.jpg", "The Aharbal waterfall thundering over rocks"),
  mansar: e("mansar.jpg", "Forested hills reflected in Mansar Lake near Jammu", "50% 55%"),
  "shiv-khori": e("shiv-khori.jpg", "A wooded hillside near the Shiv Khori cave shrine, Reasi"),
  sanasar: e("sanasar.jpg", "The small lake and green meadow at Sanasar", "50% 60%"),
  "mughal-garden": e("mughal-garden.jpg", "Terraced water channel and fountains in the Nishat Mughal Garden, Srinagar", "50% 55%"),
  tulip: e("tulip.jpg", "Rows of white and purple tulips in Srinagar's tulip garden", "50% 60%"),
  "shah-hamadan": e("shah-hamadan.jpg", "The carved timber Shah-e-Hamadan shrine in Srinagar", "50% 40%"),
  "floating-market": e("floating-market.jpg", "Boats and wooden shopfronts at the floating market on Dal Lake", "50% 50%"),
  "leh-street": e("leh-street.jpg", "Gilded Buddhist statues inside Thiksey Monastery, Ladakh"),
  "act-gondola": e("act-gondola.jpg", "A gondola cabin rising over snowy pine slopes at Gulmarg", "50% 50%"),
  "act-skiing": e("act-skiing.jpg", "A skier on a chairlift above tracked snow at Gulmarg"),
  "act-snowboarding": e("act-snowboarding.jpg", "A snowboarder jumping on a sunny ski slope", "50% 45%"),
  "act-shikara": e("act-shikara.jpg", "Colourful shikara boats waiting at the ghat on Dal Lake", "50% 60%"),
  "act-horse": e("act-horse.jpg", "Riders on horseback crossing a green Pahalgam meadow", "50% 55%"),
  "act-rafting": e("act-rafting.jpg", "Rafts on the wide Zanskar–Indus river in Ladakh", "50% 55%"),
  "act-biking": e("magnetic-hill.jpg", "An empty tarmac road winding through golden Ladakh hills, made for a long ride", "50% 55%"),
  "act-atv": e("act-atv.jpg", "An all-terrain quad bike parked on pale ground"),
  "act-iceskating": e("act-iceskating.jpg", "A skater standing on a clear frozen lake beneath snowy mountains", "50% 50%"),
  "act-trekking": e("act-trekking.jpg", "Trekkers on a snow slope above a sea of cloud", "50% 55%"),
  "act-camping": e("act-camping.jpg", "A blue tent pitched in a pine-ringed alpine meadow near Aru", "50% 65%"),
  "act-balloon": e("act-balloon.jpg", "A hot-air balloon at sunrise above mountain ridges"),
  "act-paragliding": e("act-paragliding.jpg", "Paragliders launching over the meadow at Sanasar", "50% 55%"),
  "act-camel": e("act-camel.jpg", "A Bactrian camel resting on the Hunder dunes in Nubra Valley", "50% 40%"),
  "hotel-houseboat": e("hotel-houseboat.jpg", "Carved wooden houseboats lit at dusk on Dal Lake", "50% 60%"),
  "hotel-houseboat-2": e("hotel-houseboat-2.jpg", "Houseboats and shikaras across calm Dal Lake water", "50% 60%"),
  "hotel-cottage": e("hotel-cottage.jpg", "Green-roofed timber cottages among deodar trees at Patnitop"),
  "hotel-snow-hut": e("hotel-snow-hut.jpg", "A snow-covered timber cottage in Gulmarg"),
  "hotel-camp": e("hotel-camp.jpg", "Orange tented camp beneath Himalayan hills in Ladakh", "50% 60%"),
  "hotel-camp-2": e("hotel-camp-2.jpg", "White canvas tents in a high Himalayan valley", "50% 60%"),
  "hotel-suite": e("hotel-suite.jpg", "A hotel bedroom with a carved timber headboard and soft lamps"),
  "hotel-resort": e("hotel-resort.jpg", "A timber-and-glass mountain resort villa with a lawn and umbrellas at Sonamarg", "50% 60%"),
  "hotel-tent-lux": e("hotel-tent-lux.jpg", "Inside a Ladakhi luxury tent with a stone feature wall and timber bed", "50% 55%"),
  "hotel-houseboat-3": e("hotel-houseboat-3.jpg", "A boatman rowing past carved houseboats on Dal Lake", "50% 60%"),
  "hotel-cottage-2": e("hotel-cottage-2.jpg", "A green timber cottage among tall deodar trees at Patnitop", "50% 55%"),
  "hotel-suite-2": e("hotel-suite-2.jpg", "A hotel room with a carved stone headboard wall and warm lighting"),
  "hotel-leh-house": e("hotel-leh-house.jpg", "Flat-roofed whitewashed houses of a Ladakhi town from above"),
  "hotel-wilderness": e("hotel-wilderness.jpg", "Camp tents pitched on a grassy slope among trees"),
  "veh-sedan": e("veh-sedan.jpg", "A silver Maruti Suzuki Dzire sedan"),
  "veh-suv": e("veh-suv.jpg", "A white Maruti Suzuki Ertiga people carrier"),
  "veh-premium": e("veh-premium.jpg", "A white Toyota Innova Crysta premium SUV"),
  "veh-tempo": e("veh-tempo.jpg", "A Force Traveller 12-seater tempo traveller on a mountain road"),
} satisfies Record<string, ImageEntry>;

export type ImageKey = keyof typeof images;

export function img(key: string): { src: string; alt: string; focal?: string } {
  const entry = (images as Record<string, ImageEntry>)[key] ?? images["hero-dal"];
  return { src: `/images/${entry.file}`, alt: entry.alt, focal: entry.focal };
}
