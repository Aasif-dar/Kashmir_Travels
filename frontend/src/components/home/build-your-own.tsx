import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/motion";
import { Eyebrow } from "@/components/ui/section";
import { journeySteps } from "@/data/content";

export function BuildYourOwn() {
  return (
    <section aria-labelledby="byo-title" className="relative overflow-hidden bg-parchment/60 py-20 lg:py-28">
      <div className="absolute inset-0 bg-jaali opacity-30" aria-hidden />
      <div className="container-x relative grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Build your own journey</Eyebrow>
          <h2 id="byo-title" className="display-lg mt-3">
            Seven steps to <span className="italic text-forest">your</span> Kashmir
          </h2>
          <p className="lede mt-5 max-w-md">The planner is the heart of this website. It works like sitting down with a local expert — realistic, flexible and honest about what things cost.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/plan-your-trip" size="lg">Plan My Trip</ButtonLink>
            <ButtonLink href="/packages" variant="outline" size="lg">Start from a package</ButtonLink>
          </div>
          <div className="relative mt-12 hidden aspect-[5/4] max-w-md overflow-hidden lg:block">
            <Photo k="mughal-garden" sizes="30vw" />
          </div>
        </div>
        <ol className="border-t border-forest/25">
          {journeySteps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.03} className="grid grid-cols-[64px_1fr] items-baseline gap-4 border-b border-forest/25 py-6 sm:grid-cols-[96px_1fr]">
              <span className="font-display text-5xl leading-none text-brass sm:text-6xl">{s.n}</span>
              <div>
                <h3 className="font-display text-3xl leading-tight">{s.title}</h3>
                <p className="mt-1.5 text-[15px] text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
