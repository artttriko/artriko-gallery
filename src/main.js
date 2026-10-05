import "./style.css";
import "./motion.css";
import "./motion.js";
import "./heroes.js";
import { setStudio, STUDIO_DEFAULT, setCaption } from "./studio.js";
import { pickLine, cacheLines, DEFAULT_INTRO, DEFAULT_STUDIO } from "./lines.js";
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
const toRow=w=>({sort_order:w.order==null?null:+w.order,section:w.section==="gift"?"gift":"collect",mount:w.mount==="wall"?"wall":"stand",id:w.id,name:w.name,height_cm:w.heightCm===""||w.heightCm==null?null:+w.heightCm,materials:w.materials||null,status:w.status,summary:w.summary||null,character:w.character||null,category:w.category||null,scale:w.scale||null,tech:w.tech||null,media:w.media,created_at:new Date(w.createdAt).toISOString(),updated_at:new Date().toISOString()});
const fromRow=r=>({order:r.sort_order==null?null:+r.sort_order,section:r.section==="gift"?"gift":"collect",mount:r.mount==="wall"?"wall":"stand",id:r.id,name:r.name,heightCm:r.height_cm==null?"":+r.height_cm,materials:r.materials||"",status:r.status,summary:r.summary||"",character:r.character||"",category:r.category||"",scale:r.scale||"",tech:r.tech||"",media:Array.isArray(r.media)?r.media:[],createdAt:Date.parse(r.created_at)});
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
const S={email:"",q:"",filter:{cat:"",tech:"",sale:false},works:[],view:"flat",admin:false,history:[],editing:null,staged:[]};
const firstImg=w=>w.media.find(m=>m.kind==="image");
const heightFrac=cm=>{const c=cal();return Math.max(.02,Math.min(.95,(+cm||25)*((c.x2-c.x1)/c.cm)*.8))};

const illusOf=w=>w.media.find(m=>m.kind==="image"&&m.illus&&m.aiCut);
/* ================= Size illustration: a plain room with a height ruler and a familiar object ================= */
// Everyday objects people know the size of (approximate real sizes in cm)
const REFS={
  can:{he:"פחית שתייה",h:12.2,w:6.6},
  mug:{he:"ספל קפה",h:9.5,w:11},
  phone:{he:"טלפון",h:14.7,w:7.1},
  bottle:{he:"בקבוק 1.5 ליטר",h:31,w:9},
  ball:{he:"כדורגל",h:22,w:22},
  hand:{he:"כף יד",h:19,w:9.5}
};
let REF="can";try{const r=localStorage.getItem("artriko.ref");if(REFS[r])REF=r}catch(e){}
function setRef(k){if(!REFS[k])return;REF=k;try{localStorage.setItem("artriko.ref",k)}catch(e){}}
const niceCeil=v=>[20,25,30,40,50,60,80,100,120,150,200,250,300,400].find(n=>n>=v)||Math.ceil(v/100)*100;
function refSVG(k,x,floor){ // object drawn in cm, standing on the floor, centred on x
  const o=REFS[k],h=o.h,w=o.w,y=floor-h,L=x-w/2,ink="#130d10",lw=Math.max(.12,h*.012);
  if(k==="can")return `<g><rect x="${L}" y="${y+.5}" width="${w}" height="${h-.8}" rx="${w*.12}" fill="#d8233a" stroke="${ink}" stroke-width="${lw}"/>
    <rect x="${L}" y="${y}" width="${w}" height="${h*.07}" rx="${w*.1}" fill="#c9c9cf" stroke="${ink}" stroke-width="${lw}"/>
    <rect x="${L}" y="${floor-h*.06}" width="${w}" height="${h*.06}" rx="${w*.1}" fill="#b9b9bf" stroke="${ink}" stroke-width="${lw}"/>
    <rect x="${L+w*.16}" y="${y+h*.12}" width="${w*.12}" height="${h*.74}" rx="${w*.06}" fill="#fff" opacity=".35"/>
    <path d="M${L} ${y+h*.55} q${w/2} ${-h*.12} ${w} 0" stroke="#fff" stroke-width="${h*.035}" fill="none" opacity=".85"/></g>`;
  if(k==="mug")return `<g><path d="M${L+w*.74} ${y+h*.25} h${w*.08} a${w*.18} ${h*.22} 0 0 1 0 ${h*.44} h${-w*.14}" fill="none" stroke="#e9e2d6" stroke-width="${w*.08}"/>
    <rect x="${L}" y="${y}" width="${w*.78}" height="${h}" rx="${w*.08}" fill="#efe8dc" stroke="${ink}" stroke-width="${lw}"/>
    <ellipse cx="${L+w*.39}" cy="${y+h*.02}" rx="${w*.37}" ry="${h*.05}" fill="#3a2418"/></g>`;
  if(k==="phone")return `<g><rect x="${L}" y="${y}" width="${w}" height="${h}" rx="${w*.14}" fill="#1b1b1f" stroke="#55555f" stroke-width="${lw*1.4}"/>
    <rect x="${L+w*.07}" y="${y+h*.04}" width="${w*.86}" height="${h*.92}" rx="${w*.1}" fill="#2a3550"/>
    <rect x="${L+w*.07}" y="${y+h*.04}" width="${w*.86}" height="${h*.92}" rx="${w*.1}" fill="url(#scrGlow)"/>
    <rect x="${x-w*.14}" y="${y+h*.06}" width="${w*.28}" height="${h*.025}" rx="${h*.012}" fill="#000"/></g>`;
  if(k==="bottle")return `<g><path d="M${x-w*.17} ${y} h${w*.34} v${h*.07} c0 ${h*.06} ${w*.33} ${h*.1} ${w*.33} ${h*.22} v${h*.67} a${w*.1} ${w*.1} 0 0 1 ${-w*.1} ${w*.1} h${-w*.8} a${w*.1} ${w*.1} 0 0 1 ${-w*.1} ${-w*.1} v${-h*.67} c0 ${-h*.12} ${w*.33} ${-h*.16} ${w*.33} ${-h*.22} z" fill="#9fd3ee" fill-opacity=".45" stroke="#cfeaf7" stroke-width="${lw}"/>
    <rect x="${x-w*.2}" y="${y-h*.045}" width="${w*.4}" height="${h*.06}" rx="${w*.04}" fill="#2e7bd6" stroke="${ink}" stroke-width="${lw}"/>
    <rect x="${L+w*.12}" y="${y+h*.45}" width="${w*.76}" height="${h*.16}" fill="#2e7bd6" opacity=".7"/></g>`;
  if(k==="ball"){const r=w/2,cy=floor-r;return `<g><circle cx="${x}" cy="${cy}" r="${r}" fill="#f2f2f2" stroke="${ink}" stroke-width="${lw}"/>
    <path d="M${x} ${cy-r*.32} l${r*.3} ${r*.22} l${-r*.12} ${r*.36} h${-r*.36} l${-r*.12} ${-r*.36} z" fill="${ink}"/>
    <path d="M${x-r*.95} ${cy-r*.1} l${r*.3} ${-r*.18} l${r*.1} ${r*.3} l${-r*.25} ${r*.3} z M${x+r*.95} ${cy-r*.1} l${-r*.3} ${-r*.18} l${-r*.1} ${r*.3} l${r*.25} ${r*.3} z M${x-r*.2} ${cy+r*.95} l${r*.05} ${-r*.35} h${r*.3} l${r*.05} ${r*.35} z" fill="${ink}"/></g>`}
  // hand, palm facing the viewer, fingers up
  const fw=w*.17;return `<g fill="#e7b48f" stroke="${ink}" stroke-width="${lw}">
    <rect x="${L+w*.08}" y="${y+h*.42}" width="${w*.78}" height="${h*.5}" rx="${w*.22}"/>
    ${[0,1,2,3].map(i=>`<rect x="${L+w*.1+i*(fw+w*.03)}" y="${y+[.1,0,.04,.16][i]*h}" width="${fw}" height="${h*[.42,.5,.47,.36][i]}" rx="${fw/2}"/>`).join("")}
    <rect x="${L+w*.62}" y="${y+h*.5}" width="${fw}" height="${h*.3}" rx="${fw/2}" transform="rotate(-38 ${L+w*.7} ${y+h*.75})"/>
    <rect x="${L+w*.2}" y="${y+h*.88}" width="${w*.6}" height="${h*.12}" fill="#d9a07a"/></g>`;
}
// Builds the scene in centimetres so the statue, the object and the ruler share one real scale
function scaleSVG(heightCm,mount,img,refKey){
  const H=Math.max(1,+heightCm||25),ref=REFS[refKey]||REFS.can,wall=mount==="wall";
  const lift=wall?Math.max(ref.h*1.25,H*.45,8):0;              // hanging pieces sit above the floor object
  const R=niceCeil(Math.max((lift+H)*1.18,ref.h*1.45,20));
  const SH=R/.86,SW=SH*.8,floor=SH*.9;
  const major=R<=30?5:R<=150?10:R<=250?20:50,minor=R<=40?1:R<=150?5:10;
  const rx=SW*.035,rw=SW*.07,fs=SH*.026;
  let ticks="";
  for(let c=0;c<=R;c+=minor){const y=floor-c,big=c%major===0;ticks+=`<line x1="${rx+rw}" x2="${rx+rw-(big?rw*.62:rw*.32)}" y1="${y}" y2="${y}" stroke="#130d10" stroke-width="${big?SH*.0035:SH*.002}"/>`;
    if(big&&c>0)ticks+=`<text x="${rx+rw*.1}" y="${y+fs*.36}" font-size="${fs}" font-family="Assistant,Arial,sans-serif" font-weight="800" fill="#130d10">${c}</text><line x1="${rx+rw}" x2="${SW}" y1="${y}" y2="${y}" stroke="#f6ead8" stroke-opacity=".07" stroke-width="${SH*.002}"/>`}
  const ox=rx+rw+SW*.04+ref.w/2;
  const bx=ox+ref.w/2+SW*.05,bw=SW*.97-bx,cx=bx+bw/2,top=floor-lift-H;
  return `<svg viewBox="0 0 ${SW.toFixed(2)} ${SH.toFixed(2)}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" direction="ltr" style="direction:ltr" role="img" aria-label="המחשת גודל: ${H} ס&quot;מ לצד ${ref.he}">
  <defs><linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1518"/><stop offset="1" stop-color="#2c2226"/></linearGradient>
  <radialGradient id="spotG" cx="${(cx/SW).toFixed(3)}" cy="${((top+H*.4)/SH).toFixed(3)}" r=".55"><stop offset="0" stop-color="#ffe2b0" stop-opacity=".2"/><stop offset="1" stop-color="#ffe2b0" stop-opacity="0"/></radialGradient>
  <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2e2a"/><stop offset="1" stop-color="#140f10"/></linearGradient>
  <linearGradient id="scrGlow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7aa7ff" stop-opacity=".5"/><stop offset="1" stop-color="#ff5c8a" stop-opacity=".25"/></linearGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${(SH*.006).toFixed(3)}"/></filter>
  <filter id="wallSh" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .6 0"/><feGaussianBlur stdDeviation="${(SH*.008).toFixed(3)}"/></filter></defs>
  <rect width="${SW}" height="${floor}" fill="url(#wallG)"/><rect width="${SW}" height="${floor}" fill="url(#spotG)"/>
  <rect y="${floor}" width="${SW}" height="${SH-floor}" fill="url(#floorG)"/>
  <rect y="${floor-SH*.004}" width="${SW}" height="${SH*.008}" fill="#f6ead8" opacity=".12"/>
  <rect x="${rx}" y="${floor-R}" width="${rw}" height="${R}" fill="#f1e4cc" rx="${rw*.08}"/>${ticks}
  <text x="${rx+rw/2}" y="${floor-R-fs*.6}" font-size="${fs*.9}" font-family="Assistant,Arial,sans-serif" font-weight="700" fill="#f6ead8" text-anchor="middle" opacity=".7">ס"מ</text>
  <ellipse cx="${ox}" cy="${floor}" rx="${ref.w*.62}" ry="${SH*.008}" fill="#000" opacity=".5" filter="url(#soft)"/>
  ${refSVG(refKey in REFS?refKey:"can",ox,floor)}
  ${wall?`<image href="${img}" x="${bx+SW*.012}" y="${top+SH*.012}" width="${bw}" height="${H}" preserveAspectRatio="xMidYMax meet" filter="url(#wallSh)"/>
    <circle cx="${cx}" cy="${top-SH*.006}" r="${SH*.005}" fill="#c9c9cf" stroke="#130d10" stroke-width="${SH*.0015}"/>`
   :`<ellipse cx="${cx}" cy="${floor}" rx="${Math.min(bw*.42,H*.4)}" ry="${SH*.012}" fill="#000" opacity=".6" filter="url(#soft)"/>`}
  <image href="${img}" x="${bx}" y="${top}" width="${bw}" height="${H}" preserveAspectRatio="xMidYMax meet"/>
  <line x1="${rx+rw}" x2="${bx}" y1="${top}" y2="${top}" stroke="#ffd23f" stroke-width="${SH*.003}" stroke-dasharray="${SH*.012} ${SH*.008}"/>
  <text x="${rx+rw+SW*.015}" y="${top-fs*.45}" font-size="${fs*1.15}" font-family="Assistant,Arial,sans-serif" font-weight="800" fill="#ffd23f">${H} ס"מ</text>
  </svg>`;
}
// The illustration is optional: shown only when the admin made a cutout and turned it on
function sceneHTML(w,force){
  const il=illusOf(w);
  if(!il||(!il.sceneOn&&!force)) return flatHTML(w);
  return `<div class="scene sz">${scaleSVG(w.heightCm,w.mount,il.aiCut,REF)}</div>`;
}
function flatHTML(w){const im=firstImg(w);if(!im)return `<div class="vid-only">וידאו</div>`;return `<div class="flat"><img src="${im.orig}" alt="" loading="lazy"></div>`}

// Display order: the admin's own order; works never placed yet (e.g. just added) come first, newest first
const byOrder=(a,b)=>{const ao=a.order==null,bo=b.order==null;if(ao&&bo)return b.createdAt-a.createdAt;if(ao)return -1;if(bo)return 1;return a.order-b.order||b.createdAt-a.createdAt};
function cardHTML(w){return `
    <article class="card" data-id="${esc(w.id)}" tabindex="0" aria-label="${esc(w.name)}">
      <div class="frame">${S.view==="room"&&w.section!=="gift"?sceneHTML(w):flatHTML(w)}
        ${w.status==="sale"?`<button class="badge" data-buy="${esc(w.id)}">זמין לרכישה</button>`:""}
        ${w.example?`<span class="example">דוגמה</span>`:""}
        ${S.admin&&hasWm(w)?`<span class="wm-tag on-card" title="${esc(wmText(w))}">⚠️ סימן מים · רק אתה רואה</span>`:""}
      </div>
      <div class="meta"><h3>${esc(w.name)}</h3><span class="spec">${(w.section==="gift"?[w.heightCm?esc(w.heightCm)+' ס"מ':""]:[w.category&&esc(catHe(w.category)),w.scale&&esc(w.scale.split(" ")[0]),esc(w.heightCm)+' ס"מ']).filter(Boolean).join(" · ")}</span></div>
    </article>`}
