"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Photo } from "@/components/ui/photo";
import { Eyebrow } from "@/components/ui/section";
import { stories, whyUs } from "@/data/content";
import { cn } from "@/lib/utils";

export function WhyTravelWithUs() {
  return (
    <section id="why-us" aria-labelledby="why-title" className="section scroll-mt-20">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-forest">
            <Photo k="floating-market" sizes="(min-width:1024px) 38vw, 100vw" />
          </div>
          <p className="mt-3 text-[12.5px] text-muted">The floating market on Dal Lake, before sunrise.</p>
        </div>
        <div className="lg:pt-6">
          <Eyebrow>Why travel with us</Eyebrow>
          <h2 id="why-title" className="t-h2 mt-3 max-w-xl">Local knowledge, honest planning</h2>
          <dl className="mt-10 grid gap-x-12 gap-y-9 sm:grid-cols-2">
            {whyUs.map((w) => (
              <div key={w.title} className="border-t border-line-strong pt-4">
                <dt className="font-display text-[1.5rem] leading-tight text-charcoal">{w.title}</dt>
                <dd className="mt-2 text-[14.5px] leading-relaxed text-muted">{w.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function TravellerStories() {
  const [i, setI] = useState(0);
  const s = stories[i];
  return (
    <section aria-labelledby="stories-title" className="section band-forest">
      <div className="container-x">
        <Eyebrow light>Traveller stories</Eyebrow>
        <h2 id="stories-title" className="sr-only">Traveller stories</h2>
        <figure aria-live="polite" key={i} className="anim-fade mt-8 max-w-4xl">
          <blockquote className="font-display text-[clamp(1.6rem,3.2vw,2.75rem)] leading-[1.18] text-ivory">“{s.quote}”</blockquote>
          <figcaption className="mt-7 text-sm text-ivory/70">
            <span className="font-semibold text-ivory">{s.name}</span> · {s.detail}
          </figcaption>
        </figure>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6">
          <p className="max-w-xl text-[12px] leading-relaxed text-ivory/55">Sample notes — placeholder content for design. Replace with verified traveller reviews before launch.</p>
          <div className="flex items-center gap-2">
            <div className="mr-3 flex gap-1.5" aria-hidden>
              {stories.map((_, n) => <span key={n} className={cn("h-[3px] w-8 transition-colors", n === i ? "bg-brass-soft" : "bg-white/25")} />)}
            </div>
            <button type="button" onClick={() => setI((i + stories.length - 1) % stories.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 transition-colors hover:bg-white/10" aria-label="Previous story"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => setI((i + 1) % stories.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 transition-colors hover:bg-white/10" aria-label="Next story"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
