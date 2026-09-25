"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState } from "react";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/motion";
import { Eyebrow } from "@/components/ui/section";
import { stories, whyUs } from "@/data/content";
import { cn } from "@/lib/utils";

export function WhyTravelWithUs() {
  return (
    <section id="why-us" aria-labelledby="why-title" className="scroll-mt-20 py-20 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-[4/5] overflow-hidden bg-forest">
            <Photo k="floating-market" sizes="(min-width:1024px) 40vw, 100vw" />
          </div>
          <p className="mt-3 text-xs text-muted">The floating market on Dal Lake, before sunrise.</p>
        </div>
        <div>
          <Eyebrow>Why travel with us</Eyebrow>
          <h2 id="why-title" className="display-lg mt-3">Local knowledge, <span className="italic text-forest">honest planning</span></h2>
          <ol className="mt-10 divide-y divide-line border-y border-line">
            {whyUs.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i * 0.03} className="grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[64px_220px_1fr]">
                <span className="font-display text-2xl text-brass">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-2xl leading-tight">{w.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{w.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function TravellerStories() {
  const [i, setI] = useState(0);
  const s = stories[i];
  return (
    <section aria-labelledby="stories-title" className="relative overflow-hidden bg-forest py-20 text-ivory lg:py-28">
      <div className="absolute inset-0 bg-jaali-light opacity-60" aria-hidden />
      <div className="container-x relative">
        <Eyebrow light>Traveller stories</Eyebrow>
        <h2 id="stories-title" className="sr-only">Traveller stories</h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <Quote className="h-14 w-14 text-brass-soft" aria-hidden />
          <figure aria-live="polite" key={i} className="anim-fade">
            <blockquote className="font-display text-[clamp(1.75rem,3.6vw,3.1rem)] leading-[1.15] text-ivory">“{s.quote}”</blockquote>
            <figcaption className="mt-8 text-sm text-ivory/70">
              <span className="font-semibold text-ivory">{s.name}</span> · {s.detail}
            </figcaption>
          </figure>
        </div>
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-white/15 pt-6">
          <p className="text-xs text-ivory/55">Sample notes — placeholder content for design. Replace with verified traveller reviews before launch.</p>
          <div className="flex items-center gap-2">
            <div className="mr-3 flex gap-1.5" aria-hidden>
              {stories.map((_, n) => <span key={n} className={cn("h-1 w-8 transition-colors", n === i ? "bg-brass-soft" : "bg-white/25")} />)}
            </div>
            <button type="button" onClick={() => setI((i + stories.length - 1) % stories.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10" aria-label="Previous story">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setI((i + 1) % stories.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10" aria-label="Next story">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
