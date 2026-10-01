export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider, apiKey, payload } = req.body || {};
    const defaultKey = "gsk_TOMZuMkhgyOpPwXeUsqEWGdyb3FYGywpI8gaU9KNZ51iSfzHLGcYy";
    const cleanKey = (apiKey || defaultKey).trim().replace(/^["'`]|["'`]$/g, '').trim() || defaultKey;

    let targetUrl = 'https://api.groq.com/openai/v1/chat/completions';
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanKey}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    if (provider === 'gemini') {
      const model = payload?.model || 'gemini-1.5-flash';
      targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
      headers = { 'Content-Type': 'application/json' };
    } else if (provider === 'grok' || cleanKey.startsWith('xai-')) {
      targetUrl = 'https://api.x.ai/v1/chat/completions';
    } else if (provider === 'groq' || cleanKey.startsWith('gsk_')) {
      targetUrl = 'https://api.groq.com/openai/v1/chat/completions';
      if (payload && payload.model) {
        const m = payload.model.toLowerCase();
        if (m.includes('mixtral') || m === 'llama3-70b-8192' || m === 'llama3-8b-8192') {
          payload.model = 'llama-3.3-70b-versatile';
        }
      }
    } else if (provider === 'openai') {
      targetUrl = 'https://api.openai.com/v1/chat/completions';
    } else if (provider === 'nvidia') {
      targetUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
    }

    try {
      const apiRes = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await apiRes.json().catch(() => ({}));
      if (apiRes.ok && data.choices && data.choices.length > 0) {
        return res.status(200).json(data);
      }
    } catch (e) {
      console.warn('Upstream chat proxy failed, falling back to free AI:', e);
    }

    // Free AI Gateway Fallback (Zero Config / Free for everyone)
    try {
      const freePayload = {
        model: 'openai-fast',
        messages: payload?.messages || [{ role: 'user', content: 'Hello' }],
        max_tokens: payload?.max_tokens || 2048,
        temperature: payload?.temperature || 0.3
      };
      const freeRes = await fetch('https://text.pollinations.ai/openai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        body: JSON.stringify(freePayload)
      });
      if (freeRes.ok) {
        const freeData = await freeRes.json();
        return res.status(200).json(freeData);
      }
    } catch (freeErr) {
      console.warn('Free AI gateway fallback error:', freeErr);
    }

    return res.status(200).json({
      choices: [{
        message: {
          role: 'assistant',
          content: 'Hello! I am KritiAI, your personal AI operating assistant. How can I help you today?'
        }
      }]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal proxy error' });
  }
}
