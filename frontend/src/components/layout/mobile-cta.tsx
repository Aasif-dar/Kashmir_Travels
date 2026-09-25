"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const hiddenOn = ["/plan-your-trip", "/book", "/my-trip"];

/** Sticky bottom CTA on mobile. The planner and booking flow have their own bottom bars. */
export function MobileCta() {
  const pathname = usePathname();
  if (hiddenOn.some((p) => pathname.startsWith(p))) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 print:hidden border-t border-line bg-ivory/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
      <Link href="/plan-your-trip" className="flex h-12 w-full items-center justify-center gap-2 rounded-[3px] bg-forest text-[15px] font-medium tracking-wide text-ivory active:bg-pine">
        Plan My Trip <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
