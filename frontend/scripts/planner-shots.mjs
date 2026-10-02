// Screenshots every planner step. Usage: node scripts/planner-shots.mjs <baseUrl> <width> <outDir> [package]
import { chromium } from "playwright-core";
import fs from "node:fs";
const [base, width, outDir, pkg = "kashmir-essentials"] = process.argv.slice(2);
const W = +width;
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: W, height: W < 600 ? 844 : 900 } });
const problems = [];
page.on("console", (m) => m.type() === "error" && problems.push(m.text().slice(0, 200)));
page.on("pageerror", (e) => problems.push("pageerror " + e.message.slice(0, 200)));
await page.goto(`${base}/plan-your-trip`, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.goto(`${base}/plan-your-trip?package=${pkg}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const names = ["1-duration", "2-destinations", "3-style", "4-itinerary", "5-stay", "6-vehicle", "7-experiences", "8-review"];
async function snap(i) {
  await page.waitForTimeout(700);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 600) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(80); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const over = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  await page.screenshot({ path: `${outDir}/${names[i]}-${W}.png`, fullPage: true });
  console.log(names[i], "h=" + total, over ? "OVERFLOW" : "ok");
}
// package deep link lands on the itinerary
await snap(3);
for (let i = 4; i < 8; i++) {
  await page.getByRole("button", { name: /^Continue/ }).first().click();
  await snap(i);
}
// back through the earlier steps via the stepper
for (const [i, label] of [[0, "Go to step 1"], [1, "Go to step 2"], [2, "Go to step 3"]]) {
  if (W < 768) await page.getByRole("button", { name: new RegExp(label) }).first().click();
  else await page.getByRole("navigation", { name: "Trip planner progress" }).getByRole("button", { name: new RegExp(["Duration", "Destinations", "Style"][i], "i") }).first().click();
  await snap(i);
}
console.log(problems.length ? "PROBLEMS " + problems.join(" | ") : "no console errors");
await browser.close();
