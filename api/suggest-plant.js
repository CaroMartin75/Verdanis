// Vercel serverless function — proxya la API de Anthropic para no exponer la key en el navegador.
// Requiere la variable de entorno ANTHROPIC_API_KEY configurada en el proyecto de Vercel.

const SUGGESTION_SCHEMA = `{
  "description": "descripción corta (1-2 frases) en español",
  "floweringSeason": ["Primavera", "Verano"],
  "sunlight": "pleno sol | semisombra | sombra | luz indirecta",
  "waterDays": number,
  "heightMin": number (cm),
  "heightMax": number (cm),
  "diameterMin": number (cm),
  "diameterMax": number (cm),
  "leafShape": "acintada | lobulada | redondeada | compuesta | acicular | lanceolada",
  "habit": "columnar | esférico | rastrero | trepador | arbustivo | arborescente",
  "flowerColor": "#rrggbb",
  "foliageColor": "#rrggbb"
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name } = req.body || {};
  if (!name || !String(name).trim()) {
    res.status(400).json({ error: "Falta el nombre de la planta" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY no configurada en el servidor" });
    return;
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `Sos un asistente botánico para una app de jardinería en español (Argentina). Para la planta "${String(name).trim()}", devolvé ÚNICAMENTE un objeto JSON (sin texto adicional, sin markdown, sin explicaciones) con este formato:\n${SUGGESTION_SCHEMA}\nSi no reconocés la planta o no estás razonablemente seguro de algún dato, omití esa clave en vez de inventar un valor. No agregues claves fuera de esta lista.`,
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const detail = await anthropicRes.text();
      res.status(502).json({ error: "Error consultando la IA", detail });
      return;
    }

    const data = await anthropicRes.json();
    const text = data?.content?.[0]?.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    let suggestion;
    try {
      suggestion = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (parseErr) {
      res.status(502).json({ error: "La IA devolvió una respuesta no parseable" });
      return;
    }

    res.status(200).json(suggestion);
  } catch (err) {
    res.status(500).json({ error: err.message || "Error inesperado" });
  }
}
