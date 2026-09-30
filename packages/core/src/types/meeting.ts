export type MeetingPlatform = 'google_meet' | 'zoom' | 'teams' | 'other';

export type MeetingStatus = 
  | 'scheduled' 
  | 'delegate_joining' 
  | 'in_progress' 
  | 'completed' 
  | 'failed';

export type DelegateStatus = 
  | 'idle' 
  | 'navigating' 
  | 'pre_call_config' 
  | 'waiting_admit' 
  | 'in_meeting' 
  | 'recording_audio' 
  | 'transcribing' 
  | 'left_call' 
  | 'error';

export interface ActionItem {
  id: string;
  meetingId?: string;
  userId?: string;
  title: string;
  assignee?: string;
  dueDate?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt?: string;
}

export interface MeetingTranscriptChunk {
  id: string;
  speaker?: string;
  text: string;
  timestamp: string;
  isAiDelegate?: boolean;
}

export interface Meeting {
  id: string;
  userId?: string;
  title: string;
  platform: MeetingPlatform;
  joinUrl: string;
  startTime: string;
  endTime?: string;
  status: MeetingStatus;
  delegateStatus: DelegateStatus;
  fullTranscript?: string;
  summary?: string;
  keyDecisions?: string[];
  actionItems?: ActionItem[];
  createdAt?: string;
  updatedAt?: string;
}
