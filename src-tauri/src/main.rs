// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod crypto;
mod commands;

use std::sync::Mutex;
use db::Database;
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;

pub struct AppState {
    pub db: Mutex<Database>,
    pub master_password_hash: Mutex<Option<String>>,
}

fn parse_version(v: &str) -> Vec<u32> {
    v.split('.')
        .filter_map(|s| s.parse::<u32>().ok())
        .collect()
}

fn is_version_greater_or_equal(current: &str, required: &str) -> bool {
    let curr_parts = parse_version(current);
    let req_parts = parse_version(required);
    
    for i in 0..std::cmp::max(curr_parts.len(), req_parts.len()) {
        let c = curr_parts.get(i).unwrap_or(&0);
        let r = req_parts.get(i).unwrap_or(&0);
        if c > r { return true; }
        if c < r { return false; }
    }
    true
}

fn main() {
    // Fix blank window on Linux with certain GPU drivers
    #[cfg(target_os = "linux")]
    std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_version = app.package_info().version.to_string();

            // Initialize database here to handle errors gracefully
            match Database::new() {
                Ok(db) => {
                    // Check if the database requires a newer version of the app
                    if let Ok(Some(min_version)) = db.get_setting("min_app_version") {
                        if !is_version_greater_or_equal(&app_version, &min_version) {
                            app.dialog()
                                .message(&format!("Version obsolète.\n\nCette base de données a été modifiée par une version plus récente de Lockbox et nécessite au minimum la version {}.\nVous utilisez actuellement la version {}.\n\nVeuillez mettre à jour l'application pour accéder à vos données.", min_version, app_version))
                                .title("Mise à jour requise")
                                .kind(tauri_plugin_dialog::MessageDialogKind::Error)
                                .blocking_show();
                            
                            std::process::exit(1);
                        }
                    }

                    // Lock the database to the current version to prevent future downgrades
                    let _ = db.set_setting("min_app_version", &app_version);

                    app.manage(AppState {
                        db: Mutex::new(db),
                        master_password_hash: Mutex::new(None),
                    });
                    Ok(())
                }
                Err(e) => {
                    // Show a native error dialog if migration/initialization fails
                    app.dialog()
                        .message(&format!("Mise à jour bloquée.\n\nVeuillez fermer toutes les instances de l'application Lockbox avant de continuer.\n\nErreur: {}", e))
                        .title("Action requise")
                        .kind(tauri_plugin_dialog::MessageDialogKind::Error)
                        .blocking_show();
                    
                    // Exit the application cleanly
                    std::process::exit(1);
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_all_lockboxes,
            commands::get_lockbox,
            commands::create_lockbox,
            commands::update_lockbox,
            commands::delete_lockbox,
            commands::unlock_lockbox,
            commands::cancel_unlock,
            commands::extend_unlock_delay,
            commands::use_panic_code,
            commands::reset_panic_code,
            commands::get_access_log,
            commands::get_global_access_log,
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
