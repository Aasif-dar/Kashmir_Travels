"use client";

import { BedDouble, Car, Camera, Coffee, Compass, MapPin, Plane, Plus, Sparkles, StickyNote, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { formatDate, formatHours, formatINR } from "@/lib/format";
import { getDayDate } from "@/lib/itinerary-engine";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/store/catalog-context";
import type { ItineraryDay, ItineraryItem } from "@/types/trip";

const kindIcon: Record<ItineraryItem["kind"], typeof MapPin> = {
  arrival: Plane,
  transfer: Car,
  sightseeing: Camera,
  activity: Sparkles,
  leisure: Coffee,
  departure: Plane,
  checkin: BedDouble,
};

export interface TimelineEditing {
  onRemoveActivity: (activityId: string) => void;
  onAddActivity: (activityId: string, stayDay?: number) => void;
  onMoveActivity: (activityId: string, stayDay: number) => void;
  onNote: (key: string, text: string) => void;
  /** Days at which each destination can host an activity (for the "move to" control). */
  stayDaysFor: (destinationId: string) => number;
}

interface Props {
  days: ItineraryDay[];
  stays?: { destinationId: string; hotel?: { name: string } | null }[];
  startDate?: string;
  editing?: TimelineEditing;
  className?: string;
  /** Compact rendering for print. */
  print?: boolean;
}

export function ItineraryTimeline({ days, stays, startDate, editing, className, print }: Props) {
  const catalog = useCatalog();
  const reduce = useReducedMotion();
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const destName = (id: string | null) => (id ? catalog.destinations.find((d) => d.id === id)?.name ?? id : "");
  const hotelFor = (destinationId: string | null) => stays?.find((s) => s.destinationId === destinationId)?.hotel;

  return (
    <ol className={cn("relative", className)}>
      {days.map((d, idx) => {
        const date = getDayDate(startDate, d.day);
        const hotel = hotelFor(d.overnightId);
        const last = idx === days.length - 1;
        return (
          <motion.li
            key={d.day}
            initial={reduce || print ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-6% 0px" }}
            transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
            className={cn("avoid-break relative grid grid-cols-[52px_1fr] gap-x-4 sm:grid-cols-[84px_1fr] sm:gap-x-6", !last && "pb-9")}
          >
            {/* rail */}
            <div className="relative">
              {!last && <span className="absolute left-[19px] top-[5.4rem] h-[calc(100%-5.4rem)] w-px bg-brass/40 sm:left-[27px]" aria-hidden />}
              <div className="sticky top-24 print:static">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brass">Day</p>
                <p className="font-display text-[2.6rem] leading-[0.9] text-forest sm:text-5xl">{String(d.day).padStart(2, "0")}</p>
                {date && <p className="mt-1 text-[11px] text-muted">{formatDate(date, { day: "numeric", month: "short" })}</p>}
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="font-display text-[1.65rem] leading-tight sm:text-3xl">{d.title}</h3>
              {d.transferHours != null && d.transferHours > 0 && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-muted">
                  <Car className="h-3.5 w-3.5 text-brass" aria-hidden /> About {formatHours(d.transferHours)} drive{d.transferHours > 8 ? " · early start" : ""}
                </p>
              )}
              <ul className="mt-4 space-y-2.5 border-l border-line pl-4">
                {d.items.map((it, i) => {
                  const Icon = it.optionalActivityId ? Plus : kindIcon[it.kind] ?? Compass;
                  const optAct = it.optionalActivityId ? catalog.activities.find((a) => a.id === it.optionalActivityId) : undefined;
                  return (
                    <li key={`${it.title}-${i}`} className="group flex items-start gap-3">
                      <Icon className={cn("mt-1 h-4 w-4 shrink-0", it.kind === "activity" ? "text-burgundy" : it.optionalActivityId ? "text-muted" : "text-forest")} aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-[15px] leading-snug", it.kind === "activity" ? "font-semibold text-charcoal" : it.optionalActivityId ? "text-muted" : "text-ink/90")}>
                          {it.optionalActivityId && <span className="mr-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brass">Optional</span>}
                          {it.title}
                        </p>
                        {it.description && <p className="mt-0.5 text-[13px] text-muted">{it.description}</p>}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {editing && optAct && d.overnightId && (
                            <button type="button" onClick={() => editing.onAddActivity(optAct.id, d.stayDay)} className="inline-flex min-h-8 items-center gap-1 border border-forest/40 px-2.5 text-[12px] font-medium text-forest hover:bg-forest hover:text-ivory">
                              <Plus className="h-3 w-3" aria-hidden /> Add · {formatINR(optAct.price)}{optAct.priceUnit === "person" ? " pp" : " / group"}
                            </button>
                          )}
                          {editing && it.kind === "activity" && it.activityId && d.overnightId && (
                            <>
                              <button type="button" onClick={() => editing.onRemoveActivity(it.activityId!)} className="inline-flex min-h-8 items-center gap-1 border border-burgundy/40 px-2.5 text-[12px] font-medium text-burgundy hover:bg-burgundy hover:text-ivory" aria-label={`Remove ${it.title} from day ${d.day}`}>
                                <X className="h-3 w-3" aria-hidden /> Remove
                              </button>
                              {editing.stayDaysFor(d.overnightId) > 1 && (
                                <label className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                                  Day of stay
                                  <select
                                    value={d.stayDay}
                                    onChange={(e) => editing.onMoveActivity(it.activityId!, Number(e.target.value))}
                                    className="h-8 border border-line bg-paper px-1.5 text-[12px] text-ink"
                                    aria-label={`Move ${it.title} to another day in ${destName(d.overnightId)}`}
                                  >
                                    {Array.from({ length: editing.stayDaysFor(d.overnightId) }, (_, n) => <option key={n} value={n + 1}>{n + 1}</option>)}
                                  </select>
                                </label>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {d.overnightId && (
                <p className="mt-4 flex items-start gap-2 text-[13.5px] text-forest">
                  <BedDouble className="mt-0.5 h-4 w-4 shrink-0 text-brass" aria-hidden />
                  <span>
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brass">Overnight </span>
                    {destName(d.overnightId)}{hotel ? ` · ${hotel.name}` : ""}
                  </span>
                </p>
              )}

              {d.note && noteOpen !== d.noteKey && (
                <p className="mt-3 flex gap-2 border-l-2 border-brass bg-brass/[0.07] px-3 py-2 text-[13.5px] italic text-ink/85"><StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" aria-hidden />{d.note}</p>
              )}
              {editing && (
                <div className="no-print mt-3">
                  {noteOpen === d.noteKey ? (
                    <div>
                      <label htmlFor={`note-${d.noteKey}`} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest">Personal note for day {d.day}</label>
                      <textarea
                        id={`note-${d.noteKey}`}
                        autoFocus
                        defaultValue={d.note ?? ""}
                        maxLength={240}
                        rows={2}
                        placeholder="e.g. Start late · celebrate an anniversary · vegetarian meals"
                        onBlur={(e) => { editing.onNote(d.noteKey, e.target.value.trim()); setNoteOpen(null); }}
                        className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm focus:border-forest focus:outline-none"
                      />
                      <p className="mt-1 text-[11.5px] text-muted">Saved when you click away. Shared with the travel team.</p>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setNoteOpen(d.noteKey)} className="inline-flex min-h-8 items-center gap-1.5 text-[12.5px] font-medium text-forest underline decoration-forest/30 underline-offset-4 hover:decoration-forest">
                      <StickyNote className="h-3.5 w-3.5" aria-hidden /> {d.note ? "Edit note" : "Add a note to this day"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
