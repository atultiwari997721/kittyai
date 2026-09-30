# KritiAI Architecture & System Design
**"Your Personal AI That Gets Things Done."**

KritiAI is an autonomous, local-first Personal AI Operating System connecting Windows, Web, and Mobile into a unified execution ecosystem.

```text
                     USER
                      │
        ┌─────────────┼─────────────┐
        │             │             │
      WEB           MOBILE        WINDOWS
        │             │             │
        └─────────────┼─────────────┘
                      │
                 CLOUD LAYER (Supabase Sync & Auth)
                      │
                DEVICE PAIRING
                      │
             WINDOWS LOCAL RUNTIME (Port 8000)
                      │
                 MASTER ANALYZER
                      │
                TASK ORCHESTRATOR
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
  AGENTS           AI ROUTER          MEMORY
    │                 │                 │
    │          ┌──────┼────────┐        │
    │          │      │        │        │
    │        OpenAI Gemini NVIDIA       │
    │          │      │        │        │
    │          └──────┼────────┘        │
    │                 │                 │
    │              Ollama               │
    │                                   │
    └─────────────────┬─────────────────┘
                      │
                   TOOLS (CommandPolicyEngine)
                      │
    ┌─────────────────┼────────────────────┐
    │                 │                    │
 Windows            VS Code              Browser
 Files               Git                 Screen
 Terminal            Apps                APIs
    │                 │                    │
    └─────────────────┼────────────────────┘
                      │
                EXTERNAL SERVICES
                      │
   Gmail / Calendar / Drive / WhatsApp / etc.
```

---

## 1. Core Principles
1. **Local-First Execution**: Sensitive operations (screen analysis, code editing, terminal commands, local SQLite storage) execute on the user's Windows machine.
2. **Master Analyzer**: All requests undergo multimodal intent routing (`OS_NAV`, `CODE_AGENT`, `MEETING_AGENT`, `EMAIL_AGENT`, `CALENDAR_AGENT`, `COMMUNICATION_AGENT`, `RESEARCH_AGENT`, `BROWSER_AGENT`, `FILE_AGENT`, `MEMORY_AGENT`, `DOCUMENT_AGENT`, `GENERAL_AGENT`).
3. **Consequential Approvals**: Consequential actions (sending emails, modifying code, running terminal commands, joining meetings) require explicit user authorization before execution.
4. **Multi-Model Orchestration**: Provider-agnostic support across OpenAI, Gemini 2.0 Flash, NVIDIA NIM, Groq LPUs, and local offline Ollama.
