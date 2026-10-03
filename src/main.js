import "./style.css";
import { createClient } from "@supabase/supabase-js";

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb = createClient(SB_URL, SB_KEY, { auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true } });
const BUCKET = "gallery";

const CFG = {
  instagram: "https://www.instagram.com/artttriko",
  tiktok: "https://www.tiktok.com/@artttriko",
  whatsapp: "" // מספר בפורמט 9725XXXXXXXX, יתווסף בהמשך
};
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(t){const d=document.createElement("div");d.className="toast";d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2200)}

/* ================= The room: one fixed, warm, romantic scene ================= */
function drawRoom(W=1000,H=1250){
  const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const rand=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647})();
  // wall
  let g=x.createLinearGradient(0,0,0,H*.86);g.addColorStop(0,"#3b1219");g.addColorStop(.55,"#6b2330");g.addColorStop(1,"#4a1820");
  x.fillStyle=g;x.fillRect(0,0,W,H);
  // damask-ish wallpaper dots
  x.globalAlpha=.08;x.fillStyle="#f3c9a0";
  for(let yy=30;yy<H*.62;yy+=46)for(let xx=(yy/46%2)*23;xx<W;xx+=46){x.beginPath();x.ellipse(xx,yy,5,9,0,0,7);x.fill()}
  x.globalAlpha=1;
  // picture rail
  x.fillStyle="#2a0c11";x.fillRect(0,H*.08,W,6);
  // wall frame (empty gold frame with warm abstract glow)
  const fx=W*.34,fy=H*.13,fw=W*.32,fh=H*.2;
  x.fillStyle="#b8893f";x.fillRect(fx-14,fy-14,fw+28,fh+28);
  x.fillStyle="#7d5a22";x.fillRect(fx-6,fy-6,fw+12,fh+12);
  g=x.createLinearGradient(fx,fy,fx+fw,fy+fh);g.addColorStop(0,"#ff8a5b");g.addColorStop(.5,"#d94467");g.addColorStop(1,"#3b1d4a");
  x.fillStyle=g;x.fillRect(fx,fy,fw,fh);
  x.globalAlpha=.35;x.fillStyle="#ffd9a0";for(let i=0;i<220;i++){x.beginPath();x.arc(fx+rand()*fw,fy+rand()*fh,2.2,0,7);x.fill()}x.globalAlpha=1;
  // wainscoting
  const wy=H*.6;x.fillStyle="#3a1016";x.fillRect(0,wy,W,H*.26);
  x.strokeStyle="rgba(0,0,0,.35)";x.lineWidth=4;
  for(let i=0;i<5;i++){x.strokeRect(i*W/5+18,wy+24,W/5-36,H*.2)}
  x.fillStyle="#24080d";x.fillRect(0,wy-8,W,10);
  // floor
  const fl=H*.86;g=x.createLinearGradient(0,fl,0,H);g.addColorStop(0,"#2b1510");g.addColorStop(1,"#120806");x.fillStyle=g;x.fillRect(0,fl,W,H-fl);
  x.strokeStyle="rgba(255,190,120,.06)";x.lineWidth=2;for(let i=-10;i<20;i++){x.beginPath();x.moveTo(W/2+i*30,fl);x.lineTo(W/2+i*120,H);x.stroke()}
  // rug
  x.fillStyle="#5c1424";x.beginPath();x.ellipse(W/2,H*.95,W*.42,H*.045,0,0,7);x.fill();
  x.strokeStyle="#b8893f";x.lineWidth=3;x.beginPath();x.ellipse(W/2,H*.95,W*.38,H*.034,0,0,7);x.stroke();
  // dresser
  const dl=W*.17,dr=W*.83,dt=H*.62,dtop=H*.637,db=H*.87;
  x.fillStyle="rgba(0,0,0,.45)";x.beginPath();x.ellipse(W/2,db+6,(dr-dl)/1.9,14,0,0,7);x.fill();
  g=x.createLinearGradient(dl,0,dr,0);g.addColorStop(0,"#3d2214");g.addColorStop(.3,"#6a3e22");g.addColorStop(.7,"#5a3219");g.addColorStop(1,"#2e180d");
  x.fillStyle=g;x.fillRect(dl+10,dtop,dr-dl-20,db-dtop-22);
  // top slab
  g=x.createLinearGradient(0,dt,0,dtop+6);g.addColorStop(0,"#8a5630");g.addColorStop(1,"#5a3219");
  x.fillStyle=g;x.beginPath();x.moveTo(dl+18,dt);x.lineTo(dr-18,dt);x.lineTo(dr,dtop);x.lineTo(dl,dtop);x.closePath();x.fill();
  x.fillStyle="#3a1f10";x.fillRect(dl,dtop,dr-dl,9);
  // drawers
  for(let r=0;r<3;r++){const y=dtop+22+r*((db-dtop-50)/3);const h=(db-dtop-62)/3;
    for(let k=0;k<2;k++){const xx=dl+28+k*((dr-dl-56)/2+6),ww=(dr-dl-62)/2;
      x.strokeStyle="rgba(20,8,3,.6)";x.lineWidth=3;x.strokeRect(xx,y,ww,h);
      x.strokeStyle="rgba(255,200,140,.08)";x.lineWidth=2;x.strokeRect(xx+5,y+5,ww-10,h-10);
      x.fillStyle="#d9a95a";x.beginPath();x.arc(xx+ww/2,y+h/2,6,0,7);x.fill();}}
  // legs
  x.fillStyle="#2a150a";[[dl+22],[dr-38]].forEach(([lx])=>x.fillRect(lx,db-22,16,24));
  // lamp (left)
  const lx=W*.255;x.fillStyle="#b8893f";x.fillRect(lx-26,dt-8,52,8);x.fillRect(lx-5,dt-120,10,112);
  x.beginPath();x.moveTo(lx-62,dt-120);x.lineTo(lx+62,dt-120);x.lineTo(lx+40,dt-200);x.lineTo(lx-40,dt-200);x.closePath();
  g=x.createLinearGradient(0,dt-200,0,dt-120);g.addColorStop(0,"#ffcf8a");g.addColorStop(1,"#ff9e4a");x.fillStyle=g;x.fill();
  // warm light pools
  const glow=(cx,cy,r,col)=>{const gg=x.createRadialGradient(cx,cy,0,cx,cy,r);gg.addColorStop(0,col);gg.addColorStop(1,"rgba(0,0,0,0)");x.globalCompositeOperation="lighter";x.fillStyle=gg;x.fillRect(cx-r,cy-r,r*2,r*2);x.globalCompositeOperation="source-over"};
  glow(lx,dt-160,W*.45,"rgba(255,150,60,.42)");
  // candles (right)
  [[W*.72,70],[W*.765,46],[W*.69,34]].forEach(([cx,ch])=>{x.fillStyle="#f4e2c4";x.fillRect(cx-9,dt-ch,18,ch);x.fillStyle="#ffcc66";x.beginPath();x.ellipse(cx,dt-ch-12,5,11,0,0,7);x.fill();glow(cx,dt-ch-12,90,"rgba(255,160,70,.5)")});
  // roses in small vase near candles
  const vx=W*.79;x.fillStyle="#2f4a3a";x.beginPath();x.moveTo(vx-14,dt);x.lineTo(vx+14,dt);x.lineTo(vx+10,dt-40);x.lineTo(vx-10,dt-40);x.fill();
  [[-10,-58],[8,-66],[0,-50],[-2,-74]].forEach(([ox,oy])=>{x.fillStyle="#c81e45";x.beginPath();x.arc(vx+ox,dt+oy,10,0,7);x.fill();x.fillStyle="#8e1030";x.beginPath();x.arc(vx+ox+2,dt+oy+2,5,0,7);x.fill()});
  // ambient bokeh
  for(let i=0;i<26;i++){const bx=rand()*W,by=rand()*H*.55;glow(bx,by,10+rand()*26,`rgba(255,${150+rand()*60|0},90,${.05+rand()*.08})`)}
  // vignette
  g=x.createRadialGradient(W/2,H*.55,W*.25,W/2,H*.55,W*.9);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(5,1,2,.72)");x.fillStyle=g;x.fillRect(0,0,W,H);
  return c.toDataURL("image/jpeg",.88);
}
const DRAWN_ROOM=drawRoom();
let ROOM=null; // {img?,x1,x2,y,cm,scale,shadow,sep,br}; no img = the drawn room
// Calibration: the dresser top runs from x1 to x2 (fractions of the picture width) at height y, and is cm wide in reality
const CAL0={x1:.17,x2:.83,y:.634,cm:110};
function cal(){
  const R=ROOM||{};
  if(R.x1!=null&&R.x2!=null)return {x1:R.x1,x2:R.x2,y:R.y??CAL0.y,cm:R.cm||110};
  if(R.img)return {x1:(R.x??.5)-.3,x2:(R.x??.5)+.3,y:R.y??.62,cm:R.cm||110};
  return {...CAL0,cm:R.cm||CAL0.cm};
}
function applyRoom(){
  const r=document.documentElement.style,R=ROOM||{},c=cal(),photo=!!R.img;
  r.setProperty("--room",`url(${photo?R.img:DRAWN_ROOM})`);
  r.setProperty("--px",(c.x1+c.x2)/2);r.setProperty("--py",c.y);r.setProperty("--rs",Math.max(.7,Math.min(1.3,R.scale||1)));
  r.setProperty("--sx",(R.shadow??-12)+"px");
  r.setProperty("--glow",photo?0:.65);r.setProperty("--glowh",photo?0:1);
  r.setProperty("--rsep",photo?(R.sep??.12):.12);r.setProperty("--rbr",photo?(R.br??.98):.98);
}
applyRoom();

