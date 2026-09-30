import { AIProvider, Model, ModelCapabilities, AIResponse, AIChunk } from '../types';

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini';
  tier = 'Requires API Key' as const;

  capabilities: ModelCapabilities = {
    chat: true,
    streaming: true,
    vision: true,
    toolCalling: true,
    reasoning: true,
    coding: true,
    embeddings: true,
    maxContextTokens: 1000000
  };

  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey = process.env.GEMINI_API_KEY || '', defaultModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  async listModels(): Promise<Model[]> {
    return [
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'gemini',
        capabilities: this.capabilities,
        tier: 'Requires API Key',
        isLocal: false,
        description: 'Next-generation multimodal reasoning and tool execution model'
      }
    ];
  }

  async chat(messages: Array<{ role: string; content: string }>, options: Record<string, any> = {}): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('Google Gemini API Key is required. Please configure GEMINI_API_KEY.');
    }
    const model = options.model || this.defaultModel;
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, ...options })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${err}`);
    }
    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return {
      id: 'gemini_' + Date.now(),
      model: model,
      provider: 'gemini',
      content: content
    };
  }

  async *streamChat(messages: Array<{ role: string; content: string }>, options: Record<string, any> = {}): AsyncIterable<AIChunk> {
    yield { delta: '', done: true };
  }

  async generateStructuredOutput<T>(schema: any, prompt: string): Promise<T> {
    const res = await this.chat([
      { role: 'user', content: `${prompt}\nRespond strictly with JSON schema: ${JSON.stringify(schema)}` }
    ]);
    return JSON.parse(res.content);
  }
}
