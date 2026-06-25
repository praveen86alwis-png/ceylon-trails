// Run this to see which models are available on your Gemini account
// Usage: node check-models.js YOUR_API_KEY

import fetch from "node-fetch";

const KEY = process.argv[2];
if (!KEY) { console.error("Usage: node check-models.js YOUR_API_KEY"); process.exit(1); }

const res  = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${KEY}`);
const data = await res.json();

if (data.error) { console.error("Error:", data.error.message); process.exit(1); }

console.log("\n✅ Available models that support generateContent:\n");
data.models
  .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
  .forEach(m => console.log(" •", m.name, "-", m.displayName));
