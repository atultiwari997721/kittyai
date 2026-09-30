export type PluginType = 
  | 'gmail' 
  | 'whatsapp' 
  | 'google_calendar' 
  | 'outlook' 
  | 'vscode' 
  | 'system';

export type PluginConnectionStatus = 
  | 'connected' 
  | 'disconnected' 
  | 'connecting' 
  | 'error';

export interface PluginDefinition {
  id: PluginType;
  name: string;
  description: string;
  icon: string;
  category: 'communication' | 'productivity' | 'development' | 'system';
  authType: 'oauth' | 'app_password' | 'qr_code' | 'local_rpc';
  status: PluginConnectionStatus;
  lastSync?: string;
  accountIdentifier?: string;
}

export interface EmailSendRequest {
  to: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  cc?: string[];
  bcc?: string[];
}

export interface WhatsAppSendRequest {
  phoneNumber: string;
  message: string;
  mediaUrl?: string;
}

export interface CalendarEventRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
  meetingLink?: string;
}
