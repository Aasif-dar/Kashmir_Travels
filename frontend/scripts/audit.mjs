// Visual audit helper. Usage: node scripts/audit.mjs <baseUrl> <width> <outDir> [route ...]
// Captures full-page screenshots for each route and reports horizontal overflow, broken images and console errors.
import { chromium } from "playwright-core";
import fs from "node:fs";

const [base, width, outDir, ...routes] = process.argv.slice(2);
const W = Number(width);
const list = routes.length ? routes : ["/", "/destinations", "/destinations/gulmarg", "/packages", "/packages/kashmir-essentials", "/activities", "/hotels", "/vehicles", "/about", "/contact", "/travel-guide", "/my-trip"];
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: W, height: W < 600 ? 844 : 900 } });
const problems = [];
page.on("console", (m) => ["error"].includes(m.type()) && problems.push(`[console.error] ${m.text().slice(0, 200)}`));
page.on("pageerror", (e) => problems.push("[pageerror] " + e.message.slice(0, 200)));

for (const r of list) {
  problems.length = 0;
  await page.goto(base + r, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(700);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 500) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const over = [];
    document.querySelectorAll("body *").forEach((el) => {
      const rc = el.getBoundingClientRect();
      if (rc.width > 0 && (rc.right > vw + 1 || rc.left < -1)) {
        // ignore intentionally scrollable regions
        let p = el.parentElement, scrollable = false;
        while (p) { const s = getComputedStyle(p); if (/(auto|scroll)/.test(s.overflowX) || s.overflow === "hidden" || s.overflowX === "hidden") { scrollable = true; break; } p = p.parentElement; }
        if (!scrollable) over.push(el.tagName.toLowerCase() + "." + String(el.className).slice(0, 50));
      }
    });
    const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc.slice(-60));
    return { scrollW: document.documentElement.scrollWidth, vw, over: over.slice(0, 5), broken };
  });
  const name = (r === "/" ? "home" : r.slice(1).replace(/\//g, "_")) + `-${W}`;
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  console.log(r.padEnd(32), `h=${total}`, info.scrollW > info.vw ? `OVERFLOW ${info.scrollW}>${info.vw} ${info.over.join(" | ")}` : "no-overflow", info.broken.length ? "BROKEN " + info.broken.join(",") : "", problems.length ? problems.join(" ; ") : "");
}
await browser.close();
