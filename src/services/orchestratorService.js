/**
 * KritiAI - Master Orchestrator & Autonomous Agent Execution Engine
 * "Kernel-Level RAG and IDE Tooling Interface with Artificial Intelligence"
 * 
 * Pipeline:
 * USER REQUEST
 * ➔ MASTER ANALYZER (Intent, Entities, Context)
 * ➔ AGENT & MODEL SELECTION
 * ➔ TOOL SELECTION & CAPABILITY CHECK
 * ➔ MULTI-TURN TOOL-CALLING LOOP (Terminal, Filesystem, OS, Cloud APIs)
 * ➔ REAL OBSERVATION & VERIFICATION
 * ➔ PERSISTENT AUDIT & MEMORY
 */

import { aiProviderService } from './aiProviderService';
import { toolService, TOOL_SCHEMAS } from './toolService';

export class OrchestratorService {
  constructor() {
    this.approvalPolicy = {
      'gmail_send': 'CONFIRM',
      'terminal_execute': 'AUTO_SAFE', // Safe commands run automatically; destructive require confirm
      'filesystem_create_file': 'AUTO',
      'windows_set_theme': 'AUTO',
      'windows_set_volume': 'AUTO',
      'windows_launch_app': 'AUTO',
      'vscode_open_file': 'AUTO',
      'calendar_create_event': 'AUTO',
      'memory_save': 'AUTO'
    };
  }

  isCommandHighRisk(cmd) {
    if (!cmd) return false;
    const lower = cmd.toLowerCase();
    const destructive = ['format ', 'rmdir /s', 'rm -rf', 'del /f /s /q', 'drop database', 'mkfs', 'reg delete'];
    return destructive.some(d => lower.includes(d));
  }

