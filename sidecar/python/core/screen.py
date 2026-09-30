import io
import base64
import logging
from typing import Optional, Tuple, Dict, Any
from PIL import Image, ImageChops
import mss

logger = logging.getLogger("kittyai.screen")

# Optional Windows API imports
try:
    import win32gui
    import win32process
    HAS_WIN32 = True
except ImportError:
    HAS_WIN32 = False

class ScreenManager:
    def __init__(self):
        self.last_captured_frame: Optional[Image.Image] = None
        self.sct = mss.mss()

    def get_active_window_title(self) -> str:
        """Returns the title of the currently focused foreground window on Windows."""
        if HAS_WIN32:
            try:
                hwnd = win32gui.GetForegroundWindow()
                title = win32gui.GetWindowText(hwnd)
                return title if title else "Desktop"
            except Exception as e:
                logger.debug(f"Error getting window title: {e}")
        else:
            try:
                import ctypes
                hwnd = ctypes.windll.user32.GetForegroundWindow()
                length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
                buff = ctypes.create_unicode_buffer(length + 1)
                ctypes.windll.user32.GetWindowTextW(hwnd, buff, length + 1)
                return buff.value if buff.value else "Desktop"
            except Exception:
                pass
        return "Windows Desktop"

    def get_window_rect(self, target_substring: str) -> Optional[Tuple[int, int, int, int]]:
        """Finds window rectangle (left, top, width, height) matching target_substring."""
        if not HAS_WIN32:
            return None
        
        found_rect = None
        def enum_windows_callback(hwnd, extra):
            nonlocal found_rect
            if win32gui.IsWindowVisible(hwnd):
                title = win32gui.GetWindowText(hwnd)
                if target_substring.lower() in title.lower():
                    rect = win32gui.GetWindowRect(hwnd)
                    left, top, right, bottom = rect
                    width = right - left
                    height = bottom - top
                    if width > 100 and height > 100:
                        found_rect = (left, top, width, height)
        
        try:
            win32gui.EnumWindows(enum_windows_callback, None)
        except Exception as e:
            logger.debug(f"Window enumeration error: {e}")
        return found_rect

    def capture_screen(
        self,
        target_app: Optional[str] = None,
        max_dimension: int = 1280
    ) -> Dict[str, Any]:
        """
        Captures the primary monitor or targeted app window, resizes for LLM efficiency,
        and returns base64 PNG data + window title.
        """
        active_title = self.get_active_window_title()
        monitor_bbox = None

        if target_app:
            rect = self.get_window_rect(target_app)
            if rect:
                left, top, width, height = rect
                monitor_bbox = {"left": max(0, left), "top": max(0, top), "width": width, "height": height}

        if not monitor_bbox:
            monitor_bbox = self.sct.monitors[1] # Primary monitor

        # Grab screenshot
        sct_img = self.sct.grab(monitor_bbox)
        img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")

        # Resize for optimal token efficiency while preserving readability
        if max(img.width, img.height) > max_dimension:
            ratio = max_dimension / max(img.width, img.height)
            new_size = (int(img.width * ratio), int(img.height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)

        # Encode to PNG base64
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        base64_str = base64.b64encode(buf.getvalue()).decode("utf-8")

        self.last_captured_frame = img

        return {
            "base64Png": base64_str,
            "width": img.width,
            "height": img.height,
            "activeWindowTitle": active_title
        }

    def compute_frame_difference(self, new_img: Image.Image) -> float:
        """
        Computes percentage difference between the last frame and new frame.
        Returns value between 0.0 (identical) and 1.0 (completely changed).
        """
        if self.last_captured_frame is None:
            return 1.0

        if self.last_captured_frame.size != new_img.size:
            return 1.0

        diff = ImageChops.difference(self.last_captured_frame, new_img)
        stat = diff.convert("L").getdata()
        non_zero = sum(1 for p in stat if p > 25)
        diff_ratio = non_zero / len(stat)
        return diff_ratio

screen_manager = ScreenManager()
