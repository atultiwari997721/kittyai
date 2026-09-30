# 🐱 KittyAI (KritiAI) — Autonomous Local-First Personal AI Assistant

[![Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-blue.svg)](https://microsoft.com/windows)
[![Tauri v2](https://img.shields.io/badge/Desktop-Tauri%20v2%20%2B%20React-orange.svg)](https://v2.tauri.app/)
[![Next.js 14](https://img.shields.io/badge/Web-Next.js%2014%20App%20Router-black.svg)](https://nextjs.org/)
[![Local Ollama](https://img.shields.io/badge/Inference-Local%20Ollama%20%2B%20Cloud-green.svg)](https://ollama.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> **KittyAI (KritiAI)** is a local-first, multi-agent Personal AI Assistant designed for **Windows, Web, and Mobile**. It runs locally on your PC with zero latency using **Ollama**, features a **transparent floating Assist HUD** on your screen, parses and patches compiler errors in **VS Code**, autonomously **joins calendar calls on your behalf** via headless Playwright, and connects to **Gmail, WhatsApp, and Google Calendar**—all synchronized in real-time across your laptop and phone via Supabase.

---

## 🏗 Monorepo Architecture

```
kittyai/
├── apps/
│   ├── desktop/              # Tauri v2 + React + TypeScript + Tailwind CSS
│   │   ├── src/
│   │   │   ├── components/   # Assist HUD, OS Navigator, Coding Agent, Meeting Delegate, Plugin Hub
│   │   │   └── App.tsx       # Dual-mode desktop app (Dashboard + Transparent Floating Overlay)
│   │   └── src-tauri/        # Rust backend with global hotkeys & overlay management
│   │
│   └── web/                  # Next.js 14 App Router + Tailwind CSS (Vercel-Ready)
│       ├── app/
│       │   ├── page.tsx      # Web & Mobile Remote Control Dashboard
│       │   ├── download/     # Direct Windows Desktop installer (.msi / .exe) download page
│       │   ├── meetings/     # Autonomous meeting transcript & action items manager
│       │   ├── coding/       # VS Code debugging sessions & diff reviewer
│       │   ├── plugins/      # Gmail SMTP, WhatsApp Web Bridge, Calendar sync
│       │   ├── settings/     # Model orchestrator switcher & API keys
│       │   └── api/          # Next.js server-side fallback proxy
│       └── components/       # Responsive navigation & mobile drawer
│
├── packages/
│   └── core/                 # Shared TypeScript types, IPC protocols, and API client SDK
│       ├── src/types/        # Agent, Meeting, Coding, OS, Plugin, and IPC types
│       └── src/client/       # Typed HTTP API client & resilient WebSocket client
│
├── sidecar/python/           # FastAPI local background engine (Windows-Native)
│   ├── core/
│   │   ├── router.py         # Master Analyzer & Multimodal Intent Router
│   │   ├── llm_orchestrator.py # Local Ollama detection + Gemini, OpenAI, Groq fallback
│   │   ├── screen.py         # MSS desktop capture & targeted window frame diffing
│   │   └── models.py         # Pydantic data schemas
│   ├── agents/
│   │   ├── os_agent.py       # Windows Registry theme toggle, ms-settings, PyAutoGUI assist loop
│   │   ├── coding_agent.py   # VS Code screen capture, terminal error parser, atomic diff patcher
│   │   ├── meeting_agent.py  # Playwright headless call joiner, Whisper speech-to-text, notes
│   │   └── plugin_agent.py   # Gmail SMTP delivery, WhatsApp message dispatcher
│   ├── config.py             # App settings & environment variables
│   ├── main.py               # WebSocket IPC & REST API endpoints
│   └── requirements.txt      # Python dependencies
│
└── supabase/
    └── schema.sql            # PostgreSQL schema with Realtime publications & RLS policies
```

---

## ⚡ Core Capabilities & Sub-Agents

### 1. 🧠 Master Analyzer & Intent Router (`sidecar/python/core/router.py`)
Intercepts all incoming user input (voice commands, chat queries, and screen events) and routes them with model priority:
* **`OS_NAV`**: Windows system navigation, settings toggles (e.g. Dark/Light mode), and application launching.
* **`CODE_AGENT`**: VS Code terminal error parsing, stack trace diagnostics, screen-to-code generation, and unified diff patching.
* **`MEETING_AGENT`**: Autonomous call delegate (joins Google Meet, Zoom, or Teams quietly on your behalf, transcribes speech, and extracts action items).
* **`PLUGIN_AGENT`**: External communication integrations (Gmail, WhatsApp, Google Calendar).
* **`GENERAL_CHAT`**: Conversational assistant.

### 2. 🪟 Windows OS & Navigation Agent (`sidecar/agents/os_agent.py`)
* **Instant Registry Theme Toggle**: Directly flips Windows `AppsUseLightTheme` and `SystemUsesLightTheme` for zero-latency dark/light mode toggling.
* **`ms-settings:` Direct URIs**: Navigates instantly to `ms-settings:personalization-colors`, `ms-settings:display`, `ms-settings:sound`, `ms-settings:network-wifi`, etc.
* **Background Assist Mode**: Captures focused desktop windows at configurable intervals, performs lightweight context extraction, and provides proactive guidance in the floating HUD.

### 3. 💻 VS Code Developer Agent (`sidecar/agents/coding_agent.py`)
* **Targeted Window Recording**: Captures the Visual Studio Code window frame.
* **Terminal Error Parser**: Extracts file, line, column, error category, and root cause from Python, TypeScript, JavaScript, Rust, and C++ compiler traces.
* **Unified Diff Patcher**: Generates minimal, surgical code diffs and applies them directly to local files with automatic `.kitty_backup` rollback safety.

### 4. 📞 Autonomous Meeting Delegate Agent (`sidecar/agents/meeting_agent.py`)
* **Autonomous Call Joiner**: Spins up an isolated Playwright browser instance to join Google Meet, Teams, or Zoom calls when you are away.
* **Discreet Entry**: Automatically mutes the microphone and turns off the camera before entering the call.
* **AI Transcription & Action Items**: Transcribes speaker audio and generates executive minutes, key decisions, and prioritized tasks synced directly to Supabase.

### 5. 🔌 Universal Plugin Hub (`apps/web` + Supabase)
* **Gmail SMTP Integration**: Send automated digest emails and responses directly from your email address.
* **WhatsApp Bridge**: Transmit messages directly through your connected WhatsApp Web session.
* **Google Calendar Sync**: Detect schedule conflicts and trigger autonomous delegates for missed appointments.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Windows 10 or 11** (64-bit)
* **Node.js** v18+ (tested on Node v23)
* **Python** 3.10+ (tested on Python 3.12)
* **Ollama** (optional for 100% on-device local models)

### 1. Clone & Configure Environment
```bash
git clone https://github.com/atultiwari997721/kittyai.git
cd kittyai

# Copy environment variables template
cp .env.example .env
```

Edit `.env` to configure your preferred model keys (Ollama is enabled by default on `127.0.0.1:11434`):
```ini
OLLAMA_HOST=http://127.0.0.1:11434
DEFAULT_LOCAL_MODEL=qwen2.5:latest
GEMINI_API_KEY=your_gemini_key_here
```

### 2. Install & Launch Python Sidecar
```bash
# In project root
python -m pip install -r sidecar/python/requirements.txt
python sidecar/python/main.py
```
The FastAPI background sidecar will start on `http://127.0.0.1:8000` with WebSocket IPC enabled on `ws://127.0.0.1:8000/ws`.

### 3. Run the Web Dashboard (Next.js 14)
```bash
npm --workspace apps/web run dev
```
Open [http://localhost:3000](http://localhost:3000) on your desktop or mobile browser to command your agents remotely.

### 4. Run the Windows Desktop App (Tauri v2)
```bash
# Launch Vite frontend for desktop
npm --workspace apps/desktop run dev
```
To run with native Windows Tauri overlay support:
```bash
npm --workspace apps/desktop run tauri dev
```

---

## ☁️ Deploying the Web Console to Vercel

1. Push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set **Root Directory** to `apps/web`.
4. Add the following environment variables:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `GEMINI_API_KEY` or `OPENAI_API_KEY` (for cloud fallback)
5. Deploy! Users can access the web console and download the Windows `.msi` app from `/download`.

---

## 🔒 Security & Privacy

* **Local-First Processing**: When running Ollama, prompt analysis and code generation remain on your PC.
* **Safe OS Automation**: PyAutoGUI runs with failsafe protection (`FAILSAFE=true`). Moving your mouse to any screen corner immediately halts automation.
* **Atomic Code Patches**: Every file modified by the coding agent automatically creates a `.kitty_backup` copy for rollback.
* **Discreet Meeting Entry**: The Playwright meeting delegate mutes audio and disables video prior to joining any call.

---

## 📄 License
MIT © 2026 KittyAI Team. Built with Google DeepMind Antigravity pair programming.
