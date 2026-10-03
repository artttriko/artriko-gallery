// "Studio" background for the site: a quiet, film-like scene drawn live on a canvas, fixed behind the page.
// Seen from behind: a hooded painter (no face, spray respirator) holds a model under a soft spotlight
// and paints it, with an airbrush or sometimes a brush. Everything is black and white except the paint,
// whose colour changes together with the model. Low opacity so it never competes with the content.
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

const W = 1600, H = 900;                       // virtual stage, scaled to cover the hero
const PAINTS = ["#ffd23f", "#ff3b5c", "#2ec4ff", "#b46cff", "#3ddc84", "#ff7a00"];
const MODELS = ["bust", "caped", "helmet", "beast"];
const CYCLE = 9000;                            // ms per model

init();

function init() {
  const cv = document.createElement("canvas");
  cv.className = "studio-bg";
  cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);                   // fixed behind the whole page, like a background video
  // an open "window" in the page where the scene shows through clearly, like a camera feed
  const hero = document.querySelector(".hero");
  if (hero) {
    const win = document.createElement("section");
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
  const ctx = cv.getContext("2d");
  let scale = 1, ox = 0, oy = 0, dpr = 1;

  function resize() {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(1.5, devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(r.width * dpr));
    cv.height = Math.max(1, Math.round(r.height * dpr));
    const phone = cv.width < cv.height;
    // landscape: cover the screen; portrait phones: zoom out so the hood and the model both fit
    scale = phone ? Math.max(cv.width / W * 1.25, cv.height / H * 0.62) : Math.max(cv.width / W, cv.height / H);
    const fx = phone ? 0.7 : 0.5;                // where the lit model sits across the screen
    ox = Math.min(0, Math.max(cv.width - W * scale, fx * cv.width - 1000 * scale));
    oy = (cv.height - H * scale) / 2;
  }
  resize();
  addEventListener("resize", resize);

  // film grain tile
  const grain = document.createElement("canvas"); grain.width = grain.height = 160;
  { const g = grain.getContext("2d"), im = g.createImageData(160, 160);
    for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 26; }
    g.putImageData(im, 0, 0); }
  const grainPat = ctx.createPattern(grain, "repeat");

  // spray particles and floating dust
  const parts = [];
  const dust = Array.from({ length: 70 }, () => ({ x: 820 + Math.random() * 360, y: Math.random() * 760, s: 0.6 + Math.random() * 1.8, v: 0.05 + Math.random() * 0.15, p: Math.random() * 6 }));
  const strokes = [];

  let running = true, visible = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; });

  const t0 = performance.now();
  let lastFrame = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (!running || !visible) return;
    if (now - lastFrame < 40) return;           // ~25 fps is plenty for a background
    lastFrame = now;
    draw(Math.max(0, now - t0));   // rAF time can be slightly earlier than t0
  }
  if (RM) draw(2500); else requestAnimationFrame(frame);

  function draw(t) {
    const cyc = Math.floor(t / CYCLE), u = (t % CYCLE) / CYCLE;
    const model = MODELS[cyc % MODELS.length], prevModel = MODELS[(cyc + MODELS.length - 1) % MODELS.length];
    const paint = PAINTS[cyc % PAINTS.length], prevPaint = PAINTS[(cyc + PAINTS.length - 1) % PAINTS.length];
    const brush = cyc % 3 === 2;               // every third model is painted with a brush
    if (cyc !== draw.cyc) { draw.cyc = cyc; strokes.length = 0; parts.length = 0; }
    const fadeIn = Math.min(1, u / 0.12);      // crossfade at the start of each cycle
    const progress = Math.min(1, Math.max(0, (u - 0.08) / 0.8)); // how much paint is on the model

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    // slow handheld camera drift
    const drift = { x: Math.sin(t / 5200) * 14, y: Math.sin(t / 3900) * 8, z: 1.03 + Math.sin(t / 7000) * 0.015 };
    ctx.setTransform(scale * drift.z, 0, 0, scale * drift.z, ox + drift.x * scale - (drift.z - 1) * W * scale / 2, oy + drift.y * scale - (drift.z - 1) * H * scale / 2);

    // --- room
    const bg = ctx.createRadialGradient(1000, 380, 40, 1000, 380, 900);
    bg.addColorStop(0, "#2a2a2a"); bg.addColorStop(0.5, "#141414"); bg.addColorStop(1, "#070707");
    ctx.fillStyle = bg; ctx.fillRect(-100, -100, W + 200, H + 200);

    // spotlight cone
    const flick = 0.92 + Math.sin(t / 130) * 0.015 + Math.sin(t / 47) * 0.01;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    const cone = ctx.createLinearGradient(1000, -40, 1000, 760);
    cone.addColorStop(0, `rgba(255,255,255,${0.16 * flick})`); cone.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cone;
    ctx.beginPath(); ctx.moveTo(950, -40); ctx.lineTo(1050, -40); ctx.lineTo(1260, 760); ctx.lineTo(740, 760); ctx.closePath(); ctx.fill();
    // dust in the light
    dust.forEach(d => {
      d.y -= d.v; d.x += Math.sin(t / 900 + d.p) * 0.12; if (d.y < -10) d.y = 760;
      const inCone = Math.abs(d.x - 1000) < 60 + d.y * 0.33;
      if (!inCone) return;
      ctx.fillStyle = `rgba(255,255,255,${0.10 + 0.12 * Math.sin(t / 600 + d.p) ** 2})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.s, 0, 7); ctx.fill();
    });
    ctx.restore();

    // bench glow under the model
    const pool = ctx.createRadialGradient(1000, 740, 10, 1000, 740, 330);
    pool.addColorStop(0, `rgba(200,200,200,${0.22 * flick})`); pool.addColorStop(1, "rgba(200,200,200,0)");
    ctx.fillStyle = pool; ctx.beginPath(); ctx.ellipse(1000, 740, 330, 70, 0, 0, 7); ctx.fill();

    // --- the model, held up by the painter's left hand, turning slowly
    const turn = Math.sin(t / 2600) * 0.08;
    const mx = 1000, my = 600;
    if (fadeIn < 1) drawModel(prevModel, mx, my, turn, 1 - fadeIn, prevPaint, 1);
    drawModel(model, mx, my, turn, fadeIn, paint, progress);

    // left hand under the base (gloved, grey)
    drawHoldingHand(mx, my + 6, t);

    // --- painter (foreground, from behind, slightly out of focus)
    const breathe = Math.sin(t / 1700) * 4;
    const handPath = { x: 820 + Math.sin(t / 700) * 18 + Math.sin(t / 260) * 4, y: 470 + Math.cos(t / 900) * 22 };
    drawArm(handPath, breathe, brush);
    drawPainter(breathe, t);

    // --- paint: airbrush spray or brush dabs (the only colour on screen)
    const tip = brush ? { x: handPath.x + 128, y: handPath.y - 30 } : { x: handPath.x + 96, y: handPath.y - 38 };
    if (!RM) {
      if (!brush) {
        for (let i = 0; i < 6; i++) parts.push({ x: tip.x, y: tip.y, vx: 4 + Math.random() * 5, vy: (Math.random() - 0.45) * 2.6, life: 1, c: paint, r: 1 + Math.random() * 2.6 });
      } else if (Math.random() < 0.3) {
        strokes.push({ x: mx - 40 + Math.random() * 80, y: my - 220 + Math.random() * 190, a: Math.random() * 3, life: 1, c: paint });
      }
    }
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.life -= 0.03; p.r *= 1.03;
      if (p.life <= 0 || p.x > mx + 40) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = p.life * 0.22; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    }
    if (!brush) {
      const mist = ctx.createRadialGradient(tip.x + 70, tip.y + 6, 4, tip.x + 70, tip.y + 6, 90);
      mist.addColorStop(0, hexA(paint, 0.14)); mist.addColorStop(1, hexA(paint, 0));
      ctx.globalAlpha = 1; ctx.fillStyle = mist; ctx.beginPath(); ctx.arc(tip.x + 70, tip.y + 6, 90, 0, 7); ctx.fill();
    }
    ctx.restore();
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i]; s.life -= 0.012;
      if (s.life <= 0) { strokes.splice(i, 1); continue; }
      ctx.save(); ctx.globalAlpha = Math.min(1, s.life * 1.5) * 0.55; ctx.strokeStyle = s.c; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(s.x, s.y, 9, s.a, s.a + 1.6); ctx.stroke(); ctx.restore();
    }

    // --- grain + vignette
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.save(); ctx.translate((t * 0.37) % 160, (t * 0.23) % 160);
    ctx.fillStyle = grainPat; ctx.fillRect(-160, -160, cv.width + 320, cv.height + 320); ctx.restore();
    const vg = ctx.createRadialGradient(cv.width * 0.62, cv.height * 0.45, cv.height * 0.2, cv.width * 0.6, cv.height * 0.5, cv.height * 1.05);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.75)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, cv.width, cv.height);
  }

  /* ---------- pieces ---------- */
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }

  function modelPath(kind) {
    const p = new Path2D();
    if (kind === "bust") {             // portrait bust on a stepped plinth
      p.moveTo(-6, -268); p.bezierCurveTo(30, -270, 48, -244, 46, -212); p.bezierCurveTo(46, -188, 36, -170, 22, -162);
      p.lineTo(24, -146); p.bezierCurveTo(60, -140, 96, -122, 104, -84); p.lineTo(108, -62); p.lineTo(-108, -62); p.lineTo(-104, -84);
      p.bezierCurveTo(-96, -122, -60, -140, -24, -146); p.lineTo(-22, -162); p.bezierCurveTo(-40, -172, -48, -192, -46, -214);
      p.bezierCurveTo(-46, -246, -32, -266, -6, -268); p.closePath();
      p.rect(-70, -62, 140, 26); p.rect(-82, -36, 164, 36);
    } else if (kind === "caped") {     // standing figure with a cape, on a round base
      p.arc(0, -262, 22, 0, 7);
      p.moveTo(-14, -240); p.lineTo(14, -240); p.bezierCurveTo(44, -236, 50, -206, 46, -180);
      p.lineTo(84, -40); p.quadraticCurveTo(40, -30, 26, -44); p.lineTo(22, -118); p.lineTo(30, -40); p.lineTo(8, -40); p.lineTo(0, -112);
      p.lineTo(-8, -40); p.lineTo(-30, -40); p.lineTo(-22, -118); p.lineTo(-26, -44); p.quadraticCurveTo(-40, -30, -84, -40);
      p.lineTo(-46, -180); p.bezierCurveTo(-50, -206, -44, -236, -14, -240); p.closePath();
      p.ellipse(0, -24, 92, 16, 0, 0, 7); p.rect(-92, -24, 184, 24);
    } else if (kind === "helmet") {    // knight-style helmet on a display stand
      p.moveTo(-64, -112); p.bezierCurveTo(-74, -200, -56, -268, 0, -272); p.bezierCurveTo(56, -268, 74, -200, 64, -112);
      p.lineTo(40, -96); p.lineTo(-40, -96); p.closePath();
      p.moveTo(-6, -272); p.quadraticCurveTo(-24, -320, 18, -336); p.quadraticCurveTo(4, -304, 8, -272); p.closePath();
      p.rect(-10, -96, 20, 40); p.rect(-60, -56, 120, 22); p.rect(-74, -34, 148, 34);
    } else {                           // horned creature head on a plinth
      p.moveTo(-58, -118); p.bezierCurveTo(-92, -170, -84, -228, -48, -252); p.bezierCurveTo(-74, -284, -86, -312, -76, -334);
      p.bezierCurveTo(-56, -306, -40, -286, -20, -268); p.quadraticCurveTo(10, -280, 36, -268);
      p.bezierCurveTo(56, -286, 72, -306, 92, -334); p.bezierCurveTo(102, -312, 90, -284, 64, -252);
      p.bezierCurveTo(100, -228, 108, -170, 74, -118); p.quadraticCurveTo(8, -96, -58, -118); p.closePath();
      p.rect(-64, -110, 128, 34); p.rect(-78, -76, 156, 40); p.rect(-90, -36, 180, 36);
    }
    return p;
  }

  function drawModel(kind, x, y, turn, alpha, paint, progress) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(1 - Math.abs(turn) * 0.6, 1);
    const path = modelPath(kind);
    // grey body lit from the spotlight above
    const g = ctx.createLinearGradient(0, -300, 0, 0);
    g.addColorStop(0, "#bdbdbd"); g.addColorStop(0.55, "#6e6e6e"); g.addColorStop(1, "#2c2c2c");
    ctx.fillStyle = g; ctx.fill(path);
    // side shading follows the turn
    const s = ctx.createLinearGradient(-100, 0, 100, 0);
    s.addColorStop(0, `rgba(0,0,0,${0.45 + turn})`); s.addColorStop(0.5, "rgba(0,0,0,0)"); s.addColorStop(1, `rgba(0,0,0,${0.45 - turn})`);
    ctx.fillStyle = s; ctx.fill(path);
    // fresh paint, spreading from the side facing the painter
    if (progress > 0) {
      ctx.save(); ctx.clip(path);
      const reach = -110 + progress * 260;
      const pg = ctx.createLinearGradient(-110, 0, reach + 40, 0);
      pg.addColorStop(0, hexA(paint, 0.4)); pg.addColorStop(Math.max(0.01, Math.min(0.99, (reach + 110) / (reach + 150))), hexA(paint, 0.3)); pg.addColorStop(1, hexA(paint, 0));
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = pg; ctx.fillRect(-120, -320, 260, 330);
      ctx.restore();
    }
    // rim light from the spot
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2; ctx.stroke(path);
    ctx.restore();
  }

  function drawHoldingHand(x, y, t) {
    ctx.save(); ctx.translate(x, y + Math.sin(t / 1500) * 2);
    ctx.fillStyle = "#1c1c1c";
    ctx.beginPath(); // palm and fingers wrapping the base
    ctx.moveTo(-120, 40); ctx.quadraticCurveTo(-110, 4, -70, 2); ctx.lineTo(70, 2);
    ctx.quadraticCurveTo(108, 6, 112, 30); ctx.lineTo(100, 60); ctx.quadraticCurveTo(0, 80, -140, 120); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-50 + i * 34, 4); ctx.quadraticCurveTo(-46 + i * 34, 18, -54 + i * 34, 30); ctx.stroke(); }
    // forearm going back to the painter
    const arm = ctx.createLinearGradient(-140, 60, -520, 300);
    arm.addColorStop(0, "#202020"); arm.addColorStop(1, "#0c0c0c");
    ctx.fillStyle = arm;
    ctx.beginPath(); ctx.moveTo(-130, 30); ctx.lineTo(-540, 230); ctx.lineTo(-560, 330); ctx.lineTo(-120, 120); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawArm(hand, breathe, brush) {
    ctx.save();
    // sleeve from the shoulder to the hand
    const sx = 520, sy = 520 + breathe;
    const sl = ctx.createLinearGradient(sx, sy, hand.x, hand.y);
    sl.addColorStop(0, "#0d0d0d"); sl.addColorStop(1, "#262626");
    ctx.fillStyle = sl;
    ctx.beginPath();
    ctx.moveTo(sx - 40, sy - 70); ctx.quadraticCurveTo(hand.x - 140, hand.y - 70, hand.x - 10, hand.y - 30);
    ctx.lineTo(hand.x + 6, hand.y + 22); ctx.quadraticCurveTo(hand.x - 150, hand.y + 60, sx + 30, sy + 90); ctx.closePath(); ctx.fill();
    // hand
    ctx.fillStyle = "#2a2a2a"; ctx.beginPath(); ctx.ellipse(hand.x + 14, hand.y - 4, 30, 22, -0.4, 0, 7); ctx.fill();
    if (!brush) {
      // airbrush: body, paint cup and hose
      ctx.save(); ctx.translate(hand.x + 20, hand.y - 18); ctx.rotate(-0.28);
      const body = ctx.createLinearGradient(0, -8, 0, 8); body.addColorStop(0, "#9a9a9a"); body.addColorStop(1, "#3a3a3a");
      ctx.fillStyle = body; ctx.beginPath(); ctx.roundRect(-30, -7, 108, 14, 6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(78, -4); ctx.lineTo(96, -1); ctx.lineTo(96, 1); ctx.lineTo(78, 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#777"; ctx.beginPath(); ctx.roundRect(18, -26, 22, 20, 4); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.lineWidth = 1.5; ctx.strokeRect(18, -26, 22, 20);
      ctx.restore();
      ctx.strokeStyle = "#151515"; ctx.lineWidth = 6; ctx.beginPath();
      ctx.moveTo(hand.x - 8, hand.y - 8); ctx.bezierCurveTo(hand.x - 80, hand.y + 140, sx - 60, sy + 200, sx - 160, sy + 260); ctx.stroke();
    } else {
      // brush
      ctx.save(); ctx.translate(hand.x + 10, hand.y - 10); ctx.rotate(-0.25);
      ctx.fillStyle = "#4a4a4a"; ctx.fillRect(-40, -4, 110, 8);
      ctx.fillStyle = "#8a8a8a"; ctx.fillRect(70, -5, 22, 10);
      ctx.fillStyle = "#cfcfcf"; ctx.beginPath(); ctx.moveTo(92, -5); ctx.quadraticCurveTo(118, 0, 92, 5); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawPainter(breathe, t) {
    ctx.save();
    const sway = Math.sin(t / 3100) * 6;
    ctx.translate(sway, breathe);
    ctx.filter = "blur(2.5px)";                 // foreground, out of focus
    // one silhouette: back, shoulders and the hood rising into a soft peak (seen from behind)
    const fig = new Path2D();
    fig.moveTo(-90, 960);
    fig.bezierCurveTo(-60, 760, 60, 640, 170, 600);
    fig.bezierCurveTo(170, 470, 200, 330, 290, 236);
    fig.bezierCurveTo(330, 196, 352, 170, 372, 150);
    fig.bezierCurveTo(470, 150, 590, 200, 632, 318);
    fig.bezierCurveTo(652, 380, 660, 440, 650, 500);
    fig.bezierCurveTo(642, 548, 620, 580, 640, 600);
    fig.bezierCurveTo(720, 640, 770, 760, 790, 960);
    fig.closePath();
    const body = ctx.createLinearGradient(220, 160, 640, 900);
    body.addColorStop(0, "#262626"); body.addColorStop(0.35, "#1b1b1b"); body.addColorStop(1, "#060606");
    ctx.fillStyle = body; ctx.fill(fig);
    ctx.save(); ctx.clip(fig); ctx.lineCap = "round";
    // soft fabric folds running from the peak of the hood down and back
    [[372, 160, 230, 520, 0.09, 16], [420, 170, 330, 560, 0.07, 12], [500, 190, 470, 560, 0.06, 10]].forEach(([x1, y1, x2, y2, a, w]) => {
      ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(x1 - 60, (y1 + y2) / 2, x2, y2); ctx.stroke();
    });
    // seam where the hood meets the shoulders
    ctx.strokeStyle = "rgba(255,255,255,.06)"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(170, 600); ctx.quadraticCurveTo(400, 640, 640, 600); ctx.stroke();
    // the hood opening on the side facing the model stays in deep shadow (no face shown)
    const open = ctx.createRadialGradient(668, 430, 8, 660, 430, 140);
    open.addColorStop(0, "rgba(0,0,0,.96)"); open.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = open; ctx.beginPath(); ctx.ellipse(668, 430, 120, 170, 0, 0, 7); ctx.fill();
    ctx.restore();
    // respirator: mask edge and one filter cartridge just visible at the front of the hood
    ctx.filter = "blur(1.2px)";
    ctx.fillStyle = "#242424"; ctx.beginPath(); ctx.moveTo(628, 410); ctx.quadraticCurveTo(684, 434, 676, 498); ctx.quadraticCurveTo(648, 518, 622, 500); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#313131"; ctx.beginPath(); ctx.ellipse(668, 482, 22, 26, 0.35, 0, 7); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.24)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(668, 482, 22, 26, 0.35, -1.2, 1.6); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.09)"; ctx.lineWidth = 1.5;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(655, 482 + i * 7); ctx.lineTo(682, 482 + i * 7 - 4); ctx.stroke(); }
    // rim light from the spotlight along the top and front of the hood only
    ctx.filter = "blur(1px)";
    const rim = ctx.createLinearGradient(290, 236, 650, 500);
    rim.addColorStop(0, "rgba(255,255,255,0)"); rim.addColorStop(0.4, "rgba(255,255,255,.34)"); rim.addColorStop(1, "rgba(255,255,255,.04)");
    ctx.strokeStyle = rim; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(290, 236); ctx.bezierCurveTo(330, 196, 352, 170, 372, 150);
    ctx.bezierCurveTo(470, 150, 590, 200, 632, 318); ctx.bezierCurveTo(652, 380, 660, 440, 650, 500); ctx.stroke();
    ctx.restore();
  }
}
