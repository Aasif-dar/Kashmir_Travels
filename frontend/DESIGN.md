# Zabarwan Journeys — design system

The customer-facing site is editorial, hospitality-led and photography-first. It should feel like a small,
well-run travel house in Srinagar — not a booking engine. This file is the single reference for how it looks and
why. The tokens live in [`src/app/globals.css`](src/app/globals.css); components live in `src/components`.

> **Scope.** Everything here applies to the public site. The admin area (`/admin`) is intentionally out of scope and
> keeps its own look; shared primitives were only ever changed *additively* so admin renders exactly as before.

---

## 1. Principles

| Principle | In practice |
|---|---|
| **Photography carries the page** | Real Kashmir photographs, generous crops, one treatment (see §4). Text sits *beside* or *under* an image whenever it can, and on a scrim only when it must. |
| **Editorial, not "SaaS"** | A serif display face, hairline rules, numbered sections, asymmetric layouts. No card-grid-of-four, no glass, no gradients-for-decoration, no blobs, no icon-in-a-circle rows. |
| **Every section has its own shape** | Adjacent homepage sections never share a layout (see §6). |
| **Honest prices** | Every figure is an *estimate*; nothing is instant; availability is always confirmed by the team. The words say so, everywhere a price appears. |
| **Quiet interaction** | Motion is short and calm; microinteractions confirm ("Added", toasts) but never perform. |
| **Human copy** | Short, concrete sentences. See §7. |

---

## 2. Tokens

### Colour

| Token | Hex | Use |
|---|---|---|
| `forest` | `#1d3a2f` | Brand, primary buttons, dark bands, footer |
| `pine` | `#2e5443` | Hover/pressed for forest, positive data |
| `ivory` | `#f7f2e8` | Page background |
| `paper` | `#fbf8f1` | Raised surfaces (cards, panels, inputs) |
| `parchment` / `sand` / `stone` | `#efe6d3` / `#e4d8bf` / `#cfc6b4` | Quiet bands, dividers, disabled |
| `charcoal` / `ink` / `muted` | `#1e1f1c` / `#2b2c28` / `#6b6a60` | Headings / body / secondary text |
| `brass` | `#7a5a20` | Accent **for text and fills on light** (contrast-safe, 5.7:1 on ivory) |
| `brass-soft` | `#c7a86a` | Accent **on dark** backgrounds only |
| `burgundy` | `#7a2e3a` | Warnings, destructive actions, errors — never decoration |
| `line` / `line-strong` | 14 % / 28 % charcoal | Hairlines |

Use tokens (`bg-forest`, `text-muted`, `border-line`), not raw hex. One accent (brass). No additional hues.

### Type

* **Cormorant Garamond** (`font-display`) — headings, prices, day numbers, editorial pull-quotes. Lining figures.
* **Hanken Grotesk** (`font-sans`) — UI, body, data, labels.

| Class | Use | Size (clamp) |
|---|---|---|
| `.t-hero` | Homepage headline only (uppercase) | 40 → 100 px |
| `.t-h1` | Page titles | 37 → 64 px |
| `.t-h2` | Section titles | 30 → 46 px |
| `.t-h3` / `.t-h4` | Sub-sections | 23 → 30 px / 22 px |
| `.t-lede` | Intro paragraph under a title (max `62ch` via `.measure`) | 16 → 18 px |
| `.t-meta` | Captions, helper text | 13 px |
| `.t-label` | Small-caps data labels (`DAY`, `STAY`, `FROM`) | 11 px, +0.16 em |
| `.eyebrow` | Section kicker above a title, brass | 11 px, +0.22 em |
| `.t-price` | Prices (display face, tabular) | set per use |

Rules: one `h1` per page; titles are sentence case; all-caps is reserved for eyebrows, labels, the hero line and
button labels (`caps`). Reading text is 14 px or larger (13–13.5 px only for short captions and list metadata); helper text is never below 12 px; uppercase labels run 10–11 px with wide tracking.

### Space, shape, elevation

