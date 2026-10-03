// Counts a site visit by IP. The same IP is counted again only after 10 minutes
// (enforced in the database). The IP itself is never stored, only a salted hash.
import { createHash } from "node:crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key, VISIT_SECRET, IP_SALT } = process.env;
  if (!url || !key || !VISIT_SECRET || !IP_SALT) return res.status(204).end();

  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  if (!ip) return res.status(204).end();
  const ipHash = createHash("sha256").update(IP_SALT + ip).digest("hex");

  try {
    await fetch(`${url}/rest/v1/rpc/record_visit`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_secret: VISIT_SECRET, p_ip_hash: ipHash }),
    });
  } catch {}
  return res.status(204).end();
}
