# Zabarwan Journeys — Kashmir tour & travel platform (demo)

Premium boutique travel site for Kashmir, Jammu/Katra and Ladakh built with **Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Zustand, React Hook Form + Zod**.
The Trip Planner is the core product: Duration → Destinations → Style → Itinerary → Stay → Vehicle → Experiences → Review → booking *request*.

The look and feel is documented in **[DESIGN.md](DESIGN.md)** (tokens, type, photography treatment, components, voice, accessibility).

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint         # type-check (tsc --noEmit)
```

Admin (demo, mock auth): `/admin` — `admin@zabarwan.demo` / `kashmir-demo`. Sample bookings are seeded on first load; try `/my-trip/KT-2026-1032`.

## Architecture

| Layer | Where | Notes |
|---|---|---|
| Types | `src/types` | destination, package, hotel, vehicle, activity, booking, trip |
| Static demo data | `src/data` | destinations, hotels (45), vehicles, activities, packages, **rules.ts** (tiers, road network, realism rules, styles, seasons, price multipliers) |
| Service layer | `src/services` | `getDestinations() getPackages() getHotels() getVehicles() getActivities() createBooking() getBooking()` … UI never imports `data/` directly. Replace bodies with `fetch()` to Express/Mongo/Postgres and nothing else changes. |
| Pure engines | `src/lib` | `itinerary-engine` (route, nights, day-by-day), `pricing`, `recommendations` (rule-based, no AI), `validation` (trip realism + zod schemas), `trip` (state transforms), `booking` |
| State | `src/store` | Zustand trip store (persisted), `CatalogProvider` (server catalogue → client; also layers demo admin edits) |
| UI | `src/components` | layout, hero, home, destinations, packages, itinerary, trip-planner, hotels, vehicles, activities, booking, admin, ui |

Key rules live in data, not components: e.g. Nubra/Pangong/Tso Moriri require ≥2 Leh nights first; Kashmir+Ladakh needs ≥9 days; every destination has min/recommended/max nights; road hours drive transport pricing and "long drive / packed" warnings.

## Honest by design
* No live APIs. Every price is labelled *estimated / demo*; hotels, vehicles and activities are *demo inventory*.
* Booking = **request → team review → confirmation**. Status: Inquiry Received → Under Review → Confirmed → Completed / Cancelled.
* Bookings, enquiries, admin edits are stored in browser `localStorage` (see `services/`). Admin auth is a **mock**.
* Contact details in `src/data/site.ts` are placeholders. Testimonials are marked as sample content.

## Images
All photos are real, openly licensed Wikimedia Commons images downloaded to `public/images` (see `/credits`, `src/data/image-credits.json`). Replace any image via the central registry `src/data/images.ts`. Scripts in `scripts/` (image search/download/optimise, e2e and a11y checks).

## Checks
```bash
npm run lint                                   # tsc --noEmit
npm run build && npm start -- -p 3112          # production build
node scripts/e2e.mjs http://localhost:3112     # whole journey: 8 planner steps → request → confirmation → My Trip → print, + entry points + admin regression
node scripts/a11y.mjs http://localhost:3112 390 # axe (WCAG 2 A/AA) on every public route at a given width
node scripts/widths.mjs http://localhost:3112  # every public route at 375…1600 px: overflow, broken images, console errors, CLS
```
Visual-review helpers (`audit`, `states`, `fold`, `montage`) are described in DESIGN.md §10. All scripts drive the installed Chrome through playwright-core.
