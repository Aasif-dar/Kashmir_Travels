import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Eyebrow } from "@/components/ui/section";
import { faqs } from "@/data/content";
import { site } from "@/data/site";
import { whatsappLink } from "@/lib/booking";

export function FaqSection({ id = "faq", limit }: { id?: string; limit?: number }) {
  const items = (limit ? faqs.slice(0, limit) : faqs).map((f) => ({ id: f.id, question: f.question, answer: f.answer }));
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="section scroll-mt-20">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
        <div>
          <Eyebrow>Questions</Eyebrow>
          <h2 id={`${id}-title`} className="t-h2 mt-3">Before you ask</h2>
          <p className="t-lede mt-4 max-w-sm">Can&apos;t find it here? Message us — a person from the travel team will reply.</p>
          <ButtonLink href={whatsappLink(`Hello ${site.short}! I have a question about planning a trip.`)} variant="outline" className="mt-6">Ask on WhatsApp</ButtonLink>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}

/** Closing call to action, shown before the footer on content pages. */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="on-dark relative isolate overflow-hidden bg-forest">
      <div className="absolute inset-0 -z-10">
        <Photo k="pangong" sizes="100vw" />
        <div className="absolute inset-0 bg-forest/60" aria-hidden />
      </div>
      <div className="container-x section-lg">
        <p className="eyebrow !text-brass-soft">Ready to explore?</p>
        <h2 id="cta-title" className="t-h1 mt-4 max-w-3xl !text-ivory">Let&apos;s plan your journey.</h2>
        <p className="mt-5 max-w-lg text-[1.05rem] leading-relaxed text-ivory/85">Build the trip, watch the estimate move, and let our team confirm the details. No payment, no pressure.</p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <ButtonLink href="/plan-your-trip" variant="gold" size="lg" caps>Build my journey</ButtonLink>
          <ButtonLink href={whatsappLink(`Hello ${site.short}! I'd like to plan a trip.`)} variant="onDark" size="lg" caps>WhatsApp us</ButtonLink>
        </div>
      </div>
    </section>
  );
}
