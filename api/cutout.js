// Background removal with OpenAI's image model (the model behind ChatGPT images).
// Returns a transparent PNG of the statue only, saved to Supabase Storage.
// Only the signed-in gallery admin may call it. The OpenAI key stays on the server.
import { randomUUID } from "node:crypto";

const SB = process.env.VITE_SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_ANON_KEY;
const MODELS = [process.env.OPENAI_IMAGE_MODEL, "gpt-image-1.5", "gpt-image-2.5-sunburst", "gpt-image-1"].filter(Boolean);
const HIGH_FIDELITY = new Set(["gpt-image-1", "gpt-image-1.5"]);

const PROMPT = `Remove the background from this photo and make it fully transparent.
Keep ONLY the statue and its own base/plinth. Remove everything else: hands, fingers, table, floor, walls, cables, other objects and any shadows on the background.
The statue must stay exactly as it is in the photo: identical shape, pose, proportions, sculpted details, paint colors, weathering and texture. Do not redraw, restyle, smooth, sharpen, recolor or "improve" it. Do not add anything.
Keep the full statue in frame, nothing cropped.`;

async function isAdmin(token) {
  if (!token) return false;
  const r = await fetch(`${SB}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: { apikey: ANON, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  return r.ok && (await r.json()) === true;
}

async function callOpenAI(model, imgBuf, mime) {
  const fd = new FormData();
  fd.append("model", model);
  fd.append("image", new Blob([imgBuf], { type: mime }), mime === "image/png" ? "statue.png" : "statue.jpg");
  fd.append("prompt", PROMPT);
  fd.append("background", "transparent");
  fd.append("output_format", "png");
  fd.append("size", "auto");
  fd.append("quality", "high");
  if (HIGH_FIDELITY.has(model)) fd.append("input_fidelity", "high");
  const r = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${(process.env.OPENAI_API_KEY || "").trim()}` },
    body: fd,
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: r.status, ok: r.ok, json, text };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "method", error: "POST only" });
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!(await isAdmin(token))) return res.status(401).json({ code: "not_admin", error: "Admin only" });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ code: "no_key", error: "OPENAI_API_KEY is not set" });

  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(String(req.body?.image || ""));
  if (!m) return res.status(400).json({ code: "bad_request", error: "Missing image" });
  const imgBuf = Buffer.from(m[2], "base64");

  let last = null;
  for (const model of MODELS) {
    const r = await callOpenAI(model, imgBuf, m[1]);
    const b64 = r.json?.data?.[0]?.b64_json;
    if (r.ok && b64) {
      const path = `cutouts/raw-${randomUUID()}.png`;
      const up = await fetch(`${SB}/storage/v1/object/gallery/${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, apikey: ANON, "Content-Type": "image/png" },
        body: Buffer.from(b64, "base64"),
      });
      if (!up.ok) return res.status(502).json({ code: "upload_failed", error: `Storage ${up.status}` });
      return res.status(200).json({ url: `${SB}/storage/v1/object/public/gallery/${path}`, model });
    }
    last = r;
    const msg = r.json?.error?.message || "";
    const code = r.json?.error?.code || "";
    // model not available for this key, or a parameter this model doesn't take: try the next model
    if (r.status === 404 || code === "model_not_found" || (r.status === 400 && /model|input_fidelity|background|quality|size/i.test(msg) && !/billing|verif|safety/i.test(msg))) continue;
    break;
  }
  const msg = last?.json?.error?.message || String(last?.text || "").slice(0, 300);
  console.error("OpenAI cutout error", last?.status, msg);
  if (last?.status === 429 && /quota|billing|credit/i.test(msg)) return res.status(402).json({ code: "needs_billing", error: msg });
  if (last?.status === 429) return res.status(429).json({ code: "rate_limited", error: msg });
  if (/verif/i.test(msg)) return res.status(403).json({ code: "needs_verification", error: msg });
  if (/billing|credit|quota|payment/i.test(msg)) return res.status(402).json({ code: "needs_billing", error: msg });
  if (last?.status === 401) return res.status(502).json({ code: "bad_key", error: msg });
  if (/safety|moderation|rejected/i.test(msg)) return res.status(422).json({ code: "refused", error: msg });
  return res.status(502).json({ code: "upstream_error", error: msg || "OpenAI did not return an image" });
}

export const config = { maxDuration: 60 };
