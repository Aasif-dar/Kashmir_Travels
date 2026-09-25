import sharp from "sharp";
import fs from "node:fs";
const dir = "public/images";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg")).sort();
const per = Number(process.argv[2] ?? 16), start = Number(process.argv[3] ?? 0);
const sel = files.slice(start, start + per);
const W = 360, H = 225, cols = 4;
const rows = Math.ceil(sel.length / cols);
const comps = [];
for (let i = 0; i < sel.length; i++) {
  const buf = await sharp(`${dir}/${sel[i]}`).resize(W, H, { fit: "cover" }).jpeg({ quality: 70 }).toBuffer();
  const x = (i % cols) * W, y = Math.floor(i / cols) * H;
  comps.push({ input: buf, left: x, top: y });
  const label = Buffer.from(`<svg width="${W}" height="24"><rect width="${W}" height="24" fill="black" fill-opacity="0.6"/><text x="6" y="17" font-size="14" fill="white" font-family="Arial">${sel[i].replace(".jpg", "")}</text></svg>`);
  comps.push({ input: label, left: x, top: y });
}
await sharp({ create: { width: cols * W, height: rows * H, channels: 3, background: "#000" } }).composite(comps).jpeg({ quality: 72 }).toFile(process.argv[4] ?? "sheet.jpg");
console.log(sel.length, "->", process.argv[4]);