* Container: `.container-x` (max 1440 px; 20 / 32 / 48 / 64 px gutters).
* Section rhythm: `.section` (default), `.section-sm`, `.section-lg` — chosen deliberately, not uniformly.
* Radius: **3 px** everywhere (`2 px` for tiny badges). Hairline borders (`border-line`).
* One shadow: `.shadow-float`, for floating surfaces only (planner module, summary panel, dialogs).
* Tap targets ≥ 44 px on touch layouts; inline text links get a `min-h-9` hit area.

### Motion

Ease `--ease-calm`. Durations 200–500 ms. `Reveal` (scroll-in, once), `AnimatedNumber` (price changes), slow hero
zoom, toast slide. Everything respects `prefers-reduced-motion`. No parallax, no looping decoration.

---

## 3. Layout patterns

* **PageHeader** (`ui/section.tsx`) — eyebrow, `h1`, lede, and an optional photograph on the right (4:3). Used by
  every listing page; each page uses a *different* photograph, never one that also appears in the grid beneath it.
* **Numbered lists** — `01 Duration … 08 Review`, timeline days, journey lists. Numbers are display-face, brass.
* **Hairline tables** — comparisons and matrices use rules, not boxes. Colour is never the only signal (see §8).
* **Sticky summary** — planner and booking: 380 px panel on desktop, compact bottom bar + sheet on phones.

---

## 4. Photography

* All images come from `src/data/images.ts` (`img(key)`), rendered with `<Photo k="…" sizes="…" />` (`next/image`,
  `fill`, `object-cover`, per-image focal point). Licences and credits: `/credits`.
* **Treatment**: natural colour, no filters, `3 px` corners, no borders. Text over photographs uses one of:
  * `.scrim-hero` — hero only (uniform on phones, directional from 1024 px).
  * `.scrim-tile` — short captions (destination tiles, activity tiles).
  * `.scrim-caption` — tiles that carry a description as well.
  * `.img-scrim` / `.img-scrim-bottom` — page heroes and section images.
* **`sizes` must describe the image, not the box.** A portrait tile cropped from a landscape photograph shows only a
  fraction of it, so the rendered image is wider than the tile — use `140vw` on phones, not `100vw`.
* Never repeat the same photograph within one viewport-height. Images that are purely decorative pass `alt=""`.

---

## 5. Components

| Component | File | Notes |
|---|---|---|
| Button / ButtonLink | `ui/button.tsx` | Variants `primary · outline · ghost · gold · light · onDark …`; `caps` = uppercase label for *every* call to action in a group (primary and secondary alike) |
| TextLink | `ui/button.tsx` | Editorial small-caps link with arrow: `VIEW JOURNEY →` |
| Photo, HScroller, Reveal | `ui/` | HScroller is keyboard-focusable and labelled |
| Toast | `ui/toast.tsx` | Confirms "added / removed" actions; polite live region |
| Sheet | `ui/sheet.tsx` | Radix dialog: right drawer, bottom sheet or centred |
| Empty / Error / Loading | `ui/states.tsx` | Full-page loaders reserve `100svh` so the footer never jumps |
| DestinationCard | `destinations/destination-card.tsx` | `lg / md / sm`; caption grows with size |
| PackageRow / PackageCard | `packages/package-row.tsx` | A *journey*: name, days · nights, route, includes, `FROM ₹`, `VIEW JOURNEY →`, `CUSTOMIZE` |
| VehicleCard | `vehicles/vehicle-card.tsx` | Container-query spec grid (2 → 4 columns) |
| ItineraryTimeline | `itinerary/itinerary-timeline.tsx` | Vertical timeline used by package pages, planner, My Trip and print |
| PriceBreakdown | `trip-planner/price-breakdown.tsx` | `ESTIMATED TRIP VALUE` + Accommodation / Transport / Activities / Meals / Other + disclaimer |
| QuickPlanner | `hero/quick-planner.tsx` | "Plan your escape" — one question open at a time, live route and estimate |

### Buttons and calls to action

* One primary action per view (`BUILD MY JOURNEY`, `REQUEST THIS JOURNEY`, `CONTINUE`).
* Selected states always carry a **word or glyph** ("✓ Added", "Selected"), never colour alone.
* Destructive actions use burgundy and always name the thing ("Remove Pahalgam from your journey").

---

