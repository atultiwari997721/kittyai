import os
import sys
from pathlib import Path

# Add project root and desktop dir to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "desktop"))

from app import (
    core_health_check,
    core_run_terminal,
    core_create_file,
    core_read_file,
    core_list_files,
    core_run_script,
    core_set_theme,
    core_set_volume,
    core_execute_tool,
    core_probe_ollama,
    core_get_capabilities
)

def run_tests():
    print("=== KritiAI Kernel & Tool Execution Tests ===")
    
    # 1. Health check
    h = core_health_check()
    print(f"1. Health Check: {h}")
    assert h.get("status") == "online", "Health check failed"

    # 2. Terminal execution
    term = core_run_terminal("echo 'Kernel Terminal Online'")
    print(f"2. Terminal Output: {term.get('stdout', '').strip()}")
    assert term.get("returncode") == 0, "Terminal execution failed"

    # 3. Filesystem create & read
    test_file = "test_kernel_artifact.txt"
    create_res = core_create_file(test_file, "KritiAI Kernel Execution Verified")
    print(f"3. File Create: {create_res}")
    assert create_res.get("success") is True, "File creation failed"

    read_res = core_read_file(test_file)
    print(f"4. File Read: {read_res.get('content')}")
    assert "KritiAI Kernel Execution Verified" in read_res.get("content", ""), "File read content mismatch"

    # 5. Tool Dispatcher (core_execute_tool)
    t_res = core_execute_tool("terminal_execute", {"command": "dir"})
    print(f"5. Tool Dispatch (terminal_execute): Success={t_res.get('returncode') == 0}")
    assert t_res.get("returncode") == 0

    theme_res = core_execute_tool("windows_set_theme", {"theme": "dark"})
    print(f"6. Tool Dispatch (windows_set_theme): {theme_res.get('message')}")

    vol_res = core_execute_tool("windows_set_volume", {"level": 70})
    print(f"7. Tool Dispatch (windows_set_volume): {vol_res.get('message')}")

    # 8. Capabilities check
    caps = core_get_capabilities()
    print(f"8. Capabilities Check: VSCode={caps.get('vscode')}, Ollama={caps.get('ollama')}, Terminal={caps.get('terminal')}")
    assert caps.get("terminal") is True
    assert caps.get("filesystem") is True

    # Clean up test file
    try:
        p = Path(__file__).resolve().parent.parent / test_file
        if p.exists():
            p.unlink()
            print("8. Cleaned up test artifact.")
    except Exception as e:
        print(f"Cleanup note: {e}")

    print("=== ALL KERNEL TESTS PASSED WITH 100% SUCCESS ===")

if __name__ == "__main__":
    run_tests()
