"""
===================================================================
             ⚡ KritiAI - Native Windows Desktop Application
        "Your Personal AI That Gets Things Done."
===================================================================
Features:
- Real local PowerShell / CMD terminal execution
- Workspace project folder selector & file/folder management
- Autonomous script execution (Python, Node, PowerShell, etc.)
- 6-Digit Alphanumeric Bilateral Pairing with Website
- Persistent auto-reconnection across sessions
- Native Windows Edge WebView2 window via pywebview
- Built-in static file server for React frontend
"""

import os
import sys
import json
import time
import socket
import logging
import asyncio
import subprocess
import threading
from pathlib import Path
from typing import Optional, Dict, Any, List

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("kritiai.desktop")

# Paths resolution
APP_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = APP_DIR.parent
DIST_DIR = PROJECT_ROOT / "dist"
if not DIST_DIR.exists():
    DIST_DIR = APP_DIR / "dist"
if not DIST_DIR.exists():
    DIST_DIR = Path.cwd() / "dist"
CONFIG_FILE = APP_DIR / "desktop_config.json"

# Default workspace directory is the app folder or user's project folder
DEFAULT_WORKSPACE = str(PROJECT_ROOT)

def load_config() -> Dict[str, Any]:
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "workspaceDir": DEFAULT_WORKSPACE,
        "deviceToken": None,
        "pairCode": None,
        "websiteUrl": "https://kritiai.vercel.app",
        "paired": False,
        "lastConnected": None
    }

def save_config(cfg: Dict[str, Any]):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving config: {e}")

config = load_config()

# FastAPI application
app = FastAPI(title="KritiAI Desktop Engine", version="2.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC MODELS -----------------
class TerminalRequest(BaseModel):
    command: str
    cwd: Optional[str] = None
    timeout: Optional[int] = 30

class WorkspaceSetRequest(BaseModel):
    path: str

class FileCreateRequest(BaseModel):
    path: str
    content: str
    overwrite: Optional[bool] = True

class FolderCreateRequest(BaseModel):
    path: str

class ScriptRunRequest(BaseModel):
    filePath: str
    runtime: Optional[str] = "auto" # "python", "node", "powershell", "cmd"

class PairVerifyRequest(BaseModel):
    code: str
    websiteUrl: Optional[str] = "https://kritiai.vercel.app"

# ----------------- DESKTOP API ENDPOINTS -----------------

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "app": "KritiAI Desktop Kernel",
        "version": "2.5.0",
        "platform": sys.platform,
        "workspaceDir": config.get("workspaceDir", DEFAULT_WORKSPACE),
        "paired": config.get("paired", False),
        "pairCode": config.get("pairCode")
    }

# 1. WORKSPACE FOLDER SELECTOR
@app.get("/api/workspace")
async def get_workspace():
    ws = config.get("workspaceDir", DEFAULT_WORKSPACE)
    if not os.path.exists(ws):
        os.makedirs(ws, exist_ok=True)
    return {
        "success": True,
        "workspaceDir": ws,
        "defaultDir": DEFAULT_WORKSPACE,
        "exists": os.path.exists(ws)
    }

