"use client";

import { Button } from "@/components/ui/button";
import type { TourPackage } from "@/types/package";
import type { Tier } from "@/types/trip";
import { useCustomizePackage } from "./use-customize";

/** "Customize" — opens the planner with this package preloaded. Small client island for server-rendered cards. */
export function CustomizeButton({ pkg, tier, month, className, variant = "outline", size = "sm", children = "Customize" }: { pkg: TourPackage; tier?: Tier; month?: number | null; className?: string; variant?: "outline" | "primary" | "ghost"; size?: "sm" | "md"; children?: React.ReactNode }) {
  const customize = useCustomizePackage();
  return (
    <Button variant={variant} size={size} className={className} onClick={() => customize(pkg, { tier, month })} aria-label={`Customize ${pkg.name}`}>
      {children}
    </Button>
  );
}
