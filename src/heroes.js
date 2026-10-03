// ARTRIKO superhero layer (cosmetic):
// - a spinning side badge with the logo that speeds up with scrolling
// - an original mascot, "Captain Artriko", that follows the mouse on desktop,
//   watches your taps on phones, and swaps costume on click (or every few seconds)
// - comic "POW!" bursts on empty clicks, and a bouncy wordmark
// Nothing here is needed to use the site; with reduced motion it stays still.
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
const q = (s, r = document) => r.querySelector(s);

/* ---------- Original hero costumes (no existing characters) ---------- */
const HEROES = [
  { name: "קפטן ארטריקו!", c1: "#ffd23f", c2: "#ff3b5c", c3: "#130d10", em: "A" },
  { name: "נחשול!", c1: "#2ec4ff", c2: "#14213d", c3: "#ffd23f", em: "bolt" },
  { name: "נובה!", c1: "#b46cff", c2: "#2b1a4a", c3: "#ffd23f", em: "star" },
  { name: "זרחן!", c1: "#3ddc84", c2: "#0f3d2e", c3: "#ffffff", em: "atom" },
  { name: "גחלת!", c1: "#ff7a00", c2: "#3a1010", c3: "#ffd23f", em: "flame" },
];
const INK = "#130d10";
const EMBLEMS = {
  A: `<text x="50" y="91" text-anchor="middle" font-family="Bungee, Arial Black, sans-serif" font-size="22" fill="var(--c3)">A</text>`,
  bolt: `<path d="M53 68 L41 84 H50 L46 96 L60 79 H51 Z" fill="var(--c3)" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`,
  star: `<path d="M50 68 L53.5 77 L63 77.5 L55.5 83.5 L58 93 L50 87.5 L42 93 L44.5 83.5 L37 77.5 L46.5 77 Z" fill="var(--c3)" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`,
  atom: `<g fill="none" stroke="var(--c3)" stroke-width="2.4"><ellipse cx="50" cy="82" rx="12" ry="5"/><ellipse cx="50" cy="82" rx="12" ry="5" transform="rotate(60 50 82)"/><ellipse cx="50" cy="82" rx="12" ry="5" transform="rotate(-60 50 82)"/></g><circle cx="50" cy="82" r="2.6" fill="var(--c3)"/>`,
  flame: `<path d="M50 68 C58 76 60 82 57 89 C55 94 45 94 43 89 C41 84 44 80 47 77 C47 81 49 83 51 83 C53 79 50 74 50 68 Z" fill="var(--c3)" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`,
};
function mascotSVG() {
  return `<svg viewBox="0 0 100 120" aria-hidden="true">
    <g class="m-cape"><path d="M30 60 Q14 92 8 116 L92 116 Q86 92 70 60 Z" fill="var(--c2)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g>
    <path d="M33 60 Q50 53 67 60 L71 104 Q50 111 29 104 Z" fill="var(--c1)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="50" cy="82" r="15" fill="${INK}" opacity=".18"/>
    <g class="m-em">${EMBLEMS.A}</g>
    <g class="m-head">
      <circle cx="50" cy="36" r="26" fill="#f2c9a0" stroke="${INK}" stroke-width="3"/>
      <path d="M24 35 Q24 8 50 8 Q76 8 76 35 Q66 21 50 23 Q34 21 24 35 Z" fill="var(--c2)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M21 33 Q50 27 79 33 L77 46 Q63 51 50 44 Q37 51 23 46 Z" fill="var(--c1)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="38" cy="39.5" rx="7.5" ry="5.2" fill="#fff"/><ellipse cx="62" cy="39.5" rx="7.5" ry="5.2" fill="#fff"/>
      <g class="m-pupils"><circle cx="38" cy="39.5" r="2.8" fill="${INK}"/><circle cx="62" cy="39.5" r="2.8" fill="${INK}"/></g>
      <path class="m-mouth" d="M42 54 Q50 60.5 58 54" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="31" cy="52" r="3.5" fill="#ff6b81" opacity=".45"/><circle cx="69" cy="52" r="3.5" fill="#ff6b81" opacity=".45"/>
    </g>
  </svg>`;
}

