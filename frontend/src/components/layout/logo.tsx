import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/data/site";

/** Chinar-leaf mark — a nod to Kashmir's autumn tree, drawn as a simple five-point leaf. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <path d="M16 3.5 18.6 9l4.2-2.2-.7 5.2 5.4-1-2.6 4.6 3.6 2.6-5.2 1.1.8 4.7-4.3-2L16 26.5l-1.8-4.3-4.3 2 .8-4.7-5.2-1.1 3.6-2.6L6.5 11l5.4 1-.7-5.2L15.4 9z" />
      <path d="M16 13v15" />
    </svg>
  );
}

export function Logo({ light, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label={`${site.name} — home`} className={cn("group inline-flex items-center gap-2.5", light ? "text-ivory" : "text-forest", className)}>
      <LogoMark className={light ? "text-brass-soft" : "text-brass"} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.65rem] font-semibold tracking-[0.02em]">Zabarwan</span>
        <span className={cn("mt-0.5 text-[9px] font-semibold uppercase tracking-[0.42em]", light ? "text-ivory/70" : "text-muted")}>Journeys</span>
      </span>
    </Link>
  );
}
