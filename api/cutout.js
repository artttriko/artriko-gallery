// Background removal for the in-room illustration.
// Uses remove.bg when REMOVEBG_API_KEY is set (preferred), otherwise OpenAI's image model.
// Returns a transparent PNG of the statue only, saved to Supabase Storage.
// Only the signed-in gallery admin may call it. API keys stay on the server.
import { randomUUID } from "node:crypto";

const SB = process.env.VITE_SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_ANON_KEY;

async function isAdmin(token) {
  if (!token) return false;
  const r = await fetch(`${SB}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: { apikey: ANON, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  return r.ok && (await r.json()) === true;
}

async function saveToStorage(token, buf) {
  const path = `cutouts/raw-${randomUUID()}.png`;
  const up = await fetch(`${SB}/storage/v1/object/gallery/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, apikey: ANON, "Content-Type": "image/png" },
    body: buf,
  });
  if (!up.ok) return null;
  return `${SB}/storage/v1/object/public/gallery/${path}`;
}

/* ---------- remove.bg ---------- */
// Free accounts get a monthly allowance at "preview" size; paid credits allow larger sizes (REMOVEBG_SIZE).
async function removeBg(imgBuf, mime) {
  const fd = new FormData();
  fd.append("image_file", new Blob([imgBuf], { type: mime }), mime === "image/png" ? "statue.png" : "statue.jpg");
  fd.append("size", process.env.REMOVEBG_SIZE || "preview");
  fd.append("type", "product");
  fd.append("format", "png");
  fd.append("crop", "true");
  const r = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": (process.env.REMOVEBG_API_KEY || "").trim() },
    body: fd,
  });
  if (r.ok) return { buf: Buffer.from(await r.arrayBuffer()) };
  const text = await r.text();
  let msg = text.slice(0, 300);
  try { msg = JSON.parse(text).errors?.map(e => e.title).join("; ") || msg; } catch {}
  const code =
    r.status === 402 ? "needs_credits" :
    r.status === 403 ? "bad_key" :
    r.status === 429 ? "rate_limited" :
    /foreground|identify/i.test(msg) ? "no_subject" : "upstream_error";
  return { error: { status: r.status, code, msg } };
}

/* ---------- OpenAI (fallback) ---------- */
const MODELS = [process.env.OPENAI_IMAGE_MODEL, "gpt-image-1.5", "gpt-image-2.5-sunburst", "gpt-image-1"].filter(Boolean);
const HIGH_FIDELITY = new Set(["gpt-image-1", "gpt-image-1.5"]);
const PROMPT = `Remove the background from this photo and make it fully transparent.
Keep ONLY the statue and its own base/plinth. Remove everything else: hands, fingers, table, floor, walls, cables, other objects and any shadows on the background.
The statue must stay exactly as it is in the photo: identical shape, pose, proportions, sculpted details, paint colors, weathering and texture. Do not redraw, restyle, smooth, sharpen, recolor or "improve" it. Do not add anything.
Keep the full statue in frame, nothing cropped.`;

async function openAI(imgBuf, mime) {
  let last = null;
  for (const model of MODELS) {
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
    const b64 = json?.data?.[0]?.b64_json;
    if (r.ok && b64) return { buf: Buffer.from(b64, "base64") };
    const msg = json?.error?.message || text.slice(0, 300);
    last = { status: r.status, msg };
    if (r.status === 404 || json?.error?.code === "model_not_found" || (r.status === 400 && /model|input_fidelity|background|quality|size/i.test(msg) && !/billing|verif|safety/i.test(msg))) continue;
    break;
  }
  const msg = last?.msg || "";
  const code =
    /billing|credit|quota|payment/i.test(msg) ? "needs_billing" :
    /verif/i.test(msg) ? "needs_verification" :
    last?.status === 429 ? "rate_limited" :
    last?.status === 401 ? "bad_key" :
    /safety|moderation|rejected/i.test(msg) ? "refused" : "upstream_error";
  return { error: { status: last?.status, code, msg } };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "method", error: "POST only" });
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!(await isAdmin(token))) return res.status(401).json({ code: "not_admin", error: "Admin only" });

  const provider = process.env.REMOVEBG_API_KEY ? "removebg" : process.env.OPENAI_API_KEY ? "openai" : null;
  if (!provider) return res.status(500).json({ code: "no_key", error: "REMOVEBG_API_KEY is not set" });

  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(String(req.body?.image || ""));
  if (!m) return res.status(400).json({ code: "bad_request", error: "Missing image" });
  const imgBuf = Buffer.from(m[2], "base64");

  const out = provider === "removebg" ? await removeBg(imgBuf, m[1]) : await openAI(imgBuf, m[1]);
  if (out.buf) {
    const url = await saveToStorage(token, out.buf);
    if (!url) return res.status(502).json({ code: "upload_failed", error: "Storage upload failed" });
    return res.status(200).json({ url, provider });
  }
  console.error("cutout error", provider, out.error);
  const status = { needs_credits: 402, needs_billing: 402, needs_verification: 403, rate_limited: 429, refused: 422, no_subject: 422 }[out.error.code] || 502;
  return res.status(status).json({ code: out.error.code, error: out.error.msg, provider });
}

export const config = { maxDuration: 60 };
