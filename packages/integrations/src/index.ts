export interface IntegrationPlugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'google' | 'microsoft' | 'communication' | 'development' | 'productivity';
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  getStatus(): Promise<'connected' | 'disconnected' | 'configuration_required' | 'error'>;
  getTools(): string[];
  permissions(): string[];
}

export interface EmailDraft {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  inReplyTo?: string;
  attachments?: Array<{ filename: string; contentBase64: string }>;
}

export interface CalendarEventPayload {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  attendees?: string[];
  platform?: 'google_meet' | 'zoom' | 'teams';
  meetingLink?: string;
}

export interface WhatsAppMessagePayload {
  toPhoneNumber: string;
  message: string;
  templateName?: string;
  templateParameters?: Record<string, string>;
}
