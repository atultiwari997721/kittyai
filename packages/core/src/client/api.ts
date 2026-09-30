import { AgentTask, AnalysisResult, ModelInfo, MemoryRecord, ChatResponse } from '../types/agent.js';
import { OSCommand, ScreenAnalysis } from '../types/os.js';
import { CodeFixProposal, TerminalErrorAnalysis } from '../types/coding.js';
import { Meeting } from '../types/meeting.js';
import { EmailSendRequest, WhatsAppSendRequest, CalendarEventRequest } from '../types/plugin.js';


export class KittyApiClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://127.0.0.1:8000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error [${response.status}] ${endpoint}: ${errorText}`);
    }
    return response.json() as Promise<T>;
  }

  // Health and System
  async getHealth(): Promise<{ status: string; version: string; localOllama: boolean; activeModel: string }> {
    return this.request('/api/health');
  }

  async getModels(): Promise<{ models: ModelInfo[]; activeModel: string; localOllamaOnline: boolean }> {
    return this.request('/api/models');
  }

  async setActiveModel(modelId: string, provider?: string): Promise<{ success: boolean; activeModel: string }> {
    return this.request('/api/models/active', {
      method: 'POST',
      body: JSON.stringify({ modelId, provider }),
    });
  }

  // Master Analyzer & Router
  async routeRequest(prompt: string, context?: Record<string, unknown>): Promise<{
    taskId: string;
    analysis: AnalysisResult;
    immediateExecution?: Record<string, unknown>;
  }> {
    return this.request('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    });
  }

  // OS Agent
  async executeOSAction(action: OSCommand): Promise<{ success: boolean; message: string; output?: string }> {
    return this.request('/api/os/execute', {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  async toggleWindowsTheme(theme: 'dark' | 'light' | 'toggle'): Promise<{ success: boolean; newTheme: string }> {
    return this.request('/api/os/theme', {
      method: 'POST',
      body: JSON.stringify({ theme }),
    });
  }

  async captureScreen(targetApp?: string): Promise<{ base64Png: string; windowTitle: string }> {
    return this.request('/api/os/capture', {
      method: 'POST',
      body: JSON.stringify({ targetApp }),
    });
  }

  async toggleAssistMode(enable: boolean, intervalSec = 3): Promise<{ isMonitoring: boolean }> {
    return this.request('/api/os/assist', {
      method: 'POST',
      body: JSON.stringify({ enable, intervalSec }),
    });
  }

  // Coding Agent
  async analyzeTerminalError(rawError: string, workspacePath?: string): Promise<{
    analysis: TerminalErrorAnalysis;
    proposal?: CodeFixProposal;
  }> {
    return this.request('/api/coding/analyze-error', {
      method: 'POST',
      body: JSON.stringify({ rawError, workspacePath }),
    });
  }

  async applyCodePatch(proposalId: string, patches: Array<{ filePath: string; patchedContent: string }>): Promise<{
    success: boolean;
    modifiedFiles: string[];
    backupPaths: string[];
  }> {
    return this.request('/api/coding/apply-patch', {
      method: 'POST',
      body: JSON.stringify({ proposalId, patches }),
    });
  }

  // Meeting Delegate Agent
  async getMeetings(): Promise<Meeting[]> {
    return this.request('/api/meetings');
  }

  async delegateJoinMeeting(meetingId: string, joinUrl?: string, customName?: string): Promise<{
    taskId: string;
    status: string;
    message: string;
  }> {
    return this.request('/api/meetings/join-delegate', {
      method: 'POST',
      body: JSON.stringify({ meetingId, joinUrl, customName }),
    });
  }

  async stopMeetingDelegate(meetingId: string): Promise<{ success: boolean; summary: Record<string, unknown> }> {
    return this.request(`/api/meetings/${meetingId}/leave`, {
      method: 'POST',
    });
  }

  // Plugin Hub
  async sendEmail(request: EmailSendRequest): Promise<{ success: boolean; messageId: string }> {
    return this.request('/api/plugins/gmail/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async sendWhatsApp(request: WhatsAppSendRequest): Promise<{ success: boolean; status: string }> {
    return this.request('/api/plugins/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async createCalendarEvent(request: CalendarEventRequest): Promise<{ success: boolean; eventId: string }> {
    return this.request('/api/plugins/calendar/event', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Interactive Autonomous Chat & Memory
  async chat(prompt: string, context?: Record<string, unknown>): Promise<ChatResponse> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    });
  }

  async sendClarification(taskId: string, response: string): Promise<ChatResponse> {
    return this.request('/api/chat/clarify', {
      method: 'POST',
      body: JSON.stringify({ taskId, response }),
    });
  }

  async getMemories(): Promise<MemoryRecord[]> {
    return this.request('/api/memory');
  }

  async saveMemory(key: string, value: any, category = 'entity', description = ''): Promise<MemoryRecord> {
    return this.request('/api/memory', {
      method: 'POST',
      body: JSON.stringify({ key, value, category, description }),
    });
  }

  async deleteMemory(key: string): Promise<{ success: boolean }> {
    return this.request(`/api/memory/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  }
}

