import { IntentType, StreamChunk, ModelInfo } from './agent.js';
import { ScreenAnalysis, OSCommand } from './os.js';
import { CodeFixProposal } from './coding.js';
import { Meeting } from './meeting.js';

export type ClientMessageType =
  | 'ping'
  | 'route_request'
  | 'start_assist_mode'
  | 'stop_assist_mode'
  | 'capture_screen'
  | 'execute_os_action'
  | 'analyze_code_error'
  | 'apply_code_patch'
  | 'delegate_meeting'
  | 'send_email'
  | 'send_whatsapp'
  | 'get_models'
  | 'set_active_model';

export interface ClientMessage<T = unknown> {
  id: string;
  type: ClientMessageType;
  payload: T;
  timestamp: string;
}

export type ServerMessageType =
  | 'pong'
  | 'intent_classified'
  | 'stream_chunk'
  | 'assist_observation'
  | 'screen_captured'
  | 'code_proposal_ready'
  | 'meeting_status_update'
  | 'plugin_event'
  | 'models_list'
  | 'task_complete'
  | 'error';

export interface ServerMessage<T = unknown> {
  id: string;
  type: ServerMessageType;
  payload: T;
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface IntentClassifiedPayload {
  taskId: string;
  intent: IntentType;
  confidence: number;
  reasoning: string;
  targetAgent: string;
  modelUsed: string;
}

export interface ScreenCapturedPayload {
  base64Png: string;
  width: number;
  height: number;
  activeWindowTitle: string;
}

export interface ModelsListPayload {
  models: ModelInfo[];
  activeModelId: string;
  localOllamaOnline: boolean;
}
