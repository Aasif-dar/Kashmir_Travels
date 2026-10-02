// First-screen ("above the fold") screenshots at several phone sizes. Usage: node scripts/fold.mjs <baseUrl> <outDir> <route> [WxH ...]
import { chromium } from "playwright-core";
import fs from "node:fs";
const [base, outDir, route, ...sizes] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const list = sizes.length ? sizes : ["375x667", "390x844", "430x932"];
const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
for (const s of list) {
  const [w, h] = s.split("x").map(Number);
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await p.goto(base + route, { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  const name = (route === "/" ? "home" : route.slice(1).replace(/\//g, "_")) + `-${s}.png`;
  await p.screenshot({ path: `${outDir}/${name}` });
  await p.close();
}
await b.close();
