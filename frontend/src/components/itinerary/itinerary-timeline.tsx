"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Pencil, Plus, X } from "lucide-react";
import { useState } from "react";
import { Photo } from "@/components/ui/photo";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatHours, formatINR } from "@/lib/format";
import { getDayDate } from "@/lib/itinerary-engine";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/store/catalog-context";
import { HOTEL_CATEGORY_LABEL, type HotelCategory } from "@/types/hotel";
import type { Activity } from "@/types/activity";
import type { ItineraryDay, ItineraryItem } from "@/types/trip";

export interface TimelineEditing {
  onRemoveActivity: (activityId: string) => void;
  onAddActivity: (activityId: string, stayDay?: number) => void;
  onMoveActivity: (activityId: string, stayDay: number) => void;
  onNote: (key: string, text: string) => void;
  /** Number of days spent in a destination (for the "day of stay" control). */
  stayDaysFor: (destinationId: string) => number;
  /** Stop-level controls, offered on the first day of each stay. */
  stopIndex: (destinationId: string) => number;
  stopCount: number;
  onMoveStop: (index: number, dir: -1 | 1) => void;
  onRemoveStop: (destinationId: string) => void;
  onReplaceStop: (index: number, destinationId: string) => void;
  destinationChoices: (destinationId: string) => { id: string; name: string }[];
  /** Experiences that could still be added on a day in this destination. */
  activityChoices: (destinationId: string) => Activity[];
}

interface StayInfo {
  destinationId: string;
  hotel?: { name: string; category?: string } | null;
}

interface Props {
  days: ItineraryDay[];
  stays?: StayInfo[];
  startDate?: string;
  editing?: TimelineEditing;
  className?: string;
  /** Print layout: no motion, static rail. */
  print?: boolean;
  /** Preview layout used on marketing pages: fewer details, capped length. */
  compact?: boolean;
  maxDays?: number;
  /** Meals covered on overnight days, e.g. ["Breakfast", "Dinner"]. */
  meals?: string[];
}

const nodeStyle: Record<ItineraryItem["kind"], string> = {
  arrival: "border-forest bg-forest",
  departure: "border-forest bg-forest",
  transfer: "border-forest bg-ivory",
  checkin: "border-stone bg-ivory",
  sightseeing: "border-forest bg-ivory",
  activity: "border-burgundy bg-burgundy",
  leisure: "border-stone bg-stone",
};

const categoryName = (c?: string) => (c && c in HOTEL_CATEGORY_LABEL ? HOTEL_CATEGORY_LABEL[c as HotelCategory].name : c);

