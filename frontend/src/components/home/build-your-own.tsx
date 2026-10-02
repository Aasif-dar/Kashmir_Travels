import { ItineraryTimeline } from "@/components/itinerary/itinerary-timeline";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/section";
import { journeySteps } from "@/data/content";
import { tierById } from "@/data/rules";
import { formatINR } from "@/lib/format";
import { buildItinerary } from "@/lib/itinerary-engine";
import { resolveStays } from "@/lib/pricing";
import { packageStartingPrice } from "@/lib/starting-price";
import { packageToTrip } from "@/lib/trip";
import type { TourPackage } from "@/types/package";
import type { Catalog } from "@/types/trip";

/**
 * The planner, explained by showing it: eight short steps on one side, and a real slice of the itinerary the
 * planner produces on the other (rendered by the same engine and component the planner uses).
 */
export function BuildYourOwn({ sample, catalog }: { sample: TourPackage; catalog: Catalog }) {
  const trip = packageToTrip(sample);
  const days = buildItinerary(trip, catalog);
  const stays = resolveStays(trip, catalog).map((s) => ({ destinationId: s.destinationId, hotel: s.hotel ? { name: s.hotel.name, category: s.hotel.category } : null }));
  const tier = tierById(trip.tier);
  return (
    <section aria-labelledby="byo-title" className="section">
      <div className="container-x grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
        <div>
          <Eyebrow>Build your own journey</Eyebrow>
          <h2 id="byo-title" className="t-h2 mt-3 max-w-lg">Choose the places you want to see. We&apos;ll shape the route.</h2>
          <p className="t-lede mt-4 max-w-md">Your route, your pace. The planner works like a conversation with someone who knows the roads — it tells you when a plan is too tight and shows the estimate as you go.</p>

          <ol className="mt-9 grid grid-cols-2 gap-x-6 border-t border-line-strong sm:gap-x-10">
            {journeySteps.map((s) => (
              <li key={s.n} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 border-b border-line py-3.5 sm:grid-cols-[34px_minmax(0,1fr)] sm:gap-3">
                <span className="font-display text-[1.15rem] leading-none text-brass">{s.n}</span>
                <div>
                  <p className="font-display text-[1.3rem] leading-none text-charcoal">{s.title}</p>
                  <p className="mt-1.5 hidden text-[13px] leading-snug text-muted sm:block">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
            <ButtonLink href="/plan-your-trip" size="lg" caps>Build my journey</ButtonLink>
            <TextLink href="/packages">Or start from a journey</TextLink>
          </div>
        </div>

        <figure className="min-w-0">
          <div className="rounded-[3px] border border-line bg-paper p-6 shadow-float sm:p-9">
            <figcaption className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
              <span>
                <span className="t-label !text-[10px] text-brass">A sample itinerary</span>
                <span className="mt-1 block font-display text-[1.6rem] leading-none text-charcoal">{sample.name}</span>
              </span>
              <span className="text-[12.5px] text-muted">{sample.days} days · from {formatINR(packageStartingPrice(sample, catalog))} pp</span>
            </figcaption>
            <ItineraryTimeline days={days} stays={stays} meals={tier.mealPlan} compact maxDays={3} className="mt-7" />
          </div>
          <p className="mt-3 text-[12.5px] text-muted">Every day can be reordered, extended or personalised — and every price updates as you do.</p>
        </figure>
      </div>
    </section>
  );
}
