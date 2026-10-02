import { chromium } from "playwright-core";
import fs from "node:fs";
const base = process.argv[2] ?? "http://localhost:3112";
const width = Number(process.argv[3] ?? 1280);
const axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width, height: width < 600 ? 844 : 900 } });
for (const path of ["/", "/destinations", "/destinations/gulmarg", "/packages", "/packages/kashmir-essentials", "/plan-your-trip", "/activities", "/hotels", "/vehicles", "/contact", "/travel-guide", "/about", "/my-trip", "/credits"]) {
  await p.goto(base + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  await p.evaluate(axe);
  const r = await p.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] })).violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes[0].target.join(" ").slice(0, 90) })));
  console.log(path, r.length ? JSON.stringify(r) : "OK");
}
await b.close();
