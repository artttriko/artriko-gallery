// ARTRIKO brand layer (cosmetic):
// - a spinning side badge with the logo that speeds up with scrolling
// - a bouncy wordmark
// Nothing here is needed to use the site; with reduced motion it stays still.
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const q = (s, r = document) => r.querySelector(s);

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

/* ---------- Bouncy wordmark ---------- */
const mark = q(".mark");
if (mark && !mark.querySelector("span")) {
  mark.setAttribute("aria-label", mark.textContent.trim());
  mark.innerHTML = mark.textContent.trim().split("").map((c, i) => `<span aria-hidden="true" style="--i:${i}">${c}</span>`).join("");
}
