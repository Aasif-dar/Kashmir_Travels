"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/data/site";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { SearchDialog } from "./search-dialog";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 print:hidden transition-[background-color,box-shadow,border-color] duration-300",
          overHero ? "border-b border-transparent bg-transparent" : "border-b border-line bg-ivory/95 backdrop-blur"
        )}
      >
        <div className="container-x flex h-[60px] items-center justify-between gap-6 lg:h-16">
          <Logo light={overHero} />

          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-7">
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

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search destinations, packages and activities"
              className={cn("grid h-11 w-11 place-items-center rounded-full transition-colors", overHero ? "text-ivory hover:bg-white/10" : "text-forest hover:bg-forest/5")}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <ButtonLink href="/plan-your-trip" variant={overHero ? "light" : "primary"} size="sm" className="hidden sm:inline-flex">
              Plan My Trip
            </ButtonLink>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className={cn("grid h-11 w-11 place-items-center rounded-full xl:hidden", overHero ? "text-ivory hover:bg-white/10" : "text-forest hover:bg-forest/5")}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Menu" side="left" className="bg-forest text-ivory [&_button]:text-ivory [&>div:first-child]:border-white/15 [&_h2]:!text-ivory">
        <nav aria-label="Mobile" className="px-6 py-6">
          <ul className="divide-y divide-white/10">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setMenuOpen(false)} className={cn("flex min-h-14 items-center justify-between font-display text-3xl", isActive(item.href) ? "text-brass-soft" : "text-ivory")}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href="/plan-your-trip" variant="gold" size="lg" className="mt-8 w-full" onClick={() => setMenuOpen(false)}>
            Plan My Trip
          </ButtonLink>
          <p className="mt-6 text-sm text-ivory/60">Prefer to talk it through? Message us on WhatsApp from the contact page.</p>
        </nav>
      </Sheet>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
