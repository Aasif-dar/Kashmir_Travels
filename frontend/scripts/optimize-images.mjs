// Resizes images in public/images to max 1600px wide and re-encodes as progressive JPEG (idempotent).
import sharp from "sharp";
import fs from "node:fs";
const dir = "public/images";
const crops = {}; // crops already applied once (act-skiing) — keep empty so re-runs stay idempotent
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".jpg"))) {
  const p = `${dir}/${f}`;
  const key = f.replace(".jpg", "");
  let img = sharp(fs.readFileSync(p));
  const meta = await img.metadata();
  if ((meta.width ?? 0) <= 1600) continue; // already optimised
  if (crops[key] && !meta.__cropped) {
    const c = crops[key];
    if (meta.width > 1400) img = img.extract({ left: c.left, top: c.top, width: Math.round(meta.width * c.wFrac), height: Math.round(meta.height * c.hFrac) });
  }
  const out = await img.resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 78, progressive: true, mozjpeg: true }).toBuffer();
  fs.writeFileSync(p, out);
}
console.log("done");
