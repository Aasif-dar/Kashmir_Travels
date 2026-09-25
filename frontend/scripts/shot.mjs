// Usage: node scripts/shot.mjs <url> <out.png> [width=1440] [height=900] [fullPage=1] [scrollY]
import { chromium } from "playwright-core";
const [url, out, w = "1440", h = "900", full = "1", scrollY = "0"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const logs = [];
page.on("console", (m) => ["error", "warning"].includes(m.type()) && logs.push(`[${m.type()}] ${m.text().slice(0, 300)}`));
page.on("pageerror", (e) => logs.push("[pageerror] " + e.message.slice(0, 300)));
page.on("requestfailed", (r) => logs.push("[reqfail] " + r.url().slice(0, 120)));
await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(800);
if (+scrollY) { await page.evaluate((y) => window.scrollTo(0, y), +scrollY); await page.waitForTimeout(800); }
if (full === "1") {
  // trigger lazy/reveal content
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 600) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
}
await page.screenshot({ path: out, fullPage: full === "1" });
console.log(logs.join("\n") || "no console errors");
await browser.close();