/* ================= Example pieces (placeholders until real photos are uploaded) ================= */
function drawSample(kind){
  const W=520,H=820,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  x.lineJoin="round";x.lineWidth=9;x.strokeStyle="#140b0d";
  const shape=(f,fill)=>{x.beginPath();f();x.fillStyle=fill;x.fill();x.stroke()};
  const grad=(a,b)=>{const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,a);g.addColorStop(1,b);return g};
  // plinth
  shape(()=>{x.ellipse(W/2,H-40,170,28,0,0,7)},"#2b2b31");
  shape(()=>{x.rect(W/2-170,H-70,340,30)},"#3c3c44");
  shape(()=>{x.ellipse(W/2,H-70,170,28,0,0,7)},"#55555f");
  if(kind==="hero"){
    shape(()=>{x.moveTo(W/2-110,250);x.quadraticCurveTo(W/2-210,600,W/2-150,H-90);x.lineTo(W/2+150,H-90);x.quadraticCurveTo(W/2+210,600,W/2+110,250);x.closePath()},grad("#a3122e","#ff3b5c"));
    shape(()=>{x.roundRect(W/2-70,520,60,H-610,20)},"#1b4fbf");shape(()=>{x.roundRect(W/2+10,520,60,H-610,20)},"#1b4fbf");
    shape(()=>{x.roundRect(W/2-105,250,210,300,60)},grad("#1f5fe0","#4f8dff"));
    shape(()=>{x.moveTo(W/2,320);for(let i=1;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?22:52;x.lineTo(W/2+Math.cos(a)*r,390+Math.sin(a)*r)}x.closePath()},"#ffd23f");
    shape(()=>{x.ellipse(W/2,180,78,92,0,0,7)},"#f0c29b");
    shape(()=>{x.ellipse(W/2,120,84,52,0,Math.PI,0)},"#2b1a14");
    x.fillStyle="#140b0d";x.beginPath();x.arc(W/2-28,180,8,0,7);x.arc(W/2+28,180,8,0,7);x.fill();
    x.beginPath();x.lineWidth=6;x.arc(W/2,205,30,.2,Math.PI-.2);x.stroke();
  } else if(kind==="cat"){
    shape(()=>{x.ellipse(W/2,560,170,190,0,0,7)},grad("#159bcf","#2ec4ff"));
    shape(()=>{x.moveTo(W/2+140,660);x.quadraticCurveTo(W/2+260,560,W/2+200,420);x.quadraticCurveTo(W/2+190,560,W/2+110,610)},"#159bcf");
    shape(()=>{x.ellipse(W/2,300,140,125,0,0,7)},grad("#159bcf","#2ec4ff"));
    shape(()=>{x.moveTo(W/2-130,250);x.lineTo(W/2-110,130);x.lineTo(W/2-50,195)},"#2ec4ff");
    shape(()=>{x.moveTo(W/2+130,250);x.lineTo(W/2+110,130);x.lineTo(W/2+50,195)},"#2ec4ff");
    shape(()=>{x.ellipse(W/2-50,290,30,38,0,0,7)},"#ffd23f");shape(()=>{x.ellipse(W/2+50,290,30,38,0,0,7)},"#ffd23f");
    x.fillStyle="#140b0d";x.fillRect(W/2-56,262,12,56);x.fillRect(W/2+44,262,12,56);
    shape(()=>{x.moveTo(W/2-14,340);x.lineTo(W/2+14,340);x.lineTo(W/2,356);x.closePath()},"#ff3b5c");
    shape(()=>{x.ellipse(W/2,600,90,110,0,0,7)},"#ffe9d0");
  } else {
    shape(()=>{x.moveTo(W/2-200,H-90);x.quadraticCurveTo(W/2-210,480,W/2,470);x.quadraticCurveTo(W/2+210,480,W/2+200,H-90);x.closePath()},grad("#d9d4cc","#ffffff"));
    shape(()=>{x.roundRect(W/2-60,560,120,80,10)},"#ff3b5c");
    x.fillStyle="#ffd23f";x.fillRect(W/2-40,580,24,14);x.fillStyle="#2ec4ff";x.fillRect(W/2+10,580,24,14);
    shape(()=>{x.arc(W/2,310,190,0,7)},grad("#cfc9c0","#ffffff"));
    const g=x.createLinearGradient(W/2-150,200,W/2+150,420);g.addColorStop(0,"#ff7a3d");g.addColorStop(.5,"#d43a7a");g.addColorStop(1,"#2a1650");
    shape(()=>{x.ellipse(W/2,310,145,130,0,0,7)},g);
    x.globalAlpha=.6;x.fillStyle="#fff";x.beginPath();x.ellipse(W/2-70,250,34,20,-.6,0,7);x.fill();x.globalAlpha=1;
  }
  return c.toDataURL("image/png");
}
const SAMPLES=[
  {id:"ex-astro",name:"אסטרונאוט בשקיעה",heightCm:28,materials:"PLA, צבע אקרילי, לכה מבריקה",character:"אסטרונאוט",category:"Bust",scale:"1:3",tech:"FDM",status:"sale",summary:"קסדה שמשקפת שקיעה ורודה. הצבע הוא שכבות אקריליק ביד, והברק מגיע מלכה בשלוש שכבות.",kind:"astro",createdAt:Date.now()-1000},
  {id:"ex-cat",name:"חתול פופ",heightCm:22,materials:"שרף, אקריליק",character:"חתול",category:"Statue",scale:"1:1 (גודל טבעי)",tech:"Resin",status:"show",summary:"חתול בצבעי פופ־ארט עם עיניים צהובות. מודפס בשרף בשביל פרטים חדים בפרווה.",kind:"cat",createdAt:Date.now()-2000},
  {id:"ex-hero",name:"גיבור הכוכב",heightCm:34,materials:"PLA, PETG, אקריליק",character:"גיבור מקורי",category:"Statue",scale:"1:6",tech:"FDM",status:"sale",summary:"דמות גיבור מקורית עם גלימה אדומה וסמל כוכב. נבנתה בשלושה חלקים ונצבעה ידנית.",kind:"hero",createdAt:Date.now()-3000}
];

/* ================= Data (Supabase) ================= */
const toRow=w=>({id:w.id,name:w.name,height_cm:w.heightCm===""||w.heightCm==null?null:+w.heightCm,materials:w.materials||null,status:w.status,summary:w.summary||null,character:w.character||null,category:w.category||null,scale:w.scale||null,tech:w.tech||null,media:w.media,created_at:new Date(w.createdAt).toISOString(),updated_at:new Date().toISOString()});
const fromRow=r=>({id:r.id,name:r.name,heightCm:r.height_cm==null?"":+r.height_cm,materials:r.materials||"",status:r.status,summary:r.summary||"",character:r.character||"",category:r.category||"",scale:r.scale||"",tech:r.tech||"",media:Array.isArray(r.media)?r.media:[],createdAt:Date.parse(r.created_at)});
async function dbAll(){const {data,error}=await sb.from("works").select("*").order("created_at",{ascending:false});if(error){console.error(error);return null}return data.map(fromRow)}
async function dbPut(w){const {error}=await sb.from("works").upsert(toRow(w));if(error)throw error}
async function dbDel(id){const {error}=await sb.from("works").delete().eq("id",id);if(error)throw error}
async function getSetting(k){const {data,error}=await sb.from("settings").select("value").eq("key",k).maybeSingle();if(error){console.error(error);return null}return data?data.value:null}
async function putSetting(k,v){const {error}=await sb.from("settings").upsert({key:k,value:v,updated_at:new Date().toISOString()});if(error)throw error}
const hydrate=w=>w;
const isRemote=u=>typeof u==="string"&&/^https?:/.test(u);
const extOf=type=>({"image/jpeg":"jpg","image/png":"png","image/webp":"webp","video/mp4":"mp4","video/quicktime":"mov","video/webm":"webm"}[type]||"bin");
// Uploads one file to Supabase Storage with a progress callback; returns its public URL
async function uploadBlob(path,blob,onProg){
  const {data:{session}}=await sb.auth.getSession();
  if(!session)throw new Error("צריך להיות מחובר כמנהל");
  return new Promise((res,rej)=>{
    const x=new XMLHttpRequest();
    x.open("POST",`${SB_URL}/storage/v1/object/${BUCKET}/${path}`);
    x.setRequestHeader("Authorization","Bearer "+session.access_token);
    x.setRequestHeader("apikey",SB_KEY);
    x.setRequestHeader("x-upsert","true");
    x.setRequestHeader("cache-control","max-age=31536000");
    if(blob.type)x.setRequestHeader("Content-Type",blob.type);
    x.upload.onprogress=e=>{if(e.lengthComputable&&onProg)onProg(e.loaded,e.total)};
    x.onload=()=>x.status<300?res(`${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`):rej(new Error(`העלאה נכשלה (${x.status})`));
    x.onerror=()=>rej(new Error("אין חיבור לאינטרנט"));
    x.send(blob);
  });
}

/* ================= Categories and scale ================= */
const CATS=[
  {v:"Bust",he:"באסט"},{v:"Statue",he:"פסל מלא"},{v:"Diorama",he:"דיורמה"},{v:"Miniature",he:"מיניאטורה"},{v:"Action Figure",he:"דמות מפרקית"}
];
const catHe=v=>(CATS.find(c=>c.v===v)||{}).he||v||"";
const TECH_HE={"FDM":"FDM","Resin":"שרף","FDM+Resin":"FDM + שרף"};
$("#fCat").insertAdjacentHTML("beforeend",CATS.map(c=>`<option value="${c.v}">${c.he} (${c.v})</option>`).join(""));
// Scale = real-life size of the part shown ÷ model height, snapped to the standard scales
const SCALES=[[1,"1:1 (גודל טבעי)"],[2,"1:2 (חצי)"],[3,"1:3"],[4,"1:4 (רבע)"],[6,"1:6"],[8,"1:8"],[10,"1:10 (Art Scale)"],[12,"1:12"]];
function calcScale(refCm,modelCm){
  refCm=+refCm;modelCm=+modelCm;if(!(refCm>0&&modelCm>0))return null;
  const r=refCm/modelCm;
  if(r<0.8)return {label:`${(modelCm/refCm).toFixed(1).replace(/\.0$/,"")}:1 (גדול מהמקור)`,ratio:r};
  if(r>16)return {label:`${Math.round(1800/r)} מ"מ (מיניאטורה)`,ratio:r};
  let best=SCALES[0];for(const sc of SCALES)if(Math.abs(Math.log(sc[0]/r))<Math.abs(Math.log(best[0]/r)))best=sc;
  return {label:best[1],ratio:r};
}

/* ================= State ================= */
const S={email:"",filter:{cat:"",tech:"",sale:false},works:[],view:"flat",admin:false,history:[],editing:null,staged:[]};
const firstImg=w=>w.media.find(m=>m.kind==="image");
const heightFrac=cm=>{const c=cal();return Math.max(.02,Math.min(.95,(+cm||25)*((c.x2-c.x1)/c.cm)*.8))};

const illusOf=w=>w.media.find(m=>m.kind==="image"&&m.illus&&m.aiCut);
// The in-room illustration is optional: shown only when the admin made a cutout and turned it on
function sceneHTML(w,force){
  const il=illusOf(w);
  if(!il||(!il.sceneOn&&!force)) return flatHTML(w);
  return `<div class="scene" style="--h:${heightFrac(w.heightCm)}"><div class="room"></div><div class="piece cut"><img src="${il.aiCut}" alt=""></div><div class="glow"></div></div>`;
}
function flatHTML(w){const im=firstImg(w);if(!im)return `<div class="vid-only">וידאו</div>`;return `<div class="flat"><img src="${im.orig}" alt="" loading="lazy"></div>`}

function render(){
  const all=[...S.works].sort((a,b)=>b.createdAt-a.createdAt);
  renderFilters(all);
  const F=S.filter;
  const list=all.filter(w=>(!F.cat||w.category===F.cat)&&(!F.tech||w.tech===F.tech)&&(!F.sale||w.status==="sale"));
  $("#count").textContent=`${list.length} יצירות`;
  $("#grid").innerHTML=list.map(w=>`
    <article class="card" data-id="${esc(w.id)}" tabindex="0" aria-label="${esc(w.name)}">
      <div class="frame">${S.view==="room"?sceneHTML(w):flatHTML(w)}
        ${w.status==="sale"?`<button class="badge" data-buy="${esc(w.id)}">זמין לרכישה</button>`:""}
        ${w.example?`<span class="example">דוגמה</span>`:""}
      </div>
      <div class="meta"><h3>${esc(w.name)}</h3><span class="spec">${[w.category&&esc(catHe(w.category)),w.scale&&esc(w.scale.split(" ")[0]),esc(w.heightCm)+' ס"מ'].filter(Boolean).join(" · ")}</span></div>
    </article>`).join("") || `<p class="note">עוד אין יצירות. היכנס כמנהל דרך המנעול בתחתית והעלה את הראשונה.</p>`;
  if(!list.length&&all.length)$("#grid").innerHTML=`<p class="note">אין יצירות שמתאימות לסינון. <button class="chip" id="clearF">ניקוי הסינון</button></p>`;
  const top=all.find(firstImg); $("#heroScene").innerHTML=top?(S.view==="room"?sceneHTML(top):flatHTML(top)):"";
  if(S.admin) renderAdminList();
}

