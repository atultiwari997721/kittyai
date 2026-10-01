/**
 * KritiAI - Unified Multi-Model AI Provider Abstraction
 * Supports: Groq, Gemini, OpenAI, NVIDIA NIM, Ollama (Local), Free Public Gateway Fallback
 */

export const KNOWN_MODELS = {
  'groq': [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Versatile)', speed: '300+ tok/s', context: '128k', capabilities: ['chat', 'tools', 'code'] },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B', speed: '280+ tok/s', context: '128k', capabilities: ['chat', 'reasoning', 'code'] },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', speed: '500+ tok/s', context: '128k', capabilities: ['chat', 'tools', 'fast'] }
  ],
  'gemini': [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', speed: 'Very Fast', context: '1M', capabilities: ['chat', 'vision', 'tools', 'code'] },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', speed: 'Deep Reasoning', context: '2M', capabilities: ['chat', 'vision', 'reasoning', 'tools'] }
  ],
  'openai': [
    { id: 'gpt-4o', name: 'OpenAI GPT-4o', speed: 'Fast', context: '128k', capabilities: ['chat', 'vision', 'tools', 'code'] },
    { id: 'gpt-4o-mini', name: 'OpenAI GPT-4o Mini', speed: 'Very Fast', context: '128k', capabilities: ['chat', 'tools', 'fast'] }
  ],
  'nvidia': [
    { id: 'meta/llama-3.3-70b-instruct', name: 'NVIDIA NIM Llama 3.3 70B', speed: 'Fast', context: '128k', capabilities: ['chat', 'code'] },
    { id: 'deepseek-ai/deepseek-r1', name: 'NVIDIA NIM DeepSeek R1', speed: 'High Precision', context: '64k', capabilities: ['chat', 'reasoning'] }
  ],
  'ollama': [
    { id: 'llama3.2', name: 'Llama 3.2 (Local)', speed: 'Zero Latency', context: '128k', capabilities: ['chat', 'offline', 'privacy'] },
    { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder (Local)', speed: 'Local GPU', context: '32k', capabilities: ['chat', 'code', 'offline'] },
    { id: 'deepseek-r1', name: 'DeepSeek R1 (Local)', speed: 'Local GPU', context: '32k', capabilities: ['chat', 'reasoning', 'offline'] }
  ],
  'free': [
    { id: 'openai-fast', name: 'KritiAI Public AI Gateway', speed: 'Fast', context: '8k', capabilities: ['chat', 'zero-config', 'free'] }
  ]
};

export class AIProviderService {
  constructor() {
    this.defaultGroqKey = 'gsk_TOMZuMkhgyOpPwXeUsqEWGdyb3FYGywpI8gaU9KNZ51iSfzHLGcYy';
  }