/* ---------- Side badge with the logo ---------- */
const badge = document.createElement("button");
badge.type = "button";
badge.className = "side-badge";
badge.setAttribute("aria-label", "ARTRIKO, חזרה למעלה");
badge.innerHTML = `<svg class="sb-ring" viewBox="0 0 120 120" aria-hidden="true">
    <defs><path id="sbPath" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs>
    <circle cx="60" cy="60" r="58" fill="var(--ink)" stroke="var(--paper)" stroke-width="3"/>
    <text font-family="Bungee, Arial Black, sans-serif" font-size="12.5" letter-spacing="2.2" fill="var(--sun)"><textPath href="#sbPath">ARTRIKO ✦ HAND PAINTED ✦ COLLECTIBLES ✦</textPath></text>
  </svg>
  <span class="sb-core"><span class="sb-logo">A</span></span>`;
document.body.appendChild(badge);
badge.addEventListener("click", () => {
  if (location.hash === "#guide") { location.hash = "#top"; return; }
  scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" });
});
// Custom logo: if a logo image is set later (window.ARTRIKO_LOGO), show it in the centre
if (window.ARTRIKO_LOGO) badge.querySelector(".sb-core").innerHTML = `<img src="${window.ARTRIKO_LOGO}" alt="">`;

/* ---------- Mascot ---------- */
const mascot = document.createElement("div");
mascot.className = "mascot docked";
mascot.innerHTML = `<div class="m-wrap">${mascotSVG()}</div><span class="m-bubble" hidden></span>`;
document.body.appendChild(mascot);
const svg = mascot.querySelector("svg"), em = mascot.querySelector(".m-em"), pupils = mascot.querySelector(".m-pupils"),
  head = mascot.querySelector(".m-head"), cape = mascot.querySelector(".m-cape"), bubble = mascot.querySelector(".m-bubble"), wrap = mascot.querySelector(".m-wrap");
let hero = 0;
function dress(i, announce) {
  hero = (i + HEROES.length) % HEROES.length;
  const h = HEROES[hero];
  mascot.style.setProperty("--c1", h.c1); mascot.style.setProperty("--c2", h.c2); mascot.style.setProperty("--c3", h.c3);
  em.innerHTML = EMBLEMS[h.em];
  if (announce) {
    bubble.textContent = h.name; bubble.hidden = false;
    bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
    clearTimeout(dress.t); dress.t = setTimeout(() => { bubble.hidden = true; }, 1600);
  }
}
dress(0, false);
function swap() {
  if (RM) { dress(hero + 1, true); return; }
  wrap.classList.remove("poof"); void wrap.offsetWidth; wrap.classList.add("poof");
  burstAt(mascotCenter().x, mascotCenter().y, "POOF!", true);
  setTimeout(() => dress(hero + 1, true), 160);
}
mascot.addEventListener("click", e => { e.stopPropagation(); swap(); });

/* position: follow the mouse on desktop, live by the badge on phones / when idle */
let mx = innerWidth * 0.2, my = innerHeight * 0.7, px = mx, py = my, vx = 0, vy = 0;
let tx = mx, ty = my, lastMove = 0, docked = true;
let lookX = innerWidth / 2, lookY = innerHeight / 2;
function homePos() {
  const r = badge.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top - (FINE ? 46 : 34) };
}
function mascotCenter() { return { x: px, y: py }; }
if (FINE && !RM) {
  addEventListener("pointermove", e => {
    lastMove = performance.now();
    lookX = e.clientX; lookY = e.clientY;
    // trail a little below-left of the pointer, never on top of it
    tx = Math.min(innerWidth - 50, Math.max(50, e.clientX - 74));
    ty = Math.min(innerHeight - 60, Math.max(60, e.clientY + 70));
  }, { passive: true });
} else {
  addEventListener("pointerdown", e => { lookX = e.clientX; lookY = e.clientY; lastMove = performance.now(); }, { passive: true });
}
setInterval(() => { if (!document.hidden && !q("dialog[open]")) swap(); }, 9000);

