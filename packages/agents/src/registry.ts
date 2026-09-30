export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  intent: string;
  supportedTools: string[];
  defaultModel: string;
  permissionLevel: number;
}

export const AGENT_REGISTRY: Record<string, AgentMetadata> = {
  os_agent: {
    id: 'os_agent',
    name: 'OS Agent',
    description: 'Automates Windows settings, application launching, volume, themes, and mouse/keyboard navigation.',
    intent: 'OS_NAV',
    supportedTools: ['windows.openSettings', 'windows.launchApplication', 'windows.windowList', 'terminal.run'],
    defaultModel: 'fast',
    permissionLevel: 2
  },
  coding_agent: {
    id: 'coding_agent',
    name: 'Coding Agent',
    description: 'Inspects workspaces, parses VS Code diagnostics, debugs errors, produces unified diffs, and verifies builds.',
    intent: 'CODE_AGENT',
    supportedTools: ['vscode.openFile', 'vscode.applyPatch', 'vscode.getDiagnostics', 'filesystem.patch', 'terminal.run'],
    defaultModel: 'coding',
    permissionLevel: 2
  },
  email_agent: {
    id: 'email_agent',
    name: 'Email Agent',
    description: 'Searches, reads, drafts, and sends emails via official Gmail and Outlook APIs with user authorization.',
    intent: 'EMAIL_AGENT',
    supportedTools: ['gmail.search', 'gmail.read', 'gmail.createDraft', 'gmail.send', 'gmail.reply'],
    defaultModel: 'general',
    permissionLevel: 2
  },
  calendar_agent: {
    id: 'calendar_agent',
    name: 'Calendar Agent',
    description: 'Manages schedules, checks time conflicts, prepares events, and sends invitations via Google Calendar.',
    intent: 'CALENDAR_AGENT',
    supportedTools: ['calendar.search', 'calendar.create', 'calendar.update', 'calendar.delete'],
    defaultModel: 'general',
    permissionLevel: 2
  },
  meeting_agent: {
    id: 'meeting_agent',
    name: 'Meeting Agent',
    description: 'Watches scheduled calls, joins when explicitly delegated, captures audio with consent, and generates action items.',
    intent: 'MEETING_AGENT',
    supportedTools: ['meeting.join', 'meeting.leave', 'meeting.transcribe', 'meeting.summarize'],
    defaultModel: 'reasoning',
    permissionLevel: 2
  },
  browser_agent: {
    id: 'browser_agent',
    name: 'Browser Agent',
    description: 'Controls isolated Playwright browser instances for research, form filling, and web data extraction.',
    intent: 'BROWSER_AGENT',
    supportedTools: ['browser.open', 'browser.click', 'browser.type', 'browser.extract'],
    defaultModel: 'general',
    permissionLevel: 2
  },
  research_agent: {
    id: 'research_agent',
    name: 'Research Agent',
    description: 'Performs multi-source research across the web, verifies sources, and synthesizes structured reports.',
    intent: 'RESEARCH_AGENT',
    supportedTools: ['browser.extract', 'memory.search', 'filesystem.write'],
    defaultModel: 'reasoning',
    permissionLevel: 1
  },
  document_agent: {
    id: 'document_agent',
    name: 'Document Agent',
    description: 'Processes PDFs, DOCX, TXT, CSV, and markdown files for summarization, OCR, and table extraction.',
    intent: 'DOCUMENT_AGENT',
    supportedTools: ['filesystem.read', 'filesystem.write', 'memory.save'],
    defaultModel: 'reasoning',
    permissionLevel: 1
  },
  memory_agent: {
    id: 'memory_agent',
    name: 'Memory Agent',
    description: 'Retrieves, updates, and commits personal user concepts (e.g. project teams, contacts, preferences).',
    intent: 'MEMORY_AGENT',
    supportedTools: ['memory.search', 'memory.save', 'memory.update'],
    defaultModel: 'fast',
    permissionLevel: 1
  },
  communication_agent: {
    id: 'communication_agent',
    name: 'Communication Agent',
    description: 'Handles WhatsApp Business APIs, exports analysis, Slack, and user notification dispatches.',
    intent: 'COMMUNICATION_AGENT',
    supportedTools: ['whatsapp.send', 'whatsapp.parseExport', 'notification.create'],
    defaultModel: 'general',
    permissionLevel: 2
  },
  file_agent: {
    id: 'file_agent',
    name: 'File Agent',
    description: 'Manages files in authorized user project workspaces with strict boundary protection.',
    intent: 'FILE_AGENT',
    supportedTools: ['filesystem.read', 'filesystem.write', 'filesystem.search'],
    defaultModel: 'fast',
    permissionLevel: 2
  },
  general_agent: {
    id: 'general_agent',
    name: 'General Agent',
    description: 'Handles conversational reasoning, planning, brainstorming, and multi-agent coordination.',
    intent: 'GENERAL_AGENT',
    supportedTools: ['memory.search'],
    defaultModel: 'general',
    permissionLevel: 0
  }
};
