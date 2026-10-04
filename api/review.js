// Receives a customer or student review. It is saved as "pending" and appears on the site only after
// the admin approves it. A visitor can send up to 3 reviews a day (by salted IP hash; the IP is never stored).
// Photos are uploaded by the browser to the "reviews" bucket first; only their URLs arrive here.
import { createHash } from "node:crypto";

const clip = (v, n) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const star = v => { const n = Math.round(+v); return n >= 1 && n <= 5 ? n : 0; };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "method" });
  const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key, VISIT_SECRET, IP_SALT } = process.env;
  if (!url || !key || !VISIT_SECRET || !IP_SALT) return res.status(500).json({ code: "not_configured" });

  let b = {};
  try { b = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) || {}; } catch {}
  if (b.website) return res.status(200).json({ ok: true }); // hidden field filled in: a bot
  const kind = b.kind === "lesson" ? "lesson" : b.kind === "piece" ? "piece" : null;
  const name = clip(b.name, 40), subject = clip(b.subject, 60);
  const body = String(b.body ?? "").trim().slice(0, 700);
  const r1 = star(b.service), r2 = star(b.reliable), r3 = star(b.pro);
  const photos = (Array.isArray(b.photos) ? b.photos : []).slice(0, 3).map(String)
    .filter(u => u.startsWith(`${url}/storage/v1/object/public/reviews/u/`));
  if (!kind || !name || !r1 || !r2 || !r3) return res.status(400).json({ code: "missing" });

  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim() || "unknown";
  const ipHash = createHash("sha256").update(IP_SALT + "r:" + ip).digest("hex");

  const r = await fetch(`${url}/rest/v1/rpc/submit_review`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_secret: VISIT_SECRET, p_ip_hash: ipHash, p_kind: kind, p_name: name, p_subject: subject,
      p_service: r1, p_reliable: r2, p_pro: r3, p_body: body, p_photos: photos }),
  });
  if (r.ok) return res.status(200).json({ ok: true });
  const t = await r.text();
  if (/too_many/.test(t)) return res.status(429).json({ code: "too_many" });
  console.error("submit_review", r.status, t.slice(0, 300));
  return res.status(502).json({ code: "failed" });
}
