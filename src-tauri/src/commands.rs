use crate::crypto;
use crate::db::{CreateLockboxRequest, Lockbox, UpdateLockboxRequest};
use crate::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportData {
    pub version: String,
    pub exported_at: i64,
    pub lockboxes: Vec<ExportLockbox>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportLockbox {
    pub name: String,
    pub content: String,
    pub category: Option<String>,
    pub unlock_delay_seconds: i64,
    pub relock_delay_seconds: i64,
}

#[tauri::command]
pub fn get_all_lockboxes(state: State<AppState>) -> Result<Vec<Lockbox>, String> {
    // Return lockboxes without decryption - content stays encrypted
    // Use get_lockbox(id) to get decrypted content for a specific lockbox
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_all_lockboxes().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_lockbox(id: i64, state: State<AppState>) -> Result<Option<Lockbox>, String> {
    // Get lockbox from db
    let mut lockbox = {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        db.get_lockbox(id).map_err(|e| e.to_string())?
    };
    
    // Get hash (separate lock scope)
    let hash_copy = {
        let password_hash = state.master_password_hash.lock().map_err(|e| e.to_string())?;
        password_hash.clone()
    };
    
    // Decrypt content if unlocked
    if let (Some(ref mut lb), Some(ref hash)) = (&mut lockbox, &hash_copy) {
        if !lb.is_locked {
            if let Ok(decrypted) = crypto::decrypt(&lb.content, hash) {
                lb.content = decrypted;
            }
        }
    }
    
    Ok(lockbox)
}

#[tauri::command]
pub fn create_lockbox(
    name: String,
    content: String,
    category: Option<String>,
    unlock_delay_seconds: i64,
    relock_delay_seconds: i64,
    state: State<AppState>,
) -> Result<Lockbox, String> {
    // Get master password hash (release lock before acquiring db lock)
    let hash_copy = {
        let password_hash = state.master_password_hash.lock().map_err(|e| e.to_string())?;
        password_hash.clone()
    };
    
    let encrypted_content = if let Some(ref hash) = hash_copy {
        crypto::encrypt(&content, hash).map_err(|e| e.to_string())?
    } else {
        // If no master password, store as-is (not recommended for production)
        content
    };

    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.create_lockbox(CreateLockboxRequest {
        name,
        content: encrypted_content,
        category,
        unlock_delay_seconds,
        relock_delay_seconds,
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_lockbox(
    id: i64,
    name: Option<String>,
    content: Option<String>,
    category: Option<String>,
    unlock_delay_seconds: Option<i64>,
    relock_delay_seconds: Option<i64>,
    state: State<AppState>,
) -> Result<Lockbox, String> {
    // Get hash copy first (release lock before acquiring db lock)
    let encrypted_content = if let Some(c) = content {
        let hash_copy = {
            let password_hash = state.master_password_hash.lock().map_err(|e| e.to_string())?;
            password_hash.clone()
        };
        if let Some(ref hash) = hash_copy {
            Some(crypto::encrypt(&c, hash).map_err(|e| e.to_string())?)
        } else {
            Some(c)
        }
    } else {
        None
    };

    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.update_lockbox(UpdateLockboxRequest {
        id,
        name,
        content: encrypted_content,
        category,
        unlock_delay_seconds,
        relock_delay_seconds,
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_lockbox(id: i64, state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_lockbox(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn unlock_lockbox(id: i64, state: State<AppState>) -> Result<Lockbox, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.unlock_lockbox(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn relock_lockbox(id: i64, state: State<AppState>) -> Result<Lockbox, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.relock_lockbox(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn check_and_update_lockboxes(state: State<AppState>) -> Result<Vec<Lockbox>, String> {
    // Just update states and return lockboxes - NO decryption here
    // Decryption is expensive (PBKDF2) and this runs every second
    // Content will be decrypted on-demand via get_lockbox_decrypted
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.check_and_update_states().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_master_password(password: String, state: State<AppState>) -> Result<(), String> {
    let hash = crypto::hash_password(&password);
    
    // Store in database
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.set_setting("master_password_hash", &hash)
        .map_err(|e| e.to_string())?;
    
    // Store in memory for session
    let mut password_hash = state.master_password_hash.lock().map_err(|e| e.to_string())?;
    *password_hash = Some(hash);
    
    Ok(())
}

#[tauri::command]
pub fn verify_master_password(password: String, state: State<AppState>) -> Result<bool, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    
    if let Some(stored_hash) = db.get_setting("master_password_hash").map_err(|e| e.to_string())? {
        let is_valid = crypto::verify_password(&password, &stored_hash);
        
        if is_valid {
            // Store hash in memory for session
            let mut password_hash = state.master_password_hash.lock().map_err(|e| e.to_string())?;
            *password_hash = Some(stored_hash);
        }
        
        Ok(is_valid)
    } else {
        Ok(false)
    }
}

#[tauri::command]
pub fn is_master_password_set(state: State<AppState>) -> Result<bool, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let setting = db.get_setting("master_password_hash").map_err(|e| e.to_string())?;
    Ok(setting.is_some())
}

#[tauri::command]
pub fn export_lockboxes(state: State<AppState>) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let lockboxes = db.get_all_lockboxes().map_err(|e| e.to_string())?;

    let export_data = ExportData {
        version: "2.0.0".to_string(),
        exported_at: chrono::Utc::now().timestamp_millis(),
        lockboxes: lockboxes
            .into_iter()
            .map(|lb| ExportLockbox {
                name: lb.name,
                content: lb.content,
                category: lb.category,
                unlock_delay_seconds: lb.unlock_delay_seconds,
                relock_delay_seconds: lb.relock_delay_seconds,
            })
            .collect(),
    };

    serde_json::to_string_pretty(&export_data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn import_lockboxes(data: String, state: State<AppState>) -> Result<Vec<String>, String> {
    let export_data: ExportData =
        serde_json::from_str(&data).map_err(|e| format!("Invalid file format: {}", e))?;

    let db = state.db.lock().map_err(|e| e.to_string())?;
    let existing = db.get_all_lockboxes().map_err(|e| e.to_string())?;
    let existing_names: std::collections::HashSet<_> = existing.iter().map(|lb| &lb.name).collect();

    let mut imported = Vec::new();

    for lb in export_data.lockboxes {
        if existing_names.contains(&lb.name) {
            continue; // Skip duplicates
        }

        db.create_lockbox(CreateLockboxRequest {
            name: lb.name.clone(),
            content: lb.content,
            category: lb.category,
            unlock_delay_seconds: lb.unlock_delay_seconds,
            relock_delay_seconds: lb.relock_delay_seconds,
        })
        .map_err(|e| e.to_string())?;

        imported.push(lb.name);
    }

    Ok(imported)
}
