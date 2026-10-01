/**
 * KritiAI - Real Tool System & Execution Engine
 * Provides OpenAI-standard tool definitions and executes real actions across:
 * - Local Windows Desktop Runtime (Port 9972 & Bilateral Remote Pairing)
 * - Filesystem & PowerShell Terminal
 * - Google Cloud APIs (Gmail, Calendar, Drive)
 * - Personal Memory Vault & Local RAG
 */

export const TOOL_SCHEMAS = [
  {
    type: 'function',
    function: {
      name: 'terminal_execute',
      description: 'Executes a command on the local Windows computer via PowerShell. Use to install packages, build projects, run tests, or inspect system state.',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'The exact PowerShell/CMD command to run (e.g. "npm test", "python app.py", "dir").' },
          cwd: { type: 'string', description: 'Optional working directory path.' },
          timeout: { type: 'number', description: 'Timeout in seconds (default 30).' }
        },
        required: ['command']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'filesystem_create_file',
      description: 'Creates or updates a file on disk with the specified code or text content.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative or absolute file path (e.g. "calculator.html", "src/app.py").' },
          content: { type: 'string', description: 'Complete content to write into the file.' }
        },
        required: ['path', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'filesystem_read_file',
      description: 'Reads the text content of a file from disk.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to read.' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'filesystem_list_dir',
      description: 'Lists files and folders in a workspace directory.',
      parameters: {
        type: 'object',
        properties: {
          subpath: { type: 'string', description: 'Subdirectory path to list (empty for root workspace).' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'filesystem_create_dir',
      description: 'Creates a folder/directory on disk.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Directory path to create.' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'filesystem_run_script',
      description: 'Executes a Python, Node.js, PowerShell, or Batch script in the workspace and returns its real output.',
      parameters: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to script file (e.g. "calculator.py").' },
          runtime: { type: 'string', enum: ['auto', 'python', 'node', 'powershell', 'cmd'], description: 'Runtime interpreter to use.' }
        },
        required: ['filePath']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'windows_set_theme',
      description: 'Changes Windows personalization theme between Dark Mode and Light Mode via system registry.',
      parameters: {
        type: 'object',
        properties: {
          theme: { type: 'string', enum: ['dark', 'light'], description: 'Target theme mode.' }
        },
        required: ['theme']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'windows_set_volume',
      description: 'Adjusts the master audio volume level of the Windows PC.',
      parameters: {
        type: 'object',
        properties: {
          level: { type: 'number', description: 'Volume percentage (0 to 100).' }
        },
        required: ['level']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'windows_launch_app',
      description: 'Launches a Windows desktop application (e.g. calculator, VS Code, Notepad, Windows Terminal, Edge, Chrome, File Explorer).',
      parameters: {
        type: 'object',
        properties: {
          appName: { type: 'string', description: 'Name of application to launch (e.g. "calculator", "vscode", "notepad").' }
        },
        required: ['appName']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'vscode_open_file',
      description: 'Opens a workspace file or directory in Visual Studio Code.',
      parameters: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'File or directory path to open in VS Code.' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'gmail_search',
      description: 'Searches user emails in Gmail via official Google API.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term or query (e.g. "from:professor", "subject:project").' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'gmail_send',
      description: 'Dispatches an email via official Gmail API. Requires Level 2 user approval before sending.',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient email address.' },
          subject: { type: 'string', description: 'Email subject line.' },
          body: { type: 'string', description: 'Email body text.' }
        },
        required: ['to', 'subject', 'body']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calendar_create_event',
      description: 'Creates a real event in Google Calendar with title, start time, end time, and attendees.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Event title.' },
          startTime: { type: 'string', description: 'Start time (ISO-8601 or natural date-time).' },
          endTime: { type: 'string', description: 'End time (ISO-8601 or natural date-time).' },
          attendees: { type: 'array', items: { type: 'string' }, description: 'List of attendee email addresses.' },
          description: { type: 'string', description: 'Event description.' }
        },
        required: ['title', 'startTime']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calendar_list_events',
      description: 'Lists upcoming Google Calendar events to check schedule or detect time conflicts.',
      parameters: {
        type: 'object',
        properties: {
          timeMin: { type: 'string', description: 'Earliest time boundary (ISO-8601).' },
          timeMax: { type: 'string', description: 'Latest time boundary (ISO-8601).' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'drive_search',
      description: 'Searches files stored in Google Drive.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term for file names or contents.' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'whatsapp_prepare_message',
      description: 'Prepares an official WhatsApp messaging link (wa.me) or sends via official WhatsApp API.',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: { type: 'string', description: 'Phone number with country code (e.g. +919876543210).' },
          message: { type: 'string', description: 'Text message to send.' }
        },
        required: ['phoneNumber', 'message']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'memory_save',
      description: 'Saves a persistent fact, entity, contact, or preference into the user\'s personal Memory Vault.',
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Concept or entity name (e.g. "Papa", "Team members", "Favorite IDE").' },
          value: { type: 'string', description: 'Details or values to remember.' },
          category: { type: 'string', enum: ['contacts', 'preferences', 'projects', 'facts'], description: 'Memory category.' }
        },
        required: ['key', 'value']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'rag_search',
      description: 'Performs semantic retrieval across indexed project files, documentation, or uploaded knowledge base files.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Question or search terms.' }
        },
        required: ['query']
      }
    }
  }
];

export class ToolService {
  constructor() {
    this.desktopUrl = 'http://127.0.0.1:9972';
  }

  async isDesktopOnline() {
    try {
      const res = await fetch(`${this.desktopUrl}/api/health`, { method: 'GET', signal: AbortSignal.timeout(1000) });
      const data = await res.json();
      return data.status === 'online';
    } catch {
      return false;
    }
  }

  async executeTool(toolName, args = {}) {
    const name = (toolName || '').toLowerCase().replace(/-/g, '_').trim();
    console.log(`[ToolService] Executing tool '${name}' with arguments:`, args);

    // 1. Local Desktop Tools (Filesystem, Terminal, Windows, VS Code, Ollama)
    const localTools = [
      'terminal_execute', 'filesystem_create_file', 'filesystem_read_file',
      'filesystem_list_dir', 'filesystem_create_dir', 'filesystem_run_script',
      'windows_set_theme', 'windows_set_volume', 'windows_launch_app',
      'vscode_open_file'
    ];

    if (localTools.includes(name)) {
      const online = await this.isDesktopOnline();
      if (!online) {
        // Check if device is paired via remote pairing channel
        const pairingSaved = localStorage.getItem('kritiai_pairing');
        let pairData = null;
        try { pairData = pairingSaved ? JSON.parse(pairingSaved) : null; } catch {}

        if (pairData?.paired && pairData.deviceToken) {
          // Send to remote device task queue via /api/pair
          try {
            const queueRes = await fetch('/api/pair', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'queue_command',
                deviceToken: pairData.deviceToken,
                command: {
                  tool: name,
                  args: args
                }
              })
            });
            const qData = await queueRes.json();
            return {
              success: true,
              remoteQueued: true,
              message: `Queued on remote paired Windows PC (${pairData.deviceName || 'PC'}). Waiting for desktop execution.`,
              taskId: qData.commandId
            };
          } catch (e) {
            console.warn('Failed to queue remote command:', e);
          }
        }

