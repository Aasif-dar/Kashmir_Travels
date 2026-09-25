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
    <A.Root type="single" collapsible className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((it) => (
        <A.Item key={it.id} value={it.id}>
          <A.Header>
            <A.Trigger className="group flex w-full items-start justify-between gap-6 py-5 text-left">
              <span className="font-display text-xl leading-snug text-charcoal sm:text-[1.4rem]">{it.question}</span>
              <Plus className="mt-1.5 h-5 w-5 shrink-0 text-brass transition-transform duration-300 group-data-[state=open]:rotate-45" aria-hidden />
            </A.Trigger>
          </A.Header>
          <A.Content className="overflow-hidden text-[15px] leading-relaxed text-muted data-[state=closed]:animate-[fade-in_150ms_reverse] data-[state=open]:animate-[fade-in_250ms]">
            <div className="pb-6 pr-10">{it.answer}</div>
          </A.Content>
        </A.Item>
      ))}
    </A.Root>
  );
}