function renderGifts(){
  const gifts=[...S.works].filter(w=>w.section==="gift").sort(byOrder);
  $("#giftGrid").innerHTML=gifts.map(cardHTML).join("");
  $("#giftGrid").hidden=!gifts.length;
}
// keep sticky bars below the floating header
(()=>{const h=$(".top");if(!h)return;const set=()=>document.documentElement.style.setProperty("--hdr",h.offsetHeight+"px");set();new ResizeObserver(set).observe(h)})();
/* Home page: a taste of each world, each leading to its own page */
function renderHome(){
  const box=$("#teasers");if(!box)return;
  const T=TEXTS,works=[...S.works].sort(byOrder);
  const col=works.filter(w=>w.section!=="gift"),gifts=works.filter(w=>w.section==="gift");
  const pub=(typeof REVIEWS!=="undefined"?REVIEWS:[]).filter(r=>r.status==="approved");
  const two=t=>{const [a,b]=String(t||"").split("/").map(x=>x.trim());return `${esc(a||"")}${b?`<br><span>${esc(b)}</span>`:""}`};
  const giftOn=!!String(T.giftText||"").trim(),wsOn=!!String(T.wsText||"").trim();
  const first=t=>String(t||"").replace(/\*\*/g,"").split(/(?<=[.!?])\s/)[0];
  const P={};P.gallery=`<section class="tz tz-gal">
    <div class="tz-head"><div><span class="ws-eyebrow">הגלריה</span><h2 class="sec-title">פסלי אספנות<br><span>שכבר יצאו מהסטודיו.</span></h2></div>
      <a class="pill solid tz-go" href="#gallery">לכל הגלריה${col.length?` (${col.length})`:""} ←</a></div>
    <div class="tz-row">${col.slice(0,6).map(cardHTML).join("")}</div></section>`;
  if(typeof rvAvg==="function"){
    const A=pub.length?pub.reduce((t,r)=>t+rvAvg(r),0)/pub.length:0;
    P.reviews=`<section class="tz tz-rv">
      <div class="tz-head"><div><span class="ws-eyebrow">המלצות</span><h2 class="sec-title">מה אומרים<br><span>אחרי שהפסל הגיע הביתה.</span></h2>
        ${pub.length?`<p class="tz-score">${starsHTML(A,"lg")} <b>${A.toFixed(1)}</b> · ${pub.length===1?"המלצה אחת":pub.length+" המלצות"}</p>`:`<p class="tz-text">עוד אין כאן המלצות. אפשר להיות הראשונים לכתוב.</p>`}</div>
        <div class="tz-btns">${pub.length?`<a class="pill solid tz-go" href="#reviews">לכל ההמלצות ←</a>`:""}<button class="pill tz-go" type="button" data-rvwrite>✍️ לכתוב המלצה</button></div></div>
      ${pub.length?`<div class="tz-row rv-row">${pub.slice(0,3).map(rvCard).join("")}</div>`:""}</section>`;
  }
  if(giftOn)P.gifts=`<section class="tz tz-gift">
      <div class="tz-head"><div><span class="ws-eyebrow gift-eyebrow">${esc(T.giftEyebrow||"מתנות ייחודיות")}</span><h2 class="sec-title">${two(T.giftTitle)}</h2><p class="tz-text">${esc(first(T.giftText))}</p></div>
        <a class="pill solid tz-go" href="#gifts">למתנות ←</a></div>
      ${gifts.length?`<div class="tz-row">${gifts.slice(0,3).map(cardHTML).join("")}</div>`:""}</section>`;
  if(wsOn){const ph=(T.wsPhotos||[]).slice(0,3);
    P.learn=`<section class="tz tz-ws">
      <div class="tz-head"><div><span class="ws-eyebrow">${esc(T.wsEyebrow||"סדנאות")}</span><h2 class="sec-title">${two(T.wsTitle)}</h2><p class="tz-text">${esc(first(T.wsText))}</p></div>
        <a class="pill solid tz-go" href="#learn">לסדנאות ←</a></div>
      ${ph.length?`<div class="tz-row tz-ph">${ph.map((u,i)=>`<button type="button" data-wsph="${i}"><img src="${esc(u)}" alt="" loading="lazy"></button>`).join("")}</div>`:""}</section>`}
  if(T.btnGuide!==false)P.guide=`<a class="tz tz-guide" href="#guide"><span class="ws-eyebrow">המדריך לאספנים</span><b>באסט, דיורמה או פסל מלא? מה זה סקייל, ומה ההבדל בין רזין ל־FDM?</b><span class="tz-go-t">לקריאה במדריך ←</span></a>`;
  box.innerHTML=navOrder().filter(k=>k!=="home").map(k=>P[k]||"").join("");
}
$("#teasers").addEventListener("click",e=>{
  if(e.target.closest("[data-rvwrite]")){rvOpen();return}
  const wp=e.target.closest("[data-wsph]");if(wp){openViewer(TEXTS.wsPhotos||[],+wp.dataset.wsph);return}
  const ph=e.target.closest("[data-rvph]");if(ph){const r=REVIEWS.find(x=>x.id===ph.dataset.rvph);if(r)openViewer(r.photos,+ph.dataset.i);return}
  const t=e.target.closest(".rv-more-t");if(t){const p=t.previousElementSibling;p.classList.toggle("open");t.textContent=p.classList.contains("open")?"פחות":"עוד";return}
  const buy=e.target.closest("[data-buy]");if(buy){e.preventDefault();openContact(S.works.find(w=>w.id===buy.dataset.buy));return}
  const card=e.target.closest(".card");if(card)openLB(card.dataset.id);
});
/* Home picture: a different statue on each visit (gifts never), or fixed = the first work in the gallery.
   For rotation the next visit's picture is chosen now and cached, so the page opens on it without a visible swap. */
let HERO_ID=null;
function heroWork(all){
  const withImg=all.filter(firstImg);
  if(TEXTS.heroMode==="fixed"){HERO_ID=null;return withImg[0]}
  const pool=withImg.filter(w=>!w.example);if(!pool.length)return withImg[0];
  let cur=HERO_ID&&pool.find(w=>w.id===HERO_ID);
  if(!cur){
    const cached=load("heroImg");
    cur=pool.find(w=>firstImg(w).orig===cached)||pool[Math.floor(Math.random()*pool.length)];
    HERO_ID=cur.id;
    const rest=pool.length>1?pool.filter(w=>w.id!==cur.id):pool,next=rest[Math.floor(Math.random()*rest.length)];
    const u=firstImg(next).orig;if(/^https?:/.test(u))save("heroImg",u);
  }
  return cur;
}
function render(){
  renderGifts();renderHome();
  const all=[...S.works].filter(w=>w.section!=="gift").sort(byOrder);
  renderFilters(all);
  const F=S.filter;
  let list=all.filter(w=>(!F.cat||w.category===F.cat)&&(!F.tech||w.tech===F.tech)&&(!F.sale||w.status==="sale"));
  if(S.q.trim()){const sc=new Map(list.map(w=>[w,searchScore(w,S.q)]));list=list.filter(w=>sc.get(w)>0).sort((a,b)=>sc.get(b)-sc.get(a))}
  $("#count").textContent=`${list.length} יצירות`;
  $("#grid").innerHTML=list.map(cardHTML).join("") || `<p class="note">עוד אין יצירות. היכנס כמנהל דרך הנקודה הקטנה בראש העמוד והעלה את הראשונה.</p>`;
  if(!list.length&&all.length)$("#grid").innerHTML=S.q.trim()
    ?`<div class="q-empty"><p>עוד אין כאן <b>${esc(S.q.trim())}</b>, אבל אפשר להזמין בדיוק את הדמות הזו.</p><div class="row"><button class="pill solid" type="button" id="qOrder">להזמנה אישית</button><button class="chip" type="button" id="clearF">ניקוי החיפוש</button></div></div>`
    :`<p class="note">אין יצירות שמתאימות לסינון. <button class="chip" id="clearF">ניקוי הסינון</button></p>`;
  // Hero picture: only replace it when it actually changes (re-inserting the same image made the page jump)
  const top=heroWork(all),heroHTML=top?(S.view==="room"?sceneHTML(top):flatHTML(top)):"";
  const cap=$("#heroCap");cap.hidden=!top;if(top){cap.dataset.id=top.id;const nm=String(top.name||"").split(/\s+[–-]\s+/)[0];cap.innerHTML=`<b dir="auto">${esc(nm)}</b><span>לצפייה ←</span>`}
  if($("#heroScene").dataset.k!==heroHTML){$("#heroScene").innerHTML=heroHTML;$("#heroScene").dataset.k=heroHTML;
    if(TEXTS.heroMode==="fixed"){const im=top&&firstImg(top);if(im&&!top.example&&/^https?:/.test(im.orig))save("heroImg",im.orig)}}
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
$("#grid").addEventListener("click",e=>{if(e.target.id==="clearF"){S.filter={cat:"",tech:"",sale:false};S.q="";$("#q").value="";$("#qClear").hidden=true;render()}
  if(e.target.id==="qOrder")openContact("order")});

/* ================= Character search (Hebrew or English) ================= */
// Finds a character whether it is typed in Hebrew or English, with or without spaces/hyphens,
// and with common Hebrew spelling variations (באטמן / בטמן, ספיידר מן / ספיידרמן).
const NIQQUD=/[\u0591-\u05C7]/g;
const norm=t=>String(t||"").toLowerCase().replace(NIQQUD,"").replace(/[׳״'"`´.,:;!?()\[\]{}\-–—_/\\|·*]/g," ").replace(/\s+/g," ").trim();
const tight=t=>norm(t).replace(/ /g,"");
const looseHe=t=>tight(t).replace(/[ויאהע]/g,"");
// Consonant "sound skeleton", the same for BATMAN and באטמן
function skel(t){
  let s=String(t||"").toLowerCase().replace(NIQQUD,"");
  // Hebrew letters with geresh first (ג' ז' צ' ת')
  s=s.replace(/ג['׳]/g,"g").replace(/ז['׳]/g,"z").replace(/צ['׳]/g,"c").replace(/ת['׳]/g,"t");
  const he={"א":"","ב":"b","ג":"g","ד":"d","ה":"","ו":"b","ז":"z","ח":"c","ט":"t","י":"","כ":"k","ך":"k","ל":"l","מ":"m","ם":"m","נ":"n","ן":"n","ס":"s","ע":"","פ":"p","ף":"p","צ":"ts","ץ":"ts","ק":"k","ר":"r","ש":"s","ת":"t"};
  s=s.replace(/[\u05D0-\u05EA]/g,c=>he[c]??"");
  s=s.replace(/ph/g,"p").replace(/th/g,"t").replace(/sh/g,"s").replace(/ch/g,"c").replace(/ck/g,"k").replace(/c(?=[eiy])/g,"s").replace(/c/g,"k")
     .replace(/q/g,"k").replace(/x/g,"ks").replace(/j/g,"g").replace(/[vw]/g,"b").replace(/f/g,"p").replace(/z/g,"z");
  // in Hebrew ח/צ' both became "c"; English "ch" too
  s=s.replace(/[^a-z]/g,"").replace(/[aeiouyh]/g,"");
  return s.replace(/(.)\1+/g,"$1");
}
function searchScore(w,q){
  const nq=norm(q);if(!nq)return 1;
  const tq=nq.replace(/ /g,""),lq=looseHe(q),kq=skel(q);
  const fields=[[w.name,6],[w.character,6],[catHe(w.category||""),3],[w.summary,1]];
  // add the English name for a Hebrew character (and the reverse) from the built-in list
  const enOf=Object.entries(EN_NAMES);
  const extra=[];for(const [he,en] of enOf){if(tight(he).includes(tq)||tq.includes(tight(he))&&tq.length>2)extra.push(en.toLowerCase());if(tight(en).includes(tq))extra.push(he)}
  let best=0;
  for(const [f,wgt] of fields){
    if(!f)continue;
    const nf=norm(f),tf=nf.replace(/ /g,"");
    if(nf.includes(nq)||tf.includes(tq))best=Math.max(best,wgt*3);
    else if(lq.length>=3&&looseHe(f).split(/\s+/).length&&norm(f).split(" ").some((_,i,ws)=>looseHe(ws.slice(i).join("")).startsWith(lq)))best=Math.max(best,wgt*2);
    else if(extra.some(x=>tf.includes(tight(x))))best=Math.max(best,wgt*2);
    else if(wgt>1&&kq.length>=3){const ws=norm(f).split(" ").map(skel);if(ws.some((_,i)=>ws.slice(i).join("").startsWith(kq)))best=Math.max(best,wgt)}
  }
  return best;
}
let qT=null;
$("#q").addEventListener("input",e=>{clearTimeout(qT);const v=e.target.value;$("#qClear").hidden=!v;qT=setTimeout(()=>{S.q=v;render();if(v.trim().length>2)track("search")},140)});
$("#q").addEventListener("keydown",e=>{if(e.key==="Escape"){e.target.value="";S.q="";$("#qClear").hidden=true;render()}if(e.key==="Enter")e.target.blur()});
$("#qClear").onclick=()=>{$("#q").value="";S.q="";$("#qClear").hidden=true;render();$("#q").focus()};
addEventListener("keydown",e=>{if(e.key==="/"&&!/input|textarea|select/i.test(document.activeElement?.tagName||"")&&!document.querySelector("dialog[open]")){e.preventDefault();$("#gallery").scrollIntoView({behavior:"smooth"});$("#q").focus()}});

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
$("#giftGrid").addEventListener("click",e=>{
  const buy=e.target.closest("[data-buy]"); if(buy){e.stopPropagation();openContact(S.works.find(w=>w.id===buy.dataset.buy));return}
  const card=e.target.closest(".card"); if(card) openLB(card.dataset.id);
});
$("#giftGrid").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList.contains("card"))openLB(e.target.dataset.id)});
$("#grid").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList.contains("card"))openLB(e.target.dataset.id)});

/* ================= Links ================= */
const wa=t=>CFG.whatsapp?`https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(t||"")}`:"";
["#igTop","#igBar","#ctIg"].forEach(s=>{const el=$(s);if(el)el.href=CFG.instagram});
["#ttTop","#ttBar","#ctTt"].forEach(s=>{const el=$(s);if(el)el.href=CFG.tiktok});
$("#ctaOrder").onclick=()=>openContact("order");$("#finaleOrder").onclick=()=>openContact("order");$("#orderBar").onclick=()=>openContact("order");
$("#giftCta").onclick=()=>openContact("gift");

/* ================= Lightbox ================= */
let LB={w:null,slides:[],i:0};
function openLB(id){
  track("work");
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
  if(s.kind==="room") main.innerHTML=`<div class="sz-wrap">${sceneHTML(w,true)}<div class="ref-pick" role="group" aria-label="השוואה לחפץ">${Object.entries(REFS).map(([k,o])=>`<button type="button" class="chip" data-ref="${k}" aria-pressed="${k===REF}">${o.he}</button>`).join("")}</div></div>`;
  else if(s.kind==="image") main.innerHTML=`<img class="zoomable" src="${s.orig}" alt="${esc(w.name)}">`;
  else main.innerHTML=`<video src="${s.url}" controls playsinline></video>`;
  const z=main.querySelector(".zoomable,.scene");
  if(z && matchMedia("(hover:hover)").matches){
    z.classList.add("zoomable");
    z.onmousemove=e=>{const r=z.getBoundingClientRect();z.style.transformOrigin=`${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%`};
    z.onmouseenter=()=>z.classList.add("on"); z.onmouseleave=()=>z.classList.remove("on");
  }
  $("#lbThumbs").innerHTML=LB.slides.map((t,k)=>`<button aria-current="${k===LB.i}" data-k="${k}" aria-label="מדיה ${k+1}">${t.kind==="room"?`<span class="t-room">גודל</span>`:t.kind==="image"?`<img src="${t.orig}" alt="">`:`<video src="${t.url}" muted></video>`}</button>`).join("");
  $("#lbPrev").hidden=$("#lbNext").hidden=n<2;
}
$("#lbMain").addEventListener("click",e=>{const b=e.target.closest("[data-ref]");if(!b)return;e.stopPropagation();setRef(b.dataset.ref);showSlide(LB.i);if(S.view==="room")render()});
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
// Playful lines for a piece that is on display only (not for sale)
const SOLD_TITLES=["אוי, איזה באסה!","אאוץ'. כמעט!","נו באמת, דווקא את זה?","שברון לב בפופ־ארט"];
const SOLD_LINES=[
  n=>`"${n}" כבר מצא בית חם, והוא לא מתכנן לעבור דירה. אבל אל דאגה: אני יכול להכין לך משהו באותה אנרגיה, רק שלך.`,
  n=>`"${n}" כאן רק כדי שתתאהבו בו, והוא יודע את זה טוב מאוד. נעשה לך אחד משלך?`,
  n=>`"${n}" סגור עליו כמו כספת. הדבר הכי קרוב: יצירה מותאמת בדיוק בשבילך, עם אותה כמות צבע ושיגעון.`,
  n=>`ניסיון יפה! "${n}" לא למכירה, הוא עובד פה כדוגמן. אבל אפשר להזמין ממני אח קטן (או גדול) בהזמנה אישית.`
];
const pick=a=>a[Math.floor(Math.random()*a.length)];
function openContact(w){
  track(w==="learn"?"learn":"want");
  $("#ctWa").hidden=true;
  if(w==="order"||w==="gift"){
    $("#ctTitle").textContent=w==="gift"?(TEXTS.giftCta||"אני רוצה מתנה כזו!"):"הזמנה אישית";
    $("#ctSold").hidden=true;
    $("#ctNote").textContent="ההודעה תועתק בלחיצה על אחד הכפתורים, ואז אפשר להדביק אותה בהודעה פרטית. כדאי לצרף תמונה או רפרנס:";
    const t=w==="gift"?"היי ARTRIKO, אשמח לשמוע על מתנה מיוחדת בהתאמה אישית.":"היי ARTRIKO, אשמח להזמין פסל בהתאמה אישית. הדמות שאני רוצה:";
    $("#ctMsg").textContent=t;
    if(CFG.whatsapp){$("#ctWa").hidden=false;$("#ctWa").href=wa(t)}
    $("#ct").showModal();return;
  }
  if(w==="learn"){
    $("#ctTitle").textContent=TEXTS.wsCta||"אני רוצה ללמוד לצבוע!";
    $("#ctSold").hidden=true;
    $("#ctNote").textContent="ההודעה תועתק בלחיצה על אחד הכפתורים, ואז אפשר להדביק אותה בהודעה פרטית. כדאי לציין אם יש ניסיון קודם, ואם מתאימה הדרכה אישית או סדנה:";
    const t="היי ARTRIKO, אני רוצה ללמוד לצבוע! אשמח לשמוע על הדרכה אישית או סדנה (איירבראש ומכחולים).";
    $("#ctMsg").textContent=t;
    if(CFG.whatsapp){$("#ctWa").hidden=false;$("#ctWa").href=wa(t)}
    $("#ct").showModal();return;
  }
  const notForSale=!!(w&&w.status!=="sale");
  $("#ctTitle").textContent=notForSale?pick(SOLD_TITLES):"אני רוצה את זה!";
  $("#ctSold").hidden=!notForSale;
  if(notForSale)$("#ctSold").textContent=pick(SOLD_LINES)(w.name);
  $("#ctNote").textContent=notForSale?"בא לך הזמנה אישית בסגנון? ההודעה תועתק בלחיצה על אחד הכפתורים, ואז אפשר להדביק אותה בהודעה פרטית:":"ההודעה תועתק בלחיצה על אחד הכפתורים, ואז אפשר להדביק אותה בהודעה פרטית:";
  const t=!w?"היי ARTRIKO, אשמח לשמוע עוד"
    :notForSale?`היי ARTRIKO, ראיתי את "${w.name}" ונדלקתי! אפשר להזמין ממך משהו בסגנון?`
    :`היי ARTRIKO, אני רוצה את "${w.name}" (${w.heightCm} ס"מ)! אשמח לשמוע על זמינות ומחיר.`;
  $("#ctMsg").textContent=t;
  if(CFG.whatsapp){$("#ctWa").hidden=false;$("#ctWa").href=wa(t)}
  $("#ct").showModal();
}
document.querySelectorAll("#ct .dm").forEach(a=>a.addEventListener("click",()=>{navigator.clipboard?.writeText($("#ctMsg").textContent).then(()=>toast("ההודעה הועתקה, אפשר להדביק אותה בצ'אט"),()=>{})}));
$("#wsCta").onclick=()=>openContact("learn");