        return {
          success: false,
          waitingForDevice: true,
          tool: name,
          message: 'Your Windows PC is not connected. Launch KritiAI on your PC or enter your 6-digit pairing code to execute this on your machine.'
        };
      }

      // Execute on local desktop kernel directly
      try {
        const res = await fetch(`${this.desktopUrl}/api/tools/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool: name, args: args })
        });
        return await res.json();
      } catch (err) {
        return { success: false, error: `Local tool execution failed: ${err.message}` };
      }
    }

    // 2. Personal Memory Tools
    if (name === 'memory_save') {
      try {
        const key = (args.key || '').trim().toLowerCase();
        const value = args.value;
        const category = args.category || 'facts';
        const memories = JSON.parse(localStorage.getItem('kritiai_memories') || '[]');
        const filtered = memories.filter(m => m.key.toLowerCase() !== key);
        filtered.push({
          key,
          value,
          category,
          updated_at: new Date().toISOString()
        });
        localStorage.setItem('kritiai_memories', JSON.stringify(filtered));
        return { success: true, key, message: `Saved "${key}" to personal Memory Vault.` };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    if (name === 'memory_search') {
      try {
        const q = (args.query || '').toLowerCase();
        const memories = JSON.parse(localStorage.getItem('kritiai_memories') || '[]');
        const matches = memories.filter(m => 
          m.key.toLowerCase().includes(q) || 
          JSON.stringify(m.value).toLowerCase().includes(q)
        );
        return { success: true, matches };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // 3. WhatsApp Tool
    if (name === 'whatsapp_prepare_message') {
      const cleanPhone = (args.phoneNumber || '').replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(args.message || '');
      const link = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
      return {
        success: true,
        phoneNumber: args.phoneNumber,
        message: args.message,
        deepLink: link,
        action: 'open_whatsapp_chat',
        status: 'prepared'
      };
    }

    // 4. Google Cloud Services (Gmail, Calendar, Drive)
    if (name.startsWith('gmail_') || name.startsWith('calendar_') || name.startsWith('drive_')) {
      const googleToken = localStorage.getItem('google_access_token') || sessionStorage.getItem('google_access_token');
      if (!googleToken) {
        return {
          success: false,
          configurationRequired: true,
          service: 'google',
          actionRequired: 'CONNECT_GOOGLE',
          message: 'Google account is not connected yet. Connect your Google account in Settings ➔ Plugins to enable Gmail, Calendar, and Drive features.'
        };
      }

      // Execute via real Google API
      return await this._executeGoogleApi(name, args, googleToken);
    }

    // 5. RAG Search Tool
    if (name === 'rag_search') {
      const q = (args.query || '').toLowerCase();
      // Search local project knowledge
      const projectDocs = JSON.parse(localStorage.getItem('kritiai_rag_index') || '[]');
      const matches = projectDocs.filter(d => 
        (d.title && d.title.toLowerCase().includes(q)) || 
        (d.content && d.content.toLowerCase().includes(q))
      ).slice(0, 5);

      return {
        success: true,
        query: args.query,
        results: matches.map(m => ({
          title: m.title || 'Document',
          snippet: m.content?.substring(0, 300) || '',
          source: m.source || 'Local Knowledge Base'
        }))
      };
    }

    return { success: false, error: `Unhandled tool: ${toolName}` };
  }

  async _executeGoogleApi(toolName, args, token) {
    try {
      if (toolName === 'gmail_search') {
        const q = encodeURIComponent(args.query || '');
        const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Gmail API returned HTTP ${res.status}`);
        const data = await res.json();
        return { success: true, messagesFound: data.messages?.length || 0, messages: data.messages || [] };
      }

      if (toolName === 'calendar_create_event') {
        const eventBody = {
          summary: args.title,
          description: args.description || 'Created by KritiAI Personal AI OS',
          start: { dateTime: new Date(args.startTime).toISOString() },
          end: { dateTime: new Date(args.endTime || (new Date(args.startTime).getTime() + 3600000)).toISOString() },
          attendees: (args.attendees || []).map(email => ({ email }))
        };
        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(eventBody)
        });
        if (!res.ok) throw new Error(`Calendar API returned HTTP ${res.status}`);
        const data = await res.json();
        return { success: true, eventId: data.id, htmlLink: data.htmlLink, summary: data.summary };
      }

      if (toolName === 'calendar_list_events') {
        const now = new Date().toISOString();
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=10&singleEvents=true&orderBy=startTime`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Calendar API returned HTTP ${res.status}`);
        const data = await res.json();
        return { success: true, events: data.items || [] };
      }

      if (toolName === 'drive_search') {
        const q = encodeURIComponent(`name contains '${args.query}' and trashed = false`);
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,webViewLink)`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Drive API returned HTTP ${res.status}`);
        const data = await res.json();
        return { success: true, files: data.files || [] };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

export const toolService = new ToolService();
