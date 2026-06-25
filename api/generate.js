// Vercel serverless function — replaces proxy/server.js for production
// Vercel auto-detects files in /api folder as backend endpoints

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured" });
  }

  const { prompt, temperature = 0.9 } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
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
      console.error("Groq error:", data);
      return res.status(upstream.status).json({ error: data?.error?.message || "Groq error" });
    }

    const text = data?.choices?.[0]?.message?.content || "";
    if (!text) return res.status(500).json({ error: "Empty response from Groq" });

    return res.json({ text });

  } catch (err) {
    console.error("Handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