/* ================= Click counting (which areas visitors use) ================= */
// Server counts each area once per visitor every 10 minutes; admins are not counted.
// A random id kept on this device only, so two people on one Wi-Fi count as two, and one person counts once.
function visitorId(){try{let v=localStorage.getItem("artriko.vid");if(!v){v=crypto.randomUUID();localStorage.setItem("artriko.vid",v)}return v}catch(e){return null}}
function ping(kind){try{fetch("/api/visit",{method:"POST",keepalive:true,headers:{"Content-Type":"application/json"},body:JSON.stringify(kind?{kind,vid:visitorId()}:{vid:visitorId()})})}catch(e){}}
function track(kind){if(!S.admin)ping(kind)}
document.addEventListener("click",e=>{const a=e.target.closest("a[href]");if(!a)return;const h=a.href;
  if(/instagram\.com/.test(h))track("ig");else if(/tiktok\.com/.test(h))track("tt");else if(/wa\.me/.test(h))track("wa")},true);
const EV_LABELS=[["visits","כניסות לאתר"],["work","פתיחת יצירה בגלריה"],["want","לחיצה על \"אני רוצה את זה!\""],["learn","בקשה להדרכה או סדנה"],["guide","כניסה למדריך לאספנים"],["search","שימוש בחיפוש"],["ig","מעבר לאינסטגרם"],["tt","מעבר לטיקטוק"],["wa","מעבר לוואטסאפ"]];
/* Activity over time: unique visitors per day / month, busiest hours and weekdays (Israel time) */
const HE_DAYS=["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
const HE_MONTHS=["ינו׳","פבר׳","מרץ","אפר׳","מאי","יוני","יולי","אוג׳","ספט׳","אוק׳","נוב׳","דצמ׳"];
let AN=null,AN_VIEW="days";
function anSeries(view){
  if(!AN)return [];
  if(view==="days")return (AN.days||[]).map(r=>{const d=new Date(r.d.slice(0,10)+"T12:00:00");return {label:`${d.getDate()}.${d.getMonth()+1}`,full:`${HE_DAYS[d.getDay()]} ${d.getDate()}.${d.getMonth()+1}`,v:r.uniques,sub:r.visits}});
  if(view==="months")return (AN.months||[]).map(r=>{const [y,m]=r.m.split("-");return {label:HE_MONTHS[+m-1],full:`${HE_MONTHS[+m-1]} ${y}`,v:r.uniques,sub:r.visits}});
  if(view==="hours")return (AN.hours||[]).map(r=>({label:String(r.h),full:`\u2066${String(r.h).padStart(2,"0")}:00–${String((r.h+1)%24).padStart(2,"0")}:00\u2069`,v:r.visits}));
  return (AN.weekdays||[]).map(r=>({label:HE_DAYS[r.w].slice(0,2)+"׳",full:`יום ${HE_DAYS[r.w]}`,v:r.visits}));
}
function renderAnalytics(){
  if(!AN)return;
  const u=AN.uniques||{};
  $("#anTiles").innerHTML=[["היום",u.today],["7 ימים",u.week],["30 ימים",u.month],["מאז ההתחלה",u.total]].map(([l,n])=>`<div class="an-tile"><b>${n??0}</b><span>${l}</span></div>`).join("")+`<p class="an-cap">מבקרים ייחודיים</p>`;
  const rows=anSeries(AN_VIEW),max=Math.max(1,...rows.map(r=>r.v));
  const unit=AN_VIEW==="days"||AN_VIEW==="months"?"מבקרים ייחודיים":"כניסות";
  $("#anTitle").textContent=AN_VIEW==="days"?"מבקרים ייחודיים בכל יום, 30 הימים האחרונים":AN_VIEW==="months"?"מבקרים ייחודיים בכל חודש, 12 החודשים האחרונים":AN_VIEW==="hours"?"כניסות לפי שעה ביום (שעון ישראל), 30 הימים האחרונים":"כניסות לפי יום בשבוע, 30 הימים האחרונים";
  const every=rows.length>24?5:rows.length>12?3:1;
  $("#anChart").setAttribute("aria-label",$("#anTitle").textContent);
  $("#anChart").innerHTML=`<div class="an-grid"><span>${max}</span><span>${Math.round(max/2)}</span><span>0</span></div><div class="an-bars">${rows.map((r,i)=>`<div class="an-col" data-i="${i}"><div class="an-bar" style="height:${r.v?`max(3px,calc((100% - 20px) * ${(r.v/max).toFixed(4)}))`:"0"}"></div><span class="an-x">${i%every===0||i===rows.length-1?esc(r.label):""}</span></div>`).join("")}</div>`;
  const tip=$("#anTip"),chart=$("#anChart");
  const show=e=>{const c=e.target.closest(".an-col");if(!c){tip.hidden=true;return}const r=rows[+c.dataset.i];
    tip.innerHTML=`<b>${esc(r.full)}</b><br>${r.v} ${unit}${r.sub!=null?` · ${r.sub} כניסות`:""}`;tip.hidden=false;
    const b=chart.getBoundingClientRect(),cb=c.getBoundingClientRect(),host=chart.parentElement.getBoundingClientRect();
    tip.style.left=Math.min(host.width-170,Math.max(0,cb.left-host.left+cb.width/2-80))+"px";tip.style.top=(b.top-host.top-6)+"px";
    chart.querySelectorAll(".an-col.on").forEach(x=>x.classList.remove("on"));c.classList.add("on")};
  chart.onpointermove=show;chart.onpointerdown=show;chart.onpointerleave=()=>{tip.hidden=true;chart.querySelectorAll(".an-col.on").forEach(x=>x.classList.remove("on"))};
  // Plain-language highlights
  const ins=[],top=(arr)=>arr.reduce((a,b)=>b.v>a.v?b:a,arr[0]||{v:0});
  const hs=anSeries("hours"),ws=anSeries("weekdays"),ds=anSeries("days"),ms=anSeries("months");
  const sum=a=>a.reduce((t,r)=>t+r.v,0);
  if(sum(hs)){const h=top(hs);ins.push(`השעות הכי פעילות: <b>${h.full}</b>`)}
  if(sum(ws)){const w=top(ws);ins.push(`היום בשבוע הכי פעיל: <b>${w.full}</b>`)}
  if(sum(ds)){const d=top(ds);ins.push(`היום הכי עמוס בחודש האחרון: <b>${d.full}</b> (${d.v} מבקרים)`)}
  const nm=ms.length;if(nm>1&&(ms[nm-2].v||ms[nm-1].v)){const a=ms[nm-2].v,b=ms[nm-1].v;ins.push(a?`החודש עד עכשיו: <b>${b}</b> מבקרים, לעומת ${a} בחודש שעבר (\u2066${b>=a?"+":""}${Math.round((b-a)/a*100)}%\u2069)`:`החודש עד עכשיו: <b>${b}</b> מבקרים`)}
  $("#anIns").innerHTML=ins.map(x=>`<li>${x}</li>`).join("")||`<li>עוד אין מספיק נתונים.</li>`;
}
$("#anSeg").addEventListener("click",e=>{const b=e.target.closest("[data-an]");if(!b)return;AN_VIEW=b.dataset.an;$("#anSeg").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));renderAnalytics()});
async function loadStats(){
  const [{data:v},{data:ev},{data:an}]=await Promise.all([sb.rpc("visit_stats"),sb.rpc("event_stats"),sb.rpc("visit_analytics",{p_days:30})]);
  AN=an||null;renderAnalytics();
  const all={...(ev||{}),...(v?{visits:v}:{})};
  if(v)$("#visitStats").textContent=`· היום ${an?.uniques?.today??"–"} מבקרים, ${v.today} כניסות`;
  $("#evStats").innerHTML=`<table><thead><tr><th></th><th>היום</th><th>7 ימים</th><th>סה"כ</th></tr></thead><tbody>${EV_LABELS.map(([k,l])=>{const r=all[k]||{today:0,week:0,total:0};return `<tr><td>${esc(l)}</td><td>${r.today}</td><td>${r.week}</td><td>${r.total}</td></tr>`}).join("")}</tbody></table>`;
}

/* ================= Workshop photos ================= */
// One simple photo viewer for workshop photos and review photos
let WSI=0,VIEW=[];
function showWs(i){const ph=VIEW;if(!ph.length)return;WSI=(i+ph.length)%ph.length;$("#wsLbImg").src=ph[WSI];$("#wsLbPrev").hidden=$("#wsLbNext").hidden=ph.length<2}
function openViewer(urls,i){VIEW=urls||[];showWs(i||0);$("#wsLb").showModal()}
$("#wsPhotos").addEventListener("click",e=>{const b=e.target.closest("[data-ph]");if(!b)return;openViewer(TEXTS.wsPhotos||[],+b.dataset.ph)});
$("#wsLbPrev").onclick=()=>showWs(WSI-1);$("#wsLbNext").onclick=()=>showWs(WSI+1);
function renderWsPhAdmin(){const ph=TEXTS.wsPhotos||[];
  $("#wsPhList").innerHTML=ph.map((u,i)=>`<div class="ws-ph-item"><img src="${esc(u)}" alt=""><div class="row">${i>0?`<button type="button" class="pill small" data-wp="up" data-i="${i}">↑</button>`:""}<button type="button" class="pill small danger" data-wp="rm" data-i="${i}">הסרה</button></div></div>`).join("")}
async function saveWsPhotos(msg){try{await putSetting("texts",TEXTS);renderTexts();renderWsPhAdmin();if(msg)$("#wsPhMsg").textContent=msg}catch(e){$("#wsPhMsg").textContent="השמירה נכשלה: "+(e.message||e)}}
$("#wsPhList").addEventListener("click",e=>{const b=e.target.closest("[data-wp]");if(!b)return;const i=+b.dataset.i,ph=TEXTS.wsPhotos=[...(TEXTS.wsPhotos||[])];
  if(b.dataset.wp==="rm")ph.splice(i,1);if(b.dataset.wp==="up")ph.splice(i-1,0,...ph.splice(i,1));saveWsPhotos("נשמר.")});
$("#wsPhUp").onclick=()=>$("#wsPhFile").click();
$("#wsPhFile").onchange=async e=>{const files=[...e.target.files].filter(f=>f.type.startsWith("image"));e.target.value="";if(!files.length)return;
  const ph=TEXTS.wsPhotos=[...(TEXTS.wsPhotos||[])];
  for(const [k,f] of files.entries()){
    try{
      const data=await new Promise((r,j)=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.onerror=j;fr.readAsDataURL(f)});
      const blob=b64Blob(await downscale(data,1800));
      ph.push(await uploadBlob(`workshop/${crypto.randomUUID()}.jpg`,blob,(l,t)=>{$("#wsPhMsg").textContent=`מעלה תמונה ${k+1} מתוך ${files.length}… ${Math.round(l/t*100)}%`}));
    }catch(err){$("#wsPhMsg").textContent="העלאה נכשלה: "+(err.message||err);return}
  }
  saveWsPhotos(files.length>1?`${files.length} תמונות נוספו לסקשן הסדנאות.`:"התמונה נוספה לסקשן הסדנאות.");
};
$("#ctCopy").onclick=async()=>{const t=$("#ctMsg").textContent;try{await navigator.clipboard.writeText(t);toast("ההודעה הועתקה")}catch(e){const r=document.createRange();r.selectNodeContents($("#ctMsg"));const s=getSelection();s.removeAllRanges();s.addRange(r);toast("ההודעה מסומנת, אפשר להעתיק אותה")}};

/* ================= Image tools ================= */
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();if(isRemote(src))i.crossOrigin="anonymous";i.onload=()=>res(i);i.onerror=rej;i.src=src})}
async function downscale(src,max=1600){const i=await loadImg(src);const k=Math.min(1,max/Math.max(i.width,i.height));const c=document.createElement("canvas");c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);c.getContext("2d").drawImage(i,0,0,c.width,c.height);return c.toDataURL("image/jpeg",.9)}
const ED0={rot:0,flip:false,b:100,c:100,s:100,angle:0,crop:null};
const fullCrop=c=>!c||(c.x<=0.001&&c.y<=0.001&&c.w>=0.999&&c.h>=0.999);
const isPlain=e=>!e||(!e.rot&&!e.flip&&e.b==100&&e.c==100&&e.s==100&&!e.angle&&fullCrop(e.crop));
// Zoom needed so a W×H image rotated by `deg` still fills a W×H frame (no empty corners), like phone galleries
function coverScale(W,H,deg){const t=Math.abs(deg)*Math.PI/180,c=Math.cos(t),s=Math.sin(t);return Math.max((W*c+H*s)/W,(W*s+H*c)/H)}
// Step 1: 90° turns, mirror and colour. Step 2: fine straightening. Step 3: crop.
function baseCanvas(i,e,max){
  const k=max?Math.min(1,max/Math.max(i.width,i.height)):1,iw=Math.round(i.width*k),ih=Math.round(i.height*k);
  const r=((e.rot%360)+360)%360,side=r===90||r===270;
  const c=document.createElement("canvas");c.width=side?ih:iw;c.height=side?iw:ih;const x=c.getContext("2d");
  x.translate(c.width/2,c.height/2);x.rotate(r*Math.PI/180);if(e.flip)x.scale(-1,1);
  x.filter=`brightness(${e.b/100}) contrast(${e.c/100}) saturate(${e.s/100})`;
  x.drawImage(i,-iw/2,-ih/2,iw,ih);return c;
}
function straighten(src,deg,out){
  const W=src.width,H=src.height,c=out||document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  x.save();x.fillStyle="#000";x.fillRect(0,0,W,H);x.translate(W/2,H/2);x.rotate(deg*Math.PI/180);const k=coverScale(W,H,deg);x.scale(k,k);
  x.imageSmoothingQuality="high";x.drawImage(src,-W/2,-H/2);x.restore();return c;
}
async function applyEdits(src,e){
  if(isPlain(e)) return src;
  const i=await loadImg(src);
  let c=baseCanvas(i,e);
  if(e.angle)c=straighten(c,e.angle);
  if(!fullCrop(e.crop)){const q=e.crop,W=c.width,H=c.height,sx=Math.round(q.x*W),sy=Math.round(q.y*H),sw=Math.max(1,Math.round(q.w*W)),sh=Math.max(1,Math.round(q.h*H));
    const o=document.createElement("canvas");o.width=sw;o.height=sh;o.getContext("2d").drawImage(c,sx,sy,sw,sh,0,0,sw,sh);c=o}
  return c.toDataURL("image/jpeg",.92);
}