  /**
   * Main entry point for user requests
   */
  async processRequest({
    prompt,
    agentPreference = 'AUTO',
    modelPreference = null,
    history = [],
    onStepUpdate = null
  }) {
    const startTime = performance.now();
    const executionLogs = [];
    const log = (msg) => {
      console.log(`[Orchestrator] ${msg}`);
      executionLogs.push(msg);
      if (onStepUpdate) onStepUpdate(msg);
    };

    log(`Master Analyzer initialized. Request: "${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}"`);

    // 1. Resolve Memory Context & Personal Records
    const savedMemories = JSON.parse(localStorage.getItem('kritiai_memories') || '[]');
    let memoryPrompt = '';
    if (savedMemories.length > 0) {
      memoryPrompt = `\n[USER PERSONAL MEMORY RECORDS]:\n` + 
        savedMemories.map(m => `- ${m.key}: ${JSON.stringify(m.value)}`).join('\n');
      log(`Retrieved ${savedMemories.length} personal memory records.`);
    }

    // 2. Resolve Workspace Directory & System Environment
    const wsDir = localStorage.getItem('kritiai_workspace_dir') || 'K:\\Projects\\kittyai';
    const isDesktopOnline = await toolService.isDesktopOnline();
    log(`Local Runtime Status: ${isDesktopOnline ? 'Online (Port 9972)' : 'Offline / Remote'}. Workspace: ${wsDir}`);

    // 3. Resolve Provider & Model
    let selectedProvider = 'groq';
    let selectedModel = 'llama-3.3-70b-versatile';

    const groqKey = localStorage.getItem('groq_api_key') || localStorage.getItem('kritiai_groq_api_key') || 'gsk_TOMZuMkhgyOpPwXeUsqEWGdyb3FYGywpI8gaU9KNZ51iSfzHLGcYy';
    const geminiKey = localStorage.getItem('gemini_api_key') || localStorage.getItem('kritiai_gemini_api_key') || '';
    const openaiKey = localStorage.getItem('openai_api_key') || localStorage.getItem('kritiai_openai_api_key') || '';
    const nvidiaKey = localStorage.getItem('nvidia_api_key') || localStorage.getItem('kritiai_nvidia_api_key') || '';

    if (modelPreference === 'gemini-2.0' && geminiKey) {
      selectedProvider = 'gemini';
      selectedModel = 'gemini-2.0-flash';
    } else if (modelPreference === 'gpt-4o' && openaiKey) {
      selectedProvider = 'openai';
      selectedModel = 'gpt-4o';
    } else if (modelPreference === 'nvidia-nim' && nvidiaKey) {
      selectedProvider = 'nvidia';
      selectedModel = 'meta/llama-3.3-70b-instruct';
    } else if (modelPreference === 'ollama') {
      selectedProvider = 'ollama';
      selectedModel = 'llama3.2';
    } else if (groqKey) {
      selectedProvider = 'groq';
      selectedModel = 'llama-3.3-70b-versatile';
    } else {
      selectedProvider = 'free';
      selectedModel = 'openai-fast';
    }

    log(`Model Router selected: ${selectedProvider} (${selectedModel}). Agent: ${agentPreference}`);

    // 4. Construct System Instruction with Real Tool Capabilities
    const systemInstruction = `You are KritiAI (Kernel-Level RAG and IDE Tooling Interface with Artificial Intelligence).
"Your Personal AI That Gets Things Done."

You are a genuine, intelligent personal assistant with DIRECT ACCESS to tools on the user's computer and cloud integrations:
- You have real tools to execute PowerShell commands, create/edit files, run scripts, launch desktop apps, change Windows settings, search Gmail, schedule Calendar meetings, and save memories.
- When the user asks you to build, create, run, fix, launch, or do something on their computer, DO NOT just describe what they should do—INVOKE THE APPROPRIATE TOOLS TO DO IT!
- For example, if the user says "Create a calculator", call filesystem_create_file with a complete, fully functional calculator application, and if appropriate, test it using terminal_execute or filesystem_run_script!
- If the user asks to switch theme or adjust volume, call windows_set_theme or windows_set_volume!
- If the user asks to launch an application (VS Code, Notepad, Calc, Terminal), call windows_launch_app!
- Always be concise, helpful, and technically accurate. Report the real results of any tools executed.

Current Workspace Directory: ${wsDir}
Platform: Windows (PowerShell)
${memoryPrompt}`;

    // 5. Build Conversational History
    const messages = [
      { role: 'system', content: systemInstruction }
    ];

    if (history && history.length > 0) {
      for (const turn of history.slice(-6)) {
        if (turn.role && turn.content) {
          messages.push({ role: turn.role, content: turn.content });
        }
      }
    }

    messages.push({ role: 'user', content: prompt });

    // 6. Tool-Calling Iteration Loop
    let apiKeyToUse = selectedProvider === 'groq' ? groqKey : (selectedProvider === 'gemini' ? geminiKey : (selectedProvider === 'openai' ? openaiKey : (selectedProvider === 'nvidia' ? nvidiaKey : '')));
    let currentIteration = 0;
    const maxIterations = 5;
    const executedToolResults = [];
    let pendingApproval = null;
    let finalContent = '';

    while (currentIteration < maxIterations) {
      currentIteration++;
      log(`Calling AI model inference (Iteration ${currentIteration})...`);

      let response;
      try {
        response = await aiProviderService.callCompletion({
          provider: selectedProvider,
          model: selectedModel,
          apiKey: apiKeyToUse,
          messages,
          tools: TOOL_SCHEMAS
        });
      } catch (err) {
        log(`Primary provider failed: ${err.message}. Invoking public fallback...`);
        response = await aiProviderService.callCompletion({
          provider: 'free',
          model: 'openai-fast',
          apiKey: '',
          messages,
          tools: TOOL_SCHEMAS
        });
      }

      const toolCalls = response.toolCalls || [];

      // If no tool calls were requested, we have our final text response
      if (!toolCalls || toolCalls.length === 0) {
        finalContent = response.content || "Operation completed.";
        break;
      }

      // Model requested tool calls
      log(`Model requested ${toolCalls.length} tool call(s): ${toolCalls.map(t => t.function?.name).join(', ')}`);

      // Add assistant response with tool_calls to conversation history
      messages.push({
        role: 'assistant',
        content: response.content || null,
        tool_calls: toolCalls
      });

      // Execute each tool call
      for (const call of toolCalls) {
        const fnName = call.function?.name;
        let fnArgs = {};
        try {
          fnArgs = JSON.parse(call.function?.arguments || '{}');
        } catch {
          fnArgs = {};
        }

        // Check if tool requires user confirmation
        if (fnName === 'gmail_send' || (fnName === 'terminal_execute' && this.isCommandHighRisk(fnArgs.command))) {
          log(`Tool '${fnName}' requires Level 2 user authorization.`);
          pendingApproval = {
            id: 'approval_' + Date.now(),
            tool: fnName,
            args: fnArgs,
            description: fnName === 'gmail_send' ? `Send email to ${fnArgs.to}: "${fnArgs.subject}"` : `Execute command: ${fnArgs.command}`,
            risk: 'high'
          };
          // Don't execute yet, break and present approval card to user
          finalContent = `⚠️ **Authorization Required**\n\nI have prepared the action: **\`${fnName}\`**.\n- Details: ${JSON.stringify(fnArgs, null, 2)}\n\nPlease review and approve below to proceed.`;
          break;
        }

        log(`Executing tool: ${fnName}...`);
        const toolResult = await toolService.executeTool(fnName, fnArgs);
        executedToolResults.push({
          tool: fnName,
          args: fnArgs,
          result: toolResult
        });

        log(`Tool '${fnName}' completed. Success: ${toolResult.success !== false}`);

        // Feed tool result back to model
        messages.push({
          role: 'tool',
          tool_call_id: call.id || ('call_' + Math.random().toString(36).substring(2, 9)),
          name: fnName,
          content: JSON.stringify(toolResult)
        });
      }

      if (pendingApproval) {
        break;
      }
    }

    const elapsedMs = Math.round(performance.now() - startTime);
    log(`Master Orchestration finished in ${elapsedMs}ms.`);

    return {
      reply: finalContent,
      logs: executionLogs,
      executedTools: executedToolResults,
      pendingApproval: pendingApproval,
      provider: selectedProvider,
      model: selectedModel,
      elapsedMs: elapsedMs
    };
  }
}

export const orchestratorService = new OrchestratorService();
