// Realistic showroom illustration with Gemini's image model.
// mode "piece": puts the sculpture from the photo on the collector's cabinet in the fixed dark showroom.
// mode "room": creates the empty showroom once, to be reused as the fixed reference for every piece.
// Only the signed-in admin may call it. The result is uploaded to Supabase Storage with the admin's own session.
import { randomUUID } from "node:crypto";

const MODELS = [process.env.GEMINI_IMAGE_MODEL, "gemini-3.1-flash-image", "gemini-2.5-flash-image", "gemini-3.1-flash-lite-image"].filter(Boolean);
const API = "https://generativelanguage.googleapis.com/v1beta";
const SB = process.env.VITE_SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_ANON_KEY;

const ROOM_STYLE = `a dark, moody luxury collectibles showroom at night. A dark walnut collector's display cabinet (waist height, with brass details and glass-door shelves holding blurred, out-of-focus collectible figures) stands against a deep charcoal-to-burgundy wall. Lighting like a high-end statue advertisement (Sideshow / Prime 1 product photography): a warm golden key light from the upper left, a soft rim light from behind, deep rich shadows, faint warm bokeh in the background. Camera at the height of the cabinet top, 85mm lens, shallow depth of field, photorealistic, cinematic color grading.`;

function piecePrompt({ heightCm, hasRef }) {
  return `Create a photorealistic product advertisement photo.
The FIRST image is a photo of a hand-painted 3D-printed collectible statue. Use exactly this statue: keep its sculpt, pose, proportions, paint colors, weathering and every detail identical. Do not redesign, restyle, repaint or "improve" it. Remove its original background completely, and remove any hand, fingers, table or clutter around it.
Place the statue standing on the center of the top of the display cabinet${heightCm ? `, at a realistic size for a ${heightCm} cm tall statue` : ""}, with a natural contact shadow under its base and light that matches the room.
${hasRef ? "The SECOND image is the fixed showroom. Reproduce this exact environment: same cabinet, wall, background, lighting, colors and camera angle. If the second image already shows a statue on the cabinet, replace it with the statue from the first image." : `The environment: ${ROOM_STYLE}`}
Portrait 4:5 composition, the statue is the clear hero of the frame. No text, no logos, no watermark, no people.`;
}
const ROOM_PROMPT = `Create a photorealistic photo of ${ROOM_STYLE} The top of the cabinet is empty in the center, ready for a statue to be placed there. Portrait 4:5 composition. No text, no logos, no watermark, no people.`;

async function isAdmin(token) {
  if (!token) return false;
  const r = await fetch(`${SB}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: { apikey: ANON, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  return r.ok && (await r.json()) === true;
}

// Finds the first base64 image anywhere in a Gemini response (generateContent or Interactions shape)
function findImage(o, depth = 0) {
  if (!o || typeof o !== "object" || depth > 12) return null;
  const mime = o.mime_type || o.mimeType;
  const data = typeof o.data === "string" ? o.data : null;
  if (data && data.length > 1000 && typeof mime === "string" && mime.startsWith("image/")) return { data, mime };
  for (const v of Array.isArray(o) ? o : Object.values(o)) {
    const f = findImage(v, depth + 1);
    if (f) return f;
  }
  return null;
}

async function gemini(path, body) {
  const r = await fetch(`${API}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": (process.env.GEMINI_API_KEY || "").trim() },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: r.status, ok: r.ok, json, text };
}

async function generate(model, prompt, images) {
  const parts = [{ text: prompt }, ...images.map(i => ({ inline_data: { mime_type: i.mime, data: i.data } }))];
  // 1) generateContent with image output
  let r = await gemini(`models/${encodeURIComponent(model)}:generateContent`, {
    contents: [{ role: "user", parts }],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: "4:5" } },
  });
  if (r.status === 400 && /imageConfig|aspect/i.test(r.text)) {
    r = await gemini(`models/${encodeURIComponent(model)}:generateContent`, {
      contents: [{ role: "user", parts }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    });
  }
  let img = r.ok ? findImage(r.json) : null;
  if (img) return { img };
  // 2) Interactions API (newer image models)
  if (!r.ok && r.status !== 429) {
    const r2 = await gemini("interactions", {
      model,
      input: [{ type: "text", text: prompt }, ...images.map(i => ({ type: "image", mime_type: i.mime, data: i.data }))],
    });
    img = r2.ok ? findImage(r2.json) : null;
    if (img) return { img };
    if (r2.status !== 404 && r2.status !== 400) r = r2;
  }
  return { error: r };
}

async function fetchRef(url) {
  if (typeof url !== "string" || !url.startsWith(`${SB}/storage/v1/object/public/`)) return null;
  const r = await fetch(url);
  if (!r.ok) return null;
  const mime = r.headers.get("content-type") || "image/jpeg";
  return { mime, data: Buffer.from(await r.arrayBuffer()).toString("base64") };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "method", error: "POST only" });
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!(await isAdmin(token))) return res.status(401).json({ code: "not_admin", error: "Admin only" });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ code: "no_key", error: "GEMINI_API_KEY is not set" });

  const { mode = "piece", image, heightCm, refUrl } = req.body || {};
  const images = [];
  let prompt;
  if (mode === "room") {
    prompt = ROOM_PROMPT;
  } else {
    const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(String(image || ""));
    if (!m) return res.status(400).json({ code: "bad_request", error: "Missing image" });
    images.push({ mime: m[1], data: m[2] });
    const ref = await fetchRef(refUrl);
    if (ref) images.push(ref);
    prompt = piecePrompt({ heightCm: +heightCm || null, hasRef: !!ref });
  }

  let last = null;
  for (const model of MODELS) {
    const out = await generate(model, prompt, images);
    if (out.img) {
      const buf = Buffer.from(out.img.data, "base64");
      const ext = out.img.mime.includes("png") ? "png" : out.img.mime.includes("webp") ? "webp" : "jpg";
      const path = `scenes/${mode}-${randomUUID()}.${ext}`;
      const up = await fetch(`${SB}/storage/v1/object/gallery/${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, apikey: ANON, "Content-Type": out.img.mime, "cache-control": "max-age=31536000" },
        body: buf,
      });
      if (!up.ok) return res.status(502).json({ code: "upload_failed", error: `Storage ${up.status}` });
      return res.status(200).json({ url: `${SB}/storage/v1/object/public/gallery/${path}`, model });
    }
    last = out.error;
    if (last?.status === 404) continue; // model not available for this key, try the next
    if (last?.status === 429) return res.status(429).json({ code: "rate_limited", error: "Gemini rate limit" });
    const msg = last?.json?.error?.message || String(last?.text || "").slice(0, 300);
    if (/billing|paid|free tier|quota|not available|limit: 0/i.test(msg)) return res.status(402).json({ code: "needs_billing", error: msg });
    if (last?.status === 200) return res.status(422).json({ code: "no_image", error: "Gemini answered without an image" });
    console.error("Gemini image error", model, last?.status, msg);
  }
  const msg = last?.json?.error?.message || String(last?.text || "").slice(0, 300);
  return res.status(502).json({ code: "upstream_error", error: msg || "No image model available" });
}

export const config = { maxDuration: 60 };
