import { AIProvider, Model } from './types';

export type TaskType = 'simple' | 'coding' | 'reasoning' | 'vision' | 'offline' | 'general';
export type PrivacyMode = 'local-only' | 'balanced' | 'cloud' | 'custom';

export interface RouteSelectionCriteria {
  taskType: TaskType;
  privacyMode: PrivacyMode;
  userOverrideProvider?: string;
  userOverrideModel?: string;
  requiresVision?: boolean;
}

export class ModelRouter {
  private providers: Map<string, AIProvider> = new Map();

  registerProvider(provider: AIProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  listRegisteredProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Evaluates criteria and selects best model/provider
   */
  async selectModel(criteria: RouteSelectionCriteria): Promise<{ providerId: string; modelId: string; reason: string }> {
    // 1. User manual override
    if (criteria.userOverrideProvider && criteria.userOverrideModel) {
      return {
        providerId: criteria.userOverrideProvider,
        modelId: criteria.userOverrideModel,
        reason: 'User manual override'
      };
    }

    // 2. Local-only privacy mode
    if (criteria.privacyMode === 'local-only') {
      const ollama = this.providers.get('ollama');
      if (ollama) {
        return {
          providerId: 'ollama',
          modelId: 'llama3.2',
          reason: 'Enforced by Privacy Mode: LOCAL ONLY (All cloud inference disabled)'
        };
      }
    }

    // 3. Task specific routing
    switch (criteria.taskType) {
      case 'coding':
        return {
          providerId: 'gemini',
          modelId: 'gemini-2.0-flash',
          reason: 'Optimized for high-speed code synthesis and diff analysis'
        };
      case 'reasoning':
        return {
          providerId: 'nvidia',
          modelId: 'meta/llama-3.1-70b-instruct',
          reason: 'High-parameter multi-step reasoning via NVIDIA NIM'
        };
      case 'vision':
        return {
          providerId: 'gemini',
          modelId: 'gemini-2.0-flash',
          reason: 'Native multimodal OCR and screen analysis'
        };
      case 'offline':
        return {
          providerId: 'ollama',
          modelId: 'llama3.2',
          reason: 'Zero network connection; running locally on client GPU/CPU'
        };
      default:
        return {
          providerId: 'gemini',
          modelId: 'gemini-2.0-flash',
          reason: 'Standard low-latency general conversational inference'
        };
    }
  }
}

export const modelRouter = new ModelRouter();
