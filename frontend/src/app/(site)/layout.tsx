import { Footer } from "@/components/layout/footer";
import { MobileCta } from "@/components/layout/mobile-cta";
import { Navbar } from "@/components/layout/navbar";
import { ToastProvider } from "@/components/ui/toast";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {/* data-site scopes customer-only micro-interactions (see .btn-press in globals.css); the admin does not get them. */}
      <div data-site>
        <a href="#main" className="sr-only z-[100] rounded bg-forest px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <MobileCta />
      </div>
    </ToastProvider>
  );
}