/* ---------- Crop & straighten editor (free angle, like a phone gallery) ---------- */
const CR={it:null,img:null,ed:null,base:null,ratio:null,drag:null};
async function openCrop(it){
  CR.it=it;CR.ed={...ED0,...it.ed,crop:it.ed.crop?{...it.ed.crop}:{x:0,y:0,w:1,h:1}};CR.ratio=null;
  CR.img=await loadImg(it.raw);crBase();
  $("#crRatios").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.r==="free"));
  $("#cropDlg").showModal();crDraw();crBox();
}
function crBase(){CR.base=baseCanvas(CR.img,CR.ed,1400)}
function crDraw(){
  const cv=$("#crCanvas");straighten(CR.base,CR.ed.angle||0,cv);
  const a=CR.ed.angle||0;$("#crAngle").value=a;$("#crDeg").textContent=`${a>0?"+":""}${a.toFixed(1)}°`;
  $("#crBox").classList.toggle("turning",!!CR.turning);
}
function crBox(){const q=CR.ed.crop,b=$("#crBox");b.style.left=q.x*100+"%";b.style.top=q.y*100+"%";b.style.width=q.w*100+"%";b.style.height=q.h*100+"%"}
// aspect ratio in pixels → normalized height for a given normalized width
const crAR=()=>CR.base.width/CR.base.height;
function crFitRatio(r){
  if(!r){CR.ratio=null;return}
  CR.ratio=r;const A=crAR();let w=1,h=w*A/r;if(h>1){h=1;w=h*r/A}
  CR.ed.crop={x:(1-w)/2,y:(1-h)/2,w,h};crBox();
}
$("#crRatios").addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(!b)return;
  $("#crRatios").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));
  const r=b.dataset.r;crFitRatio(r==="free"?null:r==="orig"?crAR():+r)});
$("#crAngle").addEventListener("input",e=>{CR.ed.angle=Math.round(+e.target.value*10)/10;CR.turning=true;crDraw()});
$("#crAngle").addEventListener("change",()=>{CR.turning=false;crDraw()});
$("#cropDlg").addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(!b)return;const c=b.dataset.c;
  if(c==="-0.1"||c==="0.1"){CR.ed.angle=Math.max(-45,Math.min(45,Math.round(((CR.ed.angle||0)+ +c)*10)/10));crDraw();return}
  if(c==="rotL"||c==="rotR"){CR.ed.rot+=c==="rotL"?-90:90;CR.ed.crop={x:0,y:0,w:1,h:1};crBase();if(CR.ratio)crFitRatio(CR.ratio);crDraw();crBox();return}
  if(c==="flip"){CR.ed.flip=!CR.ed.flip;crBase();crDraw();return}
  if(c==="reset"){Object.assign(CR.ed,{rot:0,flip:false,angle:0,crop:{x:0,y:0,w:1,h:1}});CR.ratio=null;$("#crRatios").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.r==="free"));crBase();crDraw();crBox()}});
// drag the frame or its handles
$("#crBox").addEventListener("pointerdown",e=>{e.preventDefault();const r=$("#crWrap").getBoundingClientRect();
  CR.drag={h:e.target.dataset.h||"move",x0:e.clientX,y0:e.clientY,W:r.width,H:r.height,q:{...CR.ed.crop}};$("#crBox").setPointerCapture(e.pointerId)});
$("#crBox").addEventListener("pointermove",e=>{const d=CR.drag;if(!d)return;
  const dx=(e.clientX-d.x0)/d.W,dy=(e.clientY-d.y0)/d.H,q={...d.q},MIN=.08,h=d.h;
  if(h==="move"){q.x=Math.min(1-q.w,Math.max(0,q.x+dx));q.y=Math.min(1-q.h,Math.max(0,q.y+dy))}
  else{
    if(h.includes("w")){const nx=Math.min(q.x+q.w-MIN,Math.max(0,q.x+dx));q.w+=q.x-nx;q.x=nx}
    if(h.includes("e")){q.w=Math.min(1-q.x,Math.max(MIN,q.w+dx))}
    if(h.includes("n")){const ny=Math.min(q.y+q.h-MIN,Math.max(0,q.y+dy));q.h+=q.y-ny;q.y=ny}
    if(h.includes("s")){q.h=Math.min(1-q.y,Math.max(MIN,q.h+dy))}
    if(CR.ratio){const A=crAR();
      if(h==="n"||h==="s"){const w=q.h*CR.ratio/A,cx=q.x+q.w/2;q.w=w;q.x=cx-w/2}
      else{const nh=q.w*A/CR.ratio;if(h.includes("n"))q.y=q.y+q.h-nh;else if(!h.includes("s")){q.y=q.y+(q.h-nh)/2}q.h=nh}
      if(q.x<-.0001||q.y<-.0001||q.x+q.w>1.0001||q.y+q.h>1.0001||q.w<MIN||q.h<MIN)return;
    }
  }
  CR.ed.crop=q;crBox()});
const crEnd=()=>{CR.drag=null};
$("#crBox").addEventListener("pointerup",crEnd);$("#crBox").addEventListener("pointercancel",crEnd);
$("#crCancel").onclick=()=>$("#cropDlg").close();
$("#crSave").onclick=()=>{const it=CR.it;if(!it)return;it.ed={...it.ed,rot:CR.ed.rot,flip:CR.ed.flip,angle:CR.ed.angle||0,crop:fullCrop(CR.ed.crop)?null:CR.ed.crop};
  $("#cropDlg").close();process(it);toast("החיתוך והיישור נשמרו")};
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
  loadReviews();
  const st=await getSetting("studio");if(st)STUDIO={...STUDIO,...st};renderStudio();
  const vv=await getSetting("voice");if(vv){VOICE=vv;$("#xVoice").value=vv.samples||"";$("#xVoiceRules").value=vv.rules||""}
  loadStats();
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
    it.progress=1;it.ready=true;renderStaged();if(kind==="image")wmQueue(it);
    if(kind==="image") queueSuggest();
  };
  kind==="image"?fr.readAsDataURL(f):fr.readAsArrayBuffer(f);
})}
function bar(it){const el=document.querySelector(`[data-sid="${it.sid}"] .prog i`);if(el)el.style.width=(it.progress*100)+"%"}
async function process(it){
  const ticket=(it.ticket||0)+1;it.ticket=ticket;it.busy=true;paint(it);
  const orig=await applyEdits(it.raw,it.ed);
  if(it.ticket!==ticket) return; // a newer edit superseded this one
  it.orig=orig;it.busy=false;paint(it);wmQueue(it);
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
    <div class="row"><button type="button" class="pill small solid" data-a="crop">✂️ חיתוך ויישור</button><button type="button" class="pill small" data-a="rotL">↺ סיבוב</button><button type="button" class="pill small" data-a="rotR">↻ סיבוב</button><button type="button" class="pill small" data-a="flip">היפוך</button></div>
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
      <div class="pv">${it.aiCut?`<img src="${it.orig}" alt=""><div class="scene sz">${scaleSVG(h,$("#fMount").value,it.aiCut,REF)}</div>`:`<img src="${it.orig}" alt="">`}</div>
      <div class="wm-slot">${wmBadge(it)}</div>
      <label><input type="radio" name="illusPick" data-a="illus" ${it.illus?"checked":""}> התמונה להמחשת גודל</label>
      ${it.illus?`<button type="button" class="pill small ai-btn" data-a="cutout" ${it.cutBusy?"disabled":""}>${it.cutBusy?"מסיר רקע… (עד דקה)":it.aiCut?"✂️ הסרת רקע מחדש":"✂️ הסרת רקע"}</button>`:""}
      ${it.illus&&it.aiCut?`<label><input type="checkbox" data-a="sceneOn" ${it.sceneOn?"checked":""}> להציג את ההמחשה באתר</label>`:""}
      ${it.illus?`<button type="button" class="pill small" data-a="noillus">בלי המחשה</button>`:""}
      ${it.cutMsg?`<span class="note">${esc(it.cutMsg)}</span>`:""}
      <button type="button" class="pill small" data-a="toggle" aria-expanded="${it.open}">${it.open?"סגירת העריכה":"עריכת תמונה"}</button>
      ${it.open?editorHTML(it):""}
      ${it.busy?`<span class="busy">מעבד…</span>`:""}`}
      <div class="row st-order"><span class="st-n">${k+1}</span><button type="button" class="pill small" data-a="up" ${k===0?"disabled":""} aria-label="להזיז אחורה בסדר">→</button><button type="button" class="pill small" data-a="down" ${k===S.staged.length-1?"disabled":""} aria-label="להזיז קדימה בסדר">←</button>${k>0&&it.kind==="image"?`<button type="button" class="pill small" data-a="first">לראשית</button>`:k===0?`<span class="note">ראשית</span>`:""}</div>
      <div class="row"><button type="button" class="pill small danger" data-a="rm">הסרה</button></div>
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
  if(a==="up"||a==="down"){const j=a==="up"?k-1:k+1;if(j<0||j>=S.staged.length)return;[S.staged[k],S.staged[j]]=[S.staged[j],S.staged[k]];renderStaged();return}
  if(a==="toggle"){it.open=!it.open;renderStaged();return}
  if(a==="cutout"){makeCutout(it);return}
  if(a==="crop"){openCrop(it);return}
  if(a==="noillus"){it.illus=false;it.sceneOn=false;it.cutMsg="";renderStaged();return}
  if(a==="rotL"||a==="rotR"){it.ed.rot+=a==="rotL"?-90:90;it.ed.crop=null}if(a==="flip")it.ed.flip=!it.ed.flip;
  if(a==="auto")Object.assign(it.ed,{b:108,c:112,s:122});if(a==="reset")it.ed={...ED0};
  if(a==="auto"||a==="reset")renderStaged();
  process(it)});
$("#fH").oninput=()=>renderStaged();
// Technology is picked automatically from the materials (other materials like wood or metal are ignored)
function techFromMaterials(t){
  const v=String(t||"").toLowerCase();
  const resin=/שרף|רזין|resin|\bsla\b|msla|\bdlp\b|\blcd\b/.test(v);
  const fdm=/\bfdm\b|\bpla\b|petg|\babs\b|\basa\b|\btpu\b|פילמנט|filament|nylon|ניילון|פי.?אל.?איי/.test(v);
  return resin&&fdm?"FDM+Resin":resin?"Resin":fdm?"FDM":"";
}
function autoTech(){const t=techFromMaterials($("#fMat").value);
  if(t){$("#fTech").value=t;$("#techAuto").textContent="· נבחר לפי החומרים"}else $("#techAuto").textContent="";}
$("#fMat").addEventListener("input",autoTech);
$("#fMount").onchange=()=>renderStaged();

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
    const w={id,name:$("#fName").value.trim(),heightCm:+$("#fH").value,materials:$("#fMat").value.trim(),status:$("#fStatus").value,section:$("#fSection").value,mount:$("#fMount").value,summary:$("#fSum").value.trim(),character:$("#fChar").value.trim(),category:$("#fCat").value,scale:$("#fScale").value.trim(),tech:techFromMaterials($("#fMat").value)||$("#fTech").value,createdAt:before?before.createdAt:Date.now(),order:before?before.order??null:null,media};
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
    out.push({kind:"image",raw,orig,illus:!!s.illus,aiCut:s.aiCut||null,sceneOn:!!(s.illus&&s.aiCut&&s.sceneOn),ed:s.ed,wm:s.wm||null});
  }
  return out;
}
function structuredCloneSafe(w){return w?{...w,media:w.media.map(m=>({...m}))}:null}
function upsert(w){const i=S.works.findIndex(x=>x.id===w.id);if(i>=0)S.works[i]=w;else S.works.push(w)}
function resetForm(){$("#wf").reset();$("#techAuto").textContent="";$("#scaleWhy").textContent="";clearAiMarks();S.staged=[];S.editing=null;$("#fCancel").hidden=true;$("#fSave").textContent="שמירה בגלריה";$("#formTitle").textContent="יצירה חדשה";$("#aiOpts").innerHTML="";$("#aiPicked").hidden=true;$("#aiState").textContent="יופיעו אוטומטית אחרי העלאת תמונה.";renderStaged()}
$("#fCancel").onclick=resetForm;

function renderAdminList(){
  const list=[...S.works].sort(byOrder);
  $("#adList").innerHTML=list.map((w,i)=>{const im=firstImg(w);return `<div class="li" data-id="${esc(w.id)}"><span class="drag" title="גרירה לשינוי הסדר" aria-label="גרירה לשינוי הסדר">⠿</span><span class="li-n">${i+1}</span>${im?`<img src="${im.orig}" alt="" draggable="false">`:""}<div class="t"><b>${esc(w.name)}${w.example?" · דוגמה":""}</b>${hasWm(w)?`<span class="wm-tag" title="${esc(wmText(w))}">⚠️ סימן מים</span>`:""}<span>${w.section==="gift"?"🎁 מתנות · ":""}${esc(w.heightCm)} ס"מ · ${w.status==="sale"?"זמין לרכישה":"מוצג בלבד"}</span></div><div class="li-mv"><button class="pill small" data-a="top" ${i===0?"disabled":""} title="להעביר לראשון">⤒ ראשון</button><button class="pill small" data-a="mup" ${i===0?"disabled":""} aria-label="למעלה">↑</button><button class="pill small" data-a="mdown" ${i===list.length-1?"disabled":""} aria-label="למטה">↓</button></div><button class="pill small" data-a="edit">עריכה</button><button class="pill small danger" data-a="del">מחיקה</button></div>`}).join("");
  $("#undoBtn").disabled=!S.history.length;$("#undoNote").textContent=S.history.length?`${S.history.length} פעולות לביטול (עד 10)`:"";
}
/* ---- Reordering works: drag the ⠿ handle, or use ⤒ / ↑ / ↓ ---- */
async function saveOrder(ids){
  const changed=[];ids.forEach((id,i)=>{const w=S.works.find(x=>x.id===id);if(w&&w.order!==i){w.order=i;changed.push(w)}});
  render();renderAdminList();
  const real=changed.filter(w=>!w.example);if(!real.length)return;
  const res=await Promise.all(real.map(w=>sb.from("works").update({sort_order:w.order}).eq("id",w.id)));
  toast(res.some(r=>r.error)?"שמירת הסדר נכשלה":"הסדר נשמר");
}
const listIds=()=>[...document.querySelectorAll("#adList .li")].map(r=>r.dataset.id);
$("#adList").addEventListener("click",e=>{const b=e.target.closest("button[data-a]");if(!b||!["top","mup","mdown"].includes(b.dataset.a))return;
  e.stopImmediatePropagation();const ids=listIds(),id=b.closest(".li").dataset.id,i=ids.indexOf(id);ids.splice(i,1);
  ids.splice(b.dataset.a==="top"?0:b.dataset.a==="mup"?i-1:i+1,0,id);saveOrder(ids)},true);
let DRAG=null;
$("#adList").addEventListener("pointerdown",e=>{const h=e.target.closest(".drag");if(!h)return;e.preventDefault();
  const row=h.closest(".li");DRAG={row,start:listIds().join()};row.classList.add("dragging");h.setPointerCapture(e.pointerId)});
$("#adList").addEventListener("pointermove",e=>{if(!DRAG)return;
  const scroller=$("#ad");const r=scroller.getBoundingClientRect();
  if(e.clientY<r.top+70)scroller.scrollTop-=12;else if(e.clientY>r.bottom-70)scroller.scrollTop+=12;
  const rows=[...document.querySelectorAll("#adList .li")].filter(x=>x!==DRAG.row);
  const over=rows.find(x=>{const b=x.getBoundingClientRect();return e.clientY<b.top+b.height/2});
  if(over){if(over.previousElementSibling!==DRAG.row)over.before(DRAG.row)}else $("#adList").appendChild(DRAG.row);
  document.querySelectorAll("#adList .li-n").forEach((n,i)=>n.textContent=i+1)});
