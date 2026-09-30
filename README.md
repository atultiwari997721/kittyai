# KritiAI
### *"Your Personal AI That Gets Things Done."*
**Autonomous Local-First Personal AI Operating System — Windows Desktop + Web + Mobile + Multi-Agent Runtime**

---

## 🌟 What is KritiAI?
KritiAI is an autonomous personal AI operating layer that bridges your Windows desktop, web dashboard, and mobile companion into a unified execution ecosystem.

Instead of a passive chatbot, KritiAI:
- **Understands Natural-Language Concepts**: Resolves user-defined concepts like *"Project Team"* into specific contacts (`Rahul`, `Priya`, `Ankit`) using a persistent Memory Vault.
- **Multimodal Master Analyzer**: Classifies incoming instructions into 12+ intent routes (`OS_NAV`, `CODE_AGENT`, `MEETING_AGENT`, `EMAIL_AGENT`, `CALENDAR_AGENT`, `COMMUNICATION_AGENT`, `RESEARCH_AGENT`, `BROWSER_AGENT`, `FILE_AGENT`, `MEMORY_AGENT`, `DOCUMENT_AGENT`, `GENERAL_AGENT`).
- **Consequential Safety & Approvals**: Never silently dispatches emails, modifies code, or executes critical terminal commands without explicit user authorization cards.
- **Local-First Privacy**: Supports local offline execution with Ollama (`llama3.2`, `deepseek-r1`) and local PyAutoGUI automation. Screen context and private files never leave your PC.
- **Multi-Model Orchestration**: Provider-agnostic inference switching between Google Gemini 2.0 Flash, NVIDIA NIM (Llama 3.1 70B), OpenAI GPT-4o, Groq LPUs, and Ollama.

---

## 🏗️ Architecture Overview

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

## 🚀 Quick Start

### 1. Web & Desktop Development
```bash
# Clone the repository
git clone https://github.com/atultiwari997721/kittyai.git
cd kittyai

# Install root dependencies
npm install

# Run web application
npm run dev

# Build production bundle (Vercel compatible)
npm run build
```

### 2. Python Background Sidecar (Windows)
```bash
# Start the Python FastAPI sidecar
python sidecar/python/main.py
# Sidecar listens on http://127.0.0.1:8000 (Health check: /api/health)
```

### 3. Windows Native Desktop Shell (Tauri v2)
```bash
# Summon Assist HUD shortcut: Ctrl+Shift+Space (or Alt+K)
npm run dev:desktop
```

---

## 📦 Windows Official Downloads (Clean & Virus-Free)

All KritiAI distribution packages are verified open-source scripts and standard zip archives with zero anti-virus false-positive alerts:
1. **Portable Windows Package (.zip)**: [`/downloads/KritiAI-Windows-Portable.zip`](public/downloads/KritiAI-Windows-Portable.zip)
2. **One-Click Batch Setup (.bat)**: [`/downloads/KritiAI-Setup.bat`](public/downloads/KritiAI-Setup.bat)
3. **PowerShell One-Liner**:
```powershell
irm https://kritiai.vercel.app/downloads/Install-KritiAI.ps1 | iex
```

---

## 🔒 Security & Privacy Guarantees
- **No Unrestricted Access**: KritiAI enforces 4 permission levels (Level 0: Chat, Level 1: Read, Level 2: Confirm, Level 3: Trusted).
- **CommandPolicyEngine**: Destructive disk commands, credential extraction, and malicious processes are permanently blocked.
- **Screen Assist**: Targeted monitoring is OFF by default. When enabled, password managers, banking applications, and private browser windows are automatically excluded.
- **Zero Silent Operations**: Emails and calendar events are never dispatched without showing an Approval Card.

---

## 📄 License
MIT License. Copyright (c) 2026 KritiAI Team.
