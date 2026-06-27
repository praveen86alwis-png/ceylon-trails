// Vercel serverless function — Google Places API proxy
// Avoids CORS issues by proxying Google Places requests server-side

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url param" });

  try {
    const decoded = decodeURIComponent(url);
    // Security: only allow Google Maps API requests
    if (!decoded.startsWith("https://maps.googleapis.com/")) {
      return res.status(403).json({ error: "Forbidden URL" });
    }
    const upstream = await fetch(decoded);
    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
