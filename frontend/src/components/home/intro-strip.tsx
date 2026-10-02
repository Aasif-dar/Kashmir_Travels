const points = [
  { label: "Planned from Srinagar", text: "A local team designs, confirms and supports every journey." },
  { label: "Realistic routes", text: "Drive times, altitude and seasons are checked as you plan." },
  { label: "Clear estimates", text: "The price moves as you choose — and is confirmed by us first." },
  { label: "Request, then confirm", text: "Nothing is booked or charged until our team gets back to you." },
];

/** Quiet trust band under the hero: one line of voice, four plain facts, no icons or cards. */
export function IntroStrip() {
  return (
    <section aria-label="How we work" className="band-paper border-b border-line">
      <div className="container-x grid gap-10 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:gap-16 lg:py-16">
        <div>
          <p className="t-h3 max-w-[16ch] !text-[clamp(1.7rem,2.6vw,2.3rem)]">Built around the way you travel.</p>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">Choose the places you want to see. We&apos;ll shape the route.</p>
        </div>
        <ul className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {points.map((p) => (
            <li key={p.label} className="border-t border-line pt-4">
              <p className="t-label text-forest">{p.label}</p>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
