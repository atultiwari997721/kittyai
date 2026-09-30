export type IntentType = 
  | 'OS_NAV' 
  | 'CODE_AGENT' 
  | 'MEETING_AGENT' 
  | 'PLUGIN_AGENT' 
  | 'GENERAL_CHAT';

export type ModelProvider = 
  | 'ollama' 
  | 'gemini' 
  | 'openai' 
  | 'groq' 
  | 'anthropic' 
  | 'openrouter';

export interface ModelInfo {
  id: string;
  name: string;
  provider: ModelProvider;
  isLocal: boolean;
  contextWindow?: number;
  supportsVision?: boolean;
  supportsAudio?: boolean;
  description?: string;
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AgentTask {
  id: string;
  userId?: string;
  intent: IntentType;
  prompt: string;
  status: TaskStatus;
  result?: Record<string, unknown>;
  logs: TaskLogItem[];
  modelUsed?: string;
  executionDurationMs?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskLogItem {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  metadata?: Record<string, unknown>;
}

export interface AnalysisResult {
  intent: IntentType;
  confidence: number;
  reasoning: string;
  targetAgent: string;
  actionPlan: string[];
  extractedEntities: {
    app?: string;
    setting?: string;
    filePath?: string;
    meetingUrl?: string;
    recipient?: string;
    date?: string;
    query?: string;
  };
  recommendedModel?: string;
}

export type StreamChunkType = 
  | 'token' 
  | 'thought' 
  | 'status' 
  | 'tool_start' 
  | 'tool_end' 
  | 'action' 
  | 'error' 
  | 'done';

export interface StreamChunk {
  taskId: string;
  type: StreamChunkType;
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export type MemoryCategory = 'entity' | 'contact' | 'preference' | 'project' | 'rule' | 'custom_fact';

export interface MemoryRecord {
  key: string;
  displayKey?: string;
  value: any;
  category: MemoryCategory;
  description?: string;
  source?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface ChatResponse {
  taskId: string;
  needsClarification: boolean;
  clarificationQuestion?: string;
  entityToLearn?: string;
  reasoning?: string;
  status: 'completed' | 'waiting_user_clarification' | 'failed';
  summary?: string;
  executionLog?: string[];
  learnedMemory?: {
    key: string;
    value: any;
    notice?: string;
  };
  artifacts?: Record<string, any>;
}

