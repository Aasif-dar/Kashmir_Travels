"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const hiddenOn = ["/plan-your-trip", "/book", "/my-trip", "/contact", "/credits"];

/**
 * Sticky "Plan My Trip" on phones — only when it is useful: after the first screen, and never over the closing
 * call-to-action or footer. The planner and booking flow have their own bottom bars.
 */
export function MobileCta() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const bottomGap = document.documentElement.scrollHeight - (y + window.innerHeight);
      setShow(y > window.innerHeight * 0.7 && bottomGap > 900);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  if (hiddenOn.some((p) => pathname.startsWith(p))) return null;
  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/[0.97] px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 transition-transform duration-300 print:hidden lg:hidden",
        show ? "translate-y-0" : "translate-y-full"
      )}
    >
      <Link href="/plan-your-trip" tabIndex={show ? 0 : -1} className="flex h-12 w-full items-center justify-center gap-2 rounded-[3px] bg-forest text-[12px] font-semibold uppercase tracking-[0.16em] text-ivory active:bg-pine">
        Build my journey <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
