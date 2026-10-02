"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/data/site";
import { whatsappLink } from "@/lib/booking";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { SearchDialog } from "./search-dialog";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3.6 20.4 5 15.6A8.6 8.6 0 1 1 8.4 19z" strokeLinejoin="round" />
      <path d="M9 8.6c.3 3 2.5 5.3 5.6 6l1.2-1.3-2-1-.9.8a4.6 4.6 0 0 1-2.3-2.3l.8-.9-1-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const overHero = pathname === "/" && !scrolled;
  const wa = whatsappLink(`Hello ${site.short}! I'd like some help planning a trip.`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));
  const ink = overHero ? "text-ivory" : "text-forest";

  return (
    <>
      <header className={cn("fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300 print:hidden", overHero ? "on-dark border-transparent bg-transparent" : "border-line bg-ivory/[0.97]")}>
        {overHero && <div className="scrim-nav pointer-events-none absolute inset-x-0 top-0 h-36" aria-hidden />}
        <div className={cn("container-x relative flex items-center justify-between gap-8 transition-[height] duration-300", scrolled ? "h-[58px]" : "h-[68px] lg:h-[76px]")}>
          <Logo light={overHero} />

          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-9">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative py-2 text-[13px] font-medium tracking-[0.04em] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100",
                      overHero ? "text-ivory/90 hover:text-white" : "text-ink hover:text-forest",
                      isActive(item.href) && "after:scale-x-100"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 xl:gap-2">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search destinations, journeys and experiences" className={cn("grid h-11 w-11 place-items-center rounded-full transition-colors", ink, overHero ? "hover:bg-white/10" : "hover:bg-forest/5")}>
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link href="/contact" className={cn("hidden px-2 text-[13px] font-medium tracking-[0.04em] transition-colors xl:inline-block", overHero ? "text-ivory/90 hover:text-white" : "text-ink hover:text-forest")} aria-current={isActive("/contact") ? "page" : undefined}>
              Contact
            </Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" className={cn("hidden h-11 w-11 place-items-center rounded-full transition-colors xl:grid", ink, overHero ? "hover:bg-white/10" : "hover:bg-forest/5")}>
              <WhatsAppGlyph className="h-[19px] w-[19px]" />
            </a>
            <ButtonLink href="/plan-your-trip" variant={overHero ? "light" : "primary"} size="sm" caps className="ml-1 hidden sm:inline-flex">
              Plan My Trip
            </ButtonLink>
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} className={cn("grid h-11 w-11 place-items-center rounded-full xl:hidden", ink, overHero ? "hover:bg-white/10" : "hover:bg-forest/5")}>
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Menu" side="left" className="on-dark bg-forest text-ivory [&_button]:text-ivory [&>div:first-child]:border-white/15 [&_h2]:!text-ivory">
        <nav aria-label="Mobile" className="flex min-h-full flex-col px-6 pb-8 pt-4">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setMenuOpen(false)} aria-current={isActive(item.href) ? "page" : undefined} className={cn("flex min-h-[54px] items-center font-display text-[1.9rem] leading-none transition-colors", isActive(item.href) ? "text-brass-soft" : "text-ivory")}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-3 pt-10">
            <ButtonLink href="/plan-your-trip" variant="gold" size="lg" caps className="w-full" onClick={() => setMenuOpen(false)}>
              Plan My Trip
            </ButtonLink>
            <div className="grid grid-cols-2 gap-3">
              <ButtonLink href="/contact" variant="onDark" size="md" onClick={() => setMenuOpen(false)}>Contact</ButtonLink>
              <ButtonLink href={wa} variant="onDark" size="md">WhatsApp</ButtonLink>
            </div>
          </div>
        </nav>
      </Sheet>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
