const cats = process.argv.slice(2);
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
for (const c of cats) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({action:"query",generator:"categorymembers",gcmtitle:"Category:"+c,gcmtype:"file",gcmlimit:"30",prop:"imageinfo",iiprop:"size|mime",format:"json"}).forEach(([k,v])=>u.searchParams.set(k,v));
  let j; for(let t=0;t<6;t++){await sleep(1500*(t+1));const r=await fetch(u,{headers:{"User-Agent":"KashmirTravelsDemo/1.0"}});try{j=JSON.parse(await r.text());break}catch{}}
  console.log("\n## "+c);
  for (const p of Object.values(j?.query?.pages??{})) { const i=p.imageinfo?.[0]; if(i&&i.mime.includes("jpeg")&&i.width>=1400&&i.width>=i.height) console.log("  "+p.title.replace("File:","")+"  "+i.width+"x"+i.height); }
}
