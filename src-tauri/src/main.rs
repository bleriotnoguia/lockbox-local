// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod crypto;
mod commands;

use std::sync::Mutex;
use db::Database;

pub struct AppState {
    pub db: Mutex<Database>,
    pub master_password_hash: Mutex<Option<String>>,
}

fn main() {
    // Fix blank window on Linux with certain GPU drivers
    #[cfg(target_os = "linux")]
    std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");

    let db = Database::new().expect("Failed to initialize database");
    
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            db: Mutex::new(db),
            master_password_hash: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_all_lockboxes,
            commands::get_lockbox,
            commands::create_lockbox,
            commands::update_lockbox,
            commands::delete_lockbox,
            commands::unlock_lockbox,
            commands::relock_lockbox,
            commands::export_lockboxes,
            commands::import_lockboxes,
            commands::set_master_password,
            commands::verify_master_password,
            commands::is_master_password_set,
            commands::check_and_update_lockboxes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
