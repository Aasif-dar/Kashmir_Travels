// End-to-end test of the customer journey (and a light admin regression) against a running server.
// Usage: node scripts/e2e.mjs [baseUrl] [shotDir]
//
// Flows covered
//   A  Build My Trip: Duration → Destinations → Style → Itinerary → Stay → Vehicle → Experiences → Review → Booking → Confirmation → My Trip → Print
//   B  Homepage "Plan your escape" → planner (itinerary step)
//   C  Package → Customize → planner
//   D  Destination → Plan this destination → planner
//   E  Admin regression (sign-in, booking status, hotel CRUD) and the WhatsApp link
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3111";
const shots = process.argv[3];
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const problems = [];
page.on("console", (m) => ["error", "warning"].includes(m.type()) && problems.push(`[console.${m.type()}] ${m.text().slice(0, 300)}${m.type() === "error" ? " @ " + m.location().url.slice(0, 120) : ""} (on ${page.url().replace(base, "")})`));
page.on("pageerror", (e) => problems.push("[pageerror] " + e.message.slice(0, 300)));
page.on("requestfailed", (r) => !r.url().includes("_rsc") && problems.push("[requestfailed] " + r.url().slice(0, 140)));
page.on("response", (r) => r.status() >= 400 && problems.push(`[http ${r.status()}] ${r.url().slice(0, 140)}`));
let n = 0;
let passed = 0;
let failed = 0;
const ok = (c, msg) => {
  console.log((c ? "PASS " : "FAIL ") + msg);
  if (c) passed++;
  else { failed++; process.exitCode = 1; }
};
// Full-page shots first scroll the page end to end so scroll-triggered reveals have played (otherwise they'd be captured at opacity 0).
const shot = async (name, full = false) => {
  if (!shots) return;
  if (full) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(80); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: `${shots}/${String(++n).padStart(2, "0")}-${name}.png`, fullPage: full });
};
const price = async () => {
  await page.waitForTimeout(900);
  return Number((await page.locator("aside[aria-label='Your journey'] .t-price").first().innerText()).replace(/[^\d]/g, ""));
};
const stepTitle = (i) => page.locator(`#step-${i}-title`);
const next = () => page.getByRole("button", { name: /^Continue/ }).first().click();
// Reset only the saved trip — bookings live in localStorage too and are needed by the admin checks at the end.
const fresh = async () => { await page.goto(base + "/plan-your-trip", { waitUntil: "networkidle" }); await page.evaluate(() => localStorage.removeItem("zj.trip.v1")); };

/* ------------------------------------------------------------------ */
/* A. Build My Trip — all eight steps                                  */
/* ------------------------------------------------------------------ */
await fresh();
await page.reload({ waitUntil: "networkidle" });
ok(await stepTitle(0).isVisible(), "planner opens on 01 Duration");
ok((await page.locator("nav[aria-label='Trip planner progress'] li:visible").count()) === 8, "stepper shows 8 numbered steps");

// 01 Duration
await page.getByRole("radio", { name: /^5\s*days/i }).click();
ok((await page.locator("aside[aria-label='Your journey']").innerText()).includes("5 days · 4 nights"), "duration 5 days reflected in the sticky summary");
await shot("01-duration");
await next();

// 02 Destinations
await stepTitle(1).waitFor();
for (const d of ["Srinagar", "Gulmarg", "Pahalgam"]) await page.getByRole("button", { name: `Add ${d} to your journey` }).first().click();
ok(await page.getByRole("button", { name: "Remove Pahalgam from your journey" }).first().isVisible(), "3 destinations added — button flips to ✓ Added");
ok((await page.getByText(/Added · \d+N/).count()) >= 3, "selected state is explained in text, not colour alone");
ok(await page.getByRole("button", { name: "Add Leh to your journey" }).first().isDisabled(), "Leh blocked as unrealistic for 5 days (validation engine)");
ok(await page.getByText("Pahalgam added to your journey").first().isVisible(), "toast confirms the addition");
await shot("02-destinations");
await next();

// 03 Style
await stepTitle(2).waitFor();
await page.getByRole("radio", { name: /^Couple Scenic/ }).click();
ok((await page.locator("aside[aria-label='Your journey']").innerText()).includes("Couple"), "travel style reflected in the summary");
await shot("03-style");
await next();

// 04 Itinerary
await stepTitle(3).waitFor();
ok((await page.locator("ol > li h3").count()) >= 5, "5 itinerary days rendered on the timeline");
ok((await page.getByText("Day", { exact: true }).count()) >= 5, "timeline labelled DAY 01…05");
ok((await page.getByText(/≈ \d+ km/).count()) > 0, "transfers show distance (km) and time");
await page.getByRole("button", { name: "Edit day" }).first().click();
await page.locator("textarea[id^='note-']").first().fill("Anniversary trip");
await page.locator("textarea[id^='note-']").first().blur();
await page.getByRole("button", { name: "Edit day" }).first().click();
ok(await page.getByText("Anniversary trip").first().isVisible(), "day note saved and shown");
await page.getByRole("button", { name: "Add activity" }).first().click();
ok(await page.getByRole("dialog", { name: /Add an experience/ }).isVisible(), "Add activity opens the experience sheet");
await page.keyboard.press("Escape");
await page.getByRole("button", { name: /Move Pahalgam later/ }).click();
await shot("04-itinerary");
await next();

// 05 Stay
await stepTitle(4).waitFor();
ok(await page.getByRole("heading", { name: /Handpicked stays/ }).first().isVisible(), "Handpicked stays step");
const before = await price();
await page.getByRole("button", { name: /Select Aru Pine Retreat/ }).click();
const after = await price();
ok(after > before, `hotel change updates the estimate (${before} → ${after})`);
await shot("05-stay");
await next();

// 06 Vehicle
await stepTitle(5).waitFor();
const vb = await price();
await page.getByRole("button", { name: /Select Sedan/ }).click();
const va = await price();
ok(va !== vb, `vehicle change updates the estimate (${vb} → ${va})`);
await shot("06-vehicle");
await next();

// 07 Experiences
await stepTitle(6).waitFor();
const ab = await price();
await page.locator("button[aria-pressed='false']", { hasText: "Add activity" }).first().click();
ok((await page.locator("button[aria-pressed='true']", { hasText: "Added" }).count()) > 0, "activity shows ✓ Added");
ok((await price()) > ab, "activity updates the total");
await shot("07-experiences");
await next();

// 08 Review
await stepTitle(7).waitFor();
ok(await page.getByText("Estimated trip value").first().isVisible(), "review shows ESTIMATED TRIP VALUE");
ok(await page.getByText(/Prices shown are estimates and will be confirmed/).first().isVisible(), "estimate disclaimer present");
for (const line of ["Accommodation", "Transport", "Activities", "Meals", "Other"]) ok((await page.getByText(line, { exact: true }).count()) > 0, `price line: ${line}`);
await shot("08-review");
await page.getByRole("link", { name: /Request this journey/ }).click();

// Booking
await page.getByRole("button", { name: /^Continue/ }).first().waitFor();
await page.getByRole("button", { name: /^Continue/ }).first().click();
await page.getByRole("button", { name: /Review your request/ }).click();
ok(await page.getByText("Please enter your full name").isVisible(), "form validation shows inline errors");
await page.getByLabel(/Full name/).fill("Test Traveller");
await page.getByLabel(/^Email/).fill("test@example.com");
await page.getByLabel(/Phone/).fill("+91 98100 12345");
const d = new Date(); d.setDate(d.getDate() + 40);
await page.getByLabel(/Travel date/).fill(d.toISOString().slice(0, 10));
const pickup = page.getByLabel(/Pickup location/);
if (!(await pickup.inputValue())) await pickup.fill("Srinagar airport");
await shot("09-booking-details");
await page.getByRole("button", { name: /Review your request/ }).click();
await page.getByRole("heading", { name: "Confirm and request" }).waitFor();
await page.getByRole("button", { name: /Request this journey/ }).click();
ok(await page.getByText("Please agree to the booking terms").isVisible(), "terms must be accepted");
await page.getByLabel(/I agree to the/).check();
await page.getByRole("button", { name: /Request this journey/ }).click();
await page.waitForURL(/\/book\/confirmation\/KT-\d{4}-\d{4}/);
const ref = (await page.getByTestId("booking-ref").innerText()).trim();
ok(/^KT-\d{4}-\d{4}$/.test(ref), "booking reference " + ref);
ok(await page.getByText("Your Kashmir journey is taking shape.").isVisible(), "confirmation headline");
ok(await page.getByText("Request received").first().isVisible(), "REQUEST RECEIVED eyebrow");
ok(await page.getByText("Inquiry Received").first().isVisible(), "status Inquiry Received");
ok(await page.getByRole("link", { name: /WhatsApp us/i }).first().isVisible() && await page.getByRole("link", { name: /View my trip/i }).first().isVisible() && await page.getByRole("link", { name: /Print itinerary/i }).first().isVisible(), "confirmation actions: WhatsApp / View my trip / Print itinerary");
await shot("10-confirmation", true);

// My trip + print
await page.getByRole("link", { name: /View my trip/i }).first().click();
await page.getByRole("heading", { name: /Your itinerary/ }).waitFor();
ok(await page.getByText("Anniversary trip").first().isVisible(), "my-trip shows the day note");
await shot("11-my-trip", true);
await page.goto(`${base}/my-trip/${ref}/print`, { waitUntil: "networkidle" });
ok(await page.getByText("Day-by-day itinerary").isVisible(), "printable itinerary renders");
await shot("12-print", true);
// Same page under print media at A4 width: navigation, buttons and backgrounds must disappear.
await page.emulateMedia({ media: "print" });
await page.setViewportSize({ width: 794, height: 1123 });
await shot("12b-print-media", true);
ok((await page.locator("header.fixed, nav[aria-label=Primary]").evaluateAll((els) => els.filter((e) => getComputedStyle(e).display !== "none" && e.getBoundingClientRect().height > 0).length)) === 0 && (await page.locator(".no-print").evaluateAll((els) => els.every((e) => getComputedStyle(e).display === "none"))), "print media hides site navigation and on-screen controls");
await page.emulateMedia({ media: "screen" });
await page.setViewportSize({ width: 1440, height: 900 });
await page.pdf({ path: shots ? `${shots}/itinerary.pdf` : "itinerary.pdf", format: "A4", printBackground: true });

