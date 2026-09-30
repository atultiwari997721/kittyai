use tauri::Manager;

#[tauri::command]
fn toggle_overlay_window(app_handle: tauri::AppHandle) -> Result<bool, String> {
    if let Some(window) = app_handle.get_webview_window("assist-overlay") {
        let is_visible = window.is_visible().unwrap_or(false);
        if is_visible {
            let _ = window.hide();
            Ok(false)
        } else {
            let _ = window.show();
            let _ = window.set_focus();
            Ok(true)
        }
    } else {
        Err("Overlay window not found".to_string())
    }
}

#[tauri::command]
fn set_overlay_ignore_cursor(app_handle: tauri::AppHandle, ignore: bool) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("assist-overlay") {
        let _ = window.set_ignore_cursor_events(ignore);
        Ok(())
    } else {
        Err("Overlay window not found".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            toggle_overlay_window,
            set_overlay_ignore_cursor
        ])
        .run(tauri::generate_context!())
        .expect("error while running KittyAI desktop application");
}
