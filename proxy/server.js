// CeylonTrails — Groq + Google Places Proxy
import express from "express";
import cors    from "cors";
import fetch   from "node-fetch";
import dotenv  from "dotenv";

dotenv.config();

const app       = express();
const PORT      = process.env.PORT || 3001;
const GROQ_KEY  = process.env.GROQ_API_KEY;
const GKEY      = process.env.GOOGLE_PLACES_KEY;
const PEXELS_KEY= process.env.PEXELS_API_KEY;

if (!GROQ_KEY) { console.error("❌  GROQ_API_KEY not set"); process.exit(1); }
if (!GKEY)     { console.warn("⚠️   GOOGLE_PLACES_KEY not set — Places features disabled"); }
if (!PEXELS_KEY) { console.warn("⚠️   PEXELS_API_KEY not set — destination photos disabled"); }

app.use(cors({ origin: ["http://localhost:3000","http://localhost:5173","http://localhost:5174"] }));
app.use(express.json({ limit: "2mb" }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok:true, places: !!GKEY }));

// ── Groq itinerary generation ─────────────────────────────────────────────────
app.post("/api/generate", async (req, res) => {
  const { prompt, temperature = 0.9 } = req.body;
  if (!prompt) return res.status(400).json({ error:"Missing prompt" });
  try {
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model:"llama-3.3-70b-versatile", temperature, max_tokens:8000,
        messages:[
          { role:"system", content:"You are an expert Sri Lanka travel planner. Always respond with valid raw JSON only — no markdown, no backticks, no text before or after the JSON object." },
          { role:"user", content:prompt },
        ],
      }),
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: data?.error?.message||"Groq error" });
    const text = data?.choices?.[0]?.message?.content || "";
    if (!text) return res.status(500).json({ error:"Empty response from Groq" });
    console.log(`✓ Groq itinerary (${text.length} chars)`);
    res.json({ text });
  } catch(err) {
    console.error("Groq error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Google Places proxy ───────────────────────────────────────────────────────
app.get("/api/places/search", async (req, res) => {
  if (!GKEY) return res.status(503).json({ error:"no_key" });
  const { query, type } = req.query;
  if (!query) return res.status(400).json({ error:"Missing query" });
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GKEY}`;
    const r   = await fetch(url);
    const d   = await r.json();
    console.log(`✓ Places search: ${query} (${d.results?.length||0} results)`);
    res.json(d);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/places/details", async (req, res) => {
  if (!GKEY) return res.status(503).json({ error:"no_key" });
  const { place_id } = req.query;
  if (!place_id) return res.status(400).json({ error:"Missing place_id" });
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&fields=name,rating,formatted_phone_number,website,opening_hours,reviews,photos,formatted_address,price_level,user_ratings_total,geometry&key=${GKEY}`;
    const r   = await fetch(url);
    const d   = await r.json();
    res.json(d);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Nearby places (landmarks/attractions near a hotel or restaurant) ─────────
app.get("/api/places/nearby", async (req, res) => {
  if (!GKEY) return res.status(503).json({ error:"no_key" });
  const { lat, lng, type = "tourist_attraction", radius = 1500 } = req.query;
  if (!lat || !lng) return res.status(400).json({ error:"Missing lat/lng" });
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${encodeURIComponent(type)}&key=${GKEY}`;
    const r   = await fetch(url);
    const d   = await r.json();
    console.log(`✓ Nearby search: ${type} near ${lat},${lng} (${d.results?.length||0} results)`);
    res.json(d);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/places/photo", async (req, res) => {
  if (!GKEY) return res.status(503).json({ error:"no_key" });
  const { ref, maxwidth = 800 } = req.query;
  if (!ref) return res.status(400).json({ error:"Missing ref" });
  try {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${encodeURIComponent(ref)}&key=${GKEY}`;
    const r   = await fetch(url);
    // Google redirects to actual image — pipe it through
    res.set("Content-Type", r.headers.get("content-type")||"image/jpeg");
    res.set("Cache-Control", "public, max-age=86400");
    r.body.pipe(res);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Pexels image search (replaces dead source.unsplash.com) ─────────────────
// Simple in-memory cache to avoid re-hitting Pexels for the same query repeatedly
const pexelsCache = new Map();
app.get("/api/photos/search", async (req, res) => {
  if (!PEXELS_KEY) return res.status(503).json({ error:"no_key", photos:[] });
  const { query, count = 6 } = req.query;
  if (!query) return res.status(400).json({ error:"Missing query" });
  const cacheKey = `${query}::${count}`;
  if (pexelsCache.has(cacheKey)) return res.json(pexelsCache.get(cacheKey));
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;
    const r   = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
    const d   = await r.json();
    const photos = (d.photos||[]).map(p => ({
      id: p.id,
      url: p.src.large,
      url_small: p.src.medium,
      width: p.width, height: p.height,
      photographer: p.photographer,
      photographer_url: p.photographer_url,
    }));
    const result = { photos };
    pexelsCache.set(cacheKey, result);
    console.log(`✓ Pexels search: ${query} (${photos.length} results)`);
    res.json(result);
  } catch(err) {
    res.status(500).json({ error: err.message, photos:[] });
  }
});

app.listen(PORT, () => {
  console.log(`✅  CeylonTrails proxy running on http://localhost:${PORT}`);
  console.log(`    Groq: ${GROQ_KEY.slice(0,8)}...`);
  console.log(`    Google Places: ${GKEY ? GKEY.slice(0,8)+"..." : "NOT SET"}`);
});