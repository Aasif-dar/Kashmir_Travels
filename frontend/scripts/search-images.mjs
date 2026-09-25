// Lists Wikimedia Commons candidates per image slot. Usage: node scripts/search-images.mjs
const slots = JSON.parse(process.argv[2]);
const API = "https://commons.wikimedia.org/w/api.php";
for (const [key, q] of Object.entries(slots)) {
  const u = new URL(API);
  Object.entries({ action:"query", generator:"search", gsrsearch:`${q} filetype:bitmap`, gsrnamespace:"6", gsrlimit:"12", prop:"imageinfo", iiprop:"size|mime|url", format:"json" }).forEach(([k,v])=>u.searchParams.set(k,v));
  let j; for (let t=0;t<6;t++){ await new Promise(r=>setTimeout(r,1500*(t+1))); const r = await fetch(u, { headers: { "User-Agent": "KashmirTravelsDemo/1.0 (demo)" } }); const tx = await r.text(); try { j = JSON.parse(tx); break; } catch { continue; } } if(!j){console.log("FAILED",key);continue;}
  const pages = Object.values(j.query?.pages ?? {}).sort((a,b)=>a.index-b.index);
  console.log(`\n## ${key} — "${q}"`);
  for (const p of pages) {
    const i = p.imageinfo?.[0]; if (!i || !i.mime.includes("jpeg")) continue;
    if (i.width < 1400 || i.width < i.height) continue;
    console.log(`  ${p.index}. ${p.title.replace("File:","")}  ${i.width}x${i.height}`);
  }
}
