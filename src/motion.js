import { pickLine, cachedLines, DEFAULT_INTRO } from "./lines.js";
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
// ARTRIKO motion layer: intro, word reveals, marquee bands, scroll reveals,
// 3D tilt + cursor + magnetic buttons on desktop, sheet lightbox + swipe-follow on phones,
// and a colour wipe between the home page and the guide. Respects reduced motion.
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
const q = (s, r = document) => r.querySelector(s);
const qa = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;

if (!RM) root.classList.add("motion");

/* ---------- 1. Intro (once per visit, click to skip) ---------- */
(function intro() {
  if (RM) return;
  let seen = false;
  try { seen = sessionStorage.getItem("artriko.intro") === "1"; sessionStorage.setItem("artriko.intro", "1"); } catch (e) { seen = true; }
  if (seen) return;
  const el = document.createElement("div");
  el.className = "intro";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `<div class="intro-word">${"ARTRIKO".split("").map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}</div><div class="intro-sub">${esc(pickLine("intro", cachedLines("intro", DEFAULT_INTRO)))}</div>`;
  document.body.appendChild(el);
  const out = () => { el.classList.add("out"); setTimeout(() => el.remove(), 800); };
  el.addEventListener("click", out);
  setTimeout(out, 1250);
})();

/* ---------- 2. Hero headline: split into words that rise in ---------- */
function splitWords(h1) {
  if (!h1 || h1.querySelector(".w")) return;
  let n = 0;
  const walk = node => {
    [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const parts = ch.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          const w = document.createElement("span"); w.className = "w";
          const inner = document.createElement("span"); inner.textContent = p; inner.style.setProperty("--wi", n++);
          w.appendChild(inner); frag.appendChild(w);
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1 && ch.tagName !== "BR") walk(ch);
    });
  };
  walk(h1);
}
const h1 = q("#tH1");
if (h1 && !RM) {
  splitWords(h1);
  new MutationObserver(() => splitWords(h1)).observe(h1, { childList: true });
}

/* ---------- 3. Marquee bands that react to scroll speed ---------- */
const BASE_WORDS = ["הדפסת תלת־ממד", "צביעה ביד", "פסלי אספנות", "באסט", "דיורמה", "פסל מלא", "מיניאטורה", "הזמנות אישיות", "ARTRIKO"];
let bands = null;
function buildBands() {
  const hero = q(".hero");
  if (!hero || RM) return;
  const wrap = document.createElement("div");
  wrap.className = "bands"; wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML = `<div class="band b2"><div class="track"></div></div><div class="band b1"><div class="track"></div></div>`;
  hero.after(wrap);
  bands = qa(".track", wrap).map((t, i) => ({ t, x: 0, dir: i === 0 ? 1 : -1, w: 0 }));
  fillBands(BASE_WORDS);
}
function fillBands(words) {
  if (!bands) return;
  bands.forEach((b, i) => {
    const list = i === 0 ? [...words].reverse() : words;
    const one = list.map(w => `<span class="it" dir="auto">${w.replace(/[<>&]/g, "")}</span>`).join("");
    b.t.innerHTML = one + one + one + one;
    b.w = b.t.scrollWidth / 4;
  });
}
buildBands();

