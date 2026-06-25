// CeylonTrails — Groq API Proxy (free, no card needed)
import express from "express";
import cors    from "cors";
import fetch   from "node-fetch";
import dotenv  from "dotenv";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;
const KEY  = process.env.GROQ_API_KEY;

if (!KEY) {
  console.error("❌  GROQ_API_KEY not set in .env file");
  console.error("    Get one free at: https://console.groq.com");
  process.exit(1);
}

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/generate", async (req, res) => {
  const { prompt, temperature = 0.9 } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const model = "llama-3.3-70b-versatile";
    console.log(`→ Sending to Groq model: ${model}`);

    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: 8000,
        messages: [
          {
            role: "system",
            content: "You are an expert Sri Lanka travel planner. Always respond with valid raw JSON only — no markdown, no backticks, no text before or after the JSON object.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error("Groq error:", JSON.stringify(data, null, 2));
      return res.status(upstream.status).json({ error: data?.error?.message || "Groq error" });
    }

    const text = data?.choices?.[0]?.message?.content || "";
    if (!text) return res.status(500).json({ error: "Empty response from Groq" });

    console.log(`✓ Groq responded (${text.length} chars)`);
    res.json({ text });

  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅  CeylonTrails (Groq) proxy running on http://localhost:${PORT}`);
  console.log(`    Key: ${KEY.slice(0, 8)}...${KEY.slice(-4)}`);
  console.log(`    Model: llama-3.3-70b-versatile (free)`);
});