/* ------------------------------------------------------------------ */
/* B. Homepage → Plan your escape → planner                            */
/* ------------------------------------------------------------------ */
await fresh();
await page.goto(base + "/", { waitUntil: "networkidle" });
const qp = page.getByRole("form", { name: "Plan your escape" }).first();
ok(await qp.isVisible(), "homepage shows the PLAN YOUR ESCAPE module");
await qp.getByRole("radio", { name: "Kashmir" }).click();
await qp.getByRole("radio", { name: "5", exact: true }).click();
await qp.getByRole("radio", { name: "Couple" }).click();
ok(await qp.getByText(/from about/).isVisible(), "module shows a live route and estimate before you commit");
await shot("13-home-planner");
await qp.getByRole("button", { name: /Build my journey/ }).click();
await page.waitForURL(/\/plan-your-trip/);
await stepTitle(3).waitFor();
ok((await page.locator("aside[aria-label='Your journey']").innerText()).includes("5 days"), "B: planner opens on the itinerary with 5 days");
ok((await page.locator("aside[aria-label='Your journey']").innerText()).includes("Couple"), "B: travel style carried over");

/* ------------------------------------------------------------------ */
/* C. Package → Customize → planner                                    */
/* ------------------------------------------------------------------ */
await page.goto(base + "/packages", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Customize/ }).first().click();
await page.waitForURL(/\/plan-your-trip/);
await stepTitle(3).waitFor();
ok((await page.locator("ol > li h3").count()) >= 4, "C: customised package appears as an editable itinerary");
ok(/Srinagar/.test(await page.locator("aside[aria-label='Your journey']").innerText()), "C: package route preloaded");

/* ------------------------------------------------------------------ */
/* D. Destination → Plan this destination → planner                    */
/* ------------------------------------------------------------------ */
await fresh();
await page.goto(base + "/destinations/gulmarg", { waitUntil: "networkidle" });
await page.getByRole("link", { name: /Plan a journey with Gulmarg/ }).click();
await page.waitForURL(/\/plan-your-trip/);
await page.waitForTimeout(800);
ok(/Gulmarg/.test(await page.locator("aside[aria-label='Your journey']").innerText()), "D: Gulmarg pre-selected in the planner");

/* ------------------------------------------------------------------ */
/* E. Admin regression + WhatsApp                                      */
/* ------------------------------------------------------------------ */
await page.goto(base + "/admin", { waitUntil: "networkidle" });
ok(page.url().endsWith("/admin/login"), "admin redirects to login when signed out");
await page.getByLabel("Email").fill("admin@zabarwan.demo");
await page.getByLabel("Password").fill("kashmir-demo");
await page.getByRole("button", { name: "Sign in" }).click();
await page.getByRole("heading", { name: "Dashboard" }).waitFor();
await shot("14-admin-dashboard");
await page.goto(base + "/admin/bookings", { waitUntil: "networkidle" });
ok(await page.getByRole("cell", { name: ref, exact: true }).isVisible(), "new booking listed in admin");
await page.getByLabel(`Status for ${ref}`).selectOption("Confirmed");
await page.goto(`${base}/my-trip/${ref}`, { waitUntil: "networkidle" });
ok((await page.getByText("Confirmed").count()) > 0, "status change reflected on My Trip");
await page.goto(base + "/admin/hotels", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Add hotel/ }).click();
await page.getByLabel(/^Name/).fill("E2E Test Lodge");
await page.getByLabel(/Description/).fill("A lodge created by the test");
await page.getByRole("button", { name: "Save" }).click();
ok(await page.getByRole("cell", { name: "E2E Test Lodge", exact: true }).isVisible(), "admin CRUD: hotel created");
await page.getByRole("button", { name: "Delete E2E Test Lodge" }).click();
await page.getByRole("button", { name: "Delete", exact: true }).click();
ok((await page.getByRole("cell", { name: "E2E Test Lodge", exact: true }).count()) === 0, "admin CRUD: hotel deleted");

await page.goto(base + "/contact", { waitUntil: "networkidle" });
const wa = await page.getByRole("link", { name: "Open WhatsApp" }).getAttribute("href");
ok(/^https:\/\/wa\.me\/\d+\?text=/.test(wa ?? ""), "WhatsApp link pre-filled");

console.log(problems.length ? "PROBLEMS:\n" + [...new Set(problems)].join("\n") : "no console/network problems");
console.log(`\n${passed} passed, ${failed} failed`);
await browser.close();
