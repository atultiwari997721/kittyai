import zipfile
import os

files_to_zip = [
    ("public/downloads/Install-KritiAI.ps1", "Install-KritiAI.ps1"),
    ("public/downloads/KritiAI-Setup.bat", "KritiAI-Setup.bat"),
]

readme_content = """===================================================================
             ⚡ KritiAI - Personal AI Operating System
        "Your Personal AI That Gets Things Done."
===================================================================

Thank you for downloading KritiAI for Windows!

DEFAULT RUNTIME PORT: 9972
(Accessible in your browser at: http://localhost:9972)

QUICK START INSTRUCTIONS:
1. Double-click 'KritiAI-Setup.bat' to launch KritiAI.
2. The launcher will check Python, Ollama, start the local AI sidecar on port 8000, and launch the assistant on port 9972.
3. Use the floating Assist HUD shortcut: Ctrl+Shift+Space (or Alt+K) anytime.

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
    zf.writestr("README.txt", readme_content)

print(f"Created {zip_path} with {len(files_to_zip) + 1} files.")
