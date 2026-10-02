import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Photo } from "./photo";

export function Eyebrow({ children, className, light }: { children: ReactNode; className?: string; light?: boolean }) {
  return <p className={cn("eyebrow", light && "!text-brass-soft", className)}>{children}</p>;
}

/** Eyebrow + h2 + optional lede. The default block for introducing a section. */
export function SectionHeading({ eyebrow, title, lede, align = "left", light, className, as: Tag = "h2" }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; align?: "left" | "center"; light?: boolean; className?: string; as?: "h1" | "h2" }) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-3xl", className)}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <Tag className={cn("t-h2 mt-3", light && "!text-ivory")}>{title}</Tag>
      {lede && <p className={cn("t-lede mt-4 measure", align === "center" && "mx-auto", light && "!text-ivory/75")}>{lede}</p>}
    </div>
  );
}

/**
 * Editorial page header. With an image it becomes an asymmetric text + photograph composition;
 * without one it is a quiet typographic header. No decorative patterns.
 */
export function PageHeader({ eyebrow, title, lede, image, children, className }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; image?: string; children?: ReactNode; className?: string }) {
  return (
    <header className={cn("border-b border-line pt-[5.5rem] sm:pt-28", className)}>
      <div className={cn("container-x", image ? "grid items-center gap-8 pb-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 lg:pb-14" : "pb-10 lg:pb-14")}>
        <div className={cn(image ? "lg:pt-6" : "pt-6 lg:pt-10")}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="t-h1 mt-4 max-w-3xl">{title}</h1>
          {lede && <p className="t-lede mt-5 measure">{lede}</p>}
          {children}
        </div>
        {image && (
          <div className="relative order-first aspect-[16/10] overflow-hidden rounded-[3px] bg-forest lg:order-none lg:aspect-[4/3]">
            <Photo k={image} priority sizes="(min-width:1024px) 45vw, 100vw" />
          </div>
        )}
      </div>
    </header>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}

/** Small label. `light` is for use on top of photography. */
export function Badge({ children, className, tone = "neutral" }: { children: ReactNode; className?: string; tone?: "neutral" | "gold" | "forest" | "burgundy" | "light" }) {
  const tones = {
    neutral: "border-line bg-paper text-forest",
    gold: "border-brass/40 bg-brass/10 text-[#6b4f1b]",
    forest: "border-forest bg-forest text-ivory",
    burgundy: "border-burgundy/40 bg-burgundy/10 text-burgundy",
    light: "border-white/40 bg-charcoal/45 text-white",
  } as const;
  return <span className={cn("inline-flex items-center gap-1 rounded-[2px] border px-2 py-[3px] text-[10.5px] font-semibold uppercase tracking-[0.14em]", tones[tone], className)}>{children}</span>;
}
