// Vercel serverless function — Pexels image search proxy
// Replaces the now-dead source.unsplash.com which all destination/gallery
// images previously relied on.
export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const KEY = process.env.PEXELS_API_KEY;
  if (!KEY) return res.status(200).json({ error:"no_key", photos:[] });

  const { query, count = "6" } = req.query;
  if (!query) return res.status(400).json({ error:"Missing query", photos:[] });

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;
    const upstream = await fetch(url, { headers: { Authorization: KEY } });
    const data = await upstream.json();
    const photos = (data.photos||[]).map(p => ({
      id: p.id,
      url: p.src.large,
      url_small: p.src.medium,
      width: p.width, height: p.height,
      photographer: p.photographer,
      photographer_url: p.photographer_url,
    }));
    // Cache at the edge for a day — destination photos don't change often
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    return res.status(200).json({ photos });
  } catch(err) {
    return res.status(500).json({ error: err.message, photos:[] });
  }
}