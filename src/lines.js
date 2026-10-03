// Rotating one-liners: a different line on every visit, never the same one twice in a row.
// The admin edits the lists (Texts tab); the last saved lists are cached so the intro can show them instantly.
export const DEFAULT_INTRO = [
  "פסלי אספנות · צבועים ביד",
  "מודפס בתלת־ממד · נצבע ביד",
  "כל דמות · עבודת יד",
  "צבע · סבלנות · אופי",
  "גיבורים · שכבה אחרי שכבה",
  "אחד ויחיד · כמו שצריך",
].join("\n");
export const DEFAULT_STUDIO = [
  "כל פסל נצבע ביד. / שכבה אחרי שכבה.",
  "אין כאן פס ייצור. / יש סבלנות.",
  "הדמות מודפסת. / האופי נצבע ביד.",
  "רסס דק. / יד יציבה.",
  "כל צל מצויר. / כל ניצוץ במקום.",
  "אף פסל לא יוצא זהה. / וזה בכוונה.",
  "מכחול, אוויר וצבע. / והרבה לילות.",
  "מאחורי כל דמות / יש לילה של צבע.",
].join("\n");

const toList = s => String(s || "").split("\n").map(x => x.trim()).filter(Boolean);
const store = (k, v) => { try { v == null ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (e) {} };
const read = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const picked = {};

// Pick once per page load; avoid repeating the line shown on the previous visit.
export function pickLine(kind, text) {
  const list = toList(text);
  if (!list.length) return "";
  if (picked[kind] && list.includes(picked[kind])) return picked[kind];
  const last = read("artriko.last." + kind);
  let pool = list.length > 1 ? list.filter(x => x !== last) : list;
  const line = pool[Math.floor(Math.random() * pool.length)];
  picked[kind] = line; store("artriko.last." + kind, line);
  return line;
}
export function cacheLines(kind, text) { store("artriko.lines." + kind, String(text || "")); }
export function cachedLines(kind, fallback) { const v = read("artriko.lines." + kind); return v && v.trim() ? v : fallback; }
