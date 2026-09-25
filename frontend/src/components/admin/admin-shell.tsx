"use client";

import { Building2, CarFront, Compass, ExternalLink, Hotel, LayoutDashboard, LogOut, Map, Menu, Package, Sparkles, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { LoadingBlock } from "@/components/ui/states";
import { Sheet } from "@/components/ui/sheet";
import { adminLogout, isAdminLoggedIn } from "@/services/admin-auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/destinations", label: "Destinations", icon: Map },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/hotels", label: "Hotels", icon: Hotel },
  { href: "/admin/vehicles", label: "Vehicles", icon: CarFront },
  { href: "/admin/activities", label: "Activities", icon: Sparkles },
  { href: "/admin/customers", label: "Customers", icon: Users },
] as const;

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="space-y-0.5">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 px-3 text-[14px] transition-colors", active ? "bg-white/10 text-brass-soft" : "text-ivory/75 hover:bg-white/5 hover:text-ivory")}>
            <Icon className="h-4 w-4" aria-hidden /> {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Demo admin frame. Guards routes with the mock session — see services/admin-auth.ts. */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    const ok = isAdminLoggedIn();
    if (!ok && !isLogin) router.replace("/admin/login");
    else if (ok && isLogin) router.replace("/admin");
    else setReady(true);
  }, [isLogin, router, pathname]);

  if (isLogin) return <>{ready ? children : null}</>;
  if (!ready) return <div className="mx-auto max-w-3xl px-4 pt-24"><LoadingBlock label="Checking session…" /></div>;

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden bg-forest lg:block">
        <div className="sticky top-0 flex h-dvh flex-col p-4">
          <div className="px-2 pb-6 pt-2"><Logo light /></div>
          <Nav />
          <div className="mt-auto space-y-1 border-t border-white/10 pt-4 text-[13px]">
            <Link href="/" className="flex min-h-10 items-center gap-2 px-3 text-ivory/70 hover:text-ivory"><ExternalLink className="h-4 w-4" aria-hidden /> View website</Link>
            <button type="button" onClick={() => { adminLogout(); router.replace("/admin/login"); }} className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-ivory/70 hover:text-ivory"><LogOut className="h-4 w-4" aria-hidden /> Sign out</button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-ivory/95 px-4 py-2.5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center text-forest lg:hidden" aria-label="Open admin menu"><Menu className="h-5 w-5" /></button>
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-burgundy"><Building2 className="h-3.5 w-3.5" aria-hidden /> Demo admin · mock sign-in · data stays in this browser</p>
          </div>
          <Compass className="hidden h-4 w-4 text-brass sm:block" aria-hidden />
        </div>
        <main className="px-4 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>

      <Sheet open={open} onOpenChange={setOpen} title="Admin menu" side="left" className="!bg-forest text-ivory [&_button]:!text-ivory [&_h2]:!text-ivory">
        <div className="p-4">
          <Nav onNavigate={() => setOpen(false)} />
          <button type="button" onClick={() => { adminLogout(); router.replace("/admin/login"); }} className="mt-6 flex min-h-11 items-center gap-2 px-3 text-ivory/70"><LogOut className="h-4 w-4" aria-hidden /> Sign out</button>
        </div>
      </Sheet>
    </div>
  );
}
