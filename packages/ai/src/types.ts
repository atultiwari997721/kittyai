export interface ModelCapabilities {
  chat: boolean;
  streaming: boolean;
  vision: boolean;
  toolCalling: boolean;
  reasoning: boolean;
  coding: boolean;
  embeddings: boolean;
  maxContextTokens: number;
}

export type ModelBillingTier = 'Free Tier' | 'Paid' | 'Local' | 'Requires API Key' | 'Requires Billing' | 'Unknown';

export interface Model {
  id: string;
  name: string;
  provider: string;
  capabilities: ModelCapabilities;
  tier: ModelBillingTier;
  isLocal: boolean;
  description?: string;
}

export interface AIResponse {
  id: string;
  model: string;
  provider: string;
  content: string;
  toolCalls?: Array<{
    name: string;
    arguments: Record<string, any>;
  }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIChunk {
  delta: string;
  done: boolean;
}

export interface AIProvider {
  id: string;
  name: string;
  capabilities: ModelCapabilities;
  tier: ModelBillingTier;
  listModels(): Promise<Model[]>;
  chat(messages: Array<{ role: string; content: string }>, options?: Record<string, any>): Promise<AIResponse>;
  streamChat(messages: Array<{ role: string; content: string }>, options?: Record<string, any>): AsyncIterable<AIChunk>;
  generateStructuredOutput<T>(schema: any, prompt: string): Promise<T>;
  embed?(text: string): Promise<number[]>;
}
