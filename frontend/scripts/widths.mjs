// Responsive sweep: every public route at every phone / tablet / desktop width.
// Reports horizontal overflow, broken images, unnamed controls, console errors, failed requests and cumulative layout shift.
// Usage: node scripts/widths.mjs [baseUrl] [w1,w2,...]
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3112";
const widths = (process.argv[3] ?? "375,390,430,768,1024,1280,1440,1600").split(",").map(Number);
const routes = ["/", "/plan-your-trip", "/destinations", "/destinations/gulmarg", "/destinations/leh", "/packages", "/packages/kashmir-essentials", "/activities", "/hotels", "/vehicles", "/about", "/contact", "/my-trip", "/travel-guide", "/book", "/credits"];

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
let bad = 0;
const rows = [];

async function check(ctx, w, route) {
  const problems = [];
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text().slice(0, 120)}`));
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message.slice(0, 120)}`));
  page.on("requestfailed", (r) => !r.url().includes("_rsc") && problems.push(`requestfailed: ${r.url().slice(0, 100)}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`http ${r.status()}: ${r.url().slice(0, 100)}`));
  page.on("crash", () => problems.push("PAGE CRASHED"));
  try {
    await page.goto(base + route, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(400);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 600) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    const r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc.slice(-50));
      const unnamed = [...document.querySelectorAll("button, a[href], [role=button]")].filter((el) => {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") return false;
        const name = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim() || (el.getAttribute("aria-labelledby") ? "x" : "") || (el.querySelector("img[alt]:not([alt=''])") ? "x" : "");
        return !name;
      }).length;
      const over = [];
      if (document.documentElement.scrollWidth > vw) {
        document.querySelectorAll("body *").forEach((el) => {
          const rc = el.getBoundingClientRect();
          if (rc.width > 0 && rc.right > vw + 1) over.push(el.tagName.toLowerCase() + "." + String(el.className).slice(0, 40));
        });
      }
      return { scrollW: document.documentElement.scrollWidth, vw, broken, unnamed, over: over.slice(0, 3), cls: Math.round(window.__cls * 1000) / 1000 };
    });
    const issues = [];
    if (r.scrollW > r.vw) issues.push(`OVERFLOW ${r.scrollW}>${r.vw} (${r.over.join(" | ")})`);
    if (r.broken.length) issues.push("BROKEN IMG " + r.broken.join(","));
    if (r.unnamed) issues.push(`${r.unnamed} unnamed controls`);
    if (r.cls > 0.1) issues.push(`CLS ${r.cls}`);
    if (problems.length) issues.push(...new Set(problems));
    return { cls: r.cls, issues };
  } catch (e) {
    return { cls: 0, issues: [`ERROR ${String(e.message).split("\n")[0].slice(0, 100)}`, ...problems] };
  } finally {
    await page.close().catch(() => {});
  }
}

for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : w < 1100 ? 1024 : 900 } });
  await ctx.addInitScript(() => {
    window.__cls = 0;
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      /* unsupported */
    }
  });
  for (const route of routes) {
    const { cls, issues } = await check(ctx, w, route);
    rows.push({ w, route, cls, issues });
    if (issues.length) {
      bad++;
      console.log(`${String(w).padEnd(5)} ${route.padEnd(30)} ${issues.join(" ; ")}`);
    }
  }
  await ctx.close();
}
const maxCls = Math.max(...rows.map((r) => r.cls));
console.log(`\n${rows.length} page loads (${routes.length} routes × ${widths.length} widths) — ${bad} with issues; worst CLS ${maxCls}`);
await browser.close();
