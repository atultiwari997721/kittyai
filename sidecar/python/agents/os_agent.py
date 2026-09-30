import os
import sys
import time
import winreg
import asyncio
import logging
import subprocess
from typing import Optional, Dict, Any, Callable, List
import pyautogui
from sidecar.python.core.screen import screen_manager
from sidecar.python.config import settings

logger = logging.getLogger("kittyai.os_agent")

pyautogui.FAILSAFE = settings.ENABLE_FAILSAFE
pyautogui.PAUSE = 0.2

SETTINGS_MAP = {
    "theme": "ms-settings:personalization-colors",
    "color": "ms-settings:personalization-colors",
    "colors": "ms-settings:personalization-colors",
    "dark mode": "ms-settings:personalization-colors",
    "display": "ms-settings:display",
    "resolution": "ms-settings:display",
    "sound": "ms-settings:sound",
    "volume": "ms-settings:sound",
    "bluetooth": "ms-settings:bluetooth",
    "wifi": "ms-settings:network-wifi",
    "network": "ms-settings:network",
    "apps": "ms-settings:appsfeatures",
    "storage": "ms-settings:storagesense",
    "battery": "ms-settings:powersleep",
    "power": "ms-settings:powersleep",
    "update": "ms-settings:windowsupdate",
    "windows update": "ms-settings:windowsupdate",
    "notifications": "ms-settings:notifications",
    "about": "ms-settings:about"
}

APP_COMMANDS = {
    "vs code": "code",
    "vscode": "code",
    "code": "code",
    "chrome": "start chrome",
    "browser": "start chrome",
    "edge": "start msedge",
    "terminal": "start wt",
    "powershell": "start powershell",
    "cmd": "start cmd",
    "notepad": "notepad",
    "calculator": "calc",
    "calc": "calc",
    "explorer": "explorer",
    "files": "explorer",
    "task manager": "taskmgr",
}