function renderFilters(all){
  const cnt=(k,v)=>all.filter(w=>w[k]===v).length;
  const cats=CATS.filter(c=>cnt("category",c.v));
  const techs=Object.keys(TECH_HE).filter(t=>cnt("tech",t));
  const F=S.filter;
  $("#filters").innerHTML=(cats.length?`<button class="chip" data-f="cat" data-v="" aria-pressed="${!F.cat}">הכול<span class="n">${all.length}</span></button>`+cats.map(c=>`<button class="chip" data-f="cat" data-v="${c.v}" aria-pressed="${F.cat===c.v}">${c.he}<span class="n">${cnt("category",c.v)}</span></button>`).join(""):"")
    +(techs.length>1?`<select id="techF" aria-label="טכנולוגיה"><option value="">כל הטכנולוגיות</option>${techs.map(t=>`<option value="${t}" ${F.tech===t?"selected":""}>${TECH_HE[t]}</option>`).join("")}</select>`:"")
    +`<button class="chip" data-f="sale" aria-pressed="${F.sale}">רק זמינים לרכישה</button>`;
}
$("#filters").addEventListener("click",e=>{const b=e.target.closest("[data-f]");if(!b)return;if(b.dataset.f==="cat")S.filter.cat=b.dataset.v;if(b.dataset.f==="sale")S.filter.sale=!S.filter.sale;render()});
$("#filters").addEventListener("change",e=>{if(e.target.id==="techF"){S.filter.tech=e.target.value;render()}});
$("#grid").addEventListener("click",e=>{if(e.target.id==="clearF"){S.filter={cat:"",tech:"",sale:false};render()}});

/* ================= Gallery controls ================= */
function press(group,btn){group.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b===btn?"true":"false"))}
$("#vRoom").onclick=e=>{S.view="room";press(e.target.parentNode,e.target);render();save("view2","room")};
$("#vFlat").onclick=e=>{S.view="flat";press(e.target.parentNode,e.target);render();save("view2","flat")};
function setSize(px){document.documentElement.style.setProperty("--card-min",px+"px");$("#sizeRange").value=px;document.querySelectorAll("[data-size]").forEach(b=>b.setAttribute("aria-pressed",Math.abs(+b.dataset.size-px)<40?"true":"false"));save("size",px)}
document.querySelectorAll("[data-size]").forEach(b=>b.onclick=()=>setSize(+b.dataset.size));
$("#sizeRange").oninput=e=>setSize(+e.target.value);
document.querySelectorAll("[data-cols]").forEach(b=>b.onclick=()=>{$("#grid").className="grid cols-"+b.dataset.cols;press(b.parentNode,b);save("cols",b.dataset.cols)});
function save(k,v){try{localStorage.setItem("artriko."+k,v)}catch(e){}}
function load(k){try{return localStorage.getItem("artriko."+k)}catch(e){return null}}

$("#grid").addEventListener("click",e=>{
  const buy=e.target.closest("[data-buy]"); if(buy){e.stopPropagation();openContact(S.works.find(w=>w.id===buy.dataset.buy));return}
  const card=e.target.closest(".card"); if(card) openLB(card.dataset.id);
});
$("#grid").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList.contains("card"))openLB(e.target.dataset.id)});

/* ================= Links ================= */
const wa=t=>CFG.whatsapp?`https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(t||"")}`:"";
["#igTop","#igHero","#igBar","#ctIg"].forEach(s=>$(s).href=CFG.instagram);
["#ttTop","#ttHero","#ttBar","#ctTt"].forEach(s=>$(s).href=CFG.tiktok);
if(CFG.whatsapp){$("#waBar").hidden=false;$("#waBar").href=wa("היי ARTRIKO, ראיתי את הגלריה ואשמח לשמוע עוד")}

/* ================= Lightbox ================= */
let LB={w:null,slides:[],i:0};
function openLB(id){
  const w=S.works.find(x=>x.id===id); if(!w) return;
  const il=illusOf(w),showIl=!!(il&&il.sceneOn);
  const slides=[]; if(showIl&&S.view==="room") slides.push({kind:"room"});
  w.media.forEach(m=>slides.push(m));
  if(showIl&&S.view!=="room") slides.push({kind:"room"});
  LB={w,slides,i:0};
  $("#lbInfo").innerHTML=`
    <span class="status ${w.status}">${w.status==="sale"?"זמין לרכישה":"מוצג בלבד"}</span>
    <h2>${esc(w.name)}</h2>
    <dl>${w.character?`<dt>דמות</dt><dd>${esc(w.character)}</dd>`:""}${w.category?`<dt>קטגוריה</dt><dd>${esc(catHe(w.category))} <a class="flink" href="#guide" data-close>מה זה?</a></dd>`:""}<dt>גובה</dt><dd>${esc(w.heightCm)} ס"מ</dd>${w.scale?`<dt>קנה מידה</dt><dd>${esc(w.scale)}</dd>`:""}${w.tech?`<dt>טכנולוגיה</dt><dd>${esc(TECH_HE[w.tech]||w.tech)}</dd>`:""}<dt>חומרים</dt><dd>${esc(w.materials||"—")}</dd><dt>נוסף</dt><dd>${new Date(w.createdAt).toLocaleDateString("he-IL")}</dd></dl>
    <p class="summary">${esc(w.summary||"")}</p>
    <button class="pill contact-btn" id="lbContact">אני רוצה את זה!</button>
    ${showIl?`<p class="note">בהמחשה בחדר הגודל על השידה מחושב לפי הגובה האמיתי של הפסל.</p>`:""}`;
  $("#lbContact").onclick=()=>openContact(w);
  showSlide(0); $("#lb").showModal();
}
function showSlide(i){
  const n=LB.slides.length; LB.i=(i+n)%n; const s=LB.slides[LB.i], w=LB.w;
  const main=$("#lbMain");
  if(s.kind==="room") main.innerHTML=sceneHTML(w);
  else if(s.kind==="image") main.innerHTML=`<img class="zoomable" src="${s.orig}" alt="${esc(w.name)}">`;
  else main.innerHTML=`<video src="${s.url}" controls playsinline></video>`;
  const z=main.querySelector(".zoomable,.scene");
  if(z && matchMedia("(hover:hover)").matches){
    z.classList.add("zoomable");
    z.onmousemove=e=>{const r=z.getBoundingClientRect();z.style.transformOrigin=`${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%`};
    z.onmouseenter=()=>z.classList.add("on"); z.onmouseleave=()=>z.classList.remove("on");
  }
  $("#lbThumbs").innerHTML=LB.slides.map((t,k)=>`<button aria-current="${k===LB.i}" data-k="${k}" aria-label="מדיה ${k+1}">${t.kind==="room"?`<span class="t-room">בחדר</span>`:t.kind==="image"?`<img src="${t.orig}" alt="">`:`<video src="${t.url}" muted></video>`}</button>`).join("");
  $("#lbPrev").hidden=$("#lbNext").hidden=n<2;
}
$("#lbThumbs").onclick=e=>{const b=e.target.closest("[data-k]");if(b)showSlide(+b.dataset.k)};
$("#lbPrev").onclick=()=>showSlide(LB.i-1);$("#lbNext").onclick=()=>showSlide(LB.i+1);
$("#lb").addEventListener("keydown",e=>{if(e.key==="ArrowLeft")showSlide(LB.i+1);if(e.key==="ArrowRight")showSlide(LB.i-1)});
(()=>{let x0=null;const m=$("#lbMain");m.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse")x0=e.clientX});m.addEventListener("pointerup",e=>{if(x0===null)return;const dx=e.clientX-x0;x0=null;if(Math.abs(dx)>50)showSlide(LB.i+(dx>0?1:-1))})})();
// Dialogs close with the ✕ button. Lightbox and contact also close on a click on the dark backdrop
// (both press and release outside the box). The admin panel closes only with ✕, never by Escape or a stray click.
document.querySelectorAll("dialog").forEach(d=>{
  const xOnly=d.id==="ad";
  const outside=e=>{const r=d.getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom};
  let downOut=false;
  d.addEventListener("pointerdown",e=>{downOut=e.target===d&&outside(e)});
  d.addEventListener("click",e=>{
    if(e.target.closest("[data-close]")){d.close();return}
    if(!xOnly&&downOut&&e.target===d&&outside(e))d.close();
    downOut=false;
  });
  d.addEventListener("cancel",e=>{if(xOnly)e.preventDefault()});
  d.addEventListener("close",()=>d.querySelectorAll("video").forEach(v=>v.pause()));
});

/* ================= Contact ================= */
function openContact(w){
  const t=w?`היי ARTRIKO, אני רוצה את "${w.name}" (${w.heightCm} ס"מ)! אשמח לשמוע על זמינות ומחיר.`:"היי ARTRIKO, אשמח לשמוע עוד";
  $("#ctMsg").textContent=t;
  if(CFG.whatsapp){$("#ctWa").hidden=false;$("#ctWa").href=wa(t)}
  $("#ct").showModal();
}
document.querySelectorAll("#ct .dm").forEach(a=>a.addEventListener("click",()=>{navigator.clipboard?.writeText($("#ctMsg").textContent).then(()=>toast("ההודעה הועתקה, הדבק אותה בצ'אט"),()=>{})}));
$("#ctCopy").onclick=async()=>{const t=$("#ctMsg").textContent;try{await navigator.clipboard.writeText(t);toast("ההודעה הועתקה")}catch(e){const r=document.createRange();r.selectNodeContents($("#ctMsg"));const s=getSelection();s.removeAllRanges();s.addRange(r);toast("ההודעה מסומנת, העתק אותה")}};

/* ================= Image tools ================= */
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();if(isRemote(src))i.crossOrigin="anonymous";i.onload=()=>res(i);i.onerror=rej;i.src=src})}
async function downscale(src,max=1600){const i=await loadImg(src);const k=Math.min(1,max/Math.max(i.width,i.height));const c=document.createElement("canvas");c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);c.getContext("2d").drawImage(i,0,0,c.width,c.height);return c.toDataURL("image/jpeg",.9)}
const ED0={rot:0,flip:false,b:100,c:100,s:100};
const isPlain=e=>!e||(!e.rot&&!e.flip&&e.b==100&&e.c==100&&e.s==100);
async function applyEdits(src,e){
  if(isPlain(e)) return src;
  const i=await loadImg(src);const r=((e.rot%360)+360)%360,side=r===90||r===270;
  const c=document.createElement("canvas");c.width=side?i.height:i.width;c.height=side?i.width:i.height;const x=c.getContext("2d");
  x.translate(c.width/2,c.height/2);x.rotate(r*Math.PI/180);if(e.flip)x.scale(-1,1);
  x.filter=`brightness(${e.b/100}) contrast(${e.c/100}) saturate(${e.s/100})`;
  x.drawImage(i,-i.width/2,-i.height/2);return c.toDataURL("image/jpeg",.92);
}
function b64Blob(dataURL){const [h,b]=dataURL.split(",");const bin=atob(b);const u=new Uint8Array(bin.length);for(let k=0;k<bin.length;k++)u[k]=bin.charCodeAt(k);return new Blob([u],{type:h.slice(5).split(";")[0]})}
// Background removal: flood-fills the backdrop from the photo's edges, then trims to the sculpture.
async function removeBg(src,tol){
  const i=await loadImg(src);const k=Math.min(1,1100/Math.max(i.width,i.height));
  const W=Math.round(i.width*k),H=Math.round(i.height*k);const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");x.drawImage(i,0,0,W,H);
  const im=x.getImageData(0,0,W,H),d=im.data,N=W*H,mark=new Uint8Array(N),q=new Int32Array(N);let qh=0,qt=0;
  let r=0,g=0,b=0,n=0;const samp=p=>{r+=d[p*4];g+=d[p*4+1];b+=d[p*4+2];n++};
  for(let xx=0;xx<W;xx++){samp(xx);samp((H-1)*W+xx)}for(let yy=0;yy<H;yy++){samp(yy*W);samp(yy*W+W-1)}
  r/=n;g/=n;b/=n;const t2=tol*tol;
  const near=p=>{const dr=d[p*4]-r,dg=d[p*4+1]-g,db=d[p*4+2]-b;return dr*dr+dg*dg+db*db<t2};
  const push=p=>{if(!mark[p]&&near(p)){mark[p]=1;q[qt++]=p}};
  for(let xx=0;xx<W;xx++){push(xx);push((H-1)*W+xx)}for(let yy=0;yy<H;yy++){push(yy*W);push(yy*W+W-1)}
  while(qh<qt){const p=q[qh++],px=p%W;if(px>0)push(p-1);if(px<W-1)push(p+1);if(p>=W)push(p-W);if(p<N-W)push(p+W)}
  let minX=W,minY=H,maxX=0,maxY=0;
  for(let p=0;p<N;p++){if(mark[p]){d[p*4+3]=0;continue}
    const px=p%W,py=(p/W)|0;const edge=(px>0&&mark[p-1])||(px<W-1&&mark[p+1])||(p>=W&&mark[p-W])||(p<N-W&&mark[p+W]);
    if(edge)d[p*4+3]=140; if(px<minX)minX=px;if(px>maxX)maxX=px;if(py<minY)minY=py;if(py>maxY)maxY=py}
  if(maxX<=minX||maxY<=minY) return null;
  x.putImageData(im,0,0);const o=document.createElement("canvas");o.width=maxX-minX+1;o.height=maxY-minY+1;o.getContext("2d").drawImage(c,minX,minY,o.width,o.height,0,0,o.width,o.height);
  return o.toDataURL("image/png");
}