## 6. Homepage rhythm

Each section is a different composition so the page reads as a story rather than a stack of feature blocks:

| # | Section | Shape |
|---|---|---|
| 1 | Hero + Plan your escape | Full-bleed photograph, headline left, staged planner module right |
| 2 | Intro strip | One line of voice on the left, four plain facts on hairline rules on the right |
| 3 | Explore Kashmir · Jammu · Ladakh | Asymmetric mosaic: one large, two medium, small tiles |
| 4 | Popular journeys | Table of contents left, photograph + details right |
| 5 | Build your own | Steps on the left, a *real* itinerary slice rendered by the planner's own engine on the right |
| 6 | Signature experiences | Dark band, horizontal portrait slider |
| 7 | Handpicked stays | Three staggered photographs, captions beneath |
| 8 | Choose your ride | Photograph + rate list |
| 9 | Seasonal guide | Month strip, season tabs, photograph + suggestions |
| 10 | Why travel with us · Stories | Photograph + numbered points · single large quotation |
| 11 | FAQ · Final CTA | Accordion · full-width photograph with one line and two buttons |

---

## 7. Voice

Short, concrete, human. Prefer the phrase a local guide would use.

| Avoid | Prefer |
|---|---|
| "Discover the magic of Kashmir" | "Choose the places you want to see. We'll shape the route." |
| "Unforgettable experiences" | "Moments worth building a trip around" |
| "Seamless, curated, bespoke" | "Built around the way you travel." |
| "Book now!" | "Request this journey" (nothing is instant, nothing is charged) |
| "Best price guaranteed" | "Prices shown are estimates and will be confirmed by our travel team." |

Numbers are written as people say them (`5 days · 4 nights`, `≈ 145 km · 5h 30m`).

---

## 8. Accessibility

* Contrast: body text ≥ 4.5 : 1; large display text ≥ 3 : 1; brass text only in the contrast-safe shade.
* Focus: 2 px outline, 3 px offset, on every interactive element — dark brass on light surfaces, soft brass on dark ones (`.band-forest`, `.band-charcoal`, `.on-dark`; use `.on-light` for a light panel sitting on a dark section). Skip link in the site layout.
* Keyboard: all carousels, dialogs, sheets, tabs, accordions and the planner are fully operable; focus moves to the
  step heading when the planner step changes.
* Non-colour cues: month grid uses `✓ / ×` glyphs plus a legend; selected states use words; errors carry text.
* Horizontally scrolling regions are focusable, labelled `role="region"`, and keep their first column sticky.
* Forms: visible labels, inline errors with `role="alert"`, hints wired with `aria-describedby`.
* Motion respects `prefers-reduced-motion`. Toasts and price changes use polite live regions.
* Automated: `node scripts/a11y.mjs <url> <width>` (axe, WCAG 2 A/AA) — clean on every public route at 1280 and 390.

---

## 9. Performance

* Server components by default; client components only where state or events are needed.
* `next/image` everywhere with accurate `sizes`; only above-the-fold hero images are `priority`.
* Fonts via `next/font` (swap). No icon or animation libraries beyond `lucide-react` and `framer-motion`.
* Layout stability: full-page loaders reserve a screen; images sit in aspect-ratio boxes; worst measured CLS across
  every public route and width is below 0.1.

---

## 10. Checks

| Script | What it does |
|---|---|
| `npm run lint` | `tsc --noEmit` |
| `node scripts/e2e.mjs <url> [shots]` | Whole customer journey (all eight planner steps → request → confirmation → My Trip → print), the homepage / package / destination entry points, and an admin regression |
| `node scripts/a11y.mjs <url> [width]` | axe on every public route |
| `node scripts/widths.mjs <url> [w1,w2,…]` | Every public route at 375 → 1600 px: overflow, broken images, unnamed controls, console/network errors, CLS |
| `node scripts/audit.mjs <url> <width> <outDir> [routes]` | Full-page screenshots for visual review |
| `node scripts/states.mjs <url> <outDir>` | Screenshots of dialogs, sheets, menus and 404 |
| `node scripts/fold.mjs`, `scripts/montage.mjs` | First-screen captures and side-by-side mobile montages |
