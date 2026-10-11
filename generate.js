// api/generate.js — Vercel serverless function
// La API key va en Vercel: Settings → Environment Variables → APIMODELS_KEY
const ENDPOINT = "https://api.apimodels.app/v1/video/generations";
const MODELS = ["veo-3.1-fast-hd", "grok-video-3", "seedance-2-fast"];

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Usa POST" });

  const API_KEY = process.env.APIMODELS_KEY;
  if (!API_KEY) return res.status(500).json({ error: "Falta la variable APIMODELS_KEY en Vercel" });

  try {
    const { prompt, image, model = MODELS[0], duration = 5 } = req.body || {};
    if (!prompt || !String(prompt).trim()) return res.status(400).json({ error: "Escribe un prompt" });
    if (!MODELS.includes(model)) return res.status(400).json({ error: "Modelo no permitido" });

    const body = {
      model,
      prompt: String(prompt).slice(0, 2000),
      duration: Math.min(Math.max(parseInt(duration) || 5, 5), 10),
      resolution: "720p",
    };
    if (image) {
      body.image_url = image;
      body.reference_image_urls = [image];
    }

    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const txt = await r.text();
    let data;
    try { data = JSON.parse(txt); }
    catch { return res.status(r.status || 502).json({ error: `La API no devolvió JSON: ${txt.slice(0, 300)}` }); }

    if (!r.ok) {
      const msg = typeof data.error === "string" ? data.error : data.error?.message || data.message || JSON.stringify(data);
      return res.status(r.status).json({ error: msg });
    }
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