/* ================= Admin ================= */
async function checkAdmin(){
  const {data:{session}}=await sb.auth.getSession();
  if(!session){S.admin=false;S.email="";return false}
  const {data,error}=await sb.rpc("is_admin");
  S.admin=!error&&data===true;S.email=session.user.email||"";
  return S.admin;
}
async function openAdmin(tab){
  await checkAdmin();
  $("#adLogin").hidden=S.admin;$("#adPanel").hidden=!S.admin;
  if(!$("#ad").open)$("#ad").showModal();
  if(S.admin){$("#whoAmI").textContent="מחובר: "+S.email;loadAdminData();showTab(tab||"work")}
}
$("#lockBtn").onclick=()=>openAdmin();
$("#lockTop").onclick=()=>openAdmin();
$("#loginForm").onsubmit=async e=>{
  e.preventDefault();const email=$("#lEmail").value.trim(),password=$("#lPass").value;
  if(!password){$("#lMsg").textContent="הזן סיסמה, או לחץ \"כניסה ראשונה / שכחתי סיסמה\" כדי לקבל קישור במייל.";return}
  $("#lMsg").textContent="נכנס…";
  const {error}=await sb.auth.signInWithPassword({email,password});
  if(error){$("#lMsg").textContent="האימייל או הסיסמה לא נכונים.";return}
  if(!(await checkAdmin())){await sb.auth.signOut();$("#lMsg").textContent="המשתמש הזה לא מוגדר כמנהל של האתר.";return}
  $("#lMsg").textContent="";openAdmin();
};
$("#lMagic").onclick=async()=>{
  const email=$("#lEmail").value.trim();
  if(!email){$("#lMsg").textContent="כתוב קודם את האימייל שלך.";$("#lEmail").focus();return}
  $("#lMsg").textContent="שולח…";
  const {error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+"/?admin=1"}});
  $("#lMsg").textContent=error?(/rate|seconds/i.test(error.message)?"נשלחו יותר מדי קישורים. נסה שוב בעוד כמה דקות.":"השליחה נכשלה: "+error.message):`שלחתי קישור כניסה ל־${email}. פתח את המייל במכשיר הזה ולחץ על הקישור. אחרי הכניסה תוכל להגדיר סיסמה.`;
};
$("#logoutBtn").onclick=async()=>{await sb.auth.signOut();S.admin=false;$("#adPanel").hidden=true;$("#adLogin").hidden=false;$("#lPass").value="";toast("יצאת מהניהול")};
$("#pwForm").onsubmit=async e=>{
  e.preventDefault();const a=$("#pw1").value,b=$("#pw2").value;
  if(a.length<8){$("#pwMsg").textContent="לפחות 8 תווים.";return}
  if(a!==b){$("#pwMsg").textContent="שתי הסיסמאות לא זהות.";return}
  const {error}=await sb.auth.updateUser({password:a});
  $("#pwMsg").textContent=error?"השמירה נכשלה: "+error.message:"הסיסמה נשמרה. מעכשיו אפשר להיכנס עם אימייל וסיסמה.";
  if(!error){$("#pw1").value=$("#pw2").value=""}
};
async function loadAdminData(){
  renderAdminList();
  const vv=await getSetting("voice");if(vv){VOICE=vv;$("#xVoice").value=vv.samples||"";$("#xVoiceRules").value=vv.rules||""}
  const {data}=await sb.rpc("visit_stats");
  if(data)$("#visitStats").textContent=`כניסות: היום ${data.today} · 7 ימים ${data.week} · סה"כ ${data.total}`;
}
$("#drop").onclick=()=>$("#fFiles").click();
$("#drop").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();$("#fFiles").click()}};
["dragover","dragenter"].forEach(ev=>$("#drop").addEventListener(ev,e=>{e.preventDefault()}));
$("#drop").addEventListener("drop",e=>{e.preventDefault();addFiles(e.dataTransfer.files)});
$("#fFiles").onchange=e=>{addFiles(e.target.files);e.target.value=""};

let sid=0;
function addFiles(files){[...files].forEach(f=>{
  const kind=f.type.startsWith("video")?"video":f.type.startsWith("image")?"image":null; if(!kind) return;
  const it={sid:++sid,kind,name:f.name,progress:0,ready:false,ed:{...ED0},open:false};
  S.staged.push(it); renderStaged();
  const fr=new FileReader();
  fr.onprogress=e=>{if(e.lengthComputable){it.progress=e.loaded/e.total;bar(it)}};
  fr.onload=async()=>{
    if(kind==="image"){it.raw=await downscale(fr.result);it.orig=it.raw}
    else{it.blob=new Blob([fr.result],{type:f.type});it.url=URL.createObjectURL(it.blob)}
    it.progress=1;it.ready=true;renderStaged();
    if(kind==="image") queueSuggest();
  };
  kind==="image"?fr.readAsDataURL(f):fr.readAsArrayBuffer(f);
})}
function bar(it){const el=document.querySelector(`[data-sid="${it.sid}"] .prog i`);if(el)el.style.width=(it.progress*100)+"%"}
async function process(it){
  const ticket=(it.ticket||0)+1;it.ticket=ticket;it.busy=true;paint(it);
  const orig=await applyEdits(it.raw,it.ed);
  if(it.ticket!==ticket) return; // a newer edit superseded this one
  it.orig=orig;it.busy=false;paint(it);
  if(it.aiCut)it.cutMsg="התמונה השתנתה. כדאי להסיר רקע מחדש כדי שההמחשה תתאים.";
}
// Update only the previews of one item, so sliders keep working while dragging
function paint(it){
  const st=document.querySelector(`.st[data-sid="${it.sid}"]`);if(!st)return;
  const a=st.querySelector(".pv > img");if(a)a.src=it.orig;
  let bz=st.querySelector(".busy");if(it.busy&&!bz){bz=document.createElement("span");bz.className="busy";bz.textContent="מעבד…";st.querySelector(":scope > .row").before(bz)}if(!it.busy&&bz)bz.remove();
}
let edTimer=null;
function processSoon(it){clearTimeout(edTimer);edTimer=setTimeout(()=>process(it),250)}
function editorHTML(it){const e=it.ed;return `
  <div class="ed">
    <div class="row"><button type="button" class="pill small" data-a="rotL">↺ סיבוב</button><button type="button" class="pill small" data-a="rotR">↻ סיבוב</button><button type="button" class="pill small" data-a="flip">היפוך</button></div>
    <label>בהירות<input type="range" min="50" max="160" value="${e.b}" data-a="b"></label>
    <label>ניגודיות<input type="range" min="50" max="160" value="${e.c}" data-a="c"></label>
    <label>רוויה<input type="range" min="0" max="200" value="${e.s}" data-a="s"></label>
    <div class="row"><button type="button" class="pill small" data-a="auto">שיפור אוטומטי</button><button type="button" class="pill small" data-a="reset">איפוס</button></div>
  </div>`}
function renderStaged(){
  const h=+$("#fH").value||25;
  $("#staged").innerHTML=S.staged.map((it,k)=>`
    <div class="st" data-sid="${it.sid}">
      <div class="prog"><i style="width:${it.progress*100}%"></i></div>
      ${!it.ready?`<span>טוען ${esc(it.name)}…</span>`:it.kind==="video"?`<div class="pv"><video src="${it.url}" muted controls playsinline></video></div><span>וידאו</span>`:`
      <div class="pv">${it.aiCut?`<img src="${it.orig}" alt=""><div class="scene" style="--h:${heightFrac(h)}"><div class="room"></div><div class="piece cut"><img src="${it.aiCut}" alt=""></div><div class="glow"></div></div>`:`<img src="${it.orig}" alt="">`}</div>
      <label><input type="radio" name="illusPick" data-a="illus" ${it.illus?"checked":""}> התמונה להמחשה בחדר</label>
      ${it.illus?`<button type="button" class="pill small ai-btn" data-a="cutout" ${it.cutBusy?"disabled":""}>${it.cutBusy?"מסיר רקע… (עד דקה)":it.aiCut?"✂️ הסרת רקע מחדש":"✂️ הסרת רקע (ChatGPT)"}</button>`:""}
      ${it.illus&&it.aiCut?`<label><input type="checkbox" data-a="sceneOn" ${it.sceneOn?"checked":""}> להציג את ההמחשה באתר</label>`:""}
      ${it.illus?`<button type="button" class="pill small" data-a="noillus">בלי המחשה</button>`:""}
      ${it.cutMsg?`<span class="note">${esc(it.cutMsg)}</span>`:""}
      <button type="button" class="pill small" data-a="toggle" aria-expanded="${it.open}">${it.open?"סגירת העריכה":"עריכת תמונה"}</button>
      ${it.open?editorHTML(it):""}
      ${it.busy?`<span class="busy">מעבד…</span>`:""}`}
      <div class="row">${k>0&&it.kind==="image"?`<button type="button" class="pill small" data-a="first">לתמונה ראשית</button>`:it.kind==="image"?`<span class="note">תמונה ראשית</span>`:""}<button type="button" class="pill small danger" data-a="rm">הסרה</button></div>
    </div>`).join("");
}
const stOf=el=>{const st=el.closest(".st");return st&&S.staged.find(s=>s.sid==st.dataset.sid)};
$("#staged").addEventListener("input",e=>{const it=stOf(e.target);if(!it)return;const a=e.target.dataset.a;
  if(["b","c","s"].includes(a)){it.ed[a]=+e.target.value;processSoon(it)}
});
$("#staged").addEventListener("change",e=>{const it=stOf(e.target);if(!it)return;if(e.target.dataset.a==="illus"){S.staged.forEach(x=>{if(x!==it){x.illus=false;x.sceneOn=false}});it.illus=true;renderStaged()}if(e.target.dataset.a==="sceneOn"){it.sceneOn=e.target.checked}});
$("#staged").addEventListener("click",e=>{const b=e.target.closest("button[data-a]");if(!b)return;const it=stOf(b);const k=S.staged.indexOf(it);const a=b.dataset.a;
  if(a==="rm"){S.staged.splice(k,1);renderStaged();return}
  if(a==="first"){S.staged.unshift(...S.staged.splice(k,1));renderStaged();return}
  if(a==="toggle"){it.open=!it.open;renderStaged();return}
  if(a==="cutout"){makeCutout(it);return}
  if(a==="noillus"){it.illus=false;it.sceneOn=false;it.cutMsg="";renderStaged();return}
  if(a==="rotL")it.ed.rot-=90;if(a==="rotR")it.ed.rot+=90;if(a==="flip")it.ed.flip=!it.ed.flip;
  if(a==="auto")Object.assign(it.ed,{b:108,c:112,s:122});if(a==="reset")it.ed={...ED0};
  if(a==="auto"||a==="reset")renderStaged();
  process(it)});
