// axe (WCAG 2 A/AA) on every *state* of the journey, not just page loads: each planner step, the timeline editor,
// the sheets and dialogs, the three booking steps, confirmation, My Trip and the printable itinerary.
// Usage: node scripts/a11y-flow.mjs [baseUrl] [width]
import { chromium } from "playwright-core";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3112";
const width = Number(process.argv[3] ?? 1280);
const axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 } });
const page = await ctx.newPage();
let failures = 0;

async function scan(label) {
  await page.waitForTimeout(700);
  await page.evaluate(axe);
  const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] })).violations.map((x) => ({ id: x.id, impact: x.impact, n: x.nodes.length, ex: x.nodes[0].target.join(" ").slice(0, 100) })));
  if (v.length) failures++;
  console.log(`${label.padEnd(34)} ${v.length ? JSON.stringify(v) : "OK"}`);
}
const next = () => page.getByRole("button", { name: /^Continue/ }).first().click();

await page.goto(base + "/plan-your-trip", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.removeItem("zj.trip.v1"));
await page.reload({ waitUntil: "networkidle" });

await scan("planner 01 duration");
await page.getByRole("radio", { name: /^5\s*days/i }).click();
await next();
await page.locator("#step-1-title").waitFor();
for (const d of ["Srinagar", "Gulmarg", "Pahalgam"]) await page.getByRole("button", { name: `Add ${d} to your journey` }).first().click();
await scan("planner 02 destinations");
await next();
await page.locator("#step-2-title").waitFor();
await page.getByRole("radio", { name: /^Couple/ }).click();
await scan("planner 03 style");
await next();
await page.locator("#step-3-title").waitFor();
await scan("planner 04 itinerary");
await page.getByRole("button", { name: "Edit day" }).nth(1).click();
await scan("planner 04 edit-day panel");
await page.getByRole("button", { name: "Add activity" }).first().click();
await scan("planner 04 add-activity sheet");
await page.keyboard.press("Escape");
await next();
await page.locator("#step-4-title").waitFor();
await scan("planner 05 stay");
await next();
await page.locator("#step-5-title").waitFor();
await scan("planner 06 vehicle");
await next();
await page.locator("#step-6-title").waitFor();
await page.locator("button[aria-pressed='false']", { hasText: "Add activity" }).first().click();
await scan("planner 07 experiences");
await next();
await page.locator("#step-7-title").waitFor();
await scan("planner 08 review");
if (width < 1024) {
  await page.getByRole("button", { name: "Open your journey summary" }).click();
  await scan("planner summary sheet (mobile)");
  await page.keyboard.press("Escape");
}
await page.getByRole("link", { name: /Request this journey/ }).click();

await page.getByRole("button", { name: /^Continue/ }).first().waitFor();
await scan("booking 01 journey");
await page.getByRole("button", { name: /^Continue/ }).first().click();
await page.getByRole("button", { name: /^Review/ }).first().click();
await scan("booking 02 details (errors shown)");
await page.getByLabel(/Full name/).fill("Test Traveller");
await page.getByLabel(/^Email/).fill("test@example.com");
await page.getByLabel(/Phone/).fill("+91 98100 12345");
const d = new Date(); d.setDate(d.getDate() + 40);
await page.getByLabel(/Travel date/).fill(d.toISOString().slice(0, 10));
const pickup = page.getByLabel(/Pickup location/);
if (!(await pickup.inputValue())) await pickup.fill("Srinagar airport");
await page.getByRole("button", { name: /^Review/ }).first().click();
await page.getByRole("heading", { name: "Confirm and request" }).waitFor();
await scan("booking 03 confirm");
await page.getByRole("button", { name: "booking terms" }).click();
await scan("booking terms sheet");
await page.getByRole("button", { name: "I agree" }).click();
await page.getByRole("button", { name: /^Request/ }).click();
await page.waitForURL(/\/book\/confirmation\/KT-/);
await scan("confirmation");
const ref = (await page.getByTestId("booking-ref").innerText()).trim();
await page.goto(`${base}/my-trip/${ref}`, { waitUntil: "networkidle" });
await scan("my trip");
await page.goto(`${base}/my-trip/${ref}/print`, { waitUntil: "networkidle" });
await scan("printable itinerary");

await page.goto(base + "/", { waitUntil: "networkidle" });
if (width >= 1280) {
  await page.getByRole("button", { name: /search/i }).first().click();
  await scan("search dialog");
  await page.keyboard.press("Escape");
} else {
  await page.getByRole("button", { name: /menu/i }).first().click();
  await scan("mobile menu");
  await page.keyboard.press("Escape");
}
const qp = page.getByRole("form", { name: "Plan your escape" }).first();
await qp.getByRole("radio", { name: "Ladakh" }).click();
await scan("home planner (region chosen)");

console.log(failures ? `\n${failures} state(s) with violations` : "\nall states clean");
await browser.close();
process.exitCode = failures ? 1 : 0;