const dragEnd=()=>{if(!DRAG)return;const ids=listIds(),moved=ids.join()!==DRAG.start;DRAG.row.classList.remove("dragging");DRAG=null;if(moved)saveOrder(ids)};
$("#adList").addEventListener("pointerup",dragEnd);$("#adList").addEventListener("pointercancel",dragEnd);
$("#adList").addEventListener("click",async e=>{
  const b=e.target.closest("button[data-a]");if(!b)return;const row=b.closest(".li");const w=S.works.find(x=>x.id===row.dataset.id);
  if(b.dataset.a==="edit"){S.editing=w.id;$("#fName").value=w.name;$("#fH").value=w.heightCm;$("#fMat").value=w.materials||"";$("#fStatus").value=w.status;$("#fSection").value=w.section||"collect";$("#fMount").value=w.mount||"stand";$("#fSum").value=w.summary||"";$("#fChar").value=w.character||"";$("#fCat").value=w.category||"";$("#fScale").value=w.scale||"";$("#fTech").value=w.tech||"";autoTech();$("#scaleWhy").textContent="";clearAiMarks();
    S.staged=w.media.map(m=>({sid:++sid,kind:m.kind,name:"",progress:1,ready:true,raw:m.raw||m.orig,orig:m.orig,illus:!!m.illus,aiCut:m.aiCut||null,ed:m.ed||(m.enh?{...ED0,b:108,c:112,s:122}:{...ED0}),open:false,sceneOn:!!m.sceneOn,blob:m.blob,url:m.url,wm:m.wm||null}));
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
function showTab(name){document.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.tab===name?"true":"false"));document.querySelectorAll("[data-pane]").forEach(p=>p.hidden=p.dataset.pane!==name);if(name==="list")renderAdminList();}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

/* ================= Landing texts (editable) ================= */
const DEFAULT_TEXTS={
  h1a:"כל פסל",h1hl:"נולד",h1b:"מהלב.",h1red:"בהדפסה.",
  eyebrow:"סטודיו לפסלי אספנות · צבוע ביד",
  sub:"פסלי אספנות ומתנות ייחודיות, בהדפסת תלת־ממד וצביעה ידנית.",
  aboutEyebrow:"מי אני",
  aboutTitle:"פותר בעיות דרך אמנות. / מאז שאני זוכר את עצמי.",
  aboutText:"בילדות זה היה נייר, פלסטלינה, חימר וקרטון. היום זה מידול, הדפסת תלת־ממד וצביעה ידנית. כל יצירה נבנית מאפס, בשבילך.",
  aboutStats:"1/1 | כל פסל הוא פריט אחד במינו\n100% | צבוע ביד, שכבה אחרי שכבה\nימים עד חודשים | של עבודה על כל יצירה\nVIP | מתנות ייחודיות לאנשים מיוחדים",
  finale:"יש דמות שלא יוצאת מהראש? / בואו נהפוך אותה לפסל.",
  p1:"אני נותן פתרונות יצירתיים. מאז ילדות אני פותר בעיות דרך אמנות: ציור, פיסול בנייר, פלסטלינה, חימר וקרטון. היום אני עובד עם **הדפסת תלת־ממד ביתית**: מידול, הדפסה וצביעה ידנית ייחודית.",
  p2:"יצרתי מתנות לאישי ציבור, שופטים, רופאים וכוחות ביטחון. רוב היצירות שלי מגיעות לאספנים שמחפשים פריט אחד במינו. **כל יצירה לוקחת ימים עד חודשים.**",
  burst:"יד\nאחת\nפסל אחד",ctaMain:"לגלריה ←",ctaOrder:"להזמנה אישית",
  giftEyebrow:"מתנות ייחודיות",giftTitle:"מתנה שאין / לאף אחד אחר.",
  giftText:"מעבר לפסלי האספנות, אני יוצר **מתנות אישיות אחת במינן**: ליום הולדת, לאירוע, לפרישה, לצוות, או למי שכבר יש לו הכול. מרעיון או תמונה ועד פריט מודפס וצבוע ביד.",
  giftCta:"אני רוצה מתנה כזו!",
  nudgePiece:"וואו, איך זה יצא במציאות? תמונה אחת שווה אלף כוכבים.\nבלי תמונה זה לא קרה! איך זה נראה אחרי שהגיע?\nאיך הגיבו למתנה? תמונה של הרגע תשמח את כולם.\nצילום מהיר מהטלפון מספיק, שכולם יראו איך זה נראה באמת.\nתמונה אחת עוזרת למי שמתלבט יותר מכל מילה.",
  nudgeLesson:"יש תמונה של מה שצבעתם בהדרכה? נשמח לראות את התוצאה!\nהדגם הראשון אחרי ההדרכה? זה הרגע להשוויץ בו.\nתמונה של העבודה מההדרכה תעזור למי שמתלבט אם להצטרף.",
  nudgeDone:"יש! 🔥 הרבה יותר שווה עם תמונה.\nמושלם, תודה על התמונה! 📸\nוואו, איזה יופי. תודה!",
  rvThanks:"וואו, תודה על הזמן ועל המילים!\nתודה ענקית ששיתפת את החוויה! 🙏\nאיזה כיף לקרוא. תודה על כל מילה!\nתודה! זה באמת משמח אותי.",
  introLines:DEFAULT_INTRO,studioLines:DEFAULT_STUDIO,
  galNote:"התמונות בגלריה עוברות עריכה קלה של תאורה, צבע ורקע כדי להתאים לתצוגה באתר. ייתכנו הבדלי גוון קלים בין מסכים. הפסל עצמו, כמובן, צבוע ביד ונאמן לעבודה המקורית.",
  wsEyebrow:"סדנאות והדרכות צביעה",
  wsTitle:"מכחול ביד אחת. / איירבראש ביד השנייה.",
  wsText:"מעבר לפסלים, אני מעביר **הדרכות אישיות וסדנאות** בצביעת פסלים ומיניאטורות. איך מחזיקים, מדללים ומכוונים, ולמה כל שכבה נמצאת בדיוק במקום שלה. מתאים גם למי שעוד לא החזיק איירבראש ביד, וגם למי שכבר צובע ורוצה לעלות רמה.",
  wsFormats:"הדרכה אישית, אחד על אחד\nסדנה בקבוצה קטנה\nמהצעד הראשון ועד רמה מתקדמת",
  wsAir:"תפעול, ניקוי ותחזוקה\nדילול צבע ולחץ אוויר\nפריימר ושכבות בסיס\nמעברי צבע חלקים\nזניטל: אור וצל מלמעלה\nמיסוך ועבודה עם שבלונות",
  wsBrush:"דריי בראש (Dry Brush)\nווט בלנדינג (Wet Blending)\nווש והצללות (Wash)\nשכבות והדגשות (Layering)\nהדגשת קצוות (Edge Highlight)\nגלייזינג (Glazing)",
  wsCombo:"**ההמלצה שלי: לשלב את שניהם.** האיירבראש בונה את הבסיס, האור והמעברים. המכחול מוסיף את הפרטים, את המבט ואת האופי.",
  wsCta:"אני רוצה לצבוע ככה!",wsPhotos:[],
  heroMode:"rotate",btnIg:true,btnTt:true,btnWa:true,btnLearn:true,btnGuide:true,waNumber:"",navOrder:["home","gallery","reviews","gifts","learn","guide"]
};
let TEXTS={...DEFAULT_TEXTS};
const rich=t=>esc(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
function renderTexts(){
  const T=TEXTS;
  $("#tH1").innerHTML=`${esc(T.h1a)} ${T.h1hl?`<em>${esc(T.h1hl)}</em>`:""}<br>${esc(T.h1b)} ${T.h1red?`<b>${esc(T.h1red)}</b>`:""}`;
  $("#tP1").innerHTML=rich(T.p1);$("#tP2").innerHTML=rich(T.p2);$("#tP2").hidden=!T.p2;
  $("#aboutMore").hidden=!String(T.p1||"").trim()&&!String(T.p2||"").trim();
  $("#tEyebrow").textContent=T.eyebrow||"";$("#tEyebrow").hidden=!String(T.eyebrow||"").trim();
  $("#tSub").innerHTML=rich(T.sub||"");$("#tSub").hidden=!String(T.sub||"").trim();
  const two2=t=>{const [a,b]=String(t||"").split("/").map(x=>x.trim());return `${esc(a||"")}${b?`<br><span>${esc(b)}</span>`:""}`};
  $("#aboutEyebrow").textContent=T.aboutEyebrow||"";
  $("#aboutTitle").innerHTML=two2(T.aboutTitle);
  $("#aboutText").innerHTML=rich(T.aboutText||"");
  $("#aboutStats").innerHTML=String(T.aboutStats||"").split("\n").map(x=>x.trim()).filter(Boolean).slice(0,6).map(x=>{const [a,b]=x.split("|").map(y=>y.trim());return `<div class="stat"><b dir="auto">${esc(a||"")}</b>${b?`<span>${esc(b)}</span>`:""}</div>`}).join("");
  $("#about").hidden=!String(T.aboutTitle||"").trim()&&!String(T.aboutText||"").trim();
  $("#finaleTitle").innerHTML=two2(T.finale);$("#finale").hidden=!String(T.finale||"").trim();
  $("#finaleOrder").textContent=T.ctaOrder||"להזמנה אישית";
  $("#tBurst").textContent=T.burst;$("#tBurst").hidden=!T.burst.trim();
  $("#ctaMain").textContent=String(T.ctaMain||"לגלריה ←").replace("↓","←");$("#ctaOrder").textContent=T.ctaOrder||"להזמנה אישית";$("#orderBar").textContent=T.ctaOrder||"להזמנה אישית";
  const [g1,g2]=String(T.giftTitle||"").split("/").map(x=>x.trim());
  $("#giftEyebrow").textContent=T.giftEyebrow||"";
  $("#giftTitle").innerHTML=`${esc(g1||"")}${g2?`<br><span>${esc(g2)}</span>`:""}`;
  $("#giftText").innerHTML=rich(T.giftText||"");$("#giftCta").textContent=T.giftCta||"אני רוצה מתנה כזו!";
  const giftOn=!!String(T.giftText||"").trim();
  $("#navGifts").hidden=!giftOn;
  setCaption(pickLine("studio",T.studioLines));
  $("#galNote").textContent=T.galNote||"";$("#galNote").hidden=!String(T.galNote||"").trim();$("#footNote").textContent=T.galNote?"* "+T.galNote:"";$("#footNote").hidden=!String(T.galNote||"").trim();
  const lines=t=>String(t||"").split("\n").map(x=>x.trim()).filter(Boolean);
  const [wa1,wa2]=String(T.wsTitle||"").split("/").map(x=>x.trim());
  $("#wsEyebrow").textContent=T.wsEyebrow||"";
  $("#wsTitle").innerHTML=`${esc(wa1||"")}${wa2?`<br><span>${esc(wa2)}</span>`:""}`;
  $("#wsText").innerHTML=rich(T.wsText||"");
  $("#wsFormats").innerHTML=lines(T.wsFormats).map(x=>`<li>${esc(x)}</li>`).join("");
  $("#wsAir").innerHTML=lines(T.wsAir).map(x=>`<li>${esc(x)}</li>`).join("");
  $("#wsBrush").innerHTML=lines(T.wsBrush).map(x=>`<li>${esc(x)}</li>`).join("");
  $("#wsCombo").innerHTML=rich(T.wsCombo||"");
  $("#wsCta").textContent=T.wsCta||"אני רוצה ללמוד לצבוע!";
  const wsOn=!!String(T.wsText||"").trim();
  $("#navLearn").hidden=!wsOn||T.btnLearn===false;
  applyNavOrder();
  if(typeof renderHome==="function"&&S.works.length)renderHome();
  const ph=Array.isArray(T.wsPhotos)?T.wsPhotos:[];
  $("#wsPhotos").hidden=!ph.length;
  $("#wsPhotos").innerHTML=ph.map((u,i)=>`<button type="button" data-ph="${i}" aria-label="תמונה ${i+1} מהסדנה"><img src="${esc(u)}" alt="" loading="lazy"></button>`).join("");
  // Buttons the admin chose to show
  const vis=(sels,on)=>sels.forEach(x=>{const el=$(x);if(el)el.hidden=!on});
  vis(["#igTop","#igBar","#ctIg","#igGuide"],T.btnIg!==false);
  vis(["#ttTop","#ttBar","#ctTt","#ttGuide"],T.btnTt!==false);
  vis(["#navGuide"],T.btnGuide!==false);
  let n=String(T.waNumber||"").replace(/\D/g,"");if(n.startsWith("0"))n="972"+n.slice(1);
  CFG.whatsapp=T.btnWa!==false&&n.length>=9?n:"";
  $("#waBar").hidden=!CFG.whatsapp;if(CFG.whatsapp)$("#waBar").href=wa("היי ARTRIKO, ראיתי את הגלריה ואשמח לשמוע עוד");
  cacheLines("intro",T.introLines);
}
renderTexts();
const TF={heroMode:"#xHeroMode",eyebrow:"#xEyebrow",sub:"#xSub",aboutEyebrow:"#xAboutEyebrow",aboutTitle:"#xAboutTitle",aboutText:"#xAboutText",aboutStats:"#xAboutStats",finale:"#xFinale",h1a:"#xH1a",h1hl:"#xH1hl",h1b:"#xH1b",h1red:"#xH1red",p1:"#xP1",p2:"#xP2",burst:"#xBurst",ctaMain:"#xCtaMain",ctaOrder:"#xCtaOrder",giftEyebrow:"#xGiftEyebrow",giftTitle:"#xGiftTitle",giftText:"#xGiftText",giftCta:"#xGiftCta",nudgePiece:"#xNudgePiece",nudgeLesson:"#xNudgeLesson",nudgeDone:"#xNudgeDone",rvThanks:"#xRvThanks",galNote:"#xGalNote",wsEyebrow:"#xWsEyebrow",wsTitle:"#xWsTitle",wsText:"#xWsText",wsFormats:"#xWsFormats",wsCta:"#xWsCta",wsAir:"#xWsAir",wsBrush:"#xWsBrush",wsCombo:"#xWsCombo",waNumber:"#xWaNumber",introLines:"#xIntro",studioLines:"#xStudio"};
const BF={btnIg:"#xBtnIg",btnTt:"#xBtnTt",btnWa:"#xBtnWa",btnLearn:"#xBtnLearn",btnGuide:"#xBtnGuide"};
function fillTextForm(){for(const k in TF)$(TF[k]).value=TEXTS[k]??"";for(const k in BF)$(BF[k]).checked=TEXTS[k]!==false;renderWsPhAdmin()}
$("#tf").onsubmit=async e=>{e.preventDefault();const before={...TEXTS};for(const k in TF)TEXTS[k]=$(TF[k]).value;for(const k in BF)TEXTS[k]=$(BF[k]).checked;await putSetting("texts",TEXTS);pushHist({type:"texts",before,after:{...TEXTS}});renderTexts();if(before.heroMode!==TEXTS.heroMode){HERO_ID=null;render()}$("#xMsg").textContent="נשמר. הדף הראשי עודכן."};
$("#xReset").onclick=()=>{TEXTS={...TEXTS,...DEFAULT_TEXTS};fillTextForm();$("#xMsg").textContent="הטקסט המקורי חזר לטופס. לחץ שמירה כדי להחיל."};

/* ================= Voice samples for the generator ================= */
let VOICE={samples:"",rules:""};
$("#vf").onsubmit=async e=>{e.preventDefault();VOICE={samples:$("#xVoice").value.trim(),rules:$("#xVoiceRules").value.trim()};await putSetting("voice",VOICE);$("#vMsg").textContent=VOICE.samples?"נשמר. ההצעות הבאות ייכתבו בסגנון הזה.":"נשמר. בלי דוגמאות, ההצעות ייכתבו בסגנון פופ־ארט כללי."};

/* ================= AI title + summary suggestions ================= */
let aiCtl=null,aiTimer=null;
// Smaller JPEG copies for the AI request (keeps the request well under the upload limit)
async function shrinkForAI(src,max=1024){const i=await loadImg(src);const k=Math.min(1,max/Math.max(i.width,i.height));const c=document.createElement("canvas");c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(i,0,0,c.width,c.height);return c.toDataURL("image/jpeg",.85)}
function queueSuggest(){clearTimeout(aiTimer);aiTimer=setTimeout(()=>{if(S.staged.some(s=>s.kind==="image"&&s.ready))suggest(false)},900)}
// Taglines and summaries already used on the site, so new suggestions don't repeat them
function usedTexts(){
  const ws=S.works.filter(w=>!w.example&&w.id!==S.editing).slice(0,30);
  if(!ws.length)return"";
  const tags=ws.map(w=>String(w.name||"").split(/\s[–-]\s/).slice(1).join(" ").trim()).filter(Boolean);
  const sums=ws.map(w=>String(w.summary||"").split(/(?<=[.!?])\s/)[0].trim()).filter(Boolean);
  return `\n- כבר משתמשים באתר בכותרות ובפתיחים האלה. אל תחזור עליהם ואל תכתוב משהו דומה מדי:\n  כותרות: ${tags.slice(0,30).map(t=>`"${t}"`).join(", ")}\n  פתיחי תקציר: ${sums.slice(0,20).map(t=>`"${t.slice(0,90)}"`).join(" | ")}`;
}
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
  1. עובדה אמיתית ומפתיעה על הדמות, משהו שלא כולם יודעים: מאחורי הקלעים, היוצרים, הופעה ראשונה, גרסה נשכחת, פרט מהקומיקס, מהסרט או מהצעצועים (למשל מי עיצב גרסה מפורסמת). כל אחת משלוש ההצעות עם עובדה אחרת. רק עובדות שאתה בטוח בהן ב־100%.
  2. ${withImages?"פרט ויזואלי אחד שבאמת רואים בתמונות של הפסל.":"משהו על כך שזה פסל מודפס וצבוע ביד."}
  3. משפט קצר שמזמין אספנים לפנות.
- כל הצעה בטון אחר: אחת מצחיקה, אחת מרגשת, אחת נועזת.
- אל תמציא פרטים טכניים (שעות עבודה, מחיר, חומרים) שלא נמסרו.
- כל הצעה חייבת להיות מקורית: בלי לפתוח באותן מילים כמו הצעה אחרת, ובלי ביטויים שחוזרים על עצמם.${usedTexts()}${v}${r}
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
/* Keyword-based suggestions: used when Gemini and OpenAI are both unavailable */
const EN_NAMES={"באטמן":"BATMAN","בטמן":"BATMAN","ספיידרמן":"SPIDER-MAN","ספיידר מן":"SPIDER-MAN","סופרמן":"SUPERMAN","איירון מן":"IRON MAN","איירונמן":"IRON MAN","ג'וקר":"JOKER","גוקר":"JOKER","דדפול":"DEADPOOL","וונדר וומן":"WONDER WOMAN","האלק":"HULK","הענק הירוק":"HULK","תור":"THOR","לוקי":"LOKI","דארת' ויידר":"DARTH VADER","דארת ויידר":"DARTH VADER","יודה":"YODA","גרוט":"GROOT","ונום":"VENOM","וולברין":"WOLVERINE","קפטן אמריקה":"CAPTAIN AMERICA","טנוס":"THANOS","פיקאצ'ו":"PIKACHU","גוקו":"GOKU","נארוטו":"NARUTO","בלאק פנתר":"BLACK PANTHER","דוקטור סטריינג'":"DOCTOR STRANGE","הארלי קווין":"HARLEY QUINN","מנדלוריאן":"MANDALORIAN","פרדטור":"PREDATOR","חייזר":"ALIEN","גודזילה":"GODZILLA","שרק":"SHREK","סוניק":"SONIC","מריו":"MARIO","קרייטוס":"KRATOS","ווקר":"WALKER","גנדלף":"GANDALF","גולום":"GOLLUM"};
const pickN=(a,n)=>[...a].sort(()=>Math.random()-.5).slice(0,n);
// A few verified "did you know" facts for popular characters (used when the AI is unavailable)
const CHAR_FACTS={
  "BATMAN":["באטמן הופיע לראשונה ב־Detective Comics מס' 27 ב־1939, והקרדיט המלא ליוצרים, בוב קיין וביל פינגר, ניתן רק עשרות שנים אחר כך.","ביל פינגר, השותף השקט ביצירת באטמן, הוא זה שהגה את הגלימה השחורה ואת השם ברוס וויין."],
  "SPIDER-MAN":["ספיידרמן הופיע לראשונה ב־Amazing Fantasy מס' 15 ב־1962, בגיליון שהיה אמור להיות האחרון של הסדרה.","סטן לי ו־סטיב דיטקו יצרו את ספיידרמן כגיבור נער עם בעיות של נער, רעיון שנחשב אז מסוכן מבחינה מסחרית."],
  "SUPERMAN":["סופרמן הופיע לראשונה ב־Action Comics מס' 1 ב־1938, פרי יצירתם של שני נערים מקליבלנד: ג'רי סיגל וג'ו שוסטר.","בגרסאות הראשונות סופרמן בכלל לא עף, הוא רק קפץ גבוה מאוד."],
  "DEADPOOL":["דדפול הופיע לראשונה ב־New Mutants מס' 98 ב־1991, בכלל בתור נבל.","השם האמיתי של דדפול, ווייד ווילסון, הוא קריצה לנבל של DC בשם סלייד ווילסון (Deathstroke)."],
  "JOKER":["הג'וקר הופיע לראשונה ב־Batman מס' 1 ב־1940, ובתוכנית המקורית היה אמור למות כבר בסוף הסיפור הראשון."],
  "WOLVERINE":["וולברין הופיע לראשונה במלואו בגיליון של ההאלק, Incredible Hulk מס' 181 ב־1974, הרבה לפני שהצטרף לאקס־מן."],
  "IRON MAN":["איירון מן הופיע לראשונה ב־Tales of Suspense מס' 39 ב־1963, ובשריון הראשון שלו היה אפור וגושי."],
  "HULK":["בגיליון הראשון ב־1962 ההאלק היה בכלל אפור. הצבע הוחלף לירוק בגיליון השני בגלל בעיות בהדפסה."],
  "THOR":["תור של מארוול הופיע לראשונה ב־Journey into Mystery מס' 83 ב־1962."],
  "VENOM":["ונום הופיע לראשונה במלואו ב־Amazing Spider-Man מס' 300 ב־1988, והחליפה השחורה שלו התחילה כרעיון שנשלח ע\"י קורא."],
  "DARTH VADER":["את דארת' ויידר גילם על הסט דייוויד פראוז, אבל את הקול המפורסם נתן ג'יימס ארל ג'ונס."],
  "GROOT":["גרוט הופיע לראשונה ב־1960 ב־Tales to Astonish מס' 13, בכלל כמפלצת עץ מהחלל, הרבה לפני שהפך לגיבור חביב."],
  "PIKACHU":["השם פיקאצ'ו מחבר שתי מילות צליל ביפנית: 'פיקה' לניצוץ חשמלי ו'צ'ו' לציוץ של עכבר."],
  "BUMBLEBEE":["בסדרה המקורית של שנות ה־80 באמבלבי היה חיפושית פולקסווגן, ורק בסרט של 2007 הפך לקמארו."],
  "WONDER WOMAN":["היוצר של וונדר וומן, ויליאם מולטון מרסטון, היה פסיכולוג שעבד גם על פיתוח מוקדם של גלאי שקר, מכאן לאסו האמת."],
  "CAPTAIN AMERICA":["הגיליון הראשון של קפטן אמריקה יצא ב־1941, עם כריכה שבה הוא מכה את היטלר, עוד לפני שארה\"ב נכנסה למלחמה."],
  "THANOS":["תאנוס נוצר ע\"י ג'ים סטרלין והופיע לראשונה ב־Iron Man מס' 55 ב־1973."],
  "GOKU":["גוקו מבוסס על סון ווקונג, מלך הקופים מהרומן הסיני הקלאסי 'מסע אל המערב'."]
};
function localSuggest(){
  const hint=$("#aiHint").value.trim(),name=$("#fName").value.trim();
  const parts=(hint||name).split(/[,،\n]/).map(x=>x.trim()).filter(Boolean);
  let he=parts[0]||"";const extra=parts.slice(1).join(", ");
  let en=cleanEn((he.match(/[A-Za-z][A-Za-z0-9 .'&:-]*/)||[""])[0]);
  if(!en){const k=Object.keys(EN_NAMES).sort((a,b)=>b.length-a.length).find(k=>he.includes(k));if(k)en=EN_NAMES[k]}
  if(/^[A-Za-z0-9 .'&:-]+$/.test(he))he=en||he;
  const who=he||"הדמות הזו";
  // phrases already used on the site are skipped so suggestions don't repeat
  const used=S.works.filter(w=>!w.example&&w.id!==S.editing).map(w=>String(w.name||"")+" "+String(w.summary||"")).join(" ");
  const fresh=list=>{const f=list.filter(t=>!used.includes(t.slice(0,18)));return f.length?f:list};
  const facts=pickN(CHAR_FACTS[en]||[],3);
  const T={
    funny:{t:["צבוע ביד, מסוכן בעין","מגיע עם אגו מוכן","קטן בגודל, ענק באופי","מוכן לכבוש את המדף","עבר מהמסך אל המדף","הגיע, ראה, ניצח את המדף","בלי פילטרים, רק צבע","האורח הכי רועש בוויטרינה"],
      s:[`${who} הגיע לסטודיו, ישב בסבלנות מול האיירבראש ויצא עם יותר סטייל ממה שנכנס.`,`אזהרה: ${who} לא מסכים לעמוד ליד פסלים משעממים.`,`${who} ביקש תאורה טובה וצד מצולם. קיבל את שניהם.`,`תכננו פסל קטן ושקט. ${who} החליט אחרת.`],
      e:["מודפס בתלת־ממד וצבוע ביד, שכבה אחרי שכבה. מקום על המדף כבר יש?","הדפסה מדויקת, צביעה ידנית ואופי שאי אפשר לפספס.","כל פרט נצבע ביד, כולל אלה שרואים רק מקרוב."]},
    warm:{t:["כל שכבה מספרת סיפור","נולד מצבע וסבלנות","רגע אחד, לנצח על המדף","מהלב, ביד, לאט","זיכרון שאפשר להחזיק ביד","כמו שזוכרים, רק קרוב יותר"],
      s:[`יש דמויות שנשארות איתנו מהילדות, ו${who} בהחלט אחת מהן.`,`${who}, כמו שזוכרים אותו, רק קרוב יותר.`,`יש משהו מיוחד ברגע שבו ${who} מקבל את שכבת הצבע האחרונה.`],
      e:["נבנה כאן בהדפסה מדויקת ונצבע ביד, עם תשומת לב לכל צל ולכל ניצוץ.","כל משיכת מכחול נעשתה ביד ובסבלנות, עד שהדמות התחילה לנשום.","פריט אחד במינו לאספנים שמרגישים את זה."]},
    bold:{t:["אגדה בגימור מלא","שליט המדף החדש","בלי פשרות, רק צבע","נוכחות שאי אפשר להתעלם ממנה","עוצמה בגובה העיניים","הגרסה שלא תמצאו בחנות"],
      s:[`${who} בגרסת ARTRIKO.`,`לא עוד פסל מהמדף בחנות.`,`${who} כמו שלא ראיתם קודם.`],
      e:["הדפסה מדויקת, צביעה ידנית מלאה וגימור שלא מתפשר. יש רק אחד כזה.","מודפס ונצבע ביד מאפס, עם עומק, צללים והדגשות שבונים נוכחות.","לאספנים שמחפשים משהו אמיתי. לפרטים, אפשר לכתוב לי."]}
  };
  const add=extra?` בגרסה הזו: ${extra}.`:"";
  return ["funny","warm","bold"].map((k,i)=>{
    const fact=facts.length?facts[i%facts.length]:"";
    const body=[pickN(fresh(T[k].s),1)[0],fact,pickN(fresh(T[k].e),1)[0]].filter(Boolean).join(" ");
    return {title:formatTitle(en,pickN(fresh(T[k].t),1)[0],he),summary:withExtra(body,add)};
  });
}
// put the artist's extra keywords just before the closing sentence
function withExtra(text,add){if(!add)return text;const ss=text.match(/[^.?!]+[.?!]+/g)||[text];if(ss.length<2)return (text+add).trim();ss.splice(ss.length-1,0,add);return ss.join("").replace(/\s+/g," ").trim()}
function showOptions(list,who,state){
  $("#aiPicked").hidden=true;
  $("#aiOpts").innerHTML=who+list.map((o,i)=>`<div class="opt" data-i="${i}"><b>${esc(o.title)}</b><p>${esc(o.summary||"")}</p><div class="row"><button type="button" class="pill small" data-use="${i}">להשתמש בזו</button></div></div>`).join("");
  $("#aiOpts").dataset.json=JSON.stringify(list);
  $("#aiState").textContent=state;
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
    const via=j.provider==="openai"?"Gemini היה עמוס, אז ההצעות הגיעו מ־OpenAI. ":"";
    showOptions(list,who,via+(images.length?`נשלחו ${images.length} תמונות. `:"")+"בחר הצעה. אפשר לערוך אחרי שהיא נכנסת לטופס.");
  }catch(e){
    const code=e?.name==="AbortError"?"cancelled":e?.code;
    if(my!==aiCtl)return;
    if(code==="cancelled"){$("#aiState").textContent="נעצר.";return}
    if(code==="not_admin"){$("#aiState").textContent="צריך להיות מחובר כמנהל.";return}
    // AI unavailable: offer quick suggestions built from the keywords instead
    const why={rate_limited:"Gemini הגיע למגבלת השימוש",no_key:"מפתח ה־AI לא מוגדר",refused:"ה־AI לא כתב הצעה לתמונות האלה",invalid_json:"התשובה מה־AI לא הגיעה בפורמט הנכון"}[code]||"ה־AI לא זמין כרגע";
    const hasWords=$("#aiHint").value.trim()||$("#fName").value.trim();
    const list=localSuggest();
    showOptions(list,`<div class="opt-who"><span>הצעות מהירות לפי מילות מפתח</span><small>${hasWords?"נבנו מהטקסט שכתבת. ":"כדאי לכתוב בשדה למעלה מי הדמות (למשל: באטמן, באסט, צבעים כהים) ולחץ \"הצעות חדשות\". "}לסיווג (קטגוריה, קנה מידה) צריך את ה־AI, אז כדאי לבדוק אותו ידנית.</small></div>`,`${why}, אז הנה הצעות מהירות לפי מילות המפתח. "הצעות חדשות" נותן גרסאות אחרות.`);
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
  if(["FDM","Resin","FDM+Resin"].includes(o.tech)&&!techFromMaterials($("#fMat").value))setAi("#fTech",o.tech);
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

/* ================= Background removal (remove.bg) for the in-room illustration ================= */
const CUT_ERR={not_admin:"צריך להיות מחובר כמנהל.",no_key:"מפתח remove.bg לא מוגדר ב־Vercel (REMOVEBG_API_KEY).",bad_key:"המפתח של שירות הסרת הרקע לא תקין. בדוק אותו ב־Vercel.",needs_credits:"נגמרו הקרדיטים החינמיים של remove.bg לחודש הזה. הם מתחדשים בתחילת החודש הבא, או שאפשר לקנות עוד באתר שלהם.",no_subject:"השירות לא הצליח לזהות את הפסל בתמונה. נסה תמונה עם רקע נקי יותר.",rate_limited:"יותר מדי בקשות. נסה שוב בעוד דקה.",needs_billing:"בחשבון OpenAI צריך קרדיט או אמצעי תשלום (Billing) כדי להשתמש במודל התמונות.",needs_verification:"OpenAI דורשים אימות ארגון (Verify Organization) בחשבון כדי להשתמש במודל התמונות.",upload_failed:"שמירת התמונה נכשלה. נסה שוב.",refused:"OpenAI סירבו לעבד את התמונה הזו."};
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

/* ================= Background video (admin) ================= */
let STUDIO={...STUDIO_DEFAULT,clips:[...STUDIO_DEFAULT.clips]},vDraft=null;
async function saveStudio(){try{await putSetting("studio",STUDIO);setStudio(STUDIO);renderStudio()}catch(e){toast("השמירה נכשלה")}}
function renderStudio(){
  $("#vList").innerHTML=STUDIO.clips.length?STUDIO.clips.map((u,i)=>`<div class="v-item"><video src="${esc(u)}" muted loop playsinline preload="metadata"></video><div class="row">${i>0?`<button type="button" class="pill small" data-v="up" data-i="${i}">↑</button>`:""}<button type="button" class="pill small danger" data-v="rm" data-i="${i}">הסרה</button></div></div>`).join(""):`<p class="note">עוד אין סרטון. העלה סרטון כדי שיופיע ברקע.</p>`;
  $("#vOn").checked=STUDIO.on!==false;$("#vOp").value=Math.round((STUDIO.opacity??.45)*100);
}
$("#vList").addEventListener("click",e=>{const b=e.target.closest("[data-v]");if(!b)return;const i=+b.dataset.i;
  if(b.dataset.v==="rm")STUDIO.clips.splice(i,1);
  if(b.dataset.v==="up")STUDIO.clips.splice(i-1,0,...STUDIO.clips.splice(i,1));
  saveStudio()});
$("#vList").addEventListener("pointerover",e=>{const v=e.target.closest("video");if(v)v.play().catch(()=>{})});
$("#vList").addEventListener("pointerout",e=>{const v=e.target.closest("video");if(v)v.pause()});
$("#vOn").onchange=e=>{STUDIO.on=e.target.checked;saveStudio()};
$("#vOp").onchange=e=>{STUDIO.opacity=+e.target.value/100;saveStudio()};
function showDraft(url){
  vDraft=url;$("#vDraft").hidden=false;
  $("#vDraft").innerHTML=`<video src="${esc(url)}" muted loop playsinline autoplay controls></video><div class="toolrow"><button type="button" class="pill" id="vAdd" style="background:var(--pop);border-color:var(--pop)">הוספה לרקע</button><button type="button" class="pill small" id="vSkip">לא טוב, לוותר</button></div>`;
  $("#vAdd").onclick=()=>{STUDIO.clips.push(vDraft);vDraft=null;$("#vDraft").hidden=true;saveStudio();toast("הקטע נוסף לרקע")};
  $("#vSkip").onclick=()=>{vDraft=null;$("#vDraft").hidden=true};
}
$("#vCopy").onclick=async()=>{try{await navigator.clipboard.writeText($("#vPrompt").value);toast("הפרומפט הועתק")}catch{$("#vPrompt").select()}};
$("#vUp").onclick=()=>$("#vFile").click();
$("#vFile").onchange=async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;
  if(f.size>48*1024*1024){$("#vsMsg").textContent="הסרטון גדול מ־48MB. קצר אותו ל־10–20 שניות או דחוס אותו.";return}
  try{const url=await uploadBlob(`studio/own-${crypto.randomUUID()}.${extOf(f.type)}`,f,(l,t)=>{$("#vsMsg").textContent=`מעלה… ${Math.round(l/t*100)}%`});$("#vsMsg").textContent="הסרטון עלה.";showDraft(url)}
  catch(err){$("#vsMsg").textContent="ההעלאה נכשלה: "+err.message}};

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

/* ================= Menu order (set in admin) ================= */
function navLabels(){return {home:"ראשי",gallery:"גלריה",reviews:"המלצות",gifts:"מתנות",learn:"סדנאות",guide:"המדריך לאספנים"}}
function navOrder(){const all=Object.keys(navLabels()),o=(Array.isArray(TEXTS.navOrder)?TEXTS.navOrder:[]).filter(k=>all.includes(k));return [...o,...all.filter(k=>!o.includes(k))]}
function applyNavOrder(){const nav=$("#secnav");if(!nav)return;navOrder().forEach(k=>{const a=nav.querySelector(`[data-k="${k}"]`);if(a)nav.appendChild(a)});renderNavOrderAdmin()}
function renderNavOrderAdmin(){const box=$("#navOrder");if(!box)return;const o=navOrder();
  box.innerHTML=o.map((k,i)=>`<div class="no-i" data-k="${k}"><span class="no-n">${i+1}</span><b class="no-l" data-k="${k}">${navLabels()[k]}</b><button type="button" class="pill small" data-mv="-1" ${i===0?"disabled":""} aria-label="להזיז למעלה">↑</button><button type="button" class="pill small" data-mv="1" ${i===o.length-1?"disabled":""} aria-label="להזיז למטה">↓</button></div>`).join("")}
$("#navOrder").addEventListener("click",async e=>{const b=e.target.closest("[data-mv]");if(!b||b.disabled)return;
  const o=navOrder(),k=b.closest("[data-k]").dataset.k,i=o.indexOf(k),j=i+ +b.dataset.mv;if(j<0||j>=o.length)return;
  [o[i],o[j]]=[o[j],o[i]];TEXTS.navOrder=o;applyNavOrder();renderHome();
  try{await putSetting("texts",TEXTS);toast("סדר התפריט נשמר")}catch(err){toast("השמירה נכשלה")}});

/* ================= Pages (hash routing) ================= */
// The site is split into pages: home (a taste of everything), gallery, reviews, gifts, workshops, guide.
const PAGE_EL={home:"#homePage",gallery:"#galleryPage",reviews:"#reviewsPage",gifts:"#giftsPage",learn:"#learnPage",guide:"#guidePage"};
function pageOfHash(h){const id=String(h||"").replace(/^#/,"");if(PAGE_EL[id])return id;if(!id||id==="top")return"home";
  const t=document.getElementById(id);const c=t&&t.closest(".page,#guidePage");return c?(Object.keys(PAGE_EL).find(k=>$(PAGE_EL[k])===c)||"home"):"home"}
window.pageOfHash=pageOfHash;
function route(){
  const id=location.hash.slice(1),page=pageOfHash(location.hash);
  Object.entries(PAGE_EL).forEach(([k,sel])=>{$(sel).hidden=k!==page});
  document.documentElement.dataset.page=page;
  document.querySelectorAll("#secnav a").forEach(a=>a.classList.toggle("on",pageOfHash(a.getAttribute("href"))===page));
  $("#galBtn").classList.toggle("on",page==="gallery");setMenu(false);
  if(page==="guide")track("guide");
  const t=id&&!PAGE_EL[id]&&id!=="top"?document.getElementById(id):null;
  if(t)requestAnimationFrame(()=>t.scrollIntoView());else window.scrollTo(0,0);
}
/* Header: the logo always leads home; on phones the menu folds into a hamburger */
function setMenu(open){
  const b=$("#burger");if(!b)return;
  document.documentElement.classList.toggle("menu-open",open);
  b.setAttribute("aria-expanded",String(open));b.setAttribute("aria-label",open?"סגירת התפריט":"תפריט");
  if(open)$(".mbar")?.classList.remove("hide");
}
$("#burger").onclick=()=>setMenu(!document.documentElement.classList.contains("menu-open"));
$("#secnav").addEventListener("click",e=>{if(e.target.closest("a"))setMenu(false)});
addEventListener("keydown",e=>{if(e.key==="Escape")setMenu(false)});
$("#homeLogo").addEventListener("click",e=>{
  setMenu(false);
  if(pageOfHash(location.hash)!=="home")return;           // another page: the link (and the wipe) takes it home
  e.preventDefault();
  if(location.hash&&location.hash!=="#top")history.replaceState(null,"","#top");
  scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
});
$("#heroCap").onclick=e=>{const id=e.currentTarget.dataset.id;if(id)openLB(id)};
window.addEventListener("hashchange",route);route();

/* ================= Boot ================= */



/* ================= Watermark check (admin only) ================= */
// Every uploaded photo is checked by the AI for a leftover watermark (e.g. "CapCut AI", an app logo, @name).
// The result is shown only in the admin panel (and on gallery cards while the admin is signed in).
const WM_WHERE={"top-left":"בפינה השמאלית העליונה","top-right":"בפינה הימנית העליונה","bottom-left":"בפינה השמאלית התחתונה","bottom-right":"בפינה הימנית התחתונה","top":"למעלה","bottom":"למטה","left":"בצד שמאל","right":"בצד ימין","center":"במרכז","tiled":"על כל התמונה"};
const WM_PROMPT=`Look at this photo of a hand-painted figurine. Is there a WATERMARK added on top of the photo? That means an overlaid logo or text stamp such as "CapCut", "CapCut AI", "Meitu", "Remini", "PicsArt", "InShot", a TikTok/Instagram logo or @username, a website address, "Made with ...", "AI generated", a stock-photo mark, or a semi-transparent repeated pattern.
Do NOT count text that physically exists in the scene: labels on paint bottles, printing on products or boxes, text on a computer screen, writing on the figurine itself.
Return only JSON: {"watermark": true or false, "text": "the watermark text if readable, else empty", "where": "top-left|top-right|bottom-left|bottom-right|top|bottom|left|right|center|tiled|"}`;
const hasWm=w=>(w.media||[]).some(m=>m.wm&&m.wm.found);
const wmText=w=>(w.media||[]).filter(m=>m.wm&&m.wm.found).map(m=>(m.wm.text||"סימן מים")+(m.wm.where?" "+(WM_WHERE[m.wm.where]||""):"")).join(" · ");
function wmBadge(it){
  if(it.kind!=="image")return"";
  if(it.wmBusy)return `<span class="wm-chk">בודק סימני מים…</span>`;
  if(!it.wm)return"";
  if(it.wm.found)return `<span class="wm-tag big">⚠️ זוהה סימן מים${it.wm.text?`: <b>${esc(it.wm.text)}</b>`:""}${it.wm.where?` ${WM_WHERE[it.wm.where]||""}`:""}. אפשר לחתוך אותו ב"עריכת תמונה ← חיתוך ויישור".</span>`;
  return `<span class="wm-ok">✓ לא נמצא סימן מים</span>`;
}
async function wmCheck(src){
  const img=await shrinkForAI(src,900);
  const {data:{session}}=await sb.auth.getSession();
  const r=await fetch("/api/suggest",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+(session?.access_token||"")},body:JSON.stringify({prompt:WM_PROMPT,images:[img]})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw {code:j.code||"failed"};
  const o=j.result||{};
  return {found:o.watermark===true||o.watermark==="true",text:String(o.text||"").slice(0,60),where:String(o.where||"").toLowerCase(),src:String(src).slice(-80),at:Date.now()};
}
const wmTimers=new Map();
function wmQueue(it){
  if(!S.admin||it.kind!=="image"||!it.orig)return;
  if(it.wm&&it.wm.src===String(it.orig).slice(-80))return; // this exact picture was already checked
  clearTimeout(wmTimers.get(it.sid));
  wmTimers.set(it.sid,setTimeout(async()=>{
    const slot=()=>document.querySelector(`.st[data-sid="${it.sid}"] .wm-slot`);
    it.wmBusy=true;if(slot())slot().innerHTML=wmBadge(it);
    try{it.wm=await wmCheck(it.orig)}catch(e){it.wm=null}
    it.wmBusy=false;if(slot())slot().innerHTML=wmBadge(it);
  },1200));
}
$("#wmScan").onclick=async()=>{
  const b=$("#wmScan");if(b.disabled)return;b.disabled=true;
  const works=S.works.filter(w=>!w.example);let n=0,found=0,total=works.reduce((t,w)=>t+(w.media||[]).filter(m=>m.kind==="image").length,0);
  for(const w of works){
    let changed=false;
    for(const m of (w.media||[]).filter(m=>m.kind==="image")){
      n++;$("#wmMsg").textContent=`בודק תמונה ${n} מתוך ${total}…`;
      if(m.wm&&m.wm.src===String(m.orig).slice(-80)){if(m.wm.found)found++;continue}
      try{m.wm=await wmCheck(m.orig);changed=true;if(m.wm.found)found++}catch(e){if(e?.code==="rate_limited"){$("#wmMsg").textContent="ה־AI עמוס כרגע. אפשר להמשיך בעוד דקה, מה שנבדק נשמר.";if(changed)await dbPut(w).catch(()=>{});b.disabled=false;render();return}}
    }
    if(changed)await dbPut(w).catch(()=>{});
  }
  b.disabled=false;render();renderAdminList();
  $("#wmMsg").textContent=found?`נמצאו ${found} תמונות עם סימן מים. הן מסומנות ב־⚠️ ברשימה.`:"✓ לא נמצאו סימני מים.";
};

/* ================= Reviews ================= */
// Customers (a piece or gift) and students (lesson or workshop) rate service, reliability and
// professionalism, and may add a few words and up to 3 photos. Reviews appear after admin approval.
const RV_CRIT={
  piece:[["service","שירות","זמינות, תקשורת ויחס"],["reliable","אמינות","עמידה בזמנים ובמה שסוכם"],["pro","מקצועיות","איכות ההדפסה והצביעה"]],
  lesson:[["service","שירות","יחס, סבלנות וזמינות"],["reliable","אמינות","עמידה בזמנים ובמה שהובטח"],["pro","מקצועיות","ידע ויכולת להסביר"]]
};
const RV_KIND={piece:"פסל או מתנה",lesson:"הדרכה או סדנה"};
const RV_MONTHS=["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
let REVIEWS=[],RV_TAB="",RV_SHOW=6,RV_ADM="pending";
const rvAvg=r=>(r.r_service+r.r_reliable+r.r_pro)/3;
const starsHTML=(v,cls="")=>`<span class="stars ${cls}" role="img" aria-label="${v.toFixed(1)} מתוך 5"><span class="st-bg">★★★★★</span><span class="st-fg" style="width:${Math.max(0,Math.min(100,v/5*100))}%">★★★★★</span></span>`;
async function loadReviews(){
  const {data,error}=await sb.from("reviews").select("id,kind,name,subject,r_service,r_reliable,r_pro,body,photos,status,created_at").order("created_at",{ascending:false});
  if(error){console.error(error);return}
  REVIEWS=(data||[]).map(r=>({...r,photos:Array.isArray(r.photos)?r.photos:[]}));
  renderReviews();if(S.admin)renderReviewsAdmin();
}
function renderReviews(){
  const pub=REVIEWS.filter(r=>r.status==="approved");
  const avg=a=>a.length?a.reduce((t,r)=>t+rvAvg(r),0)/a.length:0;
  const crit=(k)=>pub.length?pub.reduce((t,r)=>t+r["r_"+k],0)/pub.length:0;
  // summary
  if(pub.length){
    const A=avg(pub);
    $("#rvSummary").innerHTML=`<div class="rv-score"><b>${A.toFixed(1)}</b>${starsHTML(A,"lg")}<span>${pub.length===1?"המלצה אחת":pub.length+" המלצות"}</span></div>
      <div class="rv-crits">${[["service","שירות"],["reliable","אמינות"],["pro","מקצועיות"]].map(([k,l])=>{const v=crit(k);return `<div class="rv-crit"><span>${l}</span><i><em style="width:${v/5*100}%"></em></i><b>${v.toFixed(1)}</b></div>`}).join("")}</div>`;
    $("#heroRating").hidden=false;$("#heroRating").innerHTML=`${starsHTML(A)} <b>${A.toFixed(1)}</b> · ${pub.length===1?"המלצה אחת":pub.length+" המלצות"}`;
  }else{
    $("#rvSummary").innerHTML=`<p class="rv-empty-s">עוד אין כאן המלצות. אפשר להיות הראשונים לכתוב.</p>`;
    $("#heroRating").hidden=true;
  }
  const les=pub.filter(r=>r.kind==="lesson");
  $("#wsRv").hidden=!les.length;if(les.length)$("#wsRv").innerHTML=`${starsHTML(avg(les))} מה אומרים על ההדרכות (${les.length})`;
  // tabs only when both kinds exist
  const both=pub.some(r=>r.kind==="piece")&&les.length>0;$("#rvTabs").hidden=!both;if(!both)RV_TAB="";
  const list=pub.filter(r=>!RV_TAB||r.kind===RV_TAB);
  $("#rvList").innerHTML=list.slice(0,RV_SHOW).map(rvCard).join("");
  $("#rvMore").hidden=list.length<=RV_SHOW;
  requestAnimationFrame(()=>document.querySelectorAll(".rv-body").forEach(p=>{const b=p.nextElementSibling;if(b&&p.scrollHeight>p.clientHeight+4)b.hidden=false}));
  renderHome();  renderSpot();
}
/* Home: one featured review, a different one on each visit.
   Shown only from 5 approved reviews; only 4 stars and up; reviews with a photo are picked more often. */
let SPOT_ID=null;
function renderSpot(){
  const box=$("#spot");if(!box)return;
  const pub=REVIEWS.filter(r=>r.status==="approved");
  const pool=pub.filter(r=>rvAvg(r)>=4&&String(r.body||"").trim().length>=12);
  if(pub.length<5||!pool.length){box.hidden=true;box.innerHTML="";return}
  let r=pool.find(x=>x.id===SPOT_ID);
  if(!r){const w=pool.map(x=>x.photos.length?3:1),sum=w.reduce((a,b)=>a+b,0);let k=Math.random()*sum;r=pool.find((x,i)=>(k-=w[i])<0)||pool[0];SPOT_ID=r.id}
  const body=String(r.body).trim(),short=body.length>230?body.slice(0,body.lastIndexOf(" ",225)).trim()+"…":body;
  const ph=r.photos[0];
  box.classList.toggle("has-ph",!!ph);
  box.innerHTML=`${ph?`<button type="button" class="spot-ph" data-spotph aria-label="תמונה מההמלצה"><img src="${esc(ph)}" alt="" loading="lazy"></button>`:""}
    <figure class="spot-fig"><span class="spot-mark" aria-hidden="true">”</span>
      <blockquote>${esc(short)}</blockquote>
      <figcaption>${starsHTML(rvAvg(r))}<b>${esc(r.name)}</b>${r.subject?`<span class="spot-subj">${esc(r.subject)}</span>`:""}</figcaption>
      <a class="spot-all" href="#reviews">לכל ${pub.length} ההמלצות ←</a></figure>`;
  box.hidden=false;
}
$("#spot").addEventListener("click",e=>{if(e.target.closest("[data-spotph]")){const r=REVIEWS.find(x=>x.id===SPOT_ID);if(r)openViewer(r.photos,0)}});
function rvCard(r){
    const d=new Date(r.created_at),v=rvAvg(r);
    return `<article class="rv-card">
      <header><span class="rv-av" aria-hidden="true">${esc((r.name||"?").trim().charAt(0))}</span><div><b>${esc(r.name)}</b><small>${RV_MONTHS[d.getMonth()]} ${d.getFullYear()}</small></div><span class="rv-tag ${r.kind}">${r.kind==="lesson"?"הדרכה":"פסל"}</span></header>
      <div class="rv-rate">${starsHTML(v)}${r.subject?`<span class="rv-subj">${esc(r.subject)}</span>`:""}</div>
      ${r.body?`<p class="rv-body">${esc(r.body)}</p><button type="button" class="rv-more-t" hidden>עוד</button>`:""}
      ${r.photos.length?`<div class="rv-ph">${r.photos.map((u,i)=>`<button type="button" data-rvph="${esc(r.id)}" data-i="${i}" aria-label="תמונה ${i+1}"><img src="${esc(u)}" alt="" loading="lazy"></button>`).join("")}</div>`:""}
      <details class="rv-det"><summary>פירוט הדירוג</summary>${RV_CRIT[r.kind].map(([k,l])=>`<div><span>${l}</span>${starsHTML(r["r_"+k])}</div>`).join("")}</details>
    </article>`}
$("#rvTabs").addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;RV_TAB=b.dataset.k;RV_SHOW=6;$("#rvTabs").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));renderReviews()});
$("#rvMore").onclick=()=>{RV_SHOW+=6;renderReviews()};
$("#rvList").addEventListener("click",e=>{
  const t=e.target.closest(".rv-more-t");if(t){const p=t.previousElementSibling;p.classList.toggle("open");t.textContent=p.classList.contains("open")?"פחות":"עוד";return}
  const ph=e.target.closest("[data-rvph]");if(ph){const r=REVIEWS.find(x=>x.id===ph.dataset.rvph);if(r)openViewer(r.photos,+ph.dataset.i)}});
$("#wsRv").addEventListener("click",()=>{const b=$("#rvTabs").querySelector('[data-k="lesson"]');if(b&&!$("#rvTabs").hidden)b.click()});

/* ---- review form ---- */
const RVF={kind:null,rates:{},photos:[],busy:false};
// A friendly push to add a photo, different each time the form opens (worded for everyone)
const lines=t=>String(t||"").split("\n").map(x=>x.trim()).filter(Boolean);
const pickOther=(list,last)=>{const pool=list.length>1?list.filter(x=>x!==last):list;return pool[Math.floor(Math.random()*pool.length)]||""};
let rvNudgeLast="";
function rvNudge(){const el=$("#rvNudge");if(!RVF.kind){el.hidden=true;return}
  if(RVF.photos.length){const d=lines(TEXTS.nudgeDone);el.textContent=d.length?d[(RVF.photos.length-1)%d.length]:"";el.classList.add("ok");el.hidden=!d.length;return}
  el.classList.remove("ok");
  if(!RVF.nudge){RVF.nudge=pickOther(lines(RVF.kind==="lesson"?TEXTS.nudgeLesson:TEXTS.nudgePiece),rvNudgeLast);rvNudgeLast=RVF.nudge}
  el.textContent=RVF.nudge?"📸 "+RVF.nudge:"";el.hidden=!RVF.nudge}
let rvThanksLast="";
function rvOpen(kind){
  Object.assign(RVF,{kind:null,rates:{},photos:[],busy:false,nudge:""});
  $("#rvForm").reset();$("#rvMsg").textContent="";$("#rvCount").textContent="0/700";rvPhotos();
  $("#rvStep1").hidden=false;$("#rvStep2").hidden=true;$("#rvDone").hidden=true;$("#rvDlgTitle").hidden=false;
  if(kind)rvKind(kind);
  $("#rvDlg").showModal();
}
function rvKind(k){
  RVF.kind=k;RVF.rates={};RVF.nudge="";rvNudge();
  $("#rvStep1").hidden=true;$("#rvStep2").hidden=false;$("#rvKindLbl").textContent=RV_KIND[k];
  $("#rvSubjLbl").innerHTML=(k==="lesson"?"איזו הדרכה?":"איזה פסל או מתנה?")+" <small>(לא חובה)</small>";
  $("#rvSubj").placeholder=k==="lesson"?"למשל: איירבראש למתחילים":"למשל: באסט של באטמן";
  $("#rvBody").placeholder=k==="lesson"?"מה היה הכי שווה בהדרכה?":"איך היה התהליך, ואיך הפסל נראה במציאות?";
  $("#rvRates").innerHTML=RV_CRIT[k].map(([key,l,hint])=>`<div class="rv-rate-row" data-key="${key}"><div><b>${l}</b><small>${hint}</small></div>
    <div class="rv-stars" role="radiogroup" aria-label="${l}">${[1,2,3,4,5].map(n=>`<button type="button" role="radio" aria-checked="false" data-n="${n}" aria-label="${n} מתוך 5">★</button>`).join("")}</div></div>`).join("");
}
function rvPaintRow(row,n){row.querySelectorAll("[data-n]").forEach(b=>{const on=+b.dataset.n<=n;b.classList.toggle("on",on);b.setAttribute("aria-checked",+b.dataset.n===n?"true":"false")})}
$("#rvWrite").onclick=()=>rvOpen();
$("#rvDlg").addEventListener("click",e=>{const k=e.target.closest("[data-kind]");if(k){rvKind(k.dataset.kind);return}});
$("#rvBack").onclick=()=>{$("#rvStep1").hidden=false;$("#rvStep2").hidden=true};
$("#rvRates").addEventListener("click",e=>{const b=e.target.closest("[data-n]");if(!b)return;const row=b.closest(".rv-rate-row");RVF.rates[row.dataset.key]=+b.dataset.n;rvPaintRow(row,+b.dataset.n);row.classList.remove("need")});
$("#rvRates").addEventListener("pointerover",e=>{const b=e.target.closest("[data-n]");if(!b||e.pointerType!=="mouse")return;const row=b.closest(".rv-rate-row");row.querySelectorAll("[data-n]").forEach(x=>x.classList.toggle("hov",+x.dataset.n<=+b.dataset.n))});
$("#rvRates").addEventListener("pointerout",e=>{const row=e.target.closest(".rv-rate-row");if(row)row.querySelectorAll(".hov").forEach(x=>x.classList.remove("hov"))});
$("#rvRates").addEventListener("keydown",e=>{const b=e.target.closest("[data-n]");if(!b)return;const row=b.closest(".rv-rate-row");let n=RVF.rates[row.dataset.key]||0;
  if(e.key==="ArrowLeft")n=Math.min(5,n+1);else if(e.key==="ArrowRight")n=Math.max(1,n-1);else return;e.preventDefault();RVF.rates[row.dataset.key]=n;rvPaintRow(row,n);row.querySelector(`[data-n="${n}"]`).focus()});
$("#rvBody").addEventListener("input",e=>$("#rvCount").textContent=`${e.target.value.length}/700`);
function rvPhotos(){
  const box=$("#rvPhotos");box.querySelectorAll(".rv-th").forEach(x=>x.remove());
  RVF.photos.forEach((p,i)=>{const d=document.createElement("div");d.className="rv-th";d.innerHTML=`<img src="${p.preview}" alt="">${p.url?"":`<span class="rv-up">מעלה…</span>`}<button type="button" data-rm="${i}" aria-label="הסרת התמונה">✕</button>`;box.insertBefore(d,$("#rvAddPh"))});
  $("#rvAddPh").hidden=RVF.photos.length>=3;
  rvNudge();
}
$("#rvAddPh").onclick=()=>$("#rvFile").click();
$("#rvPhotos").addEventListener("click",e=>{const b=e.target.closest("[data-rm]");if(!b)return;RVF.photos.splice(+b.dataset.rm,1);rvPhotos()});
$("#rvFile").onchange=async e=>{
  const files=[...e.target.files].filter(f=>f.type.startsWith("image")).slice(0,3-RVF.photos.length);e.target.value="";
  for(const f of files){
    const p={preview:"",url:null};RVF.photos.push(p);
    try{
      const data=await new Promise((r,j)=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.onerror=j;fr.readAsDataURL(f)});
      const small=await downscale(data,1600);p.preview=small;rvPhotos();
      const path=`u/${crypto.randomUUID()}.jpg`;
      const {error}=await sb.storage.from("reviews").upload(path,b64Blob(small),{contentType:"image/jpeg",upsert:false});
      if(error)throw error;
      p.url=`${SB_URL}/storage/v1/object/public/reviews/${path}`;rvPhotos();
    }catch(err){console.error(err);RVF.photos.splice(RVF.photos.indexOf(p),1);rvPhotos();$("#rvMsg").textContent="לא הצלחנו להעלות את התמונה. אפשר לנסות שוב או לשלוח בלי."}
  }
};
$("#rvForm").onsubmit=async e=>{
  e.preventDefault();if(RVF.busy)return;
  const miss=RV_CRIT[RVF.kind].filter(([k])=>!RVF.rates[k]);
  miss.forEach(([k])=>$(`.rv-rate-row[data-key="${k}"]`).classList.add("need"));
  const name=$("#rvName").value.trim();
  if(miss.length||!name){$("#rvMsg").textContent=miss.length?"נשאר לסמן כוכבים בכל שלוש השורות.":"נשאר רק לכתוב שם שיוצג.";(miss.length?$(`.rv-rate-row[data-key="${miss[0][0]}"] [data-n]`):$("#rvName")).focus();return}
  if(RVF.photos.some(p=>!p.url)){$("#rvMsg").textContent="רגע, התמונות עוד עולות…";return}
  RVF.busy=true;$("#rvSend").disabled=true;$("#rvMsg").textContent="שולח…";
  try{
    const r=await fetch("/api/review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:RVF.kind,name,subject:$("#rvSubj").value,body:$("#rvBody").value,
      service:RVF.rates.service,reliable:RVF.rates.reliable,pro:RVF.rates.pro,photos:RVF.photos.map(p=>p.url),website:$("#rvWeb").value})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)throw {code:j.code};
    rvThanksLast=pickOther(lines(TEXTS.rvThanks),rvThanksLast);$("#rvThanks").textContent=rvThanksLast||"תודה רבה!";
    $("#rvStep2").hidden=true;$("#rvDlgTitle").hidden=true;$("#rvDone").hidden=false;
    if(S.admin)loadReviews();
  }catch(err){$("#rvMsg").textContent=err?.code==="too_many"?"נשלחו כבר כמה המלצות מהמכשיר הזה היום. תודה! אפשר לנסות שוב מחר.":"השליחה לא הצליחה. אפשר לנסות שוב בעוד רגע."}
  finally{RVF.busy=false;$("#rvSend").disabled=false}
};

/* ---- admin: approve, hide, delete ---- */
function renderReviewsAdmin(){
  const n=REVIEWS.filter(r=>r.status==="pending").length;$("#rvPendN").hidden=!n;$("#rvPendN").textContent=n;
  const list=REVIEWS.filter(r=>r.status===RV_ADM);
  $("#rvAdmList").innerHTML=list.map(r=>`<div class="rv-adm-i" data-id="${esc(r.id)}">
    <div class="rv-adm-h"><b>${esc(r.name)}</b><span class="rv-tag ${r.kind}">${r.kind==="lesson"?"הדרכה":"פסל"}</span>${starsHTML(rvAvg(r))}<small>${new Date(r.created_at).toLocaleDateString("he-IL")}</small></div>
    <small class="note">שירות ${r.r_service} · אמינות ${r.r_reliable} · מקצועיות ${r.r_pro}${r.subject?` · ${esc(r.subject)}`:""}</small>
    ${r.body?`<p>${esc(r.body)}</p>`:""}
    ${r.photos.length?`<div class="rv-ph">${r.photos.map((u,i)=>`<button type="button" data-rvph="${esc(r.id)}" data-i="${i}"><img src="${esc(u)}" alt=""></button>`).join("")}</div>`:""}
    <div class="row">${r.status!=="approved"?`<button type="button" class="pill small solid" data-rv="approved">אישור ופרסום</button>`:""}${r.status!=="hidden"?`<button type="button" class="pill small" data-rv="hidden">הסתרה</button>`:""}<button type="button" class="pill small danger" data-rv="delete">מחיקה</button></div>
  </div>`).join("")||`<p class="note">${RV_ADM==="pending"?"אין המלצות שמחכות לאישור.":"אין כאן המלצות."}</p>`;
}
$("#rvAdmTabs").addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;RV_ADM=b.dataset.s;$("#rvAdmTabs").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));renderReviewsAdmin()});
$("#rvAdmList").addEventListener("click",async e=>{
  const ph=e.target.closest("[data-rvph]");if(ph){const r=REVIEWS.find(x=>x.id===ph.dataset.rvph);if(r)openViewer(r.photos,+ph.dataset.i);return}
  const b=e.target.closest("[data-rv]");if(!b)return;const id=b.closest("[data-id]").dataset.id,a=b.dataset.rv;
  if(a==="delete"){if(!confirm("למחוק את ההמלצה לצמיתות?"))return;const r=REVIEWS.find(x=>x.id===id);
    const {error}=await sb.from("reviews").delete().eq("id",id);if(error){toast("המחיקה נכשלה");return}
    const paths=(r?.photos||[]).map(u=>u.split("/object/public/reviews/")[1]).filter(Boolean);if(paths.length)sb.storage.from("reviews").remove(paths);
  }else{const {error}=await sb.from("reviews").update({status:a}).eq("id",id);if(error){toast("השמירה נכשלה");return}}
  toast(a==="approved"?"ההמלצה פורסמה באתר":a==="hidden"?"ההמלצה הוסתרה":"ההמלצה נמחקה");loadReviews()});