$("#fH").oninput=()=>renderStaged();

$("#wf").onsubmit=async e=>{
  e.preventDefault();
  if(S.staged.some(s=>!s.ready||s.busy||s.cutBusy)){$("#fMsg").textContent="מחכה שהקבצים יסיימו להיטען.";return}
  if(!S.staged.length){$("#fMsg").textContent="צריך לפחות תמונה או וידאו אחד.";return}
  const fromExample=S.editing&&String(S.editing).startsWith("ex-");
  const id=S.editing&&!fromExample?S.editing:crypto.randomUUID();
  const before=S.editing&&!fromExample?structuredCloneSafe(S.works.find(w=>w.id===S.editing)):null;
  $("#fSave").disabled=true;
  try{
    const media=await uploadMedia(id,S.staged);
    const w={id,name:$("#fName").value.trim(),heightCm:+$("#fH").value,materials:$("#fMat").value.trim(),status:$("#fStatus").value,summary:$("#fSum").value.trim(),character:$("#fChar").value.trim(),category:$("#fCat").value,scale:$("#fScale").value.trim(),tech:$("#fTech").value,createdAt:before?before.createdAt:Date.now(),media};
    $("#fMsg").textContent="שומר…";
    await dbPut(w);
    if(fromExample)S.works=S.works.filter(x=>x.id!==S.editing);
    S.works=S.works.filter(x=>!x.example);
    upsert(w);
    pushHist(before?{type:"update",before,after:w}:{type:"add",after:w});
    resetForm();render();$("#fMsg").textContent="נשמר בגלריה.";toast("נשמר בגלריה");
  }catch(err){
    console.error(err);$("#fMsg").textContent="השמירה נכשלה: "+(err.message||err)+". שום דבר לא נמחק, אפשר לנסות שוב.";
  }finally{$("#fSave").disabled=false}
};
// Uploads every new or edited file; files already in storage keep their URLs
async function uploadMedia(id,items){
  const out=[],stamp=Date.now(),total=items.length;
  for(const [k,s] of items.entries()){
    const pre=`works/${id}/${stamp}-${k}`;
    const prog=(l,t)=>{$("#fMsg").textContent=`מעלה קובץ ${k+1} מתוך ${total}… ${Math.round(l/t*100)}%`};
    if(s.kind==="video"){
      const url=isRemote(s.url)?s.url:await uploadBlob(`${pre}.${extOf(s.blob.type)}`,s.blob,prog);
      out.push({kind:"video",url});continue;
    }
    const up=async(val,name)=>{if(!val||isRemote(val))return val||null;const b=b64Blob(val);return uploadBlob(`${pre}-${name}.${extOf(b.type)}`,b,prog)};
    const raw=await up(s.raw,"raw");
    const orig=s.orig===s.raw?raw:await up(s.orig,"img");
    out.push({kind:"image",raw,orig,illus:!!s.illus,aiCut:s.aiCut||null,sceneOn:!!(s.illus&&s.aiCut&&s.sceneOn),ed:s.ed});
  }
  return out;
}
function structuredCloneSafe(w){return w?{...w,media:w.media.map(m=>({...m}))}:null}
function upsert(w){const i=S.works.findIndex(x=>x.id===w.id);if(i>=0)S.works[i]=w;else S.works.push(w)}
function resetForm(){$("#wf").reset();$("#scaleWhy").textContent="";clearAiMarks();S.staged=[];S.editing=null;$("#fCancel").hidden=true;$("#fSave").textContent="שמירה בגלריה";$("#formTitle").textContent="יצירה חדשה";$("#aiOpts").innerHTML="";$("#aiPicked").hidden=true;$("#aiState").textContent="יופיעו אוטומטית אחרי העלאת תמונה.";renderStaged()}
$("#fCancel").onclick=resetForm;

function renderAdminList(){
  const list=[...S.works].sort((a,b)=>b.createdAt-a.createdAt);
  $("#adList").innerHTML=list.map(w=>{const im=firstImg(w);return `<div class="li" data-id="${esc(w.id)}">${im?`<img src="${im.orig}" alt="">`:""}<div class="t"><b>${esc(w.name)}${w.example?" · דוגמה":""}</b><span>${esc(w.heightCm)} ס"מ · ${w.status==="sale"?"זמין לרכישה":"מוצג בלבד"}</span></div><button class="pill small" data-a="edit">עריכה</button><button class="pill small danger" data-a="del">מחיקה</button></div>`}).join("");
  $("#undoBtn").disabled=!S.history.length;$("#undoNote").textContent=S.history.length?`${S.history.length} פעולות לביטול (עד 10)`:"";
}
$("#adList").addEventListener("click",async e=>{
  const b=e.target.closest("button[data-a]");if(!b)return;const row=b.closest(".li");const w=S.works.find(x=>x.id===row.dataset.id);
  if(b.dataset.a==="edit"){S.editing=w.id;$("#fName").value=w.name;$("#fH").value=w.heightCm;$("#fMat").value=w.materials||"";$("#fStatus").value=w.status;$("#fSum").value=w.summary||"";$("#fChar").value=w.character||"";$("#fCat").value=w.category||"";$("#fScale").value=w.scale||"";$("#fTech").value=w.tech||"";$("#scaleWhy").textContent="";clearAiMarks();
    S.staged=w.media.map(m=>({sid:++sid,kind:m.kind,name:"",progress:1,ready:true,raw:m.raw||m.orig,orig:m.orig,illus:!!m.illus,aiCut:m.aiCut||null,ed:m.ed||(m.enh?{...ED0,b:108,c:112,s:122}:{...ED0}),open:false,sceneOn:!!m.sceneOn,blob:m.blob,url:m.url}));
    $("#fCancel").hidden=false;$("#fSave").textContent="שמירת שינויים";$("#formTitle").textContent="עריכה: "+w.name;$("#aiOpts").innerHTML="";$("#aiState").textContent="לחץ \"הצעות חדשות\" כדי לקבל הצעות לתמונות האלה.";renderStaged();showTab("work");return}
  if(b.dataset.a==="del"){const cf=document.createElement("span");cf.className="confirm";cf.innerHTML=`למחוק? <button class="pill small danger" data-a="yes">כן, למחוק</button><button class="pill small" data-a="no">לא</button>`;b.replaceWith(cf);row.querySelector('[data-a="edit"]').hidden=true;return}
  if(b.dataset.a==="no"){renderAdminList();return}
  if(b.dataset.a==="yes"){if(w.example){S.works=S.works.filter(x=>x.id!==w.id);render();return}try{await dbDel(w.id);S.works=S.works.filter(x=>x.id!==w.id);pushHist({type:"delete",before:w});render()}catch(err){toast("המחיקה נכשלה, נסה שוב")}}
});
function pushHist(h){S.history.push(h);if(S.history.length>10)S.history.shift();renderAdminList()}
$("#undoBtn").onclick=async()=>{const h=S.history.pop();if(!h)return;
  try{
    if(h.type==="texts"){await putSetting("texts",h.before);TEXTS={...h.before};renderTexts();fillTextForm();toast("הטקסטים חזרו לגרסה הקודמת");renderAdminList();return}
    if(h.type==="add"){await dbDel(h.after.id);S.works=S.works.filter(x=>x.id!==h.after.id)}
    else{await dbPut(h.before);upsert(h.before)}
    render();toast("הפעולה בוטלה");
  }catch(err){S.history.push(h);toast("הביטול נכשל, נסה שוב")}};

/* ================= Admin tabs ================= */
function showTab(name){document.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.tab===name?"true":"false"));document.querySelectorAll("[data-pane]").forEach(p=>p.hidden=p.dataset.pane!==name);if(name==="list")renderAdminList();if(name==="room")renderRoomPrev()}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

