import sharp from "sharp";
const [inp, prefix, hStr = "1300"] = process.argv.slice(2);
const meta = await sharp(inp).metadata();
const H = +hStr; let i = 0;
for (let y = 0; y < meta.height; y += H, i++) {
  await sharp(inp).extract({ left: 0, top: y, width: meta.width, height: Math.min(H, meta.height - y) }).jpeg({ quality: 70 }).toFile(`${prefix}-${i}.jpg`);
}
console.log(meta.width, meta.height, i, "slices");
