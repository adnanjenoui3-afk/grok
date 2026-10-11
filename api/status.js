// api/status.js — Vercel serverless function
export default async function handler(req, res) {
  const API_KEY = process.env.APIMODELS_KEY;
  if (!API_KEY) return res.status(500).json({ error: "Falta la variable APIMODELS_KEY en Vercel" });

  const { id } = req.query;
  if (!id || !/^[\w.:-]{1,128}$/.test(id)) return res.status(400).json({ error: "id inválido" });

  try {
    const r = await fetch(`https://api.apimodels.app/v1/video/generations/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const t = await r.text();
    try { return res.status(r.status).json(JSON.parse(t)); }
    catch { return res.status(r.status).json({ error: t.slice(0, 400) }); }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
