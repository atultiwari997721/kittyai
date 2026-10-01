import zipfile
import os
from pathlib import Path

payload_zip = "installer/payload.zip"
os.makedirs("installer", exist_ok=True)

files_to_pack = [
    ("public/downloads/KritiAI.exe", "KritiAI.exe"),
    ("public/downloads/KritiAI.vbs", "KritiAI.vbs"),
    ("public/downloads/KritiAI-Launcher.bat", "KritiAI-Launcher.bat"),
    ("desktop/app.py", "desktop/app.py"),
]

with zipfile.ZipFile(payload_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    for src, arc in files_to_pack:
        if os.path.exists(src):
            zf.write(src, arc)
            print(f"Packaged: {src} -> {arc}")
        else:
            print(f"Missing: {src}")

    # Add web frontend bundle (skipping downloads folder inside dist)
    dist_dir = Path("dist")
    if dist_dir.exists():
        for file in dist_dir.rglob("*"):
            if file.is_file() and "downloads" not in file.parts:
                arcname = f"dist/{file.relative_to(dist_dir)}"
                zf.write(file, arcname)
        print("Packaged dist/ web frontend bundle.")

print(f"Created {payload_zip} ({os.path.getsize(payload_zip)} bytes).")
