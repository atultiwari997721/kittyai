import zipfile
import os
from pathlib import Path

files_to_zip = [
    ("public/downloads/KritiAI.exe", "KritiAI.exe"),
    ("public/downloads/KritiAI.vbs", "KritiAI.vbs"),
    ("public/downloads/KritiAI-Launcher.bat", "KritiAI-Launcher.bat"),
    ("public/downloads/KritiAI-Setup.bat", "KritiAI-Setup.bat"),
    ("public/downloads/Install-KritiAI.ps1", "Install-KritiAI.ps1"),
    ("desktop/app.py", "desktop/app.py"),
    ("desktop/requirements.txt", "desktop/requirements.txt"),
]

readme_content = """===================================================================
             ⚡ KritiAI - Personal AI Operating System
        "Your Personal AI That Gets Things Done."
===================================================================

Thank you for downloading KritiAI for Windows!

DEFAULT RUNTIME PORT: 9972
(Accessible in your browser at: http://localhost:9972)

QUICK START INSTRUCTIONS:
1. Double-click 'KritiAI.exe' (or 'KritiAI-Launcher.bat') to launch KritiAI instantly with 1-click.
2. The native desktop kernel starts automatically and opens the desktop interface.
3. Link with the website:
   - On the website (https://kritiai.vercel.app), click "Pair Desktop".
   - Enter the 6-digit alphanumeric code (e.g. KR72B9).
   - Your website and desktop app are now connected and will auto-reconnect!
4. Real Superpowers Active:
   - Live PowerShell / CMD terminal execution.
   - AI Code Studio: generate code with Groq Llama 3.3 70B or Gemini.
   - Create files and folders directly in your chosen workspace directory.
   - Run Python, Node.js, PowerShell, and Batch scripts with live logs.

SECURITY & VERIFICATION:
- 100% clean and transparent scripts.
- No malicious code, no false-positive virus detections.
- Runs completely offline when paired with local Ollama.

Documentation: https://kritiai.vercel.app/docs
Support: support@kritiai.app
"""

zip_path = "public/downloads/KritiAI-Windows-Portable.zip"
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for src, arc in files_to_zip:
        if os.path.exists(src):
            zf.write(src, arc)
            print(f"Added: {src} -> {arc}")
        else:
            print(f"Warning: {src} does not exist!")

    # Include dist files so the desktop app can serve offline without running build
    dist_dir = Path("dist")
    if dist_dir.exists():
        for file in dist_dir.rglob("*"):
            if file.is_file():
                arcname = f"dist/{file.relative_to(dist_dir)}"
                zf.write(file, arcname)
        print("Added complete dist/ bundle for standalone zero-config execution.")

    zf.writestr("README.txt", readme_content)
    print("Added: README.txt")

print(f"Successfully packaged {zip_path} ({os.path.getsize(zip_path)} bytes).")
