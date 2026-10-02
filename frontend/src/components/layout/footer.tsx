import Link from "next/link";
import { site } from "@/data/site";
import { whatsappLink } from "@/lib/booking";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "./logo";

const cols = [
  {
    title: "Destinations",
    links: [
      { label: "Kashmir", href: "/destinations?region=kashmir" },
      { label: "Jammu & Katra", href: "/destinations?region=jammu" },
      { label: "Ladakh", href: "/destinations?region=ladakh" },
      { label: "All destinations", href: "/destinations" },
    ],
  },
  {
    title: "Journeys",
    links: [
      { label: "Packages", href: "/packages" },
      { label: "Experiences", href: "/activities" },
      { label: "Stays", href: "/hotels" },
      { label: "Vehicles", href: "/vehicles" },
    ],
  },
  {
    title: "Travel",
    links: [
      { label: "Best time to visit", href: "/travel-guide#best-time" },
      { label: "Travel guide", href: "/travel-guide" },
      { label: "FAQs", href: "/travel-guide#faq" },
      { label: "My trip", href: "/my-trip" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Why us", href: "/about#why-us" },
      { label: "Contact", href: "/contact" },
      { label: "Photo credits", href: "/credits" },
    ],
  },
];

function Ig() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Fb() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.6V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.4H7.6V13h2.7v8z" />
    </svg>
  );
}
function Yt() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10.2 9.3 4.6 2.7-4.6 2.7z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Wa() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3.6 20.4 5 15.6A8.6 8.6 0 1 1 8.4 19z" strokeLinejoin="round" />
      <path d="M9 8.6c.3 3 2.5 5.3 5.6 6l1.2-1.3-2-1-.9.8a4.6 4.6 0 0 1-2.3-2.3l.8-.9-1-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  const wa = whatsappLink(`Hello ${site.short}! I'd like to plan a trip.`);
  const socials = [
    { label: "Instagram", href: site.social.instagram, Icon: Ig },
    { label: "Facebook", href: site.social.facebook, Icon: Fb },
    { label: "YouTube", href: site.social.youtube, Icon: Yt },
    { label: "WhatsApp", href: wa, Icon: Wa },
  ];
  return (
    <footer className="on-dark relative bg-forest text-ivory/75 print:hidden">
      <div className="bg-jaali-light pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="container-x relative pb-24 pt-14 lg:pb-8 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)] lg:gap-20">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm font-display text-[1.6rem] leading-snug text-ivory">Planned from Srinagar, around the way you travel.</p>
            <address className="mt-5 space-y-1 text-[14px] not-italic leading-relaxed">
              <p>{site.address}</p>
              <p>
                <a href={site.phoneHref} className="hover:text-white">{site.phone}</a> · <a href={`mailto:${site.email}`} className="break-all hover:text-white">{site.email}</a>
              </p>
            </address>
            <ButtonLink href={wa} variant="onDark" size="md" className="mt-6">WhatsApp us</ButtonLink>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">
            {cols.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] !text-brass-soft !font-sans">{c.title}</h2>
                <ul className="mt-4 space-y-2.5 text-[14.5px]">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="inline-flex min-h-8 items-center transition-colors hover:text-white">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-5 border-t border-white/15 pt-6 text-[12px] text-ivory/55 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl leading-relaxed">© {new Date().getFullYear()} {site.name}. Prices are estimates, not live availability; bookings are requests confirmed by our travel team. Contact details are placeholders.</p>
          <ul className="flex gap-1">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full text-ivory/80 transition-colors hover:bg-white/10 hover:text-white">
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
