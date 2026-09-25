import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { getCatalog, getPackages } from "@/services/catalog";
import { CatalogProvider } from "@/store/catalog-context";
import { TripHydrator } from "@/components/layout/trip-hydrator";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Curated journeys across Kashmir, Jammu & Ladakh`, template: `%s | ${site.name}` },
  description: "Plan a personalised Kashmir, Jammu, Katra or Ladakh holiday. Build your itinerary, choose hotels, vehicles and experiences, and see a transparent estimated price before you request a booking.",
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    title: `${site.name} — Your journey. Your Kashmir.`,
    description: "Curated journeys across Kashmir, Jammu and Ladakh — shaped around your time, interests and style.",
    images: [{ url: "/images/hero-dal.jpg", width: 1600, height: 1000, alt: "A shikara on Dal Lake at dusk" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#1d3a2f",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [catalog, packages] = await Promise.all([getCatalog(), getPackages()]);
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <CatalogProvider catalog={catalog} packages={packages}>
          <TripHydrator />
          {children}
        </CatalogProvider>
      </body>
    </html>
  );
}
