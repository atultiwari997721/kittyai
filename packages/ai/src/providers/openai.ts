import { AIProvider, Model, ModelCapabilities, AIResponse, AIChunk } from '../types';

export class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI';
  tier = 'Requires API Key' as const;

  capabilities: ModelCapabilities = {
    chat: true,
    streaming: true,
    vision: true,
    toolCalling: true,
    reasoning: true,
    coding: true,
    embeddings: true,
    maxContextTokens: 128000
  };

  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey = process.env.OPENAI_API_KEY || '', defaultModel = process.env.OPENAI_MODEL || 'gpt-4o') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  async listModels(): Promise<Model[]> {
    return [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        capabilities: this.capabilities,
        tier: 'Requires API Key',
        isLocal: false,
        description: 'Omni flagship model for reasoning, coding, and vision'
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai',
        capabilities: { ...this.capabilities, maxContextTokens: 128000 },
        tier: 'Requires API Key',
        isLocal: false,
        description: 'High-speed, cost-efficient model'
      }
    ];
  }

  async chat(messages: Array<{ role: string; content: string }>, options: Record<string, any> = {}): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API Key is required. Please configure OPENAI_API_KEY.');
    }
    const model = options.model || this.defaultModel;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ model, messages, ...options })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${err}`);
    }
    const data = await res.json();
    return {
      id: data.id,
      model: data.model,
      provider: 'openai',
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage
    };
  }

  async *streamChat(messages: Array<{ role: string; content: string }>, options: Record<string, any> = {}): AsyncIterable<AIChunk> {
    yield { delta: '', done: true };
  }

  async generateStructuredOutput<T>(schema: any, prompt: string): Promise<T> {
    const res = await this.chat([
      { role: 'system', content: `Respond strictly with JSON schema: ${JSON.stringify(schema)}` },
      { role: 'user', content: prompt }
    ], { response_format: { type: 'json_object' } });
    return JSON.parse(res.content);
  }
}
