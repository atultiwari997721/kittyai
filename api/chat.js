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
    if (!apiKey) {
      return res.status(400).json({ error: 'Missing API key' });
    }

    const cleanKey = apiKey.trim().replace(/^["'`]|["'`]$/g, '').trim();

    let targetUrl = 'https://api.groq.com/openai/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanKey}`
    };

    if (provider === 'grok' || cleanKey.startsWith('xai-')) {
      targetUrl = 'https://api.x.ai/v1/chat/completions';
    } else if (provider === 'groq' || cleanKey.startsWith('gsk_')) {
      targetUrl = 'https://api.groq.com/openai/v1/chat/completions';
    } else if (provider === 'openai') {
      targetUrl = 'https://api.openai.com/v1/chat/completions';
    } else if (provider === 'nvidia') {
      targetUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
    }

    const apiRes = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await apiRes.json().catch(() => ({}));
    return res.status(apiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal proxy error' });
  }
}