class OSAgent:
    def __init__(self):
        self.is_assist_active = False
        self.assist_task: Optional[asyncio.Task] = None
        self.assist_callbacks: List[Callable[[Dict[str, Any]], None]] = []
        self.last_assist_text = ""

    def register_assist_callback(self, cb: Callable[[Dict[str, Any]], None]):
        self.assist_callbacks.append(cb)

    def open_settings_uri(self, uri_or_keyword: str) -> Dict[str, Any]:
        """Navigates to specific Windows Settings page directly via ms-settings protocol."""
        keyword = uri_or_keyword.lower().strip()
        target_uri = SETTINGS_MAP.get(keyword, keyword)
        if not target_uri.startswith("ms-settings:"):
            target_uri = f"ms-settings:{target_uri}"

        logger.info(f"Opening Windows settings URI: {target_uri}")
        try:
            # Use os.startfile on Windows for seamless launch
            if sys.platform == "win32":
                os.startfile(target_uri)
            else:
                subprocess.Popen(["cmd.exe", "/c", "start", target_uri], shell=True)
            return {"success": True, "message": f"Navigated to Windows Settings: {target_uri}", "uri": target_uri}
        except Exception as e:
            logger.error(f"Failed to open settings URI: {e}")
            return {"success": False, "error": str(e)}

    def toggle_windows_theme(self, target_theme: str = "toggle") -> Dict[str, Any]:
        """
        Directly switches Windows Apps and System theme between Light and Dark mode
        via Windows Registry (HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize).
        """
        if sys.platform != "win32":
            return {"success": False, "error": "Theme toggle is only available on Windows."}

        reg_path = r"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, reg_path, 0, winreg.KEY_READ | winreg.KEY_WRITE) as key:
                current_apps, _ = winreg.QueryValueEx(key, "AppsUseLightTheme")
                current_system, _ = winreg.QueryValueEx(key, "SystemUsesLightTheme")

                if target_theme == "toggle":
                    new_val = 0 if current_apps == 1 else 1
                elif target_theme.lower() == "dark":
                    new_val = 0
                else: # light
                    new_val = 1

                winreg.SetValueEx(key, "AppsUseLightTheme", 0, winreg.REG_DWORD, new_val)
                winreg.SetValueEx(key, "SystemUsesLightTheme", 0, winreg.REG_DWORD, new_val)

            theme_name = "Light" if new_val == 1 else "Dark"
            logger.info(f"Switched Windows theme to: {theme_name}")

            # Also offer to open settings if user prefers visual confirmation
            return {
                "success": True,
                "newTheme": theme_name.lower(),
                "message": f"Successfully toggled Windows system and apps theme to {theme_name} Mode."
            }
        except Exception as e:
            logger.warning(f"Direct registry theme toggle failed: {e}. Falling back to ms-settings...")
            # Fallback to navigating user directly to colors settings
            return self.open_settings_uri("ms-settings:personalization-colors")

    def launch_app(self, app_name: str) -> Dict[str, Any]:
        """Launches target desktop application."""
        clean_name = app_name.lower().strip()
        cmd = APP_COMMANDS.get(clean_name, clean_name)
        try:
            logger.info(f"Launching application command: {cmd}")
            subprocess.Popen(cmd, shell=True)
            return {"success": True, "message": f"Launched '{app_name}' successfully."}
        except Exception as e:
            logger.error(f"Error launching app '{app_name}': {e}")
            return {"success": False, "error": str(e)}

    def execute_mouse_keyboard(self, action_type: str, details: Dict[str, Any]) -> Dict[str, Any]:
        """Safe UI automation using PyAutoGUI."""
        try:
            if action_type == "click":
                x = details.get("x")
                y = details.get("y")
                if x is not None and y is not None:
                    pyautogui.click(x, y)
                else:
                    pyautogui.click()
                return {"success": True, "message": f"Clicked at ({x}, {y})"}
            elif action_type == "type":
                text = details.get("text", "")
                pyautogui.write(text, interval=0.03)
                return {"success": True, "message": f"Typed text ({len(text)} chars)"}
            elif action_type == "hotkey":
                keys = details.get("keys", [])
                if keys:
                    pyautogui.hotkey(*keys)
                return {"success": True, "message": f"Pressed hotkey {keys}"}
            elif action_type == "press":
                key = details.get("key", "enter")
                pyautogui.press(key)
                return {"success": True, "message": f"Pressed key {key}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
        return {"success": False, "error": f"Unknown action {action_type}"}

    async def start_assist_mode(self, interval_sec: float = 3.0):
        """Starts background Assist Mode loop monitoring user workflow."""
        if self.is_assist_active:
            return
        self.is_assist_active = True
        self.assist_task = asyncio.create_task(self._assist_loop(interval_sec))
        logger.info(f"Assist Mode activated with interval: {interval_sec}s")

    async def stop_assist_mode(self):
        """Stops background Assist Mode loop."""
        self.is_assist_active = False
        if self.assist_task:
            self.assist_task.cancel()
            self.assist_task = None
        logger.info("Assist Mode deactivated.")

    async def _assist_loop(self, interval_sec: float):
        while self.is_assist_active:
            try:
                # Capture frame
                capture = screen_manager.capture_screen()
                window_title = capture["activeWindowTitle"]
                
                # Check for noticeable changes or developer context
                observation = {
                    "timestamp": time.time(),
                    "activeWindow": window_title,
                    "assistStatus": "monitoring",
                    "suggestion": None
                }

                # Proactive assistance triggers
                window_lower = window_title.lower()
                if "visual studio code" in window_lower or "vs code" in window_lower:
                    observation["suggestion"] = "Active in VS Code. KittyAI Coding Agent is ready to parse terminal errors and apply diff patches."
                elif "settings" in window_lower:
                    observation["suggestion"] = "Windows Settings open. Ask me if you need help finding or configuring any system option."
                elif "meet.google.com" in window_lower or "teams.microsoft.com" in window_lower or "zoom" in window_lower:
                    observation["suggestion"] = "Meeting window active. I can transcribe or delegate this meeting if needed."

                # Broadcast to connected listeners (WebSocket & HUD)
                for cb in self.assist_callbacks:
                    try:
                        if asyncio.iscoroutinefunction(cb):
                            await cb(observation)
                        else:
                            cb(observation)
                    except Exception as e:
                        logger.debug(f"Assist callback error: {e}")

                await asyncio.sleep(interval_sec)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in Assist Mode loop: {e}")
                await asyncio.sleep(interval_sec)

os_agent = OSAgent()
