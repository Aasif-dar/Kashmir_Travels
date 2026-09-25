import Image from "next/image";
import { img } from "@/data/images";
import { cn } from "@/lib/utils";

interface PhotoProps {
  /** Key from the central image registry (src/data/images.ts). */
  k: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Override the registry alt text; pass "" for purely decorative use. */
  alt?: string;
  zoom?: boolean;
}

/** Fills its (relatively-positioned) parent with a registry photo. */
export function Photo({ k, className, sizes = "(min-width:1024px) 50vw, 100vw", priority, alt, zoom }: PhotoProps) {
  const { src, alt: defaultAlt, focal } = img(k);
  return (
    <Image
      src={src}
      alt={alt ?? defaultAlt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", zoom && "transition-transform duration-[1200ms] ease-[var(--ease-calm)] group-hover:scale-[1.045]", className)}
      style={focal ? { objectPosition: focal } : undefined}
    />
  );
}
