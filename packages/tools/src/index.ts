export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ExecutionEnvironment = 'desktop' | 'cloud' | 'browser';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  requiredPermission: number;
  integration: string;
  executionEnvironment: ExecutionEnvironment;
}

export const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  'filesystem.read': {
    id: 'filesystem.read',
    name: 'Read File',
    description: 'Reads contents of an authorized file in user workspace.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
    outputSchema: { type: 'object', properties: { content: { type: 'string' } } },
    riskLevel: 'low',
    requiresApproval: false,
    requiredPermission: 1,
    integration: 'filesystem',
    executionEnvironment: 'desktop'
  },
  'filesystem.patch': {
    id: 'filesystem.patch',
    name: 'Apply File Patch',
    description: 'Applies a unified diff patch to a file in user workspace.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' }, patch: { type: 'string' } }, required: ['path', 'patch'] },
    outputSchema: { type: 'object', properties: { success: { type: 'boolean' } } },
    riskLevel: 'medium',
    requiresApproval: true,
    requiredPermission: 2,
    integration: 'filesystem',
    executionEnvironment: 'desktop'
  },
  'terminal.run': {
    id: 'terminal.run',
    name: 'Run Terminal Command',
    description: 'Executes a command via CommandPolicyEngine with sandboxing.',
    inputSchema: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] },
    outputSchema: { type: 'object', properties: { stdout: { type: 'string' }, exitCode: { type: 'number' } } },
    riskLevel: 'high',
    requiresApproval: true,
    requiredPermission: 2,
    integration: 'terminal',
    executionEnvironment: 'desktop'
  },
  'windows.openSettings': {
    id: 'windows.openSettings',
    name: 'Open Windows Settings',
    description: 'Opens official Windows Settings URI (e.g. ms-settings:personalization-colors).',
    inputSchema: { type: 'object', properties: { uri: { type: 'string' } }, required: ['uri'] },
    outputSchema: { type: 'object', properties: { success: { type: 'boolean' } } },
    riskLevel: 'low',
    requiresApproval: false,
    requiredPermission: 1,
    integration: 'windows',
    executionEnvironment: 'desktop'
  },
  'screen.capture': {
    id: 'screen.capture',
    name: 'Capture Screen Context',
    description: 'Captures targeted window context when Assist Mode is enabled.',
    inputSchema: { type: 'object', properties: { targetWindow: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { imageBase64: { type: 'string' } } },
    riskLevel: 'low',
    requiresApproval: false,
    requiredPermission: 1,
    integration: 'screen',
    executionEnvironment: 'desktop'
  },
  'vscode.getDiagnostics': {
    id: 'vscode.getDiagnostics',
    name: 'Get VS Code Diagnostics',
    description: 'Queries active VS Code language server for compiler/linter diagnostics.',
    inputSchema: { type: 'object', properties: { file: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { diagnostics: { type: 'array' } } },
    riskLevel: 'low',
    requiresApproval: false,
    requiredPermission: 1,
    integration: 'vscode',
    executionEnvironment: 'desktop'
  },
  'gmail.send': {
    id: 'gmail.send',
    name: 'Send Gmail Message',
    description: 'Dispatches an email on user behalf via official Gmail API after approval.',
    inputSchema: { type: 'object', properties: { to: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' } }, required: ['to', 'subject', 'body'] },
    outputSchema: { type: 'object', properties: { messageId: { type: 'string' } } },
    riskLevel: 'high',
    requiresApproval: true,
    requiredPermission: 2,
    integration: 'gmail',
    executionEnvironment: 'cloud'
  },
  'calendar.create': {
    id: 'calendar.create',
    name: 'Create Calendar Event',
    description: 'Creates a Google Calendar event with attendees after confirmation.',
    inputSchema: { type: 'object', properties: { title: { type: 'string' }, startTime: { type: 'string' }, attendees: { type: 'array' } }, required: ['title', 'startTime'] },
    outputSchema: { type: 'object', properties: { eventId: { type: 'string' }, htmlLink: { type: 'string' } } },
    riskLevel: 'medium',
    requiresApproval: true,
    requiredPermission: 2,
    integration: 'calendar',
    executionEnvironment: 'cloud'
  },
  'meeting.join': {
    id: 'meeting.join',
    name: 'Join Delegated Meeting',
    description: 'Joins a meeting when explicit delegation is active and identifies as AI assistant.',
    inputSchema: { type: 'object', properties: { meetingUrl: { type: 'string' }, platform: { type: 'string' } }, required: ['meetingUrl'] },
    outputSchema: { type: 'object', properties: { sessionActive: { type: 'boolean' } } },
    riskLevel: 'high',
    requiresApproval: true,
    requiredPermission: 2,
    integration: 'meeting',
    executionEnvironment: 'desktop'
  },
  'memory.save': {
    id: 'memory.save',
    name: 'Save Concept to Memory Vault',
    description: 'Commits user-defined concepts, contacts, and preferences to persistent vault.',
    inputSchema: { type: 'object', properties: { key: { type: 'string' }, value: { type: 'any' }, category: { type: 'string' } }, required: ['key', 'value'] },
    outputSchema: { type: 'object', properties: { recordId: { type: 'string' } } },
    riskLevel: 'low',
    requiresApproval: false,
    requiredPermission: 1,
    integration: 'memory',
    executionEnvironment: 'desktop'
  }
};
