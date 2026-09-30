import { AIProvider, Model, ModelCapabilities, AIResponse, AIChunk } from '../types';

export class NvidiaProvider implements AIProvider {
  id = 'nvidia';
  name = 'NVIDIA NIM';
  tier = 'Requires API Key' as const;

  capabilities: ModelCapabilities = {
    chat: true,
    streaming: true,
    vision: false,
    toolCalling: true,
    reasoning: true,
    coding: true,
    embeddings: false,
    maxContextTokens: 128000
  };

  private apiKey: string;
  private defaultModel: string;
  private baseUrl: string;

  constructor(
    apiKey = process.env.NVIDIA_API_KEY || '',
    defaultModel = process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct',
    baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1'
  ) {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
    this.baseUrl = baseUrl;
  }

  async listModels(): Promise<Model[]> {
    return [
      {
        id: 'meta/llama-3.1-70b-instruct',
        name: 'Llama 3.1 70B Instruct (NVIDIA NIM)',
        provider: 'nvidia',
        capabilities: this.capabilities,
        tier: 'Requires API Key',
        isLocal: false,
        description: 'Hosted on NVIDIA accelerated GPU cloud inference'
      }
    ];
  }

  async chat(messages: Array<{ role: string; content: string }>, options: Record<string, any> = {}): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('NVIDIA API Key is required. Please configure NVIDIA_API_KEY.');
    }
    const model = options.model || this.defaultModel;
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ model, messages, ...options })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`NVIDIA NIM API error (${res.status}): ${err}`);
    }
    const data = await res.json();
    return {
      id: data.id || 'nv_' + Date.now(),
      model: data.model || model,
      provider: 'nvidia',
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage
    };
  }

  async *streamChat(messages: Array<{ role: string; content: string }>, options: Record<string, any> = {}): AsyncIterable<AIChunk> {
    yield { delta: '', done: true };
  }

  async generateStructuredOutput<T>(schema: any, prompt: string): Promise<T> {
    const res = await this.chat([
      { role: 'user', content: `${prompt}\nRespond strictly with JSON schema: ${JSON.stringify(schema)}` }
    ], { response_format: { type: 'json_object' } });
    return JSON.parse(res.content);
  }
}
