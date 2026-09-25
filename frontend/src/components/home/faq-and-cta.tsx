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
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 py-20 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <Eyebrow>Questions, answered</Eyebrow>
          <h2 id={`${id}-title`} className="display-lg mt-3">Before you ask</h2>
          <p className="lede mt-5 max-w-sm">Can&apos;t find it here? Message us — a person from the travel team will reply.</p>
          <ButtonLink href={whatsappLink(`Hello ${site.short}! I have a question about planning a trip.`)} variant="outline" className="mt-6">Ask on WhatsApp</ButtonLink>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-forest py-28 text-center text-ivory lg:py-40">
      <div className="absolute inset-0 -z-10">
        <Photo k="pangong" sizes="100vw" />
        <div className="absolute inset-0 bg-forest/70" aria-hidden />
        <div className="absolute inset-0 bg-jaali-light opacity-50" aria-hidden />
      </div>
      <div className="container-x">
        <p className="eyebrow !text-brass-soft">Ready when you are</p>
        <h2 id="cta-title" className="display-xl mx-auto mt-4 max-w-4xl !text-[clamp(2.4rem,6.6vw,5.5rem)] !text-ivory">
          Start with a blank page, <span className="italic text-brass-soft">or a route we love.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ivory/80">No payment, no pressure. Build the trip, see the estimate, and let our team confirm the details.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/plan-your-trip" variant="gold" size="lg">Plan My Trip</ButtonLink>
          <ButtonLink href="/packages" variant="outline" size="lg" className="!border-white/60 !text-ivory hover:!bg-white/10">Explore Packages</ButtonLink>
        </div>
      </div>
    </section>
  );
}