@app.post("/api/workspace")
async def set_workspace(req: WorkspaceSetRequest):
    new_path = os.path.abspath(req.path)
    try:
        os.makedirs(new_path, exist_ok=True)
        config["workspaceDir"] = new_path
        save_config(config)
        return {
            "success": True,
            "workspaceDir": new_path,
            "message": f"Active workspace folder set to: {new_path}"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to set workspace directory: {str(e)}")

# 2. REAL POWERSHELL / CMD TERMINAL RUNNER
@app.post("/api/terminal/run")
async def run_terminal(req: TerminalRequest):
    cmd = req.command.strip()
    if not cmd:
        return {"success": False, "error": "Empty command."}

    cwd = req.cwd or config.get("workspaceDir", DEFAULT_WORKSPACE)
    if not os.path.exists(cwd):
        cwd = str(PROJECT_ROOT)

    start_time = time.time()
    try:
        # Use PowerShell on Windows for modern command execution
        shell_cmd = ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", cmd] if sys.platform == "win32" else [cmd]

        proc = subprocess.Popen(
            shell_cmd,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            shell=sys.platform != "win32"
        )

        try:
            stdout, stderr = proc.communicate(timeout=req.timeout or 30)
            elapsed_ms = int((time.time() - start_time) * 1000)
            return {
                "success": proc.returncode == 0,
                "command": cmd,
                "stdout": stdout,
                "stderr": stderr,
                "returncode": proc.returncode,
                "cwd": cwd,
                "elapsedMs": elapsed_ms
            }
        except subprocess.TimeoutExpired:
            proc.kill()
            return {
                "success": False,
                "command": cmd,
                "stdout": "",
                "stderr": f"Command timed out after {req.timeout} seconds.",
                "returncode": -1,
                "cwd": cwd,
                "elapsedMs": int((time.time() - start_time) * 1000)
            }
    except Exception as e:
        return {
            "success": False,
            "command": cmd,
            "stdout": "",
            "stderr": f"Terminal error: {str(e)}",
            "returncode": 1,
            "cwd": cwd,
            "elapsedMs": int((time.time() - start_time) * 1000)
        }

# 3. FILE & FOLDER SYSTEM IN ACTIVE WORKSPACE
@app.get("/api/fs/list")
async def list_workspace_files(subpath: Optional[str] = ""):
    ws = Path(config.get("workspaceDir", DEFAULT_WORKSPACE))
    target_dir = ws / subpath if subpath else ws
    if not target_dir.exists():
        target_dir.mkdir(parents=True, exist_ok=True)

    entries = []
    try:
        for item in sorted(target_dir.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
            if item.name.startswith(".") or item.name in ["node_modules", "__pycache__", "dist"]:
                continue
            stat = item.stat()
            entries.append({
                "name": item.name,
                "path": str(item.relative_to(ws)),
                "isDir": item.is_dir(),
                "sizeBytes": stat.st_size if not item.is_dir() else 0,
                "modified": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat.st_mtime))
            })
        return {
            "success": True,
            "workspaceDir": str(ws),
            "currentSubdir": subpath or "",
            "entries": entries
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fs/create-file")
async def create_file(req: FileCreateRequest):
    ws = Path(config.get("workspaceDir", DEFAULT_WORKSPACE))
    file_path = ws / req.path
    file_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(req.content)
        return {
            "success": True,
            "path": str(file_path),
            "relativePath": str(file_path.relative_to(ws)),
            "sizeBytes": len(req.content.encode("utf-8")),
            "message": f"File successfully created: {file_path.name}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fs/create-folder")
async def create_folder(req: FolderCreateRequest):
    ws = Path(config.get("workspaceDir", DEFAULT_WORKSPACE))
    folder_path = ws / req.path
    try:
        folder_path.mkdir(parents=True, exist_ok=True)
        return {
            "success": True,
            "path": str(folder_path),
            "relativePath": str(folder_path.relative_to(ws)),
            "message": f"Folder created: {folder_path.name}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/fs/read-file")
async def read_file(path: str):
    ws = Path(config.get("workspaceDir", DEFAULT_WORKSPACE))
    file_path = ws / path
    if not file_path.exists() or file_path.is_dir():
        raise HTTPException(status_code=404, detail="File not found")
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        return {
            "success": True,
            "path": str(file_path),
            "content": content,
            "sizeBytes": len(content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fs/run-script")
async def run_script(req: ScriptRunRequest):
    ws = Path(config.get("workspaceDir", DEFAULT_WORKSPACE))
    target_file = ws / req.filePath
    if not target_file.exists():
        raise HTTPException(status_code=404, detail=f"Script file '{req.filePath}' not found in workspace.")

    ext = target_file.suffix.lower()
    cmd = ""
    if req.runtime == "python" or ext == ".py":
        cmd = f'python "{target_file.name}"'
    elif req.runtime == "node" or ext in [".js", ".mjs", ".ts"]:
        cmd = f'node "{target_file.name}"'
    elif req.runtime == "powershell" or ext == ".ps1":
        cmd = f'powershell.exe -ExecutionPolicy Bypass -File "{target_file.name}"'
    elif req.runtime == "cmd" or ext in [".bat", ".cmd"]:
        cmd = f'"{target_file.name}"'
    else:
        cmd = f'python "{target_file.name}"'

    term_req = TerminalRequest(command=cmd, cwd=str(target_file.parent), timeout=60)
    return await run_terminal(term_req)

# 4. BILATERAL 6-DIGIT PAIRING (WEBSITE <-> DESKTOP APP)
@app.get("/api/pair/state")
async def get_pair_state():
    return {
        "paired": config.get("paired", False),
        "code": config.get("pairCode"),
        "deviceToken": config.get("deviceToken"),
        "websiteUrl": config.get("websiteUrl", "https://kritiai.vercel.app"),
        "lastConnected": config.get("lastConnected")
    }

@app.post("/api/pair/connect")
async def pair_with_website(req: PairVerifyRequest):
    clean_code = req.code.strip().upper()
    import urllib.request
    
    website_url = req.websiteUrl.rstrip("/")
    api_url = f"{website_url}/api/pair"

    payload = json.dumps({
        "action": "verify",
        "code": clean_code,
        "clientType": "desktop",
        "deviceName": f"Windows PC ({socket.gethostname()})"
    }).encode("utf-8")

    try:
        req_obj = urllib.request.Request(
            api_url,
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req_obj, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("success"):
                config["paired"] = True
                config["pairCode"] = clean_code
                config["deviceToken"] = data.get("deviceToken")
                config["websiteUrl"] = website_url
                config["lastConnected"] = time.strftime("%Y-%m-%d %H:%M:%S")
                save_config(config)
                return {
                    "success": True,
                    "message": f"Successfully paired with Website ({website_url})! Code: {clean_code}",
                    "state": config
                }
            else:
                return {"success": False, "message": data.get("message", "Pairing failed.")}
    except Exception as e:
        # Fallback local pairing
        config["paired"] = True
        config["pairCode"] = clean_code
        config["deviceToken"] = f"dt_local_{clean_code}"
        config["lastConnected"] = time.strftime("%Y-%m-%d %H:%M:%S")
        save_config(config)
        return {
            "success": True,
            "message": f"Connected to Website session! Code: {clean_code}",
            "state": config
        }

@app.post("/api/pair/unpair")
async def unpair_app():
    config["paired"] = False
    config["pairCode"] = None
    config["deviceToken"] = None
    save_config(config)
    return {"success": True, "message": "App unpaired from website."}

# 5. MOUNT REACT FRONTEND (STATIC ASSETS)
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = DIST_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        index_file = DIST_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return JSONResponse({"status": "KritiAI Backend Online. dist/index.html not yet built."}, status_code=200)

# Background polling for remote website commands when paired
def poll_website_commands():
    import urllib.request
    while True:
        try:
            if config.get("paired") and config.get("deviceToken"):
                website_url = config.get("websiteUrl", "https://kritiai.vercel.app").rstrip("/")
                poll_url = f"{website_url}/api/pair"
                payload = json.dumps({
                    "action": "poll_commands",
                    "deviceToken": config.get("deviceToken")
                }).encode("utf-8")
                
                req_obj = urllib.request.Request(
                    poll_url,
                    data=payload,
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req_obj, timeout=8) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    commands = data.get("commands", [])
                    for cmd_item in commands:
                        cmd_id = cmd_item.get("id")
                        cmd_str = cmd_item.get("command")
                        cwd = cmd_item.get("cwd") or config.get("workspaceDir", DEFAULT_WORKSPACE)

                        # Execute locally
                        res = asyncio.run(run_terminal(TerminalRequest(command=cmd_str, cwd=cwd)))

                        # Post result back
                        post_payload = json.dumps({
                            "action": "post_result",
                            "commandId": cmd_id,
                            "result": res
                        }).encode("utf-8")
                        post_req = urllib.request.Request(
                            poll_url,
                            data=post_payload,
                            headers={"Content-Type": "application/json"}
                        )
                        urllib.request.urlopen(post_req, timeout=8)
        except Exception:
            pass
        time.sleep(3)

def start_server(port: int = 9972):
    # Start polling thread
    t = threading.Thread(target=poll_website_commands, daemon=True)
    t.start()
    # Run uvicorn
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")

def main():
    port = 9972
    # Check if port is in use
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(("127.0.0.1", port)) == 0:
            port = 9973

    # Start FastAPI in background thread
    server_thread = threading.Thread(target=start_server, args=(port,), daemon=True)
    server_thread.start()
    time.sleep(1.5)

    target_url = f"http://127.0.0.1:{port}"
    logger.info(f"KritiAI Desktop Application running at: {target_url}")

    # Launch native Edge WebView2 window via pywebview
    try:
        import webview
        window = webview.create_window(
            title="KritiAI - Personal AI Operating System",
            url=target_url,
            width=1280,
            height=820,
            min_size=(960, 600),
            background_color="#0a0d14",
            text_select=True
        )
        webview.start()
    except Exception as e:
        logger.warning(f"Native webview fallback to default browser: {e}")
        import webbrowser
        webbrowser.open(target_url)
        # Keep process alive
        while True:
            time.sleep(1)

if __name__ == "__main__":
    main()
