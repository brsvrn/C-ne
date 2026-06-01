export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // CORS Yönetimi
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { messages, systemPrompt } = await req.json();
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  try {
    // URL'deki 'streamGenerateContent?alt=sse' kısmına dikkat, streaming'i başlatan yer burası.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          // Yarım kesilmeleri önleyen güvenlik filtresi ayarları:
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `API error: ${response.status}` }), { status: response.status });
    }

    // Gemini'den gelen akışı (stream) doğrudan frontend'e yönlendiriyoruz
    return new Response(response.body, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Chat API Error:', err.message);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
