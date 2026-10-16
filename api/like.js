// Adds or removes a like on a work. One like per device: a random id made in the visitor's browser,
// stored only as a salted hash (the IP is hashed too, for a gentle rate limit). Raw ids are never stored.
import { createHash } from "node:crypto";

const SHOW_FROM = 5; // public counts appear only from this number

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "method" });
  const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key, VISIT_SECRET, IP_SALT } = process.env;
  if (!url || !key || !VISIT_SECRET || !IP_SALT) return res.status(500).json({ code: "not_configured" });

  let b = {};
  try { b = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) || {}; } catch {}
  const id = String(b.id || "");
  const vid = String(b.vid || "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[\w-]{16,64}$/.test(vid)) return res.status(400).json({ code: "bad_request" });

  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim() || "unknown";
  const ipHash = createHash("sha256").update(IP_SALT + "li:" + ip).digest("hex");
  const visitorHash = createHash("sha256").update(IP_SALT + "l:" + vid).digest("hex");

  const r = await fetch(`${url}/rest/v1/rpc/toggle_like`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_secret: VISIT_SECRET, p_work: id, p_visitor_hash: visitorHash, p_ip_hash: ipHash, p_like: b.like !== false }),
  });
  const t = await r.text();
  if (!r.ok) {
    if (/too_many/.test(t)) return res.status(429).json({ code: "too_many" });
    console.error("toggle_like", r.status, t.slice(0, 200));
    return res.status(502).json({ code: "failed" });
  }
  const n = +t || 0;
  return res.status(200).json({ ok: true, likes: n >= SHOW_FROM ? n : null });
}
