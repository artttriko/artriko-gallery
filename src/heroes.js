// ARTRIKO brand layer (cosmetic): a bouncy wordmark.
// Nothing here is needed to use the site; with reduced motion it stays still.
const q = (s, r = document) => r.querySelector(s);

/* ---------- Bouncy wordmark ---------- */
const mark = q(".mark");
if (mark && !mark.querySelector("span")) {
  mark.setAttribute("aria-label", mark.textContent.trim());
  mark.innerHTML = mark.textContent.trim().split("").map((c, i) => `<span aria-hidden="true" style="--i:${i}">${c}</span>`).join("");
}
