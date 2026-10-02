import { chromium } from "playwright-core";
const [url, w = "390"] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: +w, height: 844 } });
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(800);
const r = await p.evaluate(() => {
  const vw = document.documentElement.clientWidth; const out = [];
  document.querySelectorAll("body *").forEach((el) => { const rc = el.getBoundingClientRect(); if (rc.width > 0 && rc.right > vw + 1) out.push({ tag: el.tagName, cls: String(el.className).slice(0, 70), right: Math.round(rc.right), w: Math.round(rc.width), parent: el.parentElement?.tagName + "." + String(el.parentElement?.className).slice(0, 40) }); });
  return { scrollW: document.documentElement.scrollWidth, vw, out: out.slice(0, 12) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
