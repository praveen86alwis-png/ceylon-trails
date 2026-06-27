// Vercel serverless — Google Places proxy (search, details, photo)
export default async function handler(req, res) {
  const KEY = process.env.GOOGLE_PLACES_KEY;
  if (!KEY) return res.status(503).json({ error:"no_key" });

  const { action, query, place_id, ref, maxwidth = "800" } = req.query;

  try {
    let url, isImage = false;

    if (action === "search") {
      if (!query) return res.status(400).json({ error:"Missing query" });
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${KEY}`;
    } else if (action === "details") {
      if (!place_id) return res.status(400).json({ error:"Missing place_id" });
      url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&fields=name,rating,formatted_phone_number,website,opening_hours,reviews,photos,formatted_address,price_level,user_ratings_total&key=${KEY}`;
    } else if (action === "photo") {
      if (!ref) return res.status(400).json({ error:"Missing ref" });
      url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${encodeURIComponent(ref)}&key=${KEY}`;
      isImage = true;
    } else {
      return res.status(400).json({ error:"Invalid action. Use: search | details | photo" });
    }

    const upstream = await fetch(url);

    if (isImage) {
      const buf = await upstream.arrayBuffer();
      res.setHeader("Content-Type", upstream.headers.get("content-type") || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(Buffer.from(buf));
    } else {
      const data = await upstream.json();
      res.json(data);
    }
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}
