// Cuts a tall screenshot into columns and lays them side by side, so a long mobile page can be reviewed in a few images.
// Usage: node scripts/montage.mjs <input.png> <outPrefix> [sliceHeight=1100] [columns=3]
import sharp from "sharp";
const [inp, prefix, hStr = "1100", colsStr = "3"] = process.argv.slice(2);
const H = +hStr, cols = +colsStr, gap = 12;
const meta = await sharp(inp).metadata();
const slices = [];
for (let y = 0; y < meta.height; y += H) {
  const h = Math.min(H, meta.height - y);
  slices.push({ buf: await sharp(inp).extract({ left: 0, top: y, width: meta.width, height: h }).toBuffer(), h, y });
}
let out = 0;
for (let i = 0; i < slices.length; i += cols, out++) {
  const group = slices.slice(i, i + cols);
  const W = group.length * meta.width + (group.length - 1) * gap;
  const comps = group.map((g, k) => ({ input: g.buf, left: k * (meta.width + gap), top: 0 }));
  await sharp({ create: { width: W, height: H, channels: 3, background: "#888" } }).composite(comps).jpeg({ quality: 72 }).toFile(`${prefix}-${out}.jpg`);
}
console.log(meta.width, meta.height, `${out} montage(s), ${slices.length} slices`);