/* character names from the gallery feed the bands (e.g. BATMAN, SPIDER-MAN) */
const grid = q("#grid");
function namesFromGrid() {
  const names = qa(".card h3", grid).map(h => (h.textContent.match(/^[A-Z0-9][A-Z0-9 .'&:-]{1,30}(?=\s*–)/) || [])[0]).filter(Boolean);
  if (names.length) fillBands([...new Set([...names, ...BASE_WORDS])].slice(0, 16));
}

/* ---------- 4. Scroll: progress bar, parallax, band speed, sticky bar, phone bottom bar ---------- */
const progress = document.createElement("div");
progress.className = "progress"; progress.setAttribute("aria-hidden", "true");
if (!RM) document.body.appendChild(progress);
let lastY = scrollY, vel = 0, ticking = false;
const heroArt = q(".hero-art"), bar = q(".bar"), mbar = q(".mbar");
function onScroll() {
  const y = scrollY, dy = y - lastY; lastY = y;
  vel += dy * 0.6;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
  if (heroArt && y < innerHeight * 1.2) heroArt.style.transform = `translateY(${(y * 0.12).toFixed(1)}px) rotate(${(y * 0.004).toFixed(2)}deg)`;
  if (bar) bar.classList.toggle("stuck", bar.getBoundingClientRect().top <= 1);
  if (mbar && Math.abs(dy) > 4) mbar.classList.toggle("hide", dy > 0 && y > 300);
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); } }, { passive: true });

let lastT = performance.now();
function loop(t) {
  const dt = Math.min(64, t - lastT) / 16.7; lastT = t;
  vel *= 0.9;
  if (bands) bands.forEach(b => {
    if (!b.w) b.w = b.t.scrollWidth / 4;
    const speed = (1.1 + Math.min(14, Math.abs(vel) * 0.25)) * dt;
    const sign = vel < -2 ? -1 : 1;
    b.x += speed * b.dir * sign;
    if (b.w) { if (b.x > 0) b.x -= b.w; if (b.x < -b.w) b.x += b.w; }
    const skew = Math.max(-8, Math.min(8, vel * 0.08));
    b.t.style.transform = `translate3d(${b.x.toFixed(1)}px,0,0) skewX(${(-skew * b.dir).toFixed(2)}deg)`;
  });
  requestAnimationFrame(loop);
}
if (!RM) requestAnimationFrame(loop);

/* ---------- 5. Cards: reveal on scroll, re-animate after filtering ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { rootMargin: "0px 0px -8% 0px" });

function prepCards(fresh) {
  const cards = qa(".card", grid);
  let k = 0;
  cards.forEach((c, i) => {
    if (c.dataset.mo) return;
    c.dataset.mo = "1";
    if (!c.querySelector(".shine")) { const s = document.createElement("i"); s.className = "shine"; c.querySelector(".frame")?.appendChild(s); }
    if (RM) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--rot", (i % 2 ? -1.5 : 1.5) + "deg");
    if (r.top > innerHeight * 0.92) { c.classList.add("rv"); c.style.setProperty("--d", (i % 4)); io.observe(c); }
    else if (fresh && c.animate) {
      c.animate([{ opacity: 0, transform: "translateY(24px) scale(.95)" }, { opacity: 1, transform: "none" }],
        { duration: 550, delay: k++ * 55, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
    }
  });
}
let firstFill = true;
if (grid) {
  new MutationObserver(() => { prepCards(!firstFill); firstFill = false; namesFromGrid(); }).observe(grid, { childList: true });
  prepCards(false); namesFromGrid();
}

/* generic scroll reveals for the guide page and section headings */
function prepReveals() {
  if (RM) return;
  const sel = ".ws-head, .ws-tool, .ws-combo, .g-sec h2, .g-sec .lead, .type, .tech, .minis > div, .g-sec .tbl, .calc, .chart, .callout, .terms, .g-cta";
  const groups = new Map();
  qa(sel).forEach(el => {
    if (el.dataset.sr) return;
    el.dataset.sr = "1";
    const p = el.parentElement; const n = groups.get(p) || 0; groups.set(p, n + 1);
    el.style.setProperty("--d", n % 5);
    const r = el.getBoundingClientRect();
    if (r.height && r.top < innerHeight * 0.92) return; // already on screen: leave it still
    el.classList.add("sr"); io.observe(el);
  });
}

/* ---------- 6. Desktop: 3D tilt, custom cursor, magnetic buttons ---------- */
if (FINE && !RM) {
  root.classList.add("has-cursor");
  const cur = document.createElement("div");
  cur.className = "cursor"; cur.innerHTML = "<b>לצפייה</b>"; cur.setAttribute("aria-hidden", "true");
  document.body.appendChild(cur);
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; cur.classList.add("on"); }, { passive: true });
  document.addEventListener("pointerleave", () => cur.classList.remove("on"));
  (function follow() { cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(follow); })();
  document.addEventListener("pointerover", e => {
    const onCard = e.target.closest(".card") && !e.target.closest(".badge");
    cur.classList.toggle("big", !!onCard && !q("dialog[open]"));
  });

  grid?.addEventListener("pointermove", e => {
    const c = e.target.closest(".card"); if (!c) return;
    const f = c.querySelector(".frame"); const r = f.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    c.classList.add("tilting");
    f.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 9).toFixed(2)}deg) rotateY(${((px - 0.5) * 11).toFixed(2)}deg) translate(-3px,-3px)`;
    f.style.setProperty("--sx2", (px * 100).toFixed(1) + "%"); f.style.setProperty("--sy2", (py * 100).toFixed(1) + "%");
  });
  grid?.addEventListener("pointerout", e => {
    const c = e.target.closest(".card"); if (!c || c.contains(e.relatedTarget)) return;
    c.classList.remove("tilting"); const f = c.querySelector(".frame"); if (f) f.style.transform = "";
  });

  const magnets = () => qa(".pill.big, .guide-link, .contact-btn, .lock-top");
  document.addEventListener("pointermove", e => {
    magnets().forEach(b => {
      const r = b.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2;
      const dx = e.clientX - mx, dy = e.clientY - my, d = Math.hypot(dx, dy), R = Math.max(r.width, r.height) * 0.9;
      b.classList.add("mag");
      b.style.transform = d < R ? `translate(${(dx * 0.22).toFixed(1)}px,${(dy * 0.3).toFixed(1)}px)` : "";
    });
  }, { passive: true });
}

/* ---------- 7. Lightbox: slide direction + swipe that follows the finger ---------- */
const lbMain = q("#lbMain");
if (lbMain && !RM) {
  let lastIdx = 0;
  const thumbs = q("#lbThumbs");
  new MutationObserver(() => {
    const cur = thumbs ? [...thumbs.children].findIndex(b => b.getAttribute("aria-current") === "true") : 0;
    lbMain.classList.toggle("from-left", cur < lastIdx);
    lastIdx = cur;
  }).observe(lbMain, { childList: true });
  let sx = null, el = null;
  lbMain.addEventListener("pointerdown", e => { if (e.pointerType === "mouse") return; sx = e.clientX; el = lbMain.firstElementChild; lbMain.classList.add("dragging"); });
  lbMain.addEventListener("pointermove", e => { if (sx === null || !el) return; const dx = e.clientX - sx; el.style.transform = `translateX(${dx}px) rotate(${dx * 0.02}deg)`; el.style.opacity = String(1 - Math.min(.5, Math.abs(dx) / 600)); });
  const end = () => { if (el) { el.style.transition = "transform .3s cubic-bezier(.16,1,.3,1),opacity .3s"; el.style.transform = ""; el.style.opacity = ""; const e2 = el; setTimeout(() => { e2.style.transition = ""; }, 320); } sx = null; el = null; lbMain.classList.remove("dragging"); };
  lbMain.addEventListener("pointerup", end); lbMain.addEventListener("pointercancel", end);
}

/* ---------- 8. Colour wipe between the home page and the guide ---------- */
let wiping = false;
function wipeTo(hash) {
  if (RM || wiping) { location.hash = hash; return; }
  wiping = true;
  const w = document.createElement("div");
  w.className = "wipe in"; w.setAttribute("aria-hidden", "true");
  w.innerHTML = "<i></i><i></i><i>ARTRIKO</i>";
  document.body.appendChild(w);
  setTimeout(() => {
    location.hash = hash;
    requestAnimationFrame(() => { w.className = "wipe out"; prepReveals(); });
    setTimeout(() => { w.remove(); wiping = false; }, 800);
  }, 720);
}
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const h = a.getAttribute("href");
  const toGuide = h === "#guide", leavingGuide = location.hash === "#guide" && h !== "#guide";
  if (!toGuide && !leavingGuide) return;
  e.preventDefault();
  q("dialog[open]")?.close();
  wipeTo(h);
}, true);
addEventListener("hashchange", () => setTimeout(prepReveals, 50));
setTimeout(prepReveals, 300);