  cleanKey(key) {
    if (!key || typeof key !== 'string') return '';
    return key.trim().replace(/^["'`]|["'`]$/g, '').trim();
  }

  /**
   * Health check / connection test for any provider
   */
  async testProvider(provider, apiKey, localUrl = 'http://127.0.0.1:11434') {
    const start = performance.now();
    const clean = this.cleanKey(apiKey);

    if (provider === 'ollama') {
      try {
        const res = await fetch(`${localUrl}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(2000) });
        const latencyMs = Math.round(performance.now() - start);
        if (res.ok) {
          const data = await res.json();
          const models = (data.models || []).map(m => m.name);
          return {
            success: true,
            provider: 'ollama',
            latencyMs,
            models,
            message: `Ollama is running locally (${models.length} model${models.length === 1 ? '' : 's'} installed).`
          };
        }
      } catch (err) {
        return {
          success: false,
          provider: 'ollama',
          latencyMs: Math.round(performance.now() - start),
          message: 'Local Ollama is not running on 127.0.0.1:11434. Start Ollama to use offline models.'
        };
      }
    }

    if (!clean && provider !== 'free') {
      return { success: false, provider, message: 'API key is missing. Please configure an API key.' };
    }

    try {
      let testUrl = '';
      let headers = { 'Content-Type': 'application/json' };
      let body = {};

      if (provider === 'groq') {
        testUrl = 'https://api.groq.com/openai/v1/chat/completions';
        headers['Authorization'] = `Bearer ${clean}`;
        body = {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        };
      } else if (provider === 'gemini') {
        testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${clean}`;
        body = { contents: [{ parts: [{ text: 'Ping' }] }] };
      } else if (provider === 'openai') {
        testUrl = 'https://api.openai.com/v1/chat/completions';
        headers['Authorization'] = `Bearer ${clean}`;
        body = {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        };
      } else if (provider === 'nvidia') {
        testUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
        headers['Authorization'] = `Bearer ${clean}`;
        body = {
          model: 'meta/llama-3.3-70b-instruct',
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        };
      } else if (provider === 'grok') {
        testUrl = 'https://api.x.ai/v1/chat/completions';
        headers['Authorization'] = `Bearer ${clean}`;
        body = {
          model: 'grok-2-latest',
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        };
      }

      const res = await fetch(testUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000)
      });
      const latencyMs = Math.round(performance.now() - start);

      if (res.ok) {
        return {
          success: true,
          provider,
          latencyMs,
          message: `Connected successfully! Response time: ${latencyMs}ms.`
        };
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error?.message || errData.message || `HTTP ${res.status} error`;
        return {
          success: false,
          provider,
          latencyMs,
          message: `Connection failed: ${errMsg}`
        };
      }
    } catch (e) {
      return {
        success: false,
        provider,
        latencyMs: Math.round(performance.now() - start),
        message: `Network error: ${e.message}`
      };
    }
  }

  /**
   * Main completion caller with provider routing and zero-failure fallback
   */
  async callCompletion({ provider, model, apiKey, messages, tools = null, temperature = 0.3, maxTokens = 2048 }) {
    const clean = this.cleanKey(apiKey);

    // 1. If Local Ollama is requested
    if (provider === 'ollama') {
      try {
        const ollamaRes = await fetch('http://127.0.0.1:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model.replace('ollama:', '') || 'llama3.2',
            prompt: messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') + '\nASSISTANT: ',
            stream: false
          }),
          signal: AbortSignal.timeout(30000)
        });
        if (ollamaRes.ok) {
          const data = await ollamaRes.json();
          return {
            content: data.response || '',
            provider: 'ollama',
            model: model,
            toolCalls: []
          };
        }
      } catch (err) {
        console.warn('Ollama direct call failed:', err);
      }
    }

    // 2. Direct Cloud Provider Call
    const payload = {
      model: model || (provider === 'groq' ? 'llama-3.3-70b-versatile' : (provider === 'openai' ? 'gpt-4o' : 'gemini-2.0-flash')),
      messages,
      temperature,
      max_tokens: maxTokens
    };
    if (tools && tools.length > 0 && provider !== 'nvidia') {
      payload.tools = tools;
    }

    // Try primary provider
    if (clean) {
      try {
        const res = await this._callUpstream(provider, clean, payload);
        if (res && (res.content || res.toolCalls?.length > 0)) {
          return res;
        }
      } catch (e) {
        console.warn(`Provider ${provider} failed (${e.message}), attempting fallback...`);
      }
    }

    // 3. Try default Groq Key if different
    if (this.defaultGroqKey && clean !== this.defaultGroqKey) {
      try {
        const groqPayload = { ...payload, model: 'llama-3.3-70b-versatile' };
        const res = await this._callUpstream('groq', this.defaultGroqKey, groqPayload);
        if (res && res.content) return res;
      } catch (e) {
        console.warn('Default Groq fallback failed:', e);
      }
    }

    // 4. Guaranteed Free AI Gateway Fallback (Zero Config / Free)
    try {
      const freePayload = {
        model: 'openai-fast',
        messages,
        temperature,
        max_tokens: maxTokens
      };
      const freeRes = await fetch('https://text.pollinations.ai/openai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        body: JSON.stringify(freePayload),
        signal: AbortSignal.timeout(15000)
      });
      if (freeRes.ok) {
        const freeData = await freeRes.json();
        const choice = freeData.choices?.[0];
        return {
          content: choice?.message?.content || '',
          provider: 'free-gateway',
          model: 'openai-fast',
          toolCalls: choice?.message?.tool_calls || []
        };
      }
    } catch (freeErr) {
      console.warn('Free AI gateway fallback failed:', freeErr);
    }

    throw new Error('All AI providers and gateways failed. Please check network connection or verify API keys.');
  }

  async _callUpstream(provider, apiKey, payload) {
    let url = 'https://api.groq.com/openai/v1/chat/completions';
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'User-Agent': 'Mozilla/5.0'
    };

    if (provider === 'gemini') {
      const model = payload.model || 'gemini-1.5-flash';
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const geminiBody = {
        contents: payload.messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      };
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody) });
      if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { content: text, provider: 'gemini', model, toolCalls: [] };
    }

    if (provider === 'openai') {
      url = 'https://api.openai.com/v1/chat/completions';
    } else if (provider === 'nvidia') {
      url = 'https://integrate.api.nvidia.com/v1/chat/completions';
    } else if (provider === 'grok' || apiKey.startsWith('xai-')) {
      url = 'https://api.x.ai/v1/chat/completions';
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    return {
      content: choice?.message?.content || '',
      provider,
      model: payload.model,
      toolCalls: choice?.message?.tool_calls || []
    };
  }
}

export const aiProviderService = new AIProviderService();
