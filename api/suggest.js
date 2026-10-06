// Title, summary and classification suggestions. Gemini first; when Gemini is limited or down,
// OpenAI is tried (if OPENAI_API_KEY is set). The site itself falls back to keyword-based
// suggestions when both are unavailable.
// POST: only the signed-in gallery admin may call it. The keys stay on the server.

const MODELS = [process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-lite-latest", "gemini-2.0-flash"].filter(Boolean);
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

async function tryGemini(prompt, images) {
  if (!geminiKey()) return { err: { status: 500, code: "no_key", error: "GEMINI_API_KEY is not set" } };
  const parts = [{ text: prompt }];
  for (const img of images) {
    const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(img);
    if (m) parts.push({ inline_data: { mime_type: m[1], data: m[2] } });
  }
  const body = { contents: [{ role: "user", parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.9 } };
  let lastErr = "";
  for (const model of MODELS) {
    const r = await callGemini(`models/${encodeURIComponent(model)}:generateContent`, body);
    if (!r) break;
    if (r.r.status === 404) { lastErr = `model ${model} not found`; continue; }
    // each model has its own quota: when one is limited, try the next one
    if (r.r.status === 429) { console.error("Gemini 429", model, short(r.text)); lastErr = "rate_limited"; continue; }
    let data = {};
    try { data = JSON.parse(r.text); } catch {}
    if (!r.r.ok) {
      const msg = data?.error?.message || short(r.text);
      console.error("Gemini error", r.r.status, model, msg);
      if (r.r.status === 401 || r.r.status === 403) return { err: { status: 502, code: "bad_key", error: msg } };
      return { err: { status: 502, code: "upstream_error", error: msg } };
    }
    const cand = data?.candidates?.[0];
    if (!cand || cand.finishReason === "SAFETY") return { err: { status: 422, code: "refused", error: "No answer" } };
    const text = (cand.content?.parts || []).map(p => p.text || "").join("");
    const result = parseJson(text);
    if (!result) return { err: { status: 502, code: "invalid_json", error: "Could not read the answer" } };
    return { result, model };
  }
  if (lastErr === "rate_limited") return { err: { status: 429, code: "rate_limited", error: "Gemini rate limit on all models" } };
  return { err: { status: 502, code: "upstream_error", error: lastErr || "No Gemini model available" } };
}

const OPENAI_MODELS = [process.env.OPENAI_TEXT_MODEL, "gpt-4.1-mini", "gpt-4o-mini"].filter(Boolean);
async function tryOpenAI(prompt, images) {
  const key = (process.env.OPENAI_API_KEY || "").trim();
  if (!key) return { err: { status: 500, code: "no_key", error: "OPENAI_API_KEY is not set" } };
  const content = [{ type: "text", text: prompt + "\n\nReturn only the JSON object." }];
  for (const img of images) if (/^data:image\/(jpeg|png|webp);base64,/.test(img)) content.push({ type: "image_url", image_url: { url: img, detail: "low" } });
  let last = null;
  for (const model of OPENAI_MODELS) {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "user", content }], response_format: { type: "json_object" }, temperature: 0.9 }),
    });
    const text = await r.text();
    let data = {};
    try { data = JSON.parse(text); } catch {}
    if (r.ok) {
      const result = parseJson(data?.choices?.[0]?.message?.content || "");
      if (!result) return { err: { status: 502, code: "invalid_json", error: "Could not read the answer" } };
      return { result, model };
    }
    const msg = data?.error?.message || short(text);
    console.error("OpenAI error", r.status, model, msg);
    last = { status: r.status, msg, type: data?.error?.code || data?.error?.type || "" };
    if (r.status === 404 || /model/i.test(last.type) && r.status === 400) continue;
    break;
  }
  if (last?.status === 401) return { err: { status: 502, code: "bad_key", error: last.msg } };
  if (/insufficient_quota|billing/i.test(last?.type + " " + last?.msg)) return { err: { status: 402, code: "needs_billing", error: last.msg } };
  if (last?.status === 429) return { err: { status: 429, code: "rate_limited", error: last.msg } };
  return { err: { status: 502, code: "upstream_error", error: last?.msg || "OpenAI unavailable" } };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "method", error: "POST only" });
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!(await isAdmin(token))) return res.status(401).json({ code: "not_admin", error: "Admin only" });

  const { prompt, images } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 30000) {
    return res.status(400).json({ code: "bad_request", error: "Missing prompt" });
  }
  const imgs = (Array.isArray(images) ? images : []).slice(0, 3).map(String);

  const g = await tryGemini(prompt, imgs);
  if (g.result) return res.status(200).json({ result: g.result, model: g.model, provider: "gemini" });
  const o = await tryOpenAI(prompt, imgs);
  if (o.result) return res.status(200).json({ result: o.result, model: o.model, provider: "openai", geminiError: g.err.code });
  // Both unavailable: report Gemini's reason (the site then offers keyword-based suggestions)
  return res.status(g.err.status).json({ code: g.err.code, error: g.err.error, openai: o.err.code });
}

export const config = { maxDuration: 60 };
