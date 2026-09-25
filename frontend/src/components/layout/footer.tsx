import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { site } from "@/data/site";
import { whatsappLink } from "@/lib/booking";
import { Logo } from "./logo";

const cols = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Why Us", href: "/about#why-us" },
      { label: "Photo credits", href: "/credits" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Kashmir", href: "/destinations?region=kashmir" },
      { label: "Jammu", href: "/destinations?region=jammu" },
      { label: "Ladakh", href: "/destinations?region=ladakh" },
      { label: "Packages", href: "/packages" },
      { label: "Activities", href: "/activities" },
    ],
  },
  {
    title: "Travel information",
    links: [
      { label: "Best Time to Visit", href: "/travel-guide#best-time" },
      { label: "Travel Guide", href: "/travel-guide" },
      { label: "FAQs", href: "/travel-guide#faq" },
      { label: "My Trip", href: "/my-trip" },
    ],
  },
];

function Ig() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Fb() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.6V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.4H7.6V13h2.7v8z" />
    </svg>
  );
}
function Yt() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10.2 9.3 4.6 2.7-4.6 2.7z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Wa() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3.6 20.4 5 15.6A8.6 8.6 0 1 1 8.4 19z" strokeLinejoin="round" />
      <path d="M9 8.6c.3 3 2.5 5.3 5.6 6l1.2-1.3-2-1-.9.8a4.6 4.6 0 0 1-2.3-2.3l.8-.9-1-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  const socials = [
    { label: "Instagram", href: site.social.instagram, Icon: Ig },
    { label: "Facebook", href: site.social.facebook, Icon: Fb },
    { label: "YouTube", href: site.social.youtube, Icon: Yt },
    { label: "WhatsApp", href: whatsappLink(`Hello ${site.short}! I'd like to plan a trip.`), Icon: Wa },
  ];
  return (
    <footer className="relative mt-24 print:hidden bg-forest text-ivory/80">
      <div className="absolute inset-0 bg-jaali-light opacity-70" aria-hidden />
      <div className="container-x relative pb-28 pt-16 lg:pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2.6fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm font-display text-2xl leading-snug text-ivory">Curated journeys across Kashmir, Jammu and Ladakh — planned by people who live here.</p>
            <ul className="mt-6 flex gap-2">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-ivory transition-colors hover:border-brass-soft hover:text-brass-soft">
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {cols.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <h2 className="eyebrow !text-brass-soft !font-sans">{c.title}</h2>
                <ul className="mt-4 space-y-2.5 text-[14.5px]">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div>
              <h2 className="eyebrow !text-brass-soft !font-sans">Contact</h2>
              <ul className="mt-4 space-y-3 text-[14.5px]">
                <li className="flex gap-2.5">
                  <Phone className="mt-1 h-4 w-4 shrink-0 text-brass-soft" aria-hidden />
                  <a href={site.phoneHref} className="hover:text-white">{site.phone}</a>
                </li>
                <li className="flex gap-2.5">
                  <Mail className="mt-1 h-4 w-4 shrink-0 text-brass-soft" aria-hidden />
                  <a href={`mailto:${site.email}`} className="break-all hover:text-white">{site.email}</a>
                </li>
                <li className="flex gap-2.5">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-brass-soft" aria-hidden />
                  <span>Srinagar, Jammu &amp; Kashmir</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-ivory/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Contact details shown are placeholders until supplied.</p>
          <p>Prices shown are demo estimates, not live availability. Bookings are requests confirmed by our travel team.</p>
        </div>
      </div>
    </footer>
  );
}
