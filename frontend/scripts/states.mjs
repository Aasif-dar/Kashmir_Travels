// Screenshots of interactive states that a plain page load never shows: navigation overlays, dialogs, sheets, 404.
// Usage: node scripts/states.mjs <baseUrl> <outDir>
import { chromium } from "playwright-core";
import fs from "node:fs";

const [base, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });

async function withPage(w, h, fn) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  try { await fn(page); } finally { await ctx.close(); }
}
const snap = (page, name) => page.screenshot({ path: `${outDir}/${name}.png` });

// Desktop overlays
await withPage(1440, 900, async (p) => {
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  await p.getByRole("button", { name: /search/i }).first().click();
  await p.waitForTimeout(500);
  await snap(p, "d-search-dialog");
  await p.keyboard.type("gulm");
  await p.waitForTimeout(500);
  await snap(p, "d-search-typed");
  await p.keyboard.press("Escape");

  await p.goto(base + "/my-trip", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await snap(p, "d-my-trip-lookup");
  await p.getByRole("textbox").first().fill("KT-2026-0000");
  await p.keyboard.press("Enter");
  await p.waitForTimeout(1200);
  await snap(p, "d-my-trip-notfound");

  await p.goto(base + "/no-such-page", { waitUntil: "networkidle" });
  await snap(p, "d-404");
});

// Planner interactions: edit-day panel and the add-activity sheet
await withPage(1440, 900, async (p) => {
  await p.goto(base + "/packages/kashmir-essentials", { waitUntil: "networkidle" });
  await p.getByRole("button", { name: /Customize this package/i }).first().click();
  await p.waitForURL(/plan-your-trip/);
  await p.locator("#step-3-title").waitFor();
  await p.waitForTimeout(800);
  await p.getByRole("button", { name: "Edit day" }).nth(2).click();
  await p.waitForTimeout(500);
  await snap(p, "d-planner-edit-day");
  await p.getByRole("button", { name: "Add activity" }).nth(2).click();
  await p.waitForTimeout(700);
  await snap(p, "d-planner-add-activity");
  await p.keyboard.press("Escape");
  await p.locator("button", { hasText: /^Continue/ }).first().click();
  await p.locator("#step-4-title").waitFor();
  await p.waitForTimeout(600);
  await snap(p, "d-planner-stay");
  await p.getByRole("button", { name: /^Continue/ }).first().click();
  await p.locator("#step-5-title").waitFor();
  await p.waitForTimeout(600);
  await snap(p, "d-planner-vehicle");
});

// Phone: menu, planner summary sheet, sticky bars
await withPage(390, 844, async (p) => {
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  await p.getByRole("button", { name: /menu/i }).first().click();
  await p.waitForTimeout(600);
  await snap(p, "m-menu");
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
  await p.evaluate(() => window.scrollTo(0, 1500));
  await p.waitForTimeout(700);
  await snap(p, "m-sticky-cta");

  await p.goto(base + "/packages/kashmir-essentials", { waitUntil: "networkidle" });
  await p.getByRole("button", { name: /Customize this package/i }).first().click();
  await p.waitForURL(/plan-your-trip/);
  await p.locator("#step-3-title").waitFor();
  await p.waitForTimeout(900);
  await snap(p, "m-planner-itinerary");
  await p.getByRole("button", { name: "Open your journey summary" }).click();
  await p.waitForTimeout(700);
  await snap(p, "m-planner-summary");
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
  await p.getByRole("button", { name: "Edit day" }).nth(2).click();
  await p.waitForTimeout(500);
  await snap(p, "m-planner-edit-day");
});

// Tablet
await withPage(768, 1024, async (p) => {
  for (const [route, name] of [["/", "t-home"], ["/destinations/gulmarg", "t-destination"], ["/packages", "t-packages"], ["/plan-your-trip", "t-planner"]]) {
    await p.goto(base + route, { waitUntil: "networkidle" });
    await p.waitForTimeout(700);
    await snap(p, name);
  }
});

await browser.close();
console.log("done");
