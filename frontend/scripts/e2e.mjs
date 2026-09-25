// End-to-end smoke test of the whole journey against a running server. Usage: node scripts/e2e.mjs [baseUrl] [shotDir]
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3112";
const shots = process.argv[3];
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const problems = [];
page.on("console", (m) => ["error", "warning"].includes(m.type()) && problems.push(`[console.${m.type()}] ${m.text().slice(0, 300)}`));
page.on("pageerror", (e) => problems.push("[pageerror] " + e.message.slice(0, 300)));
page.on("requestfailed", (r) => !r.url().includes("_rsc") && problems.push("[requestfailed] " + r.url().slice(0, 140)));
page.on("response", (r) => r.status() >= 400 && problems.push(`[http ${r.status()}] ${r.url().slice(0, 140)}`));
let n = 0;
const ok = (c, msg) => { console.log((c ? "PASS " : "FAIL ") + msg); if (!c) process.exitCode = 1; };
const shot = async (name) => shots && page.screenshot({ path: `${shots}/${String(++n).padStart(2, "0")}-${name}.png`, fullPage: false });
const price = async () => { await page.waitForTimeout(900); return Number((await page.locator("aside[aria-label='Trip summary'] .font-display.text-\\[2\\.1rem\\]").first().innerText()).replace(/[^\d]/g, "")); };

await page.goto(base + "/plan-your-trip", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });

// Step 1
await page.getByRole("radio", { name: /^5\s*days/i }).click();
await page.getByRole("radio", { name: /^Couple Scenic/ }).click();
ok((await page.locator("aside[aria-label='Trip summary']").innerText()).includes("5 days / 4 nights"), "duration 5 days reflected in summary");
await shot("step1");
await page.getByRole("button", { name: "Continue" }).first().click();

// Step 2 destinations
await page.getByRole("heading", { name: /Where would you like to go/ }).waitFor();
for (const d of ["Srinagar", "Gulmarg", "Pahalgam"]) await page.getByRole("button", { name: `Add ${d} to your trip` }).first().click();
ok(await page.getByRole("button", { name: "Remove Pahalgam from your trip" }).first().isVisible(), "3 destinations added for 5 days");
const leh = page.getByRole("button", { name: "Add Leh to your trip" }).first();
ok(await leh.isDisabled(), "Leh blocked as unrealistic for 5 days (validation engine)");
await shot("step2");
await page.getByRole("button", { name: "Continue" }).first().click();

// Step 3 itinerary
await page.getByRole("heading", { name: /Shape your itinerary/ }).waitFor();
ok((await page.getByRole("heading", { name: /Day/ }).count()) >= 0 && (await page.locator("ol > li h3").count()) >= 5, "5 itinerary days rendered");
await page.getByRole("button", { name: "Add a note to this day" }).first().click();
await page.locator("textarea[id^='note-']").first().fill("Anniversary trip");
await page.locator("textarea[id^='note-']").first().blur();
ok(await page.getByText("Anniversary trip").first().isVisible(), "day note saved");
await page.getByRole("button", { name: /Move Pahalgam later/ }).click();
await shot("step3");
await page.getByRole("button", { name: "Continue" }).first().click();

// Step 4 hotels
await page.getByRole("heading", { name: /Choose your stays/ }).waitFor();
const before = await price();
await page.getByRole("button", { name: /Select Aru Pine Retreat/ }).click();
const after = await price();
ok(after > before, `hotel change updates price (${before} -> ${after})`);
await shot("step4");
await page.getByRole("button", { name: "Continue" }).first().click();

// Step 5 vehicle
await page.getByRole("heading", { name: /Choose your vehicle/ }).waitFor();
const vb = await price();
await page.getByRole("button", { name: /Select Sedan/ }).click();
const va = await price();
ok(va !== vb, `vehicle change updates price (${vb} -> ${va})`);
await shot("step5");
await page.getByRole("button", { name: "Continue" }).first().click();

// Step 6 activities
await page.getByRole("heading", { name: /Add experiences/ }).waitFor();
const ab = await price();
await page.getByRole("button", { name: /Add Activity/ }).first().click();
ok(await page.getByRole("button", { name: /Added/ }).first().isVisible(), "activity shows ✓ Added");
ok((await price()) > ab, "activity updates total");
await shot("step6");
await page.getByRole("button", { name: "Continue" }).first().click();

// Step 7 review
await page.getByRole("heading", { name: /Review your journey/ }).waitFor();
await shot("step7");
await page.getByRole("link", { name: /Continue to booking request/ }).click();

// Booking
await page.getByRole("heading", { name: "Trip summary" }).waitFor();
await page.getByRole("button", { name: /Continue to traveller details/ }).click();
await page.getByRole("button", { name: /Review your request/ }).click();
ok(await page.getByText("Please enter your full name").isVisible(), "form validation shows errors");
await page.getByLabel(/Full name/).fill("Test Traveller");
await page.getByLabel(/^Email/).fill("test@example.com");
await page.getByLabel(/Phone/).fill("+91 98100 12345");
const d = new Date(); d.setDate(d.getDate() + 40);
await page.getByLabel(/Travel date/).fill(d.toISOString().slice(0, 10));
await shot("booking-details");
await page.getByRole("button", { name: /Review your request/ }).click();
await page.getByRole("heading", { name: "Review & request" }).waitFor();
await page.getByRole("button", { name: /Request Booking/ }).click();
ok(await page.getByText("Please agree to the booking terms").isVisible(), "terms must be accepted");
await page.getByLabel(/I agree to the/).check();
await page.getByRole("button", { name: /Request Booking/ }).click();
await page.waitForURL(/\/book\/confirmation\/KT-\d{4}-\d{4}/);
const ref = (await page.getByTestId("booking-ref").innerText()).trim();
ok(/^KT-\d{4}-\d{4}$/.test(ref), "booking reference " + ref);
ok(await page.getByText("Your Kashmir journey is taking shape.").isVisible(), "confirmation headline");
ok(await page.getByText("Inquiry Received").first().isVisible(), "status Inquiry Received");
await shot("confirmation");

// My trip + print
await page.getByRole("link", { name: /View My Trip/ }).click();
await page.getByRole("heading", { name: /Your itinerary/ }).waitFor();
ok(await page.getByText("Anniversary trip").first().isVisible(), "my-trip shows the day note");
await shot("my-trip");
await page.goto(`${base}/my-trip/${ref}/print`, { waitUntil: "networkidle" });
ok(await page.getByText("Day-by-day itinerary").isVisible(), "printable itinerary renders");
await shot("print");
await page.pdf({ path: shots ? `${shots}/itinerary.pdf` : "itinerary.pdf", format: "A4", printBackground: true });

// Admin
await page.goto(base + "/admin", { waitUntil: "networkidle" });
ok(page.url().endsWith("/admin/login"), "admin redirects to login when signed out");
await page.getByLabel("Email").fill("admin@zabarwan.demo");
await page.getByLabel("Password").fill("kashmir-demo");
await page.getByRole("button", { name: "Sign in" }).click();
await page.getByRole("heading", { name: "Dashboard" }).waitFor();
await shot("admin-dashboard");
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

// WhatsApp link
await page.goto(base + "/contact", { waitUntil: "networkidle" });
const wa = await page.getByRole("link", { name: "Open WhatsApp" }).getAttribute("href");
ok(/^https:\/\/wa\.me\/\d+\?text=/.test(wa ?? ""), "WhatsApp link pre-filled");

console.log(problems.length ? "PROBLEMS:\n" + [...new Set(problems)].join("\n") : "no console/network problems");
await browser.close();
