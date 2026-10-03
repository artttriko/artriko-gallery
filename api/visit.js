// Counts a site visit by IP, or a click on a tracked area ({kind}) such as the collector's guide or the
// workshop button. The same IP is counted again only after 10 minutes, per area (enforced in the database).
// The IP itself is never stored, only a salted hash.
import { createHash } from "node:crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key, VISIT_SECRET, IP_SALT } = process.env;
  if (!url || !key || !VISIT_SECRET || !IP_SALT) return res.status(204).end();

  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  if (!ip) return res.status(204).end();
  const ipHash = createHash("sha256").update(IP_SALT + ip).digest("hex");

  let kind = null;
  try { kind = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {}).kind || null; } catch {}
  if (kind && !/^[a-z]{1,12}$/.test(kind)) return res.status(204).end();
  try {
    await fetch(`${url}/rest/v1/rpc/${kind ? "record_event" : "record_visit"}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(kind ? { p_secret: VISIT_SECRET, p_ip_hash: ipHash, p_kind: kind } : { p_secret: VISIT_SECRET, p_ip_hash: ipHash }),
    });
  } catch {}
  return res.status(204).end();
}
