import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
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
      <PageHeader eyebrow="Contact" title={<>Talk to someone <span className="italic text-forest">who lives here</span></>} lede="Questions, half-formed ideas or a finished plan you'd like checked — we're glad to help. WhatsApp is usually the quickest." />
      <section className="container-x grid gap-16 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
        <div>
          <Suspense fallback={<LoadingBlock />}><ContactForm /></Suspense>
        </div>
        <aside aria-label="Contact details" className="space-y-8 lg:pt-2">
          <div className="border border-forest bg-forest p-7 text-ivory">
            <MessageCircle className="h-6 w-6 text-brass-soft" aria-hidden />
            <h2 className="mt-3 font-display text-3xl !text-ivory">WhatsApp a travel expert</h2>
            <p className="mt-2 text-[15px] text-ivory/80">Opens WhatsApp with a message ready to send.</p>
            <ButtonLink href={whatsappLink(`Hello ${site.short}! I'd like some help planning a trip to Kashmir.`)} variant="gold" size="lg" className="mt-5">Open WhatsApp</ButtonLink>
          </div>
          <ul className="divide-y divide-line border-y border-line text-[15px]">
            <li className="flex gap-4 py-4"><Phone className="mt-1 h-4 w-4 text-brass" aria-hidden /><div><p className="eyebrow">Phone</p><a href={site.phoneHref} className="hover:text-forest">{site.phone}</a></div></li>
            <li className="flex gap-4 py-4"><Mail className="mt-1 h-4 w-4 text-brass" aria-hidden /><div><p className="eyebrow">Email</p><a href={`mailto:${site.email}`} className="break-all hover:text-forest">{site.email}</a></div></li>
            <li className="flex gap-4 py-4"><MapPin className="mt-1 h-4 w-4 text-brass" aria-hidden /><div><p className="eyebrow">Office</p><p>{site.address}</p><p className="text-sm text-muted">{site.hours}</p></div></li>
          </ul>
          <p className="text-xs text-muted">Phone, email and address are placeholders until real company details are supplied.</p>
        </aside>
      </section>
    </>
  );
}
