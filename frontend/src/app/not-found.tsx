import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="grid min-h-[70svh] place-items-center px-4 pb-20 pt-36 text-center">
        <div>
          <p className="eyebrow">Error 404</p>
          <h1 className="display-lg mt-3">This path leads <span className="italic text-forest">nowhere yet</span></h1>
          <p className="lede mx-auto mt-5 max-w-md">The page you were looking for has moved, or never existed. Let&apos;s get you back on the road.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/" size="lg">Back to home</ButtonLink>
            <ButtonLink href="/destinations" variant="outline" size="lg">Browse destinations</ButtonLink>
          </div>
          <p className="mt-6 text-sm text-muted">Or <Link href="/plan-your-trip" className="underline">plan a trip</Link> from scratch.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
