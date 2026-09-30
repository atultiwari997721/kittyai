import os
import sys
import json
import logging
from contextlib import asynccontextmanager
from typing import Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Ensure parent directory is in sys.path
sys.path.insert(0, str(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from sidecar.python.config import settings
from sidecar.python.core.models import (
    AnalyzeRequest,
    AnalyzeResponse,
    OSActionRequest,
    ThemeToggleRequest,
    AssistToggleRequest,
    CodeAnalyzeRequest,
    CodePatchRequest,
    MeetingJoinRequest,
    EmailSendModel,
    WhatsAppSendModel,
    CalendarEventModel,
    ActiveModelRequest,
    MemorySaveRequest,
    ChatRequest,
    ClarificationRequest,
    TerminalRunRequest,
    FileCreateRequest,
    FolderCreateRequest,
    CodeRunRequest,
    PairGenerateRequest,
    PairVerifyRequest,
)
from sidecar.python.core.terminal_fs import terminal_fs_engine
from sidecar.python.core.llm_orchestrator import orchestrator
from sidecar.python.core.router import master_router
from sidecar.python.core.screen import screen_manager
from sidecar.python.core.memory import personal_memory
from sidecar.python.core.planner import autonomous_planner
from sidecar.python.agents.os_agent import os_agent
from sidecar.python.agents.coding_agent import coding_agent
from sidecar.python.agents.meeting_agent import meeting_agent
from sidecar.python.agents.plugin_agent import plugin_agent

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("kritiai.server")

# Active WebSocket connections
active_connections: Set[WebSocket] = set()

async def broadcast_ws(message_type: str, payload: dict, success: bool = True):
    msg = {
        "id": os.urandom(4).hex(),
        "type": message_type,
        "payload": payload,
        "timestamp": os.times().elapsed,
        "success": success
    }
    dead_sockets = set()
    for ws in active_connections:
        try:
            await ws.send_text(json.dumps(msg))
        except Exception:
            dead_sockets.add(ws)
    for ws in dead_sockets:
        active_connections.discard(ws)

# Connect assist mode callbacks to WebSocket broadcast
async def on_assist_observation(obs: dict):
    await broadcast_ws("assist_observation", obs)

os_agent.register_assist_callback(on_assist_observation)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing KritiAI Background Sidecar Engine...")
    models = await orchestrator.list_available_models()
    logger.info(f"Discovered {len(models)} AI models. Active: {orchestrator.active_model_id}")
    yield
    logger.info("Shutting down KritiAI Sidecar...")
    await os_agent.stop_assist_mode()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- WebSocket IPC -----------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    logger.info("New WebSocket client connected.")

    # Send initial models state
    models = await orchestrator.list_available_models()
    await websocket.send_text(json.dumps({
        "type": "models_list",
        "payload": {
            "models": [m.model_dump() for m in models],
            "activeModelId": orchestrator.active_model_id,
            "localOllamaOnline": await orchestrator.is_ollama_ready()
        },
        "success": True
    }))

    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
                msg_type = msg.get("type")
                payload = msg.get("payload", {})

                if msg_type == "ping":
                    await websocket.send_text(json.dumps({"type": "pong", "payload": {}, "success": True}))

                elif msg_type == "route_request":
                    prompt = payload.get("prompt", "")
                    res = await master_router.analyze_and_route(prompt)
                    await websocket.send_text(json.dumps({
                        "type": "intent_classified",
                        "payload": res.model_dump(),
                        "success": True
                    }))

                elif msg_type == "capture_screen":
                    target_app = payload.get("targetApp")
                    cap = screen_manager.capture_screen(target_app=target_app)
                    await websocket.send_text(json.dumps({
                        "type": "screen_captured",
                        "payload": cap,
                        "success": True
                    }))

                elif msg_type == "start_assist_mode":
                    interval = float(payload.get("intervalSec", 3.0))
                    await os_agent.start_assist_mode(interval_sec=interval)
                    await websocket.send_text(json.dumps({
                        "type": "assist_observation",
                        "payload": {"isMonitoring": True},
                        "success": True
                    }))

                elif msg_type == "stop_assist_mode":
                    await os_agent.stop_assist_mode()
                    await websocket.send_text(json.dumps({
                        "type": "assist_observation",
                        "payload": {"isMonitoring": False},
                        "success": True
                    }))

                elif msg_type == "set_active_model":
                    model_id = payload.get("modelId")
                    provider = payload.get("provider")
                    if model_id:
                        orchestrator.set_active_model(model_id, provider)
                        await websocket.send_text(json.dumps({
                            "type": "models_list",
                            "payload": {"activeModelId": orchestrator.active_model_id},
                            "success": True
                        }))

            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        active_connections.discard(websocket)
        logger.info("WebSocket client disconnected.")
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
        active_connections.discard(websocket)

# ----------------- REST Endpoints -----------------

@app.get("/api/health")
async def get_health():
    is_ollama = await orchestrator.is_ollama_ready()
    return {
        "status": "online",
        "version": settings.VERSION,
        "localOllama": is_ollama,
        "activeModel": orchestrator.active_model_id,
        "platform": sys.platform
    }

@app.get("/api/models")
async def get_models():
    models = await orchestrator.list_available_models()
    return {
        "models": models,
        "activeModel": orchestrator.active_model_id,
        "localOllamaOnline": await orchestrator.is_ollama_ready()
    }

@app.post("/api/models/active")
async def set_active_model(req: ActiveModelRequest):
    orchestrator.set_active_model(req.modelId, req.provider)
    return {"success": True, "activeModel": orchestrator.active_model_id}

@app.post("/api/analyze")
async def analyze_request(req: AnalyzeRequest):
    res = await master_router.analyze_and_route(
        prompt=req.prompt,
        context=req.context,
        screenshot_base64=req.screenshotBase64
    )
    return res

# --- OS Agent Endpoints ---
@app.post("/api/os/execute")
async def execute_os_action(req: OSActionRequest):
    if req.type == "launch_app" and req.appName:
        return os_agent.launch_app(req.appName)
    elif req.type == "open_settings":
        return os_agent.open_settings_uri(req.uri or "theme")
    elif req.type == "toggle_theme":
        return os_agent.toggle_windows_theme(req.theme or "toggle")
    elif req.type in ["click", "type", "press", "hotkey"]:
        return os_agent.execute_mouse_keyboard(req.type, req.model_dump())
    return {"success": False, "error": f"Unsupported OS action: {req.type}"}

@app.post("/api/os/theme")
async def toggle_theme(req: ThemeToggleRequest):
    return os_agent.toggle_windows_theme(req.theme)

@app.post("/api/os/capture")
async def capture_screen(target_app: str = None):
    return screen_manager.capture_screen(target_app=target_app)

@app.post("/api/os/assist")
async def toggle_assist(req: AssistToggleRequest):
    if req.enable:
        await os_agent.start_assist_mode(req.intervalSec)
    else:
        await os_agent.stop_assist_mode()
    return {"isMonitoring": os_agent.is_assist_active}

# --- Coding Agent Endpoints ---
@app.post("/api/coding/analyze-error")
async def analyze_code_error(req: CodeAnalyzeRequest):
    return await coding_agent.analyze_and_propose_fix(
        raw_error=req.rawError,
        workspace_path=req.workspacePath,
        active_file=req.activeFile,
        file_content=req.fileContent
    )

@app.post("/api/coding/apply-patch")
async def apply_code_patch(req: CodePatchRequest):
    patches_dicts = [p.model_dump() for p in req.patches]
    return coding_agent.apply_patch(req.proposalId, patches_dicts)

# --- Meeting Agent Endpoints ---
@app.get("/api/meetings")
async def list_meetings():
    return meeting_agent.get_upcoming_meetings()

@app.post("/api/meetings/join-delegate")
async def join_meeting_delegate(req: MeetingJoinRequest):
    return await meeting_agent.join_meeting_on_behalf(
        meeting_id=req.meetingId,
        join_url=req.joinUrl,
        custom_name=req.customName
    )

@app.post("/api/meetings/{meeting_id}/leave")
async def leave_meeting(meeting_id: str):
    return meeting_agent.leave_meeting(meeting_id)

# --- Plugin Hub Endpoints ---
@app.get("/api/plugins/status")
async def get_plugin_status():
    return plugin_agent.get_plugin_status()

@app.post("/api/plugins/gmail/send")
async def send_gmail_email(req: EmailSendModel):
    return plugin_agent.send_email_smtp(
        recipients=req.to,
        subject=req.subject,
        body=req.body,
        is_html=req.isHtml
    )

@app.post("/api/plugins/whatsapp/send")
async def send_whatsapp_message(req: WhatsAppSendModel):
    return plugin_agent.send_whatsapp_message(
        phone_number=req.phoneNumber,
        message=req.message,
        media_url=req.mediaUrl
    )

@app.post("/api/plugins/calendar/event")
async def schedule_calendar_event(req: CalendarEventModel):
    return plugin_agent.schedule_calendar_event(
        title=req.title,
        start_time=req.startTime,
        end_time=req.endTime,
        description=req.description,
        attendees=req.attendees,
        meeting_link=req.meetingLink
    )

# --- Interactive Chat & Autonomous Planner Endpoints ---
@app.post("/api/chat")
async def chat_execute(req: ChatRequest):
    """
    Submits user prompt to Autonomous Planner.
    Checks personal memory for entities; if ambiguous/missing, returns needsClarification=True.
    Otherwise, executes multi-step plan autonomously.
    """
    if req.groqApiKey:
        settings.GROQ_API_KEY = req.groqApiKey
    if req.geminiApiKey:
        settings.GEMINI_API_KEY = req.geminiApiKey
    if req.openaiApiKey:
        settings.OPENAI_API_KEY = req.openaiApiKey
    if req.nvidiaApiKey:
        settings.NVIDIA_API_KEY = req.nvidiaApiKey
    if req.model:
        provider = "groq" if "groq" in req.model else ("gemini" if "gemini" in req.model else ("openai" if "gpt" in req.model else ("nvidia" if "nvidia" in req.model else "ollama")))
        orchestrator.set_active_model(req.model, provider)

    res = await autonomous_planner.plan_and_execute(req.prompt, req.context)
    if isinstance(res, dict) and "reply" not in res:
        res["reply"] = res.get("summary") or res.get("reasoning") or "Action executed successfully."
    return res


@app.post("/api/chat/clarify")
async def chat_clarify(req: ClarificationRequest):
    """
    User responds to clarification question.
    Saves entity into Personal Memory permanently, then completes task.
    """
    return await autonomous_planner.resume_with_clarification(req.taskId, req.response)

# --- Personal Memory & Knowledge Base Endpoints ---
@app.get("/api/memory")
async def list_memories():
    return personal_memory.get_all_memories()

@app.post("/api/memory")
async def save_memory(req: MemorySaveRequest):
    return personal_memory.set_memory(
        key=req.key,
        value=req.value,
        category=req.category,
        description=req.description,
        source="user_api"
    )

@app.delete("/api/memory/{key}")
async def delete_memory(key: str):
    success = personal_memory.delete_memory(key)
    return {"success": success}

# --- Superpower Terminal Execution Endpoints ---
@app.post("/api/terminal/run")
async def run_terminal(req: TerminalRunRequest):
    """Executes a real shell command in Windows PowerShell or CMD and returns stdout/stderr."""
    return terminal_fs_engine.run_terminal_command(
        command=req.command,
        cwd=req.cwd,
        timeout=req.timeout or 30
    )

# --- Superpower File & Folder Endpoints ---
@app.post("/api/fs/create-file")
async def create_file(req: FileCreateRequest):
    """Creates/writes a file with content on the user's disk."""
    return terminal_fs_engine.create_file(
        path=req.path,
        content=req.content,
        overwrite=req.overwrite if req.overwrite is not None else True
    )

@app.post("/api/fs/create-folder")
async def create_folder(req: FolderCreateRequest):
    """Creates a folder/directory on the user's disk."""
    return terminal_fs_engine.create_folder(path=req.path)

@app.get("/api/fs/list")
async def list_files(path: str = None):
    """Lists files and folders in the specified path."""
    return terminal_fs_engine.list_files(path=path)

@app.post("/api/fs/read")
async def read_file(path: str):
    """Reads file text from disk."""
    return terminal_fs_engine.read_file(path=path)

@app.post("/api/fs/run-code")
async def run_code(req: CodeRunRequest):
    """Writes code to workspace file and executes it via Python/Node/PowerShell."""
    return terminal_fs_engine.run_code_snippet(
        code=req.code,
        language=req.language or "python",
        filename=req.filename,
        cwd=req.cwd
    )

# --- 6-Digit Alphanumeric Pairing Endpoints (Website <-> Desktop App) ---
@app.post("/api/pair/generate")
async def generate_pairing_code(req: PairGenerateRequest = None):
    """Generates a 6-digit alphanumeric pairing code to connect Website and Desktop App."""
    client_type = req.clientType if req else "web"
    device_name = req.deviceName if req else None
    return terminal_fs_engine.generate_pair_code(client_type=client_type, device_name=device_name)

@app.post("/api/pair/verify")
async def verify_pairing_code(req: PairVerifyRequest):
    """Verifies a 6-digit alphanumeric pairing code and establishes bilateral link."""
    return terminal_fs_engine.verify_pair_code(
        code=req.code,
        client_type=req.clientType or "desktop",
        device_name=req.deviceName
    )

@app.get("/api/pair/status")
async def get_pair_status():
    """Returns the current link state between Web and Desktop App."""
    return terminal_fs_engine.get_pairing_status()

@app.post("/api/pair/unpair")
async def unpair_devices():
    """Unpairs connected devices."""
    return terminal_fs_engine.unpair_device()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("sidecar.python.main:app", host=settings.HOST, port=settings.PORT, reload=True)

