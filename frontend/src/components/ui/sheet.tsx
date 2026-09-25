"use client";

import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Side = "right" | "left" | "bottom" | "center";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: Side;
  children: ReactNode;
  className?: string;
  /** Hide the visible title (kept for screen readers). */
  hideTitle?: boolean;
}

const sideClasses: Record<Side, string> = {
  right: "right-0 top-0 h-dvh w-[min(92vw,440px)] anim-drawer",
  left: "left-0 top-0 h-dvh w-[min(88vw,380px)] anim-drawer-left",
  bottom: "bottom-0 left-0 right-0 max-h-[88dvh] rounded-t-[10px] anim-sheet",
  center: "left-1/2 top-1/2 max-h-[90dvh] w-[min(94vw,640px)] -translate-x-1/2 -translate-y-1/2 rounded-[6px] anim-pop",
};

/** Accessible modal / drawer / bottom-sheet (focus-trapped, Esc to close) built on Radix Dialog. */
export function Sheet({ open, onOpenChange, title, description, side = "right", children, className, hideTitle }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="anim-fade fixed inset-0 z-[80] bg-charcoal/55 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn("fixed z-[90] flex flex-col overflow-hidden bg-ivory text-ink shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] focus:outline-none", sideClasses[side], className)}
          aria-describedby={description ? undefined : undefined}
        >
          <div className={cn("flex items-start justify-between gap-4 border-b border-line px-5 py-4", hideTitle && "sr-only")}>
            <div>
              <Dialog.Title className="font-display text-2xl leading-tight text-charcoal">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="-mr-2 grid h-10 w-10 shrink-0 place-items-center rounded-full text-forest hover:bg-forest/5" aria-label="Close">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
