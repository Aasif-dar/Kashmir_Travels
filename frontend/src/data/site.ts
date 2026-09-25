/** Company details. All contact values are PLACEHOLDERS until real details are supplied. */
export const site = {
  name: "Zabarwan Journeys",
  short: "Zabarwan",
  tagline: "Curated journeys across Kashmir, Jammu and Ladakh",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.zabarwanjourneys.example",
  phone: "+91 99999 00000",
  phoneHref: "tel:+919999900000",
  whatsappNumber: "919999900000",
  email: "hello@zabarwanjourneys.example",
  address: "Boulevard Road, Srinagar, Jammu & Kashmir 190001",
  hours: "Mon–Sat, 9:30 am – 7:00 pm IST",
  licence: "J&K Tourism registration no. — to be supplied",
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
  },
} as const;

export const nav = [
  { label: "Destinations", href: "/destinations" },
  { label: "Packages", href: "/packages" },
  { label: "Plan Your Trip", href: "/plan-your-trip" },
  { label: "Experiences", href: "/activities" },
  { label: "Hotels", href: "/hotels" },
  { label: "Vehicles", href: "/vehicles" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const originCities = ["Delhi", "Mumbai", "Bengaluru", "Kolkata", "Hyderabad", "Chennai", "Ahmedabad", "Pune", "Chandigarh", "Jaipur", "Lucknow", "Other city"] as const;
