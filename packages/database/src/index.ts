export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface DeviceRecord {
  id: string;
  userId: string;
  name: string;
  platform: 'windows' | 'mac' | 'linux' | 'mobile_ios' | 'mobile_android' | 'web';
  status: 'online' | 'offline';
  publicKey?: string;
  lastSeenAt: string;
  createdAt: string;
}

export interface TaskRecord {
  id: string;
  userId?: string;
  goal: string;
  agent: string;
  model: string;
  status: 'IDLE' | 'ANALYZING' | 'PLANNING' | 'WAITING_APPROVAL' | 'EXECUTING' | 'OBSERVING' | 'RETRYING' | 'VERIFYING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  steps: string[];
  approvalData?: Record<string, any>;
  result?: any;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingSummaryRecord {
  id: string;
  userId?: string;
  title: string;
  date: string;
  platform: string;
  executiveSummary: string;
  decisions: string[];
  actionItems: Array<{ owner: string; task: string; deadline?: string; completed: boolean }>;
  createdAt: string;
}
