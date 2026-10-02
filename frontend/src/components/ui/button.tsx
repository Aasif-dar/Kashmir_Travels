import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "gold" | "light" | "burgundy" | "onDark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-ivory hover:bg-pine border border-forest",
  secondary: "bg-parchment text-forest hover:bg-sand border border-parchment",
  outline: "bg-transparent text-forest border border-forest/40 hover:border-forest hover:bg-forest/5",
  ghost: "bg-transparent text-forest hover:bg-forest/5 border border-transparent",
  gold: "bg-brass text-white hover:bg-[#5f4419] border border-brass",
  light: "bg-ivory text-forest hover:bg-white border border-ivory",
  burgundy: "bg-burgundy text-ivory hover:bg-[#642530] border border-burgundy",
  /** Outline button for use over photography or dark bands. */
  onDark: "bg-transparent text-ivory border border-white/55 hover:border-white hover:bg-white/10",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-sm",
  lg: "h-[52px] px-8 text-[15px]",
};
/** Uppercase treatment for major calls to action ("BUILD MY JOURNEY"). */
const capsSizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[11px]",
  md: "h-11 px-6 text-[11.5px]",
  lg: "h-[52px] px-8 text-[12px]",
};

interface StyleOpts {
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Uppercase, letter-spaced label — reserved for primary conversions. */
  caps?: boolean;
}

export function buttonClasses({ variant = "primary", size = "md", className, caps }: StyleOpts = {}) {
  return cn(
    "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[3px] font-medium transition-[background-color,border-color,color,transform] duration-200 btn-press disabled:pointer-events-none disabled:opacity-45 select-none",
    caps ? "font-semibold uppercase tracking-[0.16em]" : "tracking-[0.02em]",
    variants[variant],
    caps ? capsSizes[size] : sizes[size],
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, Omit<StyleOpts, "className"> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant, size, caps, className, type = "button", ...props }, ref) {
  return <button ref={ref} type={type} className={buttonClasses({ variant, size, className, caps })} {...props} />;
});

export function ButtonLink({ variant, size, caps, className, href, children, ...props }: StyleOpts & { href: string; children: React.ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const external = /^(https?:|mailto:|tel:)/.test(href);
  const classes = buttonClasses({ variant, size, className, caps });
  if (external) {
    return (
      <a href={href} className={classes} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}

/** Editorial text link: small caps, hairline underline, arrow that nudges on hover. */
export function TextLink({ href, children, className, onDark, arrow = true }: { href: string; children: React.ReactNode; className?: string; onDark?: boolean; arrow?: boolean }) {
  const external = /^(https?:|mailto:|tel:)/.test(href);
  const inner = (
    <>
      <span className={cn("border-b pb-0.5 transition-colors", onDark ? "border-white/40 group-hover:border-white" : "border-forest/35 group-hover:border-forest")}>{children}</span>
      {arrow && (
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      )}
    </>
  );
  const cls = cn("group inline-flex min-h-8 items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em]", onDark ? "text-ivory" : "text-forest", className);
  return external ? (
    <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
