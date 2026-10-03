// Title, summary and classification suggestions from Gemini.
// Only the signed-in gallery admin may call this. The Gemini key stays on the server.

const MODELS = [process.env.GEMINI_MODEL, "gemini-3.8-flash", "gemini-flash-latest"].filter(Boolean);

async function isAdmin(token) {
  if (!token) return false;
  const r = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: {
      apikey: process.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "method", error: "POST only" });
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!(await isAdmin(token))) return res.status(401).json({ code: "not_admin", error: "Admin only" });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ code: "no_key", error: "GEMINI_API_KEY is not set" });

  const { prompt, images } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 30000) {
    return res.status(400).json({ code: "bad_request", error: "Missing prompt" });
  }
  const parts = [{ text: prompt }];
  for (const img of (Array.isArray(images) ? images : []).slice(0, 3)) {
    const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(String(img));
    if (m) parts.push({ inline_data: { mime_type: m[1], data: m[2] } });
  }

  let lastErr = null;
  for (const model of MODELS) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.9 },
      }),
    });
    if (r.status === 404) { lastErr = { status: 404, model }; continue; } // model name not available, try the next one
    const data = await r.json().catch(() => ({}));
    if (r.status === 429) return res.status(429).json({ code: "rate_limited", error: "Gemini rate limit" });
    if (!r.ok) return res.status(502).json({ code: "upstream_error", error: data?.error?.message || `Gemini ${r.status}` });
    const cand = data?.candidates?.[0];
    if (!cand || cand.finishReason === "SAFETY") return res.status(422).json({ code: "refused", error: "No answer" });
    const text = (cand.content?.parts || []).map(p => p.text || "").join("");
    const result = parseJson(text);
    if (!result) return res.status(502).json({ code: "invalid_json", error: "Could not read the answer" });
    return res.status(200).json({ result, model });
  }
  return res.status(502).json({ code: "upstream_error", error: `No Gemini model available (${lastErr?.model})` });
}

export const config = { maxDuration: 60 };
