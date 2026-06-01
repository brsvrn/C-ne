export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemPrompt } = req.body;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  // Validation
  if (!GEMINI_KEY) {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY environment variable not set' 
    });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ 
      error: 'Missing or invalid messages field' 
    });
  }

  if (!systemPrompt || typeof systemPrompt !== 'string') {
    return res.status(400).json({ 
      error: 'Missing or invalid systemPrompt field' 
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API Error:', response.status, err);
      return res.status(response.status).json({ 
        error: `API error: ${response.status}` 
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      console.warn('Empty response from Gemini API');
      return res.status(500).json({ 
        error: 'No response text generated' 
      });
    }

    return res.status(200).json({ text });
  } catch (err) {
    console.error('Chat API Error:', err.message);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
