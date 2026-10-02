import { Compass } from "lucide-react";
import { TextLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { QuickPlanner } from "./quick-planner";

/**
 * Editorial hero: photograph first, a ghost letterform for depth, a stamp-style locus badge,
 * and vertical marginalia on wide viewports — the planning module anchored to the headline baseline.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[max(100svh,780px)] flex-col justify-end overflow-hidden bg-forest">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 animate-slow-zoom">
          <Photo k="hero-dal" priority sizes="100vw" />
        </div>
        <div className="scrim-hero absolute inset-0" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-forest/70 via-forest/10 to-transparent" aria-hidden />
      </div>

      {/* ghost letterform behind the headline — depth without noise */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-6 top-16 hidden select-none font-display text-[26rem] leading-none text-ivory/[0.04] md:block"
      >
        K
      </span>

      {/* vertical marginalia, wide viewports only */}
      <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 xl:flex">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-px bg-ivory/25" aria-hidden />
          <p className="[writing-mode:vertical-rl] text-[10px] uppercase tracking-[0.35em] text-ivory/50">
            Dal Lake, Srinagar — at dusk
          </p>
          <span className="h-10 w-px bg-ivory/25" aria-hidden />
        </div>
      </div>

      <div className="container-x relative grid items-end gap-10 pb-10 pt-36 lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] lg:gap-16 lg:pb-14">
        <div className="anim-fade max-w-3xl">
          <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-dashed border-brass-soft/40 px-3.5 py-1 !text-brass-soft">
            <Compass className="h-3 w-3" aria-hidden />
            Kashmir · Jammu · Ladakh
          </p>
          <h1 id="hero-title" className="t-hero relative mt-5 !text-ivory">
            Your journey.
            <br />
            <span className="text-brass-soft">Your Kashmir.</span>
          </h1>
          <p className="mt-6 max-w-[34rem] text-[1.05rem] leading-relaxed text-ivory/90 sm:text-[1.125rem]">
            Curated journeys across the mountains, valleys and cities of the north — shaped around the way you want to travel.
          </p>
          <div className="mt-7 hidden lg:block">
            <TextLink href="/destinations" onDark>Explore destinations</TextLink>
          </div>
          <p className="mt-10 hidden items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ivory/60 lg:flex xl:hidden">
            Dal Lake, Srinagar
            <span className="h-px w-4 bg-ivory/30" aria-hidden />
            at dusk
          </p>
        </div>

        <div className="anim-fade" style={{ animationDelay: "80ms" }}>
          <QuickPlanner />
          <div className="mt-5 lg:hidden">
            <TextLink href="/destinations" onDark>Explore destinations</TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}