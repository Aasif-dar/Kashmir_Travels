import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "gold" | "light" | "burgundy";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-ivory hover:bg-pine border border-forest",
  secondary: "bg-parchment text-forest hover:bg-sand border border-parchment",
  outline: "bg-transparent text-forest border border-forest/40 hover:border-forest hover:bg-forest/5",
  ghost: "bg-transparent text-forest hover:bg-forest/5 border border-transparent",
  gold: "bg-brass text-white hover:bg-[#5f4419] border border-brass",
  light: "bg-ivory text-forest hover:bg-white border border-ivory",
  burgundy: "bg-burgundy text-ivory hover:bg-[#642530] border border-burgundy",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-sm",
  lg: "h-[52px] px-8 text-[15px]",
};

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[3px] font-medium tracking-[0.02em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-45 select-none",
    variants[variant],
    sizes[size],
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant, size, className, type = "button", ...props }, ref) {
  return <button ref={ref} type={type} className={buttonClasses({ variant, size, className })} {...props} />;
});

export function ButtonLink({ variant, size, className, href, children, ...props }: { variant?: Variant; size?: Size; className?: string; href: string; children: React.ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const external = /^(https?:|mailto:|tel:)/.test(href);
  const classes = buttonClasses({ variant, size, className });
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

/** Editorial text link with an underline that draws in. */
export function TextLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-forest", className)}>
      <span className="border-b border-forest/40 pb-0.5 transition-colors group-hover:border-forest">{children}</span>
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </Link>
  );
}