/* ================= Landing texts (editable) ================= */
const DEFAULT_TEXTS={
  h1a:"כל פסל",h1hl:"נולד",h1b:"מהלב.",h1red:"בהדפסה.",
  p1:"אני נותן פתרונות יצירתיים. מאז ילדות אני פותר בעיות דרך אמנות: ציור, פיסול בנייר, פלסטלינה, חימר וקרטון. היום אני עובד עם **הדפסת תלת־ממד ביתית**: מידול, הדפסה וצביעה ידנית ייחודית.",
  p2:"יצרתי מתנות לאישי ציבור, שופטים, רופאים וכוחות ביטחון. רוב היצירות שלי מגיעות לאספנים שמחפשים פריט אחד במינו. **כל יצירה לוקחת ימים עד חודשים.**",
  burst:"יד\nאחת\nפסל אחד",ctaIg:"לעקוב באינסטגרם",ctaTt:"לצפות בטיקטוק"
};
let TEXTS={...DEFAULT_TEXTS};
const rich=t=>esc(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
function renderTexts(){
  const T=TEXTS;
  $("#tH1").innerHTML=`${esc(T.h1a)} ${T.h1hl?`<em>${esc(T.h1hl)}</em>`:""}<br>${esc(T.h1b)} ${T.h1red?`<b>${esc(T.h1red)}</b>`:""}`;
  $("#tP1").innerHTML=rich(T.p1);$("#tP2").innerHTML=rich(T.p2);$("#tP2").hidden=!T.p2;
  $("#tBurst").textContent=T.burst;$("#tBurst").hidden=!T.burst.trim();
  $("#igHero").textContent=T.ctaIg||"Instagram";$("#ttHero").textContent=T.ctaTt||"TikTok";
}
renderTexts();
const TF={h1a:"#xH1a",h1hl:"#xH1hl",h1b:"#xH1b",h1red:"#xH1red",p1:"#xP1",p2:"#xP2",burst:"#xBurst",ctaIg:"#xIg",ctaTt:"#xTt"};
function fillTextForm(){for(const k in TF)$(TF[k]).value=TEXTS[k]??""}
$("#tf").onsubmit=async e=>{e.preventDefault();const before={...TEXTS};for(const k in TF)TEXTS[k]=$(TF[k]).value;await putSetting("texts",TEXTS);pushHist({type:"texts",before,after:{...TEXTS}});renderTexts();$("#xMsg").textContent="נשמר. הדף הראשי עודכן."};
$("#xReset").onclick=()=>{TEXTS={...TEXTS,...DEFAULT_TEXTS};fillTextForm();$("#xMsg").textContent="הטקסט המקורי חזר לטופס. לחץ שמירה כדי להחיל."};

/* ================= Voice samples for the generator ================= */
let VOICE={samples:"",rules:""};
$("#vf").onsubmit=async e=>{e.preventDefault();VOICE={samples:$("#xVoice").value.trim(),rules:$("#xVoiceRules").value.trim()};await putSetting("voice",VOICE);$("#vMsg").textContent=VOICE.samples?"נשמר. ההצעות הבאות ייכתבו בסגנון הזה.":"נשמר. בלי דוגמאות, ההצעות ייכתבו בסגנון פופ־ארט כללי."};

/* ================= AI title + summary suggestions ================= */
let aiCtl=null,aiTimer=null;
// Smaller JPEG copies for the AI request (keeps the request well under the upload limit)
async function shrinkForAI(src,max=1024){const i=await loadImg(src);const k=Math.min(1,max/Math.max(i.width,i.height));const c=document.createElement("canvas");c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(i,0,0,c.width,c.height);return c.toDataURL("image/jpeg",.85)}
function queueSuggest(){clearTimeout(aiTimer);aiTimer=setTimeout(()=>{if(S.staged.some(s=>s.kind==="image"&&s.ready))suggest(false)},900)}
function buildPrompt(withImages){
  const v=VOICE.samples?`\n\nכך האמן כותב בפוסטים שלו (חקה את הטון, אורך המשפטים, הסלנג והפנייה לקהל. אל תעתיק משפטים):\n"""\n${VOICE.samples.slice(0,5000)}\n"""`:"\n\nאין דוגמאות כתיבה של האמן, אז כתוב כמו יוצר פופ־ארט: אנרגטי, צבעוני, משפטים קצרים, קצת הומור.";
  const r=VOICE.rules?`\nהנחיות נוספות מהאמן: ${VOICE.rules}`:"";
  const hint=$("#aiHint").value.trim(), name=$("#fName").value.trim(), mat=$("#fMat").value.trim(), h=$("#fH").value;
  return `אתה כותב טקסטים לגלריה של ARTRIKO, אמן ישראלי שמדפיס בתלת־ממד, ממדל וצובע ביד פסלים ייחודיים לאספנים.
${withImages?`המקור העיקרי שלך הוא התמונות המצורפות, כולן של אותו פסל.

שלב 1: זיהוי הדמות מהתמונות.`:`הפעם לא מצורפות תמונות. כתוב לפי הפרטים מהאמן בלבד, ואל תזכיר בטקסט שאין תמונות.

שלב 1: הדמות.`}
- זהה איזו דמות הפסל מתאר: גיבור קומיקס, דמות מסרט, סדרה, משחק, אנימה או מיתולוגיה. ציין גם גרסה אם רואים אותה (למשל תלבושת של סרט מסוים).
- תאר מה אתה רואה בפועל: תנוחה, צבעים, תלבושת, אביזרים, הבעה ופרטי צביעה.
- אם הפסל מתאר אדם אמיתי, אל תנחש את שמו. השתמש בשם רק אם הוא מופיע בפרטים מהאמן.
${hint?`
פרטים מהאמן על הדמות: "${hint}"
שלב את המידע הזה עם מה שרואים בתמונות. אם יש סתירה, הפרטים של האמן קובעים לגבי זהות הדמות, ומהתמונות קח את הפרטים הוויזואליים.`:`
האמן לא כתב פרטים, אז הסתמך רק על התמונות.`}

שלב 2: כתוב 3 הצעות שונות לכותרת ולתקציר בעברית. כל ההצעות מתמקדות בדמות.
- כותרת: עד 5 מילים בעברית, קליטה, בסגנון פופ־ארט. משחק מילים על הדמות מצוין. אל תכלול בכותרת את שם הדמות: האתר מוסיף אותו לבד בתחילת הכותרת, באנגלית ובאותיות גדולות.
- תקציר: 2–3 משפטים, עד 280 תווים. חייב לכלול:
  1. עובדה אמיתית ומעניינת על הדמות (היסטוריה, מקור, רגע מפורסם). רק עובדות שאתה בטוח בהן.
  2. ${withImages?"פרט ויזואלי אחד שבאמת רואים בתמונות של הפסל.":"משהו על כך שזה פסל מודפס וצבוע ביד."}
  3. משפט קצר שמזמין אספנים לפנות.
- כל הצעה בטון אחר: אחת מצחיקה, אחת מרגשת, אחת נועזת.
- אל תמציא פרטים טכניים (שעות עבודה, מחיר, חומרים) שלא נמסרו.${v}${r}
${name?`שם זמני שהאמן כתב: ${name}. `:""}${h?`גובה: ${h} ס"מ. `:""}${mat?`חומרים: ${mat}.`:""}

שלב 3: סיווג לפילטרים של הגלריה. השתמש בהגדרות האלה בדיוק:
CATEGORY (בחר אחת בלבד):
- Bust: רק ראש, כתפיים וחזה. בדרך כלל בלי ידיים ובלי פלג גוף תחתון.
- Diorama: סצנה דינמית עם סביבה או רקע מפורטים, אינטראקציה עם אביזרים, או כמה דמויות שמספרות סיפור.
- Statue: דמות בגוף מלא, בתנוחה סטטית או דינמית, על בסיס רגיל או מעוצב (בלי סביבה מלאה).
- Miniature: דמויות קטנות מאוד, בערך 2.8–7.5 ס"מ (גודל משחקי שולחן).
- Action Figure: רק אם רואים מפרקים להזזה או שהאמן כתב זאת. השתמש בזה לעיתים רחוקות.
SCALE: תן את הגובה האמיתי בס"מ של החלק שמוצג בפסל, לפי המציאות או לפי הלור של הדמות. לפסל מלא: גובה הדמות כולה (למשל ספיידרמן כ־178). לבאסט: גובה החלק המוצג במציאות, מקודקוד הראש ועד אמצע החזה, בערך 45–50 ס"מ לאדם רגיל. לדיורמה: גובה הדמות הראשית. האתר יחשב את קנה המידה מזה ומגובה הדגם${h?` (${h} ס"מ)`:""}.
TECH: FDM או Resin או FDM+Resin, לפי הטקסט של האמן או לפי רמזים ויזואליים: Resin לפרטים עדינים מאוד וחלקים קטנים, FDM לחלקים גדולים מאוד או לקווי שכבה נראים.

החזר JSON בלבד בצורה:
{"character":"שם הדמות או תיאור קצר אם לא זוהתה","characterEn":"השם הרשמי של הדמות באנגלית, למשל BATMAN או SPIDER-MAN. מחרוזת ריקה אם הדמות לא זוהתה או שהיא אדם אמיתי שהאמן לא נתן את שמו","confidence":"גבוה|בינוני|נמוך","seen":"משפט אחד על מה שרואים בתמונות","category":"Bust|Statue|Diorama|Miniature|Action Figure","referenceHeightCm":178,"referenceNote":"מה נמדד, למשל: גובה באטמן בקומיקס כ־188 ס\"מ","tech":"FDM|Resin|FDM+Resin","techReason":"משפט קצר","options":[{"title":"…","summary":"…"},{"title":"…","summary":"…"},{"title":"…","summary":"…"}]}`;
}
// Uniform title format: the character's English name in capitals, then the Hebrew tagline
function cleanEn(v){return String(v||"").replace(/\([^)]*\)/g," ").replace(/[^A-Za-z0-9 .'&:-]/g," ").replace(/\s+/g," ").trim().toUpperCase().slice(0,40)}
const escRe=x=>x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
function formatTitle(en,title,heName){
  let t=String(title||"").trim();
  if(!en)return t;
  // also drop the Hebrew name if the title starts with it
  const he=String(heName||"").split(/[(\-–—:,]/)[0].trim();
  if(he)t=t.replace(new RegExp("^"+escRe(he)+"\\s*[-–—:|·]*\\s*"),"");
  // drop the name if the model put it in anyway, plus any separator after it
  const re=new RegExp("^"+escRe(en)+"\\s*[-–—:|·]*\\s*","i");
  t=t.replace(re,"").replace(/^[-–—:|·\s]+/,"").trim();
  return t?`${en} – ${t}`:en;
}
async function suggest(fresh){
  aiCtl?.abort();aiCtl=new AbortController();const my=aiCtl;
  const imgs=S.staged.filter(s=>s.kind==="image"&&s.ready).slice(0,3);
  const hint=$("#aiHint").value.trim();
  if(!imgs.length&&!hint){$("#aiState").textContent="העלה תמונה או כתוב מי הדמות, ואז לחץ \"הצעות חדשות\".";return}
  $("#aiState").textContent=(imgs.length?`שולח ${imgs.length} תמונות ל־Gemini… `:"כותב לפי הפרטים שכתבת… ")+"(עד דקה)";
  $("#aiStop").hidden=false;$("#aiRun").disabled=true;
  try{
    const images=await Promise.all(imgs.map(s=>shrinkForAI(s.orig)));
    const {data:{session}}=await sb.auth.getSession();
    const r=await fetch("/api/suggest",{method:"POST",signal:my.signal,headers:{"Content-Type":"application/json",Authorization:"Bearer "+(session?.access_token||"")},body:JSON.stringify({prompt:buildPrompt(images.length>0),images})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)throw {code:j.code||"upstream_error",message:j.error};
    let out=j.result||{};
    const en=cleanEn(out.characterEn);
    const list=(Array.isArray(out.options)?out.options:[]).filter(o=>o&&o.title).slice(0,3).map(o=>({...o,title:formatTitle(en,o.title,out.character)}));
    if(!list.length)throw{code:"invalid_json"};
    applyCategorization(out);
    const who=out.character?`<div class="opt-who"><span>הדמות: <b>${esc(out.character)}</b>${out.confidence?` · ביטחון ${esc(out.confidence)}`:""}</span>${out.seen?`<small>${esc(out.seen)}</small>`:""}<small>לא מדויק? כתוב את הדמות בשדה למעלה ולחץ "הצעות חדשות".</small></div>`:"";
    $("#aiPicked").hidden=true;
    $("#aiOpts").innerHTML=who+list.map((o,i)=>`<div class="opt" data-i="${i}"><b>${esc(o.title)}</b><p>${esc(o.summary||"")}</p><div class="row"><button type="button" class="pill small" data-use="${i}">להשתמש בזו</button></div></div>`).join("");
    $("#aiOpts").dataset.json=JSON.stringify(list);
    $("#aiState").textContent=(images.length?`נשלחו ${images.length} תמונות. `:"")+"בחר הצעה. אפשר לערוך אחרי שהיא נכנסת לטופס.";
  }catch(e){
    const code=e?.name==="AbortError"?"cancelled":e?.code;
    const msg={cancelled:"נעצר.",no_key:"מפתח Gemini עוד לא הוגדר ב־Vercel (GEMINI_API_KEY).",not_admin:"צריך להיות מחובר כמנהל.",rate_limited:"יותר מדי בקשות ל־Gemini. נסה שוב בעוד דקה.",too_large:"התמונות גדולות מדי. נסה פחות תמונות.",invalid_json:"התשובה לא הגיעה בפורמט הנכון. לחץ \"הצעות חדשות\".",refused:"Gemini לא כתב הצעה לתמונות האלה. נסה להוסיף פרטים על הדמות."}[code]||"משהו השתבש. לחץ \"הצעות חדשות\" כדי לנסות שוב.";
    if(my===aiCtl)$("#aiState").textContent=msg;
  }finally{if(my===aiCtl){$("#aiStop").hidden=true;$("#aiRun").disabled=false}}
}
$("#aiRun").onclick=()=>suggest(true);
$("#aiHint").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();suggest(true)}});
$("#aiStop").onclick=()=>aiCtl?.abort();
$("#aiOpts").addEventListener("click",e=>{const b=e.target.closest("[data-use]");if(!b)return;const o=JSON.parse($("#aiOpts").dataset.json||"[]")[+b.dataset.use];if(!o)return;
  $("#fName").value=o.title;$("#fSum").value=o.summary||"";
  document.querySelectorAll(".opt").forEach(x=>{const on=x.dataset.i===b.dataset.use;x.classList.toggle("used",on);const btn=x.querySelector("[data-use]");btn.textContent=on?"✓ נבחרה":"להשתמש בזו";btn.setAttribute("aria-pressed",on)});
  ["#fName","#fSum"].forEach(id=>{const el=$(id);el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash")});
  $("#aiPicked").hidden=false;$("#aiPickedText").textContent=`השם והתקציר בטופס עודכנו ל"${o.title}". אפשר לערוך אותם שם.`;
  toast("ההצעה נכנסה לטופס")});
$("#aiSeeForm").onclick=()=>{$("#fName").scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>$("#fName").focus({preventScroll:true}),400)};

/* ================= Apply AI categorization to the form ================= */
function clearAiMarks(){document.querySelectorAll(".ai-filled").forEach(el=>el.classList.remove("ai-filled"));$("#catState").textContent="יתמלא אוטומטית אחרי ניתוח התמונות. אפשר לשנות ידנית."}
function setAi(id,val){const el=$(id);if(val==null||val==="")return;el.value=val;el.classList.add("ai-filled");el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash")}
let lastRef=null;
function applyCategorization(o){
  if(!o)return;
  if(o.character)setAi("#fChar",String(o.character).slice(0,80));
  if(CATS.some(c=>c.v===o.category))setAi("#fCat",o.category);
  if(["FDM","Resin","FDM+Resin"].includes(o.tech))setAi("#fTech",o.tech);
  lastRef=+o.referenceHeightCm||null;
  updateScale(o.referenceNote,o.techReason);
  $("#catState").textContent="מולא על ידי AI (מסומן בכחול). בדוק ושנה אם צריך.";
}
function updateScale(note,techReason){
  const sc=calcScale(lastRef,$("#fH").value);
  if(sc)setAi("#fScale",sc.label);
  const parts=[];
  if(lastRef)parts.push(`קנה מידה: ${note?note+". ":""}${sc?`${lastRef} ס"מ במציאות ÷ ${$("#fH").value} ס"מ בדגם ≈ 1:${sc.ratio.toFixed(1)}.`:"מלא גובה בס\"מ כדי לחשב."}`);
  if(techReason)parts.push(`טכנולוגיה: ${techReason}`);
  if(parts.length)$("#scaleWhy").textContent=parts.join(" ");
}
$("#fH").addEventListener("input",()=>{if(lastRef)updateScale()});

/* ================= Background removal (OpenAI) for the in-room illustration ================= */
const CUT_ERR={not_admin:"צריך להיות מחובר כמנהל.",no_key:"מפתח OpenAI לא מוגדר ב־Vercel (OPENAI_API_KEY).",bad_key:"מפתח OpenAI לא תקין. בדוק אותו ב־Vercel.",rate_limited:"יותר מדי בקשות. נסה שוב בעוד דקה.",needs_billing:"בחשבון OpenAI צריך קרדיט או אמצעי תשלום (Billing) כדי להשתמש במודל התמונות.",needs_verification:"OpenAI דורשים אימות ארגון (Verify Organization) בחשבון כדי להשתמש במודל התמונות.",upload_failed:"שמירת התמונה נכשלה. נסה שוב.",refused:"OpenAI סירבו לעבד את התמונה הזו."};
// Crops a transparent PNG to the statue itself, so its height in the picture equals the statue's real height
async function trimAlpha(url){
  const i=await loadImg(url);const c=document.createElement("canvas");c.width=i.width;c.height=i.height;const x=c.getContext("2d");x.drawImage(i,0,0);
  const d=x.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;
  for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++){if(d[(y*c.width+xx)*4+3]>24){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(y<y0)y0=y;if(y>y1)y1=y}}
  if(x1<0)throw {code:"empty",message:"לא נשאר כלום אחרי הסרת הרקע"};
  const o=document.createElement("canvas");o.width=x1-x0+1;o.height=y1-y0+1;o.getContext("2d").drawImage(c,x0,y0,o.width,o.height,0,0,o.width,o.height);
  return new Promise(r=>o.toBlob(r,"image/png"));
}
async function makeCutout(it){
  it.cutBusy=true;it.cutMsg="";renderStaged();
  try{
    const image=await shrinkForAI(it.orig,1536);
    const {data:{session}}=await sb.auth.getSession();
    const r=await fetch("/api/cutout",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+(session?.access_token||"")},body:JSON.stringify({image})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)throw {code:j.code,message:j.error};
    const png=await trimAlpha(j.url);
    it.aiCut=await uploadBlob(`cutouts/${crypto.randomUUID()}.png`,png);
    it.sceneOn=false;
    it.cutMsg="הרקע הוסר. ההמחשה מוצגת כרגע רק כאן. כדי שתופיע באתר, סמן \"להציג את ההמחשה באתר\" ושמור.";
  }catch(e){it.cutMsg=CUT_ERR[e?.code]||("הסרת הרקע נכשלה"+(e?.message?": "+e.message:"")+". נסה שוב.")}
  it.cutBusy=false;renderStaged();
}

/* ================= Room photo + scale calibration (admin) ================= */
let calStep=0,calP1=null;
function renderRoomPrev(){
  const c=cal();
  const w=[...S.works].sort((a,b)=>b.createdAt-a.createdAt).find(illusOf);
  const marks=`<span class="cal-line" style="left:${c.x1*100}%;width:${(c.x2-c.x1)*100}%;top:${c.y*100}%"><b>${c.cm} ס"מ</b></span>${calP1?`<span class="cal-dot" style="left:${calP1.x*100}%;top:${calP1.y*100}%"></span>`:""}`;
  $("#roomPrev").innerHTML=(w?sceneHTML(w,true):`<div class="scene"><div class="room"></div><div class="glow"></div></div>`).replace(/<\/div>$/,marks+"</div>");
  $("#calCm").value=c.cm;
  $("#roomScale").value=Math.round(Math.max(.7,Math.min(1.3,ROOM?.scale||1))*100);$("#roomShadow").value=ROOM?.shadow??-12;
  $("#roomReset").disabled=!ROOM;
  if(!calStep)$("#roomMsg").textContent=(ROOM?.img?"מוצגת תמונת הרקע שלך. ":"מוצג החדר המאויר. ")+(w?"בתצוגה: הפסל האחרון שיש לו המחשה.":"עוד אין פסל עם המחשה. הסר רקע לתמונה בטופס היצירה כדי לראות כאן דוגמה.");
}
function saveRoom(){applyRoom();renderRoomPrev();return putSetting("room",ROOM).catch(()=>toast("השמירה נכשלה"))}
$("#calStart").onclick=()=>{calStep=1;calP1=null;$("#roomMsg").textContent="לחץ על הקצה השמאלי של משטח השידה (איפה שהפסל עומד).";};
$("#roomPrev").addEventListener("click",e=>{
  if(!calStep)return;const sc=e.target.closest(".scene");if(!sc)return;const r=sc.getBoundingClientRect();
  const p={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};
  if(calStep===1){calP1=p;calStep=2;renderRoomPrev();$("#roomMsg").textContent="עכשיו לחץ על הקצה הימני של משטח השידה.";return}
  const x1=Math.min(calP1.x,p.x),x2=Math.max(calP1.x,p.x);
  if(x2-x1<.05){$("#roomMsg").textContent="שתי הנקודות קרובות מדי. לחץ שוב על \"סימון השידה\".";calStep=0;calP1=null;renderRoomPrev();return}
  ROOM={...(ROOM||{}),x1:+x1.toFixed(4),x2:+x2.toFixed(4),y:+((calP1.y+p.y)/2).toFixed(4)};
  calStep=0;calP1=null;saveRoom();$("#roomMsg").textContent="נשמר. הפסלים יעמדו במרכז השידה, בגודל שמחושב לפי הגובה שלהם.";
});
$("#calCm").onchange=e=>{const v=+e.target.value;if(!(v>=10&&v<=500))return;ROOM={...(ROOM||{}),cm:v};saveRoom()};
async function cropRoom(src){
  const i=await loadImg(src);const W=1000,H=1250,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const k=Math.max(W/i.width,H/i.height),dw=i.width*k,dh=i.height*k;x.drawImage(i,(W-dw)/2,(H-dh)/2,dw,dh);
  const d=x.getImageData(0,0,W,H).data;let r=0,g=0,b=0,n=0;for(let p=0;p<d.length;p+=4*37){r+=d[p];g+=d[p+1];b+=d[p+2];n++}r/=n;g/=n;b/=n;
  const lum=(.299*r+.587*g+.114*b)/255,warm=(r-b)/255;
  return {img:c.toDataURL("image/jpeg",.88),sep:Math.max(0,Math.min(.35,warm*.6)),br:Math.max(.7,Math.min(1.08,.6+lum*.8))};
}
$("#roomPick").onclick=()=>$("#roomFile").click();
$("#roomFile").onchange=async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;$("#roomMsg").textContent="מעבד את התמונה…";
  const fr=new FileReader();fr.onload=async()=>{try{const t=await cropRoom(fr.result);const url=await uploadBlob(`room/room-${Date.now()}.jpg`,b64Blob(t.img),(l,tt)=>{$("#roomMsg").textContent=`מעלה… ${Math.round(l/tt*100)}%`});ROOM={scale:1,shadow:-12,...(ROOM||{}),...t,img:url,x1:null,x2:null};applyRoom();await putSetting("room",ROOM);renderRoomPrev();}catch(err){$("#roomMsg").textContent="ההעלאה נכשלה: "+err.message;return}$("#roomMsg").textContent="עכשיו לחץ \"סימון השידה\" וסמן את שני הקצוות של משטח השידה."};fr.readAsDataURL(f)};
