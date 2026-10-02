"use client";

import { Accordion as A } from "radix-ui";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AccordionEntry {
  id: string;
  question: string;
  answer: ReactNode;
}

export function Accordion({ items, className }: { items: AccordionEntry[]; className?: string }) {
  return (
    <A.Root type="single" collapsible className={cn("border-t border-line-strong", className)}>
      {items.map((it) => (
        <A.Item key={it.id} value={it.id} className="border-b border-line">
          <A.Header>
            <A.Trigger className="group flex min-h-[64px] w-full items-center justify-between gap-6 py-4 text-left">
              <span className="font-display text-[1.3rem] leading-snug text-charcoal transition-colors group-hover:text-forest sm:text-[1.45rem]">{it.question}</span>
              <Plus className="h-5 w-5 shrink-0 text-brass transition-transform duration-300 group-data-[state=open]:rotate-45" aria-hidden />
            </A.Trigger>
          </A.Header>
          <A.Content className="overflow-hidden text-[15px] leading-relaxed text-muted data-[state=closed]:animate-[fade-in_150ms_reverse] data-[state=open]:animate-[fade-in_250ms]">
            <div className="max-w-[62ch] pb-6 pr-10">{it.answer}</div>
          </A.Content>
        </A.Item>
      ))}
    </A.Root>
  );
}
