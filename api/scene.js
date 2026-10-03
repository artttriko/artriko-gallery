// Replaced by api/cutout.js (background removal + placement on the room photo).
export default function handler(req, res) {
  res.status(410).json({ code: "gone", error: "Use /api/cutout" });
}