$("#roomScale").oninput=e=>{ROOM={...(ROOM||{}),scale:+e.target.value/100};applyRoom()};
$("#roomShadow").oninput=e=>{ROOM={...(ROOM||{}),shadow:+e.target.value};applyRoom()};
["#roomScale","#roomShadow"].forEach(id=>$(id).onchange=()=>saveRoom());
$("#roomReset").onclick=async()=>{ROOM=null;applyRoom();await putSetting("room",null);renderRoomPrev()};

/* ================= Collector guide ================= */
const INK="#f6ead8",SUN="#ffd23f",POP="#ff3b5c",SKY="#2ec4ff",LINE="#3a2a30",DIM="#bfae9c";
// A simple standing figure: feet at (cx,fy), total height h
function person(cx,fy,h,fill,stroke=INK){
  const u=h/100,t=fy-h,sw=Math.max(1,1.4*u);
  return `<g fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round">
    <rect x="${cx-16*u}" y="${t+19*u}" width="${5*u}" height="${32*u}" rx="${2.5*u}"/><rect x="${cx+11*u}" y="${t+19*u}" width="${5*u}" height="${32*u}" rx="${2.5*u}"/>
    <rect x="${cx-10*u}" y="${t+52*u}" width="${9*u}" height="${48*u}" rx="${2*u}"/><rect x="${cx+1*u}" y="${t+52*u}" width="${9*u}" height="${48*u}" rx="${2*u}"/>
    <rect x="${cx-11*u}" y="${t+18*u}" width="${22*u}" height="${38*u}" rx="${4*u}"/>
    <circle cx="${cx}" cy="${t+8.5*u}" r="${8.5*u}"/>
  </g>`;
}
function illSVG(kind){
  const v='viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" role="img" style="direction:ltr"';
  const base=(cx,w,y)=>`<ellipse cx="${cx}" cy="${y+8}" rx="${w/2}" ry="9" fill="#2b2b31" stroke="${INK}" stroke-width="2"/><rect x="${cx-w/2}" y="${y-6}" width="${w}" height="14" fill="#3c3c44" stroke="${INK}" stroke-width="2"/><ellipse cx="${cx}" cy="${y-6}" rx="${w/2}" ry="9" fill="#55555f" stroke="${INK}" stroke-width="2"/>`;
  if(kind==="bust") return `<svg ${v} aria-label="איור של באסט">${base(160,120,200)}
    <path d="M95 190 Q100 140 160 135 Q220 140 225 190 Z" fill="${POP}" stroke="${INK}" stroke-width="3"/>
    <rect x="146" y="112" width="28" height="30" fill="#f0c29b" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="160" cy="88" rx="34" ry="40" fill="#f0c29b" stroke="${INK}" stroke-width="3"/>
    <path d="M126 80 Q130 44 160 46 Q192 44 194 80 Q180 62 160 64 Q140 62 126 80Z" fill="#2b1a14" stroke="${INK}" stroke-width="3"/>
    <circle cx="148" cy="90" r="3.5" fill="#140b0d"/><circle cx="172" cy="90" r="3.5" fill="#140b0d"/>
    <text x="300" y="30" text-anchor="end" fill="${DIM}" font-size="13" font-family="Assistant,sans-serif">ראש · כתפיים · חזה</text></svg>`;
  if(kind==="statue") return `<svg ${v} aria-label="איור של פסל מלא">${base(160,110,206)}${person(160,200,170,SKY)}
    <text x="300" y="30" text-anchor="end" fill="${DIM}" font-size="13" font-family="Assistant,sans-serif">גוף מלא על בסיס</text></svg>`;
  if(kind==="diorama") return `<svg ${v} aria-label="איור של דיורמה">
    <path d="M20 206 L300 206 L286 222 L34 222 Z" fill="#3c3c44" stroke="${INK}" stroke-width="2"/>
    <rect x="20" y="196" width="280" height="12" fill="#55555f" stroke="${INK}" stroke-width="2"/>
    <path d="M200 196 V70 h30 v-14 h20 v14 h30 V196 Z" fill="#4a2a33" stroke="${INK}" stroke-width="2.5"/>
    <rect x="216" y="96" width="18" height="26" fill="${SUN}" stroke="${INK}" stroke-width="2"/><rect x="250" y="96" width="18" height="26" fill="#1a1114" stroke="${INK}" stroke-width="2"/>
    <path d="M44 196 l14 -30 l10 18 l8 -12 l12 24 Z" fill="#6b5a4a" stroke="${INK}" stroke-width="2"/>
    ${person(110,196,108,POP)}${person(165,196,96,SKY)}
    <path d="M128 120 L150 128" stroke="${SUN}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="150" cy="128" r="9" fill="${SUN}" opacity=".85"/>
    <text x="20" y="30" fill="${DIM}" font-size="13" font-family="Assistant,sans-serif">סביבה · כמה דמויות · סיפור</text></svg>`;
  if(kind==="mini") return `<svg ${v} aria-label="איור של מיניאטורה ליד קובייה רגילה">
    <ellipse cx="125" cy="200" rx="30" ry="8" fill="#2b2b31" stroke="${INK}" stroke-width="2"/><rect x="95" y="191" width="60" height="9" fill="#3c3c44" stroke="${INK}" stroke-width="2"/><ellipse cx="125" cy="191" rx="30" ry="8" fill="#55555f" stroke="${INK}" stroke-width="2"/>
    ${person(125,189,128,POP)}
    <rect x="196" y="136" width="64" height="64" rx="10" fill="${INK}" stroke="#140b0d" stroke-width="3"/>
    <circle cx="211" cy="151" r="5.5" fill="#140b0d"/><circle cx="228" cy="168" r="5.5" fill="#140b0d"/><circle cx="245" cy="185" r="5.5" fill="#140b0d"/>
    <path d="M60 61 V189 M54 61 h12 M54 189 h12" stroke="${SKY}" stroke-width="2"/><text x="52" y="130" text-anchor="end" fill="${SKY}" font-size="13" font-family="Assistant,sans-serif">32 מ"מ</text>
    <path d="M276 136 V200 M270 136 h12 M270 200 h12" stroke="${SKY}" stroke-width="2"/><text x="286" y="172" fill="${SKY}" font-size="13" font-family="Assistant,sans-serif">16 מ"מ</text>
    <text x="300" y="30" text-anchor="end" fill="${DIM}" font-size="13" font-family="Assistant,sans-serif">בערך פי שניים מקובייה רגילה</text></svg>`;
  if(kind==="action") return `<svg ${v} aria-label="איור של דמות מפרקית">${base(160,100,206)}${person(160,200,170,"#6b6b75")}
    ${[[160,61],[146,65],[174,65],[146,87],[174,87],[151,121],[169,121],[151,152],[169,152]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="${SUN}" stroke="#140b0d" stroke-width="2"/>`).join("")}
    <text x="300" y="30" text-anchor="end" fill="${DIM}" font-size="13" font-family="Assistant,sans-serif">מפרקים מסומנים בצהוב</text></svg>`;
  if(kind==="resin") return `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="direction:ltr" role="img" aria-label="איור של מדפסת רזין">
    <rect x="70" y="14" width="180" height="16" fill="#55555f" stroke="${INK}" stroke-width="2"/>
    <rect x="152" y="30" width="16" height="22" fill="#55555f" stroke="${INK}" stroke-width="2"/>
    <rect x="100" y="52" width="120" height="10" fill="#9aa0aa" stroke="${INK}" stroke-width="2"/>
    <path d="M135 62 h50 v10 q-6 22 -25 26 q-19 -4 -25 -26 z" fill="${SKY}" stroke="${INK}" stroke-width="2"/>
    ${[0,1,2,3,4].map(k=>`<line x1="${142+k*9}" y1="98" x2="${142+k*9}" y2="110" stroke="${INK}" stroke-width="1.5"/>`).join("")}
    <path d="M80 110 h160 v26 h-160 z" fill="rgba(255,190,60,.45)" stroke="${INK}" stroke-width="2"/>
    <rect x="70" y="136" width="180" height="26" fill="#2b2b31" stroke="${INK}" stroke-width="2"/>
    ${[0,1,2,3,4,5].map(k=>`<line x1="${110+k*20}" y1="160" x2="${120+k*16}" y2="128" stroke="#b46cff" stroke-width="3" opacity=".8"/>`).join("")}
    <text x="262" y="126" fill="${DIM}" font-size="12" font-family="Assistant,sans-serif">שרף נוזלי</text>
    <text x="262" y="156" fill="${DIM}" font-size="12" font-family="Assistant,sans-serif">אור UV</text>
    <text x="230" y="80" fill="${DIM}" font-size="12" font-family="Assistant,sans-serif">הדגם נבנה הפוך</text></svg>`;
  if(kind==="fdm") return `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="direction:ltr" role="img" aria-label="איור של מדפסת FDM">
    <path d="M30 20 q30 -14 60 6" fill="none" stroke="${SUN}" stroke-width="4"/>
    <rect x="86" y="18" width="70" height="34" fill="#55555f" stroke="${INK}" stroke-width="2"/>
    <path d="M112 52 h18 l-6 14 h-6 z" fill="#c9a24a" stroke="${INK}" stroke-width="2"/>
    ${[0,1,2,3,4,5,6,7].map(k=>`<rect x="${100-k*1}" y="${140-k*9}" width="${120+k*2}" height="8" rx="4" fill="${k===7?SUN:POP}" stroke="#140b0d" stroke-width="1.5"/>`).join("")}
    <rect x="60" y="148" width="200" height="12" fill="#3c3c44" stroke="${INK}" stroke-width="2"/>
    <text x="164" y="30" fill="${DIM}" font-size="12" font-family="Assistant,sans-serif">ראש הדפסה חם</text>
    <text x="232" y="110" fill="${DIM}" font-size="12" font-family="Assistant,sans-serif">שכבה על שכבה</text>
    <text x="20" y="48" fill="${DIM}" font-size="12" font-family="Assistant,sans-serif">חוט פלסטיק</text></svg>`;
  return "";
}
function scaleChartSVG(){
  // Every figure drawn with the same px-per-cm, so the sizes compare truly
  const W=760,G=250,PX=200/180,items=[["1:1",180],["1:2",90],["1:3",60],["1:4",45],["1:6",30],["1:10",18]];
  const gap=W/(items.length+0.4);
  let out=`<svg viewBox="0 0 ${W} 300" xmlns="http://www.w3.org/2000/svg" style="direction:ltr" role="img" aria-label="השוואת גובה של דמות אדם בכל סקייל">`;
  [0,50,100,150,200].forEach(cm=>{const y=G-cm*PX;out+=`<line x1="30" x2="${W-10}" y1="${y}" y2="${y}" stroke="${LINE}" stroke-width="1"/><text x="26" y="${y+4}" text-anchor="end" fill="${DIM}" font-size="11" font-family="Assistant,sans-serif">${cm}</text>`});
  out+=`<text x="26" y="20" text-anchor="end" fill="${DIM}" font-size="11" font-family="Assistant,sans-serif">ס"מ</text>`;
  items.forEach(([lbl,cm],i)=>{const cx=70+gap*(i+0.5);const h=cm*PX;
    out+=person(cx,G,h,i===0?"#3a2a30":[POP,SKY,SUN,POP,SKY][i-1]);
    out+=`<text x="${cx}" y="${G+22}" text-anchor="middle" fill="${INK}" font-size="18" font-weight="800" font-family="Assistant,sans-serif">${lbl}</text><text x="${cx}" y="${G+40}" text-anchor="middle" fill="${DIM}" font-size="12" font-family="Assistant,sans-serif">${cm} ס"מ</text>`});
  return out+`<line x1="30" x2="${W-10}" y1="${G}" y2="${G}" stroke="${INK}" stroke-width="2"/></svg>`;
}
document.querySelectorAll("[data-ill]").forEach(el=>el.innerHTML=illSVG(el.dataset.ill));
$("#scaleChart").innerHTML=scaleChartSVG();
function calcGuide(){
  const r=+$("#cReal").value,m=+$("#cModel").value;
  if(!(r>0&&m>0)){$("#cOut").textContent="מלא את שני הגבהים.";return}
  const sc=calcScale(r,m);
  $("#cOut").innerHTML=`<b>1:${(r/m).toFixed(1).replace(/\.0$/,"")}</b> הכי קרוב לסקייל <strong>${esc(sc.label)}</strong>`;
}
["#cReal","#cModel"].forEach(id=>$(id).addEventListener("input",calcGuide));calcGuide();
$("#igGuide").href=CFG.instagram;$("#ttGuide").href=CFG.tiktok;
document.querySelectorAll("[data-goto]").forEach(b=>b.onclick=()=>{S.filter={cat:b.dataset.goto,tech:"",sale:false};render();location.hash="gallery"});

