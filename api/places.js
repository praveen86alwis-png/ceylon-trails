// Vercel serverless function — Google Places API proxy
export default async function handler(req, res) {
  // Set JSON header immediately so errors are always JSON
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  const KEY = process.env.GOOGLE_PLACES_KEY;
  if (!KEY) return res.status(200).json({ error:"no_key", results:[] });

  // Parse the URL path: /api/places/search, /api/places/details, /api/places/photo, /api/places/nearby
  const urlPath = req.url || "";
  const action = urlPath.includes("/search") ? "search"
               : urlPath.includes("/details") ? "details"
               : urlPath.includes("/photo") ? "photo"
               : urlPath.includes("/nearby") ? "nearby"
               : null;

  if (!action) return res.status(400).json({ error:"Invalid endpoint" });

  try {
    let upstream, url;

    if (action === "search") {
      const query = req.query.query;
      if (!query) return res.status(400).json({ error:"Missing query" });
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${KEY}`;
      upstream = await fetch(url);
      const data = await upstream.json();
      return res.status(200).json(data);
    }

    if (action === "details") {
      const place_id = req.query.place_id;
      if (!place_id) return res.status(400).json({ error:"Missing place_id" });
      url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&fields=name,rating,formatted_phone_number,website,opening_hours,reviews,photos,formatted_address,price_level,user_ratings_total,geometry&key=${KEY}`;
      upstream = await fetch(url);
      const data = await upstream.json();
      return res.status(200).json(data);
    }

    if (action === "nearby") {
      const { lat, lng, type = "tourist_attraction", radius = "1500" } = req.query;
      if (!lat || !lng) return res.status(400).json({ error:"Missing lat/lng" });
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${encodeURIComponent(type)}&key=${KEY}`;
      upstream = await fetch(url);
      const data = await upstream.json();
      return res.status(200).json(data);
    }

    if (action === "photo") {
      const ref = req.query.ref;
      const maxwidth = req.query.maxwidth || "800";
      if (!ref) return res.status(400).json({ error:"Missing ref" });
      url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${encodeURIComponent(ref)}&key=${KEY}`;
      upstream = await fetch(url);
      // Photo returns binary — pipe it through
      const buf = await upstream.arrayBuffer();
      res.setHeader("Content-Type", upstream.headers.get("content-type") || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(Buffer.from(buf));
    }

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}