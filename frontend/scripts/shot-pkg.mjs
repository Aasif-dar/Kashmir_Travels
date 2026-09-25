import { chromium } from "playwright-core";
const [w, h, out, url] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
console.log(p.url());
await p.screenshot({ path: out });
await b.close();
