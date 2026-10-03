// Title, summary and classification suggestions from Gemini.
// POST: only the signed-in gallery admin may call it. The Gemini key stays on the server.

const MODELS = [process.env.GEMINI_MODEL, "gemini-3.8-flash", "gemini-flash-latest", "gemini-2.5-flash"].filter(Boolean);
const API = "https://generativelanguage.googleapis.com/v1beta";

// Google issues keys in two formats (AIza… and the newer AQ.…). Try the standard header first,
// then the other ways Google accepts a key, and remember the one that worked.
const AUTH_STYLES = [
  key => ({ headers: { "x-goog-api-key": key }, qs: "" }),
  key => ({ headers: {}, qs: `?key=${encodeURIComponent(key)}` }),
  key => ({ headers: { Authorization: `Bearer ${key}` }, qs: "" }),
];
let goodStyle = null;

function geminiKey() { return (process.env.GEMINI_API_KEY || "").trim(); }

async function callGemini(path, body) {
  const key = geminiKey();
  const order = goodStyle == null ? AUTH_STYLES.map((_, i) => i) : [goodStyle, ...AUTH_STYLES.map((_, i) => i).filter(i => i !== goodStyle)];
  let last = null;
  for (const i of order) {
    const { headers, qs } = AUTH_STYLES[i](key);
    const r = await fetch(`${API}/${path}${qs}`, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (r.status === 400 || r.status === 401 || r.status === 403) {
      const t = await r.text();
      // a real request problem (not authentication) — no point trying other auth styles
      if (r.status === 400 && !/API key|credential|auth/i.test(t)) return { r, text: t, style: i };
      last = { r, text: t, style: i };
      continue;
    }
    goodStyle = i;
    return { r, text: await r.text(), style: i };
  }
  return last;
}

async function isAdmin(token) {
  if (!token) return false;
  const r = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  if (!r.ok) return false;
  return (await r.json()) === true;
}

function parseJson(text) {
  try { return JSON.parse(text); } catch {}
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) { try { return JSON.parse(m[1]); } catch {} }
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch {} }
  return null;
}
const short = t => String(t || "").replace(/\s+/g, " ").slice(0, 300);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "method", error: "POST only" });
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!(await isAdmin(token))) return res.status(401).json({ code: "not_admin", error: "Admin only" });
  if (!geminiKey()) return res.status(500).json({ code: "no_key", error: "GEMINI_API_KEY is not set" });

  const { prompt, images } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 30000) {
    return res.status(400).json({ code: "bad_request", error: "Missing prompt" });
  }
  const parts = [{ text: prompt }];
  for (const img of (Array.isArray(images) ? images : []).slice(0, 3)) {
    const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(String(img));
    if (m) parts.push({ inline_data: { mime_type: m[1], data: m[2] } });
  }
  const body = { contents: [{ role: "user", parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.9 } };

  let lastErr = "";
  for (const model of MODELS) {
    const r = await callGemini(`models/${encodeURIComponent(model)}:generateContent`, body);
    if (!r) break;
    if (r.r.status === 404) { lastErr = `model ${model} not found`; continue; }
    if (r.r.status === 429) return res.status(429).json({ code: "rate_limited", error: "Gemini rate limit" });
    let data = {};
    try { data = JSON.parse(r.text); } catch {}
    if (!r.r.ok) {
      const msg = data?.error?.message || short(r.text);
      console.error("Gemini error", r.r.status, model, msg);
      if (r.r.status === 401 || r.r.status === 403) return res.status(502).json({ code: "bad_key", error: msg });
      return res.status(502).json({ code: "upstream_error", error: msg });
    }
    const cand = data?.candidates?.[0];
    if (!cand || cand.finishReason === "SAFETY") return res.status(422).json({ code: "refused", error: "No answer" });
    const text = (cand.content?.parts || []).map(p => p.text || "").join("");
    const result = parseJson(text);
    if (!result) return res.status(502).json({ code: "invalid_json", error: "Could not read the answer" });
    return res.status(200).json({ result, model });
  }
  console.error("Gemini: no model available", lastErr);
  return res.status(502).json({ code: "upstream_error", error: lastErr || "No Gemini model available" });
}

export const config = { maxDuration: 60 };
