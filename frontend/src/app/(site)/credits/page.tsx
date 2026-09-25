import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/section";
import credits from "@/data/image-credits.json";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "Photo credits",
  description: "Attribution for the openly licensed photographs used on this website.",
  robots: { index: false },
};

type Credit = { file: string; author: string; license: string; source: string };

export default function CreditsPage() {
  const entries = Object.entries(credits as Record<string, Credit>).sort(([a], [b]) => a.localeCompare(b));
  const used = new Set(Object.values(images).map((i) => i.file.replace(".jpg", "")));
  return (
    <>
      <PageHeader eyebrow="Credits" title="Photo credits" lede="Photographs are sourced from Wikimedia Commons under open licences and shown here with attribution. Some were cropped or resized. Replace any of them by updating the central image registry." />
      <section className="container-x py-14">
        <ul className="divide-y divide-line border-y border-line text-[13.5px]">
          {entries.filter(([k]) => used.has(k)).map(([key, c]) => (
            <li key={key} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr_120px] sm:gap-6">
              <span className="font-medium text-forest">{key}</span>
              <span className="text-ink/85"><a href={c.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{c.file}</a> — {c.author}</span>
              <span className="text-muted">{c.license}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted">Hotel and vehicle photographs are illustrative and may not show the exact named property or model.</p>
      </section>
    </>
  );
}
