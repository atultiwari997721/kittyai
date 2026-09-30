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

  try {
    const { provider, apiKey } = req.body || {};
    if (!apiKey) return res.status(400).json({ success: false, message: 'Missing API key' });

    const cleanKey = apiKey.trim().replace(/^["'`]|["'`]$/g, '').trim();

    // 1. xAI Grok (starts with xai- or explicit grok)
    if (provider === 'grok' || cleanKey.startsWith('xai-')) {
      const xRes = await fetch('https://api.x.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${cleanKey}` }
      });
      if (xRes.ok) {
        return res.json({ success: true, message: 'xAI Grok API Key Verified! Grok 2 Inference is Active.', provider: 'grok' });
      }
      const err = await xRes.json().catch(() => ({}));
      return res.status(400).json({ success: false, message: err.error?.message || 'Invalid xAI Grok API key.' });
    }

    // 2. Groq
    if (provider === 'groq' || cleanKey.startsWith('gsk_')) {
      const gRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${cleanKey}` }
      });
      if (gRes.ok) {
        return res.json({ success: true, message: 'Groq API Key Verified! Ultra-Fast LPUs Active.', provider: 'groq' });
      }
      // Check if it might be an xAI key
      try {
        const xRes = await fetch('https://api.x.ai/v1/models', {
          headers: { 'Authorization': `Bearer ${cleanKey}` }
        });
        if (xRes.ok) {
          return res.json({ success: true, message: 'Auto-detected valid xAI Grok API Key! Grok 2 is active.', provider: 'grok' });
        }
      } catch {}
      const err = await gRes.json().catch(() => ({}));
      return res.status(400).json({ success: false, message: err.error?.message || 'Invalid Groq API key.' });
    }

    // 3. OpenAI
    if (provider === 'openai') {
      const oRes = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${cleanKey}` }
      });
      if (oRes.ok) return res.json({ success: true, message: 'OpenAI API Key Verified!' });
      const err = await oRes.json().catch(() => ({}));
      return res.status(400).json({ success: false, message: err.error?.message || 'Invalid OpenAI API key.' });
    }

    // 4. Gemini
    if (provider === 'gemini') {
      const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
      if (gRes.ok) return res.json({ success: true, message: 'Gemini API Key Verified!' });
      const err = await gRes.json().catch(() => ({}));
      return res.status(400).json({ success: false, message: err.error?.message || 'Invalid Gemini API key.' });
    }

    // 5. NVIDIA
    if (provider === 'nvidia') {
      const nRes = await fetch('https://integrate.api.nvidia.com/v1/models', {
        headers: { 'Authorization': `Bearer ${cleanKey}` }
      });
      if (nRes.ok) return res.json({ success: true, message: 'NVIDIA NIM API Key Verified!' });
      const err = await nRes.json().catch(() => ({}));
      return res.status(400).json({ success: false, message: err.error?.message || 'Invalid NVIDIA NIM API key.' });
    }

    return res.status(400).json({ success: false, message: 'Unknown provider.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
