import { ArrowDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { QuickPlanner } from "./quick-planner";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[max(100svh,760px)] flex-col justify-end overflow-hidden bg-forest">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 animate-slow-zoom">
          <Photo k="hero-dal" priority sizes="100vw" />
        </div>
        <div className="img-scrim absolute inset-0" aria-hidden />
        <div className="absolute inset-0 bg-jaali-light opacity-40" aria-hidden />
      </div>

      <div className="container-x pb-6 pt-32 sm:pb-8 lg:pt-40">
        <p className="eyebrow !text-brass-soft">Kashmir · Jammu · Katra · Ladakh</p>
        <h1 id="hero-title" className="mt-4 max-w-5xl font-display text-[clamp(2.6rem,8.4vw,7rem)] font-medium uppercase leading-[0.94] tracking-[0.005em] !text-ivory">
          Your journey.
          <br />
          Your <span className="italic text-brass-soft">Kashmir.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ivory/85 sm:text-lg">
          Curated journeys across Kashmir, Jammu and Ladakh — shaped around your time, interests and style.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/plan-your-trip" variant="gold" size="lg">Plan My Trip</ButtonLink>
          <ButtonLink href="/packages" variant="outline" size="lg" className="!border-white/60 !text-ivory hover:!bg-white/10">Explore Packages</ButtonLink>
        </div>

        <QuickPlanner variant="hero" className="mt-10 sm:mt-14" />

        <a href="#explore" className="mx-auto mt-6 hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory/70 hover:text-ivory lg:flex lg:w-fit">
          Scroll <ArrowDown className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </section>
  );
}
