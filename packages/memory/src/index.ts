export type MemoryType = 
  | 'conversation'
  | 'personal'
  | 'project'
  | 'relationship'
  | 'task'
  | 'preference'
  | 'integration';

export type PrivacyLevel = 'local_only' | 'cloud_synced' | 'encrypted';

export interface MemoryRecord {
  id: string;
  userId?: string;
  type: MemoryType;
  key: string;
  content: Record<string, any> | string;
  source: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  privacyLevel: PrivacyLevel;
}

export interface MemoryQuery {
  query: string;
  type?: MemoryType;
  limit?: number;
  minConfidence?: number;
}
