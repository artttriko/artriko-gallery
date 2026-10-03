// Studio background video: real-looking clips of a hooded painter, filmed from behind (generated with Veo,
// or a clip the admin uploads). Fixed behind the whole page at low opacity, with a "camera window" section
// where it shows clearly. Several clips play one after another with a soft crossfade.
// Nothing is shown until the admin turns a clip on.
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
// Built-in clip (slow motion, seamless boomerang loop, smoke and paint mist), used until the admin changes it.
export const BUILTIN = "/studio/painter.mp4";
export const STUDIO_DEFAULT = { clips: [BUILTIN], on: true, opacity: 0.45 };
const SMALL = matchMedia("(max-width: 760px)").matches;
const pick = u => (u === BUILTIN && SMALL ? "/studio/painter-m.mp4" : u);
let layer = null, win = null, timer = null;

export function setStudio(cfg) {
  const clips = (cfg && cfg.on !== false && Array.isArray(cfg.clips)) ? cfg.clips.filter(c => typeof c === "string" && /^(https:\/\/|\/studio\/)/.test(c)).map(pick) : [];
  if (!clips.length) { teardown(); return; }
  if (!layer) build();
  layer.style.setProperty("--studio-o", String(cfg.opacity ?? 0.45));
  play(clips);
}

function build() {
  document.documentElement.classList.add("studio-on");
  layer = document.createElement("div");
  layer.className = "studio-bg";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `<video muted playsinline preload="auto"></video><video muted playsinline preload="auto"></video>`;
  document.body.prepend(layer);
  const hero = document.querySelector(".hero");
  if (hero) {
    win = document.createElement("section");
    win.className = "studio-window";
    win.innerHTML = `<div class="sw-rec" aria-hidden="true"><i></i>REC <span class="sw-tc">00:00:00</span></div>
      <p class="sw-cap">כל פסל נצבע ביד.<br><span>שכבה אחרי שכבה.</span></p>`;
    hero.after(win);
    const tc = win.querySelector(".sw-tc"), start = Date.now();
    setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      tc.textContent = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(n => String(n).padStart(2, "0")).join(":");
    }, 1000);
  }
  document.addEventListener("visibilitychange", () => {
    const v = layer?.querySelector("video.on"); if (!v) return;
    document.hidden ? v.pause() : v.play().catch(() => {});
  });
}

function play(clips) {
  clearTimeout(timer);
  const [a, b] = layer.querySelectorAll("video");
  let i = 0, cur = a, next = b;
  const start = (v, src) => { v.src = src; v.currentTime = 0; const p = v.play(); if (p) p.catch(() => {}); };
  cur.loop = clips.length === 1; next.loop = false;
  cur.poster = /\/studio\/painter/.test(clips[0]) ? "/studio/painter.jpg" : "";
  start(cur, clips[0]); cur.classList.add("on"); next.classList.remove("on");
  if (RM) { cur.pause(); return; }               // reduced motion: a still frame
  if (clips.length === 1) return;
  const schedule = () => {
    const d = isFinite(cur.duration) && cur.duration > 1 ? cur.duration : 8;
    timer = setTimeout(advance, Math.max(1500, (d - 0.8) * 1000));
  };
  const advance = () => {
    i = (i + 1) % clips.length;
    start(next, clips[i]);
    next.classList.add("on"); cur.classList.remove("on");
    [cur, next] = [next, cur];
    if (isFinite(cur.duration) && cur.duration > 1) schedule(); else cur.addEventListener("loadedmetadata", schedule, { once: true });
  };
  if (isFinite(cur.duration) && cur.duration > 1) schedule(); else cur.addEventListener("loadedmetadata", schedule, { once: true });
}

function teardown() {
  clearTimeout(timer);
  document.documentElement.classList.remove("studio-on");
  layer?.remove(); win?.remove(); layer = win = null;
}
