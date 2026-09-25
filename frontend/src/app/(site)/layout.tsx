import { Footer } from "@/components/layout/footer";
import { MobileCta } from "@/components/layout/mobile-cta";
import { Navbar } from "@/components/layout/navbar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded bg-forest px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <MobileCta />
    </>
  );
}
