import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className, light }: { children: ReactNode; className?: string; light?: boolean }) {
  return <p className={cn("eyebrow", light && "!text-brass-soft", className)}>{children}</p>;
}

export function SectionHeading({ eyebrow, title, lede, align = "left", light, className, as: Tag = "h2" }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; align?: "left" | "center"; light?: boolean; className?: string; as?: "h1" | "h2" }) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-3xl", className)}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <Tag className={cn("display-lg mt-3", light && "!text-ivory")}>{title}</Tag>
      {lede && <p className={cn("lede mt-5 max-w-2xl", align === "center" && "mx-auto", light && "!text-ivory/75")}>{lede}</p>}
    </div>
  );
}

/** Page-level top spacing under the fixed navbar. */
export function PageHeader({ eyebrow, title, lede, children, className }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <header className={cn("border-b border-line bg-parchment/50 bg-jaali pt-28 pb-12 sm:pt-32 sm:pb-16", className)}>
      <div className="container-x">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="display-lg mt-3 max-w-4xl">{title}</h1>
        {lede && <p className="lede mt-5 max-w-2xl">{lede}</p>}
        {children}
      </div>
    </header>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}

export function Badge({ children, className, tone = "neutral" }: { children: ReactNode; className?: string; tone?: "neutral" | "gold" | "forest" | "burgundy" | "light" }) {
  const tones = {
    neutral: "border-line bg-paper text-forest",
    gold: "border-brass/40 bg-brass/10 text-[#6b4f1b]",
    forest: "border-forest bg-forest text-ivory",
    burgundy: "border-burgundy/40 bg-burgundy/10 text-burgundy",
    light: "border-white/30 bg-black/25 text-white backdrop-blur-sm",
  } as const;
  return <span className={cn("inline-flex items-center gap-1 rounded-[2px] border px-2 py-[3px] text-[10.5px] font-semibold uppercase tracking-[0.14em]", tones[tone], className)}>{children}</span>;
}
