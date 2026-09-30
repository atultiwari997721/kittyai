import { AIProvider, Model, ModelCapabilities, AIResponse, AIChunk } from '../types';

export class OllamaProvider implements AIProvider {
  id = 'ollama';
  name = 'Ollama (Local)';
  tier = 'Local' as const;

  capabilities: ModelCapabilities = {
    chat: true,
    streaming: true,
    vision: false,
    toolCalling: true,
    reasoning: true,
    coding: true,
    embeddings: true,
    maxContextTokens: 32768
  };

  private baseUrl: string;
  private defaultModel: string;

  constructor(
    baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    defaultModel = process.env.OLLAMA_MODEL || 'llama3.2'
  ) {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  async isOnline(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/version`, { signal: AbortSignal.timeout(1200) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<Model[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        return (data.models || []).map((m: any) => ({
          id: m.name,
          name: m.name,
          provider: 'ollama',
          capabilities: this.capabilities,
          tier: 'Local' as const,
          isLocal: true,
          description: `Size: ${(m.size / 1e9).toFixed(1)} GB. Family: ${m.details?.family || 'local'}`
        }));
      }
    } catch {
      // offline fallback
    }
    return [
      {
        id: 'llama3.2',
        name: 'Llama 3.2',
        provider: 'ollama',
        capabilities: this.capabilities,
        tier: 'Local',
        isLocal: true,
        description: 'Meta Llama 3.2 local private model'
      },
      {
        id: 'deepseek-r1',
        name: 'DeepSeek R1',
        provider: 'ollama',
        capabilities: { ...this.capabilities, reasoning: true },
        tier: 'Local',
        isLocal: true,
        description: 'Local deep reasoning model'
      }
    ];
  }

  async chat(messages: Array<{ role: string; content: string }>, options: Record<string, any> = {}): Promise<AIResponse> {
    const model = options.model || this.defaultModel;
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false, ...options })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama local inference error (${res.status}): ${err}`);
    }
    const data = await res.json();
    return {
      id: 'ollama_' + Date.now(),
      model: model,
      provider: 'ollama',
      content: data.message?.content || ''
    };
  }

  async *streamChat(messages: Array<{ role: string; content: string }>, options: Record<string, any> = {}): AsyncIterable<AIChunk> {
    yield { delta: '', done: true };
  }

  async generateStructuredOutput<T>(schema: any, prompt: string): Promise<T> {
    const res = await this.chat([
      { role: 'user', content: `${prompt}\nRespond strictly with JSON matching: ${JSON.stringify(schema)}` }
    ], { format: 'json' });
    return JSON.parse(res.content);
  }
}
