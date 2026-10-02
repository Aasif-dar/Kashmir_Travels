import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/layout/contact-form";
import { JsonLd } from "@/components/layout/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/section";
import { LoadingBlock } from "@/components/ui/states";
import { site } from "@/data/site";
import { whatsappLink } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Contact our Kashmir travel team",
  description: "Talk to a travel expert in Srinagar about your Kashmir, Jammu, Katra or Ladakh trip — by WhatsApp, phone, email or the contact form.",
  alternates: { canonical: "/contact" },
  openGraph: { title: `Contact ${site.name}`, description: "Speak to a local travel expert.", images: ["/images/floating-market.jpg"] },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", name: `Contact ${site.name}`, url: `${site.url}/contact`, mainEntity: { "@type": "TravelAgency", name: site.name, telephone: site.phone, email: site.email, address: { "@type": "PostalAddress", addressLocality: "Srinagar", addressRegion: "Jammu & Kashmir", addressCountry: "IN" } } }} />
      <PageHeader eyebrow="Contact" title="Talk to someone who lives here" lede="Questions, half-formed ideas or a finished plan you'd like checked — we're glad to help. WhatsApp is usually the quickest." image="floating-market" />
      <section className="container-x grid gap-16 py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:py-20">
        <div>
          <h2 className="font-display text-[1.9rem] leading-none">Send us a message</h2>
          <div className="mt-7"><Suspense fallback={<div className="min-h-[520px]"><LoadingBlock /></div>}><ContactForm /></Suspense></div>
        </div>
        <aside aria-label="Contact details" className="space-y-9 lg:pt-1">
          <div className="rounded-[3px] bg-forest p-7 text-ivory">
            <p className="eyebrow !text-brass-soft">Quickest</p>
            <h2 className="mt-3 font-display text-[1.9rem] leading-tight !text-ivory">WhatsApp a travel expert</h2>
            <p className="mt-2 text-[14.5px] text-ivory/80">Opens WhatsApp with a message ready to send.</p>
            <ButtonLink href={whatsappLink(`Hello ${site.short}! I'd like some help planning a trip to Kashmir.`)} variant="gold" size="lg" caps className="mt-6">Open WhatsApp</ButtonLink>
          </div>
          <dl className="divide-y divide-line border-y border-line-strong text-[15px]">
            <div className="py-4"><dt className="t-label !text-[10px] text-brass">Phone</dt><dd className="mt-1"><a href={site.phoneHref} className="hover:text-forest">{site.phone}</a></dd></div>
            <div className="py-4"><dt className="t-label !text-[10px] text-brass">Email</dt><dd className="mt-1"><a href={`mailto:${site.email}`} className="break-all hover:text-forest">{site.email}</a></dd></div>
            <div className="py-4"><dt className="t-label !text-[10px] text-brass">Office</dt><dd className="mt-1">{site.address}</dd><dd className="text-[13px] text-muted">{site.hours}</dd></div>
          </dl>
          <p className="text-[12px] text-muted">Phone, email and address are placeholders until real company details are supplied.</p>
        </aside>
      </section>
    </>
  );
}
