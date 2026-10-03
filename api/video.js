// Background video clips generated with Google's Veo model through the Gemini API.
// POST {action:"start", color, model} starts a clip and returns an operation id.
// POST {action:"poll", op} checks it; when ready the clip is saved to Supabase Storage and its URL returned.
// Only the signed-in gallery admin may call it. The Gemini key stays on the server.
import { randomUUID } from "node:crypto";

const SB = process.env.VITE_SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_ANON_KEY;
const API = "https://generativelanguage.googleapis.com/v1beta";
const MODELS = [process.env.VEO_MODEL, "veo-3.1-generate-preview", "veo-3.1-fast-generate-preview", "veo-3.0-generate-001"].filter(Boolean);

const COLORS = { yellow: "vivid sunflower yellow", red: "vivid hot pink-red", cyan: "vivid electric cyan blue", purple: "vivid violet purple", green: "vivid neon green", orange: "vivid bright orange" };
const PIECES = {
  bust: "a small hand-painted collectible bust of an original superhero character (head and shoulders, about 25 cm tall) on a round black base",
  statue: "a small hand-painted collectible statue of an original caped hero in a dynamic pose (about 30 cm tall) on a round black base",
  helmet: "a small hand-painted collectible fantasy knight helmet (about 20 cm tall) on a display stand",
  creature: "a small hand-painted collectible statue of an original horned fantasy creature (about 25 cm tall) on a round black base",
};

function buildPrompt(color, piece, tool) {
  const c = COLORS[color] || COLORS.yellow, p = PIECES[piece] || PIECES.bust;
  const t = tool === "brush" ? "a fine paint brush, making small careful strokes" : "an airbrush, spraying a fine mist of paint";
  return `Cinematic documentary footage filmed from behind and slightly over the right shoulder of an artist sitting on a wooden stool at a workbench in a dark, quiet hobby studio at night. ` +
    `The artist meticulously paints ${p}, holding the figurine up in the left hand and using ${t} in the right hand. ` +
    `The artist wears a dark hoodie with the hood up and a black half-face respirator mask; the face is never visible, we only see the back of the hood and shoulders. ` +
    `A single soft warm spotlight from above lights only the figurine; the rest of the room falls into deep shadow. Shallow depth of field, the figurine in sharp focus, the hood softly out of focus in the foreground. ` +
    `Slow, subtle handheld camera drift, natural film grain, realistic, 35mm. ` +
    `The whole image is black and white, except the fresh paint on the figurine and the paint mist, which are ${c}. ` +
    `Calm, focused, patient mood. No text, no logos, no watermark.`;
}
const NEGATIVE = "visible face, eyes, skin of the face, text, letters, watermark, logo, colorful background, cartoon, illustration, CGI look";

async function isAdmin(token) {
  if (!token) return false;
  const r = await fetch(`${SB}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: { apikey: ANON, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  return r.ok && (await r.json()) === true;
}
const key = () => (process.env.GEMINI_API_KEY || "").trim();
async function gjson(url, opts = {}) {
  const r = await fetch(url, { ...opts, headers: { "x-goog-api-key": key(), "Content-Type": "application/json", ...(opts.headers || {}) } });
  const text = await r.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: r.status, ok: r.ok, json, text };
}
const errMsg = r => r?.json?.error?.message || String(r?.text || "").slice(0, 300);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "method", error: "POST only" });
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!(await isAdmin(token))) return res.status(401).json({ code: "not_admin", error: "Admin only" });
  if (!key()) return res.status(500).json({ code: "no_key", error: "GEMINI_API_KEY is not set" });
  const { action, color, piece, tool, op } = req.body || {};

  if (action === "start") {
    const prompt = buildPrompt(color, piece, tool);
    let last = null;
    for (const model of MODELS) {
      for (const personGeneration of ["allow_all", "allow_adult", undefined]) {
        const parameters = { aspectRatio: "16:9", negativePrompt: NEGATIVE };
        if (personGeneration) parameters.personGeneration = personGeneration;
        const r = await gjson(`${API}/models/${encodeURIComponent(model)}:predictLongRunning`, {
          method: "POST",
          body: JSON.stringify({ instances: [{ prompt }], parameters }),
        });
        if (r.ok && r.json?.name) return res.status(200).json({ op: r.json.name, model });
        last = r;
        const m = errMsg(r);
        if (r.status === 400 && /personGeneration|person_generation|allow_/i.test(m)) continue; // try the next setting
        break;
      }
      if (last?.status === 404) continue;           // model not available for this key
      break;
    }
    const m = errMsg(last);
    console.error("veo start", last?.status, m);
    if (last?.status === 429) return res.status(429).json({ code: "rate_limited", error: m });
    if (/billing|paid|quota|free tier|not available|permission|limit: 0/i.test(m) || last?.status === 403) return res.status(402).json({ code: "needs_billing", error: m });
    return res.status(502).json({ code: "upstream_error", error: m || "Could not start the video" });
  }

  if (action === "poll") {
    if (typeof op !== "string" || !/^[\w./-]+$/.test(op)) return res.status(400).json({ code: "bad_request", error: "Bad operation id" });
    const r = await gjson(`${API}/${op}`);
    if (!r.ok) return res.status(502).json({ code: "upstream_error", error: errMsg(r) });
    if (!r.json?.done) return res.status(200).json({ done: false });
    if (r.json.error) return res.status(422).json({ code: "failed", error: r.json.error.message || "Generation failed" });
    const resp = r.json.response || {};
    const sample = resp.generateVideoResponse?.generatedSamples?.[0] || resp.generatedVideos?.[0];
    const uri = sample?.video?.uri;
    if (!uri) {
      const why = resp.generateVideoResponse?.raiMediaFilteredReasons?.join(" ") || "";
      return res.status(422).json({ code: "filtered", error: why || "No video returned" });
    }
    const v = await fetch(uri, { headers: { "x-goog-api-key": key() }, redirect: "follow" });
    if (!v.ok) return res.status(502).json({ code: "download_failed", error: `Download ${v.status}` });
    const buf = Buffer.from(await v.arrayBuffer());
    const path = `studio/clip-${randomUUID()}.mp4`;
    const up = await fetch(`${SB}/storage/v1/object/gallery/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, apikey: ANON, "Content-Type": "video/mp4", "cache-control": "max-age=31536000" },
      body: buf,
    });
    if (!up.ok) return res.status(502).json({ code: "upload_failed", error: `Storage ${up.status}` });
    return res.status(200).json({ done: true, url: `${SB}/storage/v1/object/public/gallery/${path}` });
  }

  return res.status(400).json({ code: "bad_request", error: "Unknown action" });
}

export const config = { maxDuration: 60 };
