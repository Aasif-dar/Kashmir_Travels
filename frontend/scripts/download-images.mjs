// Downloads the images listed in image-manifest.json from Wikimedia Commons into public/images
// and writes src/data/image-credits.json with author + license for attribution.
import fs from "node:fs";
import path from "node:path";
const manifest = JSON.parse(fs.readFileSync("scripts/image-manifest.json", "utf8"));
const UA = { "User-Agent": "KashmirTravelsDemo/1.0 (demo project)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (h) => (h ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
fs.mkdirSync("public/images", { recursive: true });
const creditsPath = "src/data/image-credits.json";
const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, "utf8")) : {};

async function getJson(url) {
  for (let t = 0; t < 8; t++) {
    await sleep(1200 * (t + 1));
    const r = await fetch(url, { headers: UA });
    const tx = await r.text();
    try { return JSON.parse(tx); } catch {}
  }
  throw new Error("api failed " + url);
}
for (const [key, file] of Object.entries(manifest)) {
  const out = `public/images/${key}.jpg`;
  if (fs.existsSync(out) && credits[key]) continue;
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({ action: "query", titles: "File:" + file, prop: "imageinfo", iiprop: "extmetadata|url", format: "json" }).forEach(([k, v]) => api.searchParams.set(k, v));
  const j = await getJson(api);
  const page = Object.values(j.query.pages)[0];
  const ii = page.imageinfo?.[0];
  if (!ii) { console.log("MISSING", key, file); continue; }
  const m = ii.extmetadata ?? {};
  let ok = false;
  for (let t = 0; t < 6 && !ok; t++) {
    await sleep(1500 * (t + 1));
    const url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(file) + "?width=1800";
    const r = await fetch(url, { headers: UA, redirect: "follow" });
    if (r.ok && (r.headers.get("content-type") ?? "").startsWith("image")) {
      fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
      ok = true;
    }
  }
  if (!ok) { console.log("DOWNLOAD FAILED", key); continue; }
  credits[key] = { file, author: strip(m.Artist?.value) || "Wikimedia Commons contributor", license: strip(m.LicenseShortName?.value) || "See source", source: ii.descriptionurl ?? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}` };
  fs.mkdirSync(path.dirname(creditsPath), { recursive: true });
  fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
  console.log("ok", key, (fs.statSync(out).size / 1024) | 0, "KB");
}
