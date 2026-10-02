// Usage: node scripts/fetch-candidates.mjs <outDir> <sheet.jpg> "File A.jpg" "File B.jpg" ...
import sharp from "sharp";
import fs from "node:fs";
const [outDir, sheet, ...files] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const UA = { "User-Agent": "KashmirTravelsDemo/1.0 (demo project)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const W = 360, H = 240, cols = 4;
const comps = [];
let i = 0;
for (const f of files) {
  const p = `${outDir}/${i}.jpg`;
  if (!fs.existsSync(p)) {
    for (let t = 0; t < 6; t++) {
      await sleep(1200 * (t + 1));
      const r = await fetch("https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(f) + "?width=720", { headers: UA, redirect: "follow" });
      if (r.ok && (r.headers.get("content-type") ?? "").startsWith("image")) { fs.writeFileSync(p, Buffer.from(await r.arrayBuffer())); break; }
    }
  }
  if (fs.existsSync(p)) {
    const buf = await sharp(p).resize(W, H, { fit: "cover" }).jpeg({ quality: 72 }).toBuffer();
    const x = (i % cols) * W, y = Math.floor(i / cols) * H;
    comps.push({ input: buf, left: x, top: y });
    const label = Buffer.from(`<svg width="${W}" height="22"><rect width="${W}" height="22" fill="black" fill-opacity="0.65"/><text x="5" y="16" font-size="13" fill="white" font-family="Arial">${i}: ${f.replace(/&/g, "and").slice(0, 46)}</text></svg>`);
    comps.push({ input: label, left: x, top: y });
  } else console.log("MISSING", f);
  i++;
}
const rows = Math.ceil(files.length / cols);
await sharp({ create: { width: cols * W, height: rows * H, channels: 3, background: "#000" } }).composite(comps).jpeg({ quality: 74 }).toFile(sheet);
console.log("sheet", sheet);