/* ================= Page routing (#guide) ================= */
function route(){
  const g=location.hash==="#guide";
  $("#homePage").hidden=g;$("#guidePage").hidden=!g;
  if(g){window.scrollTo(0,0);return}
  const t=location.hash&&location.hash.length>1?document.getElementById(location.hash.slice(1)):null;
  if(t&&t.id!=="top")requestAnimationFrame(()=>t.scrollIntoView());else window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);route();

/* ================= Boot ================= */
(async()=>{
  const v=load("view2");if(v==="room"){S.view="room";press($("#vRoom").parentNode,$("#vRoom"))}
  const sz=+load("size");setSize(sz||300);
  const cols=load("cols");if(cols){$("#grid").className="grid cols-"+cols;press(document.querySelector("[data-cols]").parentNode,document.querySelector(`[data-cols="${cols}"]`))}
  const t=await getSetting("texts");if(t)TEXTS={...DEFAULT_TEXTS,...t};renderTexts();fillTextForm();
  const rm=await getSetting("room");if(rm){ROOM=rm;applyRoom()}
  const stored=await dbAll();
  if(stored&&stored.length) S.works=stored.map(hydrate);
  else S.works=SAMPLES.map(s=>{const png=drawSample(s.kind);return {...s,example:true,media:[{kind:"image",orig:png,raw:png,cut:png}]}});
  render();
  const isAdmin=await checkAdmin();
  const q=new URLSearchParams(location.search);
  if(q.has("admin")){history.replaceState(null,"",location.pathname+location.hash);if(isAdmin)openAdmin("account");else if((await sb.auth.getSession()).data.session)toast("המשתמש הזה לא מוגדר כמנהל")}
  // Count the visit (the server ignores repeats from the same IP within 10 minutes); admins are not counted
  if(!isAdmin){try{fetch("/api/visit",{method:"POST",keepalive:true})}catch(e){}}
})();
sb.auth.onAuthStateChange(ev=>{if(ev==="PASSWORD_RECOVERY")openAdmin("account")});