let last = performance.now();
function tick(t) {
  const dt = Math.min(48, t - last) / 16.7; last = t;
  const hidden = !!q("dialog[open]") || location.hash === "#guide" && !FINE;
  mascot.classList.toggle("away", hidden);
  const idle = !FINE || RM || t - lastMove > 5000;
  if (idle) { const h = homePos(); tx = h.x; ty = h.y; }
  if (idle !== docked) { docked = idle; mascot.classList.toggle("docked", docked); }
  // spring
  const k = RM ? 1 : 0.075, damp = 0.78;
  vx = (vx + (tx - px) * k * dt) * damp; vy = (vy + (ty - py) * k * dt) * damp;
  px += vx * dt; py += vy * dt;
  const tilt = Math.max(-18, Math.min(18, vx * 1.3));
  mascot.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) rotate(${tilt.toFixed(1)}deg)`;
  // cape flutters with speed, head and eyes look at the pointer
  cape.style.transform = `skewX(${Math.max(-22, Math.min(22, -vx * 2)).toFixed(1)}deg)`;
  const dx = lookX - px, dy = lookY - (py - 20), d = Math.hypot(dx, dy) || 1;
  const ex = (dx / d) * Math.min(3.2, d / 40), ey = (dy / d) * Math.min(2.4, d / 40);
  pupils.setAttribute("transform", `translate(${ex.toFixed(2)} ${ey.toFixed(2)})`);
  head.setAttribute("transform", `rotate(${Math.max(-10, Math.min(10, dx / 60)).toFixed(1)} 50 40)`);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------- Badge spins faster while scrolling ---------- */
let ang = 0, spinV = 0, lastY = scrollY;
addEventListener("scroll", () => { spinV += Math.abs(scrollY - lastY) * 0.08; lastY = scrollY; }, { passive: true });
const ring = badge.querySelector(".sb-ring");
(function spin() {
  if (!RM) {
    spinV *= 0.93;
    ang = (ang + 0.25 + Math.min(12, spinV)) % 360;
    ring.style.transform = `rotate(${ang.toFixed(2)}deg)`;
  }
  requestAnimationFrame(spin);
})();

/* ---------- Comic bursts ---------- */
const WORDS = ["POW!", "BAM!", "ZAP!", "WHAM!", "BOOM!", "KAPOW!"];
const COLORS = [["#ffd23f", "#ff3b5c"], ["#2ec4ff", "#ffd23f"], ["#ff3b5c", "#ffd23f"], ["#b46cff", "#ffd23f"]];
function burstAt(x, y, word, small) {
  if (RM) return;
  const [bg, fg] = COLORS[Math.floor(Math.random() * COLORS.length)];
  const el = document.createElement("div");
  el.className = "pow" + (small ? " small" : "");
  el.style.left = x + "px"; el.style.top = y + "px";
  el.style.setProperty("--rot", (Math.random() * 30 - 15).toFixed(1) + "deg");
  const pts = [];
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 30 + Math.random() * 6 : 48 + Math.random() * 10; pts.push(`${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`); }
  el.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><pattern id="ht" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.1" fill="${fg}" opacity=".55"/></pattern></defs>
    <polygon points="${pts.join(" ")}" fill="${bg}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <polygon points="${pts.join(" ")}" fill="url(#ht)"/></svg><b style="color:${INK};-webkit-text-stroke:0">${word || WORDS[Math.floor(Math.random() * WORDS.length)]}</b>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}
let lastPow = 0;
document.addEventListener("click", e => {
  if (e.target.closest("a,button,input,textarea,select,label,dialog,.card,.mascot,.side-badge,.chip,summary")) return;
  const t = performance.now(); if (t - lastPow < 350) return; lastPow = t;
  burstAt(e.clientX, e.clientY);
});

/* ---------- Bouncy wordmark ---------- */
const mark = q(".mark");
if (mark && !mark.querySelector("span")) {
  mark.setAttribute("aria-label", mark.textContent.trim());
  mark.innerHTML = mark.textContent.trim().split("").map((c, i) => `<span aria-hidden="true" style="--i:${i}">${c}</span>`).join("");
}