loadReviews();

{const hi=load("heroImg");if(hi&&/^https:\/\//.test(hi)&&!$("#heroScene").innerHTML)$("#heroScene").innerHTML=`<div class="flat"><img src="${esc(hi)}" alt="" fetchpriority="high"></div>`}
(async()=>{
  const v=load("view2");if(v==="room"){S.view="room";press($("#vRoom").parentNode,$("#vRoom"))}
  const sz=+load("size");setSize(sz||300);
  const cols=load("cols");if(cols){$("#grid").className="grid cols-"+cols;press(document.querySelector("[data-cols]").parentNode,document.querySelector(`[data-cols="${cols}"]`))}
  const t=await getSetting("texts");if(t)TEXTS={...DEFAULT_TEXTS,...t};renderTexts();fillTextForm();
  setStudio((await getSetting("studio"))??STUDIO_DEFAULT);
  const rm=await getSetting("room");if(rm){ROOM=rm;applyRoom()}
  const stored=await dbAll();
  if(stored&&stored.length) S.works=stored.map(hydrate);
  else S.works=SAMPLES.map(s=>{const png=drawSample(s.kind);return {...s,example:true,media:[{kind:"image",orig:png,raw:png,cut:png}]}});
  render();
  const isAdmin=await checkAdmin();if(isAdmin)render();
  const q=new URLSearchParams(location.search);
  if(q.has("admin")){history.replaceState(null,"",location.pathname+location.hash);if(isAdmin)openAdmin("account");else if((await sb.auth.getSession()).data.session)toast("המשתמש הזה לא מוגדר כמנהל")}
  // Count the visit (the server ignores repeats from the same IP within 10 minutes); admins are not counted
  if(!isAdmin)ping();
})();
sb.auth.onAuthStateChange(ev=>{if(ev==="PASSWORD_RECOVERY")openAdmin("account")});