export function ItineraryTimeline({ days, stays, startDate, editing, className, print, compact, maxDays, meals }: Props) {
  const catalog = useCatalog();
  const reduce = useReducedMotion();
  const { notify } = useToast();
  const [editDay, setEditDay] = useState<number | null>(null);
  const [addFor, setAddFor] = useState<ItineraryDay | null>(null);

  const destName = (id: string | null) => (id ? catalog.destinations.find((d) => d.id === id)?.name ?? id : "");
  const stayFor = (destinationId: string | null) => stays?.find((s) => s.destinationId === destinationId);
  const shown = maxDays ? days.slice(0, maxDays) : days;
  const hidden = days.length - shown.length;

  return (
    <>
      <ol className={cn("relative", className)}>
        {shown.map((d, idx) => {
          const date = getDayDate(startDate, d.day);
          const stay = stayFor(d.overnightId);
          const last = idx === shown.length - 1;
          const isFirstStayDay = !!editing && !!d.overnightId && d.stayDay === 1;
          const overnightDeparture = d.overnightId === null;
          const mealText = overnightDeparture ? (meals?.includes("Breakfast") ? "Breakfast" : "—") : meals?.length ? meals.join(" · ") : "";
          const items = compact ? d.items.filter((i) => !i.optionalActivityId).slice(0, 4) : d.items;
          const open = editDay === d.day;
          return (
            <motion.li
              key={d.day}
              initial={reduce || print || compact ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-6% 0px" }}
              transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
              className={cn("avoid-break relative grid grid-cols-[52px_minmax(0,1fr)] gap-x-4 sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-x-7", !last && (compact ? "pb-8" : "pb-12"))}
            >
              {/* rail */}
              <div className="relative">
                <p className="t-label !text-[10px] text-brass">Day</p>
                <p className="font-display text-[2.5rem] leading-[0.9] text-forest sm:text-[3.1rem]">{String(d.day).padStart(2, "0")}</p>
                {date && <p className="mt-1 text-[11.5px] text-muted">{formatDate(date, { day: "numeric", month: "short" })}</p>}
                {!last && <span className="absolute bottom-[-3rem] left-[17px] top-[5.4rem] w-px bg-line-strong sm:left-[21px]" aria-hidden />}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="font-display text-[1.3rem] font-semibold uppercase leading-tight tracking-[0.05em] text-charcoal sm:text-[1.55rem]">{d.title}</h3>
                  {d.transferHours != null && d.transferHours > 0 && (
                    <p className="t-label whitespace-nowrap !text-[10.5px] text-brass">
                      {d.transferKm ? `≈ ${d.transferKm} km · ` : ""}
                      {formatHours(d.transferHours)}
                      {d.transferHours > 8 ? " · early start" : ""}
                    </p>
                  )}
                </div>

                {/* the day, as a path */}
                <ul className="relative ml-1 mt-4 space-y-3.5 border-l border-dashed border-line-strong pl-5">
                  {items.map((it, i) => {
                    const optAct = it.optionalActivityId ? catalog.activities.find((a) => a.id === it.optionalActivityId) : undefined;
                    const isActivity = it.kind === "activity";
                    return (
                      <li key={`${it.title}-${i}`} className="relative">
                        <span aria-hidden className={cn("absolute -left-[25.5px] top-[0.5rem] h-[9px] w-[9px] rounded-full border-[1.5px]", it.optionalActivityId ? "border-dashed border-muted bg-ivory" : nodeStyle[it.kind])} />
                        <p className={cn("text-[15px] leading-snug", isActivity ? "font-semibold text-charcoal" : it.optionalActivityId ? "text-muted" : "text-ink/90", it.kind === "leisure" && "italic text-muted")}>
                          {isActivity && <span className="t-label mr-2 !text-[9.5px] text-burgundy">Experience</span>}
                          {it.optionalActivityId && <span className="t-label mr-2 !text-[9.5px] text-brass">Optional</span>}
                          {it.title}
                        </p>
                        {it.description && <p className="mt-0.5 text-[13px] leading-snug text-muted">{it.description}</p>}
                        {editing && (optAct || (isActivity && it.activityId)) && d.overnightId && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                            {optAct && (
                              <button type="button" onClick={() => { editing.onAddActivity(optAct.id, d.stayDay); notify(`${optAct.name} added to day ${d.day}`); }} className="inline-flex min-h-8 items-center gap-1.5 text-[12.5px] font-medium text-forest underline decoration-forest/30 underline-offset-4 hover:decoration-forest">
                                <Plus className="h-3.5 w-3.5" aria-hidden /> Add · {formatINR(optAct.price)}{optAct.priceUnit === "person" ? " pp" : " / group"}
                              </button>
                            )}
                            {isActivity && it.activityId && (
                              <>
                                {editing.stayDaysFor(d.overnightId) > 1 && (
                                  <label className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
                                    Move to day
                                    <select value={d.stayDay} onChange={(e) => editing.onMoveActivity(it.activityId!, Number(e.target.value))} className="h-8 rounded-[3px] border border-line bg-paper px-1.5 text-[12.5px] text-ink" aria-label={`Move ${it.title} to another day in ${destName(d.overnightId)}`}>
                                      {Array.from({ length: editing.stayDaysFor(d.overnightId) }, (_, n) => <option key={n} value={n + 1}>{n + 1} of {editing.stayDaysFor(d.overnightId!)} in {destName(d.overnightId)}</option>)}
                                    </select>
                                  </label>
                                )}
                                <button type="button" onClick={() => editing.onRemoveActivity(it.activityId!)} className="inline-flex min-h-8 items-center gap-1 text-[12.5px] text-burgundy underline decoration-burgundy/30 underline-offset-4 hover:decoration-burgundy" aria-label={`Remove ${it.title} from day ${d.day}`}>
                                  <X className="h-3.5 w-3.5" aria-hidden /> Remove
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* stay + meals */}
                {!compact && (
                  <dl className="mt-5 grid gap-x-10 gap-y-3 border-t border-line pt-4 sm:grid-cols-2">
                    <div>
                      <dt className="t-label !text-[10px] text-brass">Stay</dt>
                      <dd className="mt-1 text-[14px] text-ink">
                        {d.overnightId ? (
                          <>
                            {stay?.hotel ? stay.hotel.name : `${destName(d.overnightId)}`}
                            {stay?.hotel?.category && <span className="text-muted"> · {categoryName(stay.hotel.category)}</span>}
                          </>
                        ) : (
                          <span className="text-muted">Check-out today</span>
                        )}
                      </dd>
                    </div>
                    {mealText && (
                      <div>
                        <dt className="t-label !text-[10px] text-brass">Meals</dt>
                        <dd className="mt-1 text-[14px] text-ink">{mealText}</dd>
                      </div>
                    )}
                  </dl>
                )}

                {d.note && !open && (
                  <p className="mt-4 border-l-2 border-brass pl-3 text-[13.5px] italic leading-snug text-ink/85">
                    <span className="t-label mr-2 !text-[9.5px] not-italic text-brass">Your note</span>
                    {d.note}
                  </p>
                )}

                {/* day actions */}
                {editing && (
                  <div className="no-print mt-4">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px]">
                      <button type="button" onClick={() => setEditDay(open ? null : d.day)} aria-expanded={open} className="inline-flex min-h-9 items-center gap-1.5 font-medium text-forest hover:underline">
                        <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit day
                      </button>
                      {d.overnightId && (
                        <button type="button" onClick={() => setAddFor(d)} className="inline-flex min-h-9 items-center gap-1.5 font-medium text-forest hover:underline">
                          <Plus className="h-3.5 w-3.5" aria-hidden /> Add activity
                        </button>
                      )}
                    </div>

                    {open && (
                      <div className="anim-fade mt-2 space-y-4 rounded-[3px] border border-line bg-paper p-4">
                        <div>
                          <label htmlFor={`note-${d.noteKey}`} className="t-label !text-[10.5px] text-forest">Note for day {d.day}</label>
                          <textarea id={`note-${d.noteKey}`} defaultValue={d.note ?? ""} maxLength={240} rows={2} placeholder="e.g. start late · celebrating an anniversary · vegetarian meals" onBlur={(e) => editing.onNote(d.noteKey, e.target.value.trim())} className="mt-1 w-full rounded-[3px] border border-line bg-ivory px-3 py-2 text-sm focus:border-forest focus:outline-none" />
                          <p className="mt-1 text-[11.5px] text-muted">Saved when you click away. Shared with the travel team.</p>
                        </div>
                        {isFirstStayDay && d.overnightId && (
                          <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                            <div>
                              <label htmlFor={`stop-${d.day}`} className="t-label !text-[10.5px] text-forest">This stay</label>
                              <select id={`stop-${d.day}`} value={d.overnightId} onChange={(e) => editing.onReplaceStop(editing.stopIndex(d.overnightId!), e.target.value)} className="mt-1 h-10 w-full rounded-[3px] border border-line bg-ivory px-2.5 text-[14px]">
                                {editing.destinationChoices(d.overnightId).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                              </select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" disabled={editing.stopIndex(d.overnightId) === 0} onClick={() => editing.onMoveStop(editing.stopIndex(d.overnightId!), -1)} className="inline-flex h-10 items-center gap-1.5 rounded-[3px] border border-line bg-ivory px-3 text-[12.5px] text-forest hover:bg-forest/5 disabled:opacity-35"><ArrowUp className="h-3.5 w-3.5" aria-hidden /> Earlier</button>
                              <button type="button" disabled={editing.stopIndex(d.overnightId) === editing.stopCount - 1} onClick={() => editing.onMoveStop(editing.stopIndex(d.overnightId!), 1)} className="inline-flex h-10 items-center gap-1.5 rounded-[3px] border border-line bg-ivory px-3 text-[12.5px] text-forest hover:bg-forest/5 disabled:opacity-35"><ArrowDown className="h-3.5 w-3.5" aria-hidden /> Later</button>
                              <button type="button" disabled={editing.stopCount < 2} onClick={() => { editing.onRemoveStop(d.overnightId!); setEditDay(null); }} className="inline-flex h-10 items-center gap-1.5 rounded-[3px] border border-burgundy/40 bg-ivory px-3 text-[12.5px] text-burgundy hover:bg-burgundy hover:text-ivory disabled:opacity-35"><X className="h-3.5 w-3.5" aria-hidden /> Remove stay</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
      {hidden > 0 && <p className="mt-2 text-[13px] text-muted">…and {hidden} more {hidden === 1 ? "day" : "days"} in the full itinerary.</p>}

      {editing && (
        <Sheet open={!!addFor} onOpenChange={(o) => !o && setAddFor(null)} title="Add an experience" description={addFor?.overnightId ? `Day ${addFor.day} · ${destName(addFor.overnightId)}` : undefined} side="right" className="!w-[min(96vw,480px)]">
          {addFor?.overnightId && (
            <ul className="divide-y divide-line">
              {editing.activityChoices(addFor.overnightId).length === 0 && <li className="p-6 text-sm text-muted">Everything available here is already in your journey.</li>}
              {editing.activityChoices(addFor.overnightId).map((a) => (
                <li key={a.id} className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 p-4">
                  <div className="relative aspect-square overflow-hidden rounded-[3px] bg-forest"><Photo k={a.image} sizes="96px" /></div>
                  <div className="min-w-0">
                    <p className="font-display text-[1.25rem] leading-tight">{a.name}</p>
                    <p className="mt-0.5 text-[12.5px] text-muted">{a.duration} · <span className="capitalize">{a.difficulty}</span> · {formatINR(a.price)}{a.priceUnit === "person" ? " pp" : " / group"}</p>
                    <button type="button" onClick={() => { editing.onAddActivity(a.id, addFor.stayDay); notify(`${a.name} added to day ${addFor.day}`); setAddFor(null); }} className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-[3px] border border-forest px-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-forest hover:bg-forest hover:text-ivory">
                      <Plus className="h-3.5 w-3.5" aria-hidden /> Add to day {addFor.day}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Sheet>
      )}
    </>
  );
}
