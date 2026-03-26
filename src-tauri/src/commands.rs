use crate::crypto;
use crate::db::{AccessLogEntry, CreateLockboxRequest, Lockbox, UpdateLockboxRequest};
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
    // Advanced fields (added in v2)
    #[serde(default)]
    pub reflection_enabled: bool,
    #[serde(default)]
    pub reflection_message: Option<String>,
    #[serde(default)]
    pub reflection_checklist: Option<String>,
    #[serde(default)]
    pub penalty_enabled: bool,
    #[serde(default)]
    pub penalty_seconds: i64,
    #[serde(default)]
    pub tags: Option<String>,
    /// HMAC-SHA256 signature of security-critical fields.
    /// Prevents tampering with delays / content after export.
    #[serde(default)]
    pub signature: Option<String>,
}

/// Builds the canonical string that is HMAC-signed for a lockbox.
/// Only security-critical fields are included.
fn lockbox_sign_data(
    name: &str,
    content: &str,
    unlock_delay_seconds: i64,
    relock_delay_seconds: i64,
    penalty_enabled: bool,
    penalty_seconds: i64,
) -> String {
    format!(
        "{name}|{content}|{unlock}|{relock}|{penalty}|{penalty_sec}",
        name = name,
        content = content,
        unlock = unlock_delay_seconds,
        relock = relock_delay_seconds,
        penalty = if penalty_enabled { "1" } else { "0" },
        penalty_sec = penalty_seconds,
    )
}

#[tauri::command]
pub fn get_all_lockboxes(state: State<AppState>) -> Result<Vec<Lockbox>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_all_lockboxes().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_lockbox(id: i64, state: State<AppState>) -> Result<Option<Lockbox>, String> {
    let mut lockbox = {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        db.get_lockbox(id).map_err(|e| e.to_string())?
    };

    let hash_copy = {
        let password_hash = state.master_password_hash.lock().map_err(|e| e.to_string())?;
        password_hash.clone()
    };

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
    reflection_enabled: bool,
    reflection_message: Option<String>,
    reflection_checklist: Option<String>,
    penalty_enabled: bool,
    penalty_seconds: i64,
    panic_code: Option<String>,
    scheduled_unlock_at: Option<i64>,
    tags: Option<String>,
    state: State<AppState>,
) -> Result<Lockbox, String> {
    let hash_copy = {
        let password_hash = state.master_password_hash.lock().map_err(|e| e.to_string())?;
        password_hash.clone()
    };

    let encrypted_content = if let Some(ref hash) = hash_copy {
        crypto::encrypt(&content, hash).map_err(|e| e.to_string())?
    } else {
        content
    };

    let panic_code_hash = panic_code.map(|c| crypto::hash_password(&c));

    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.create_lockbox(CreateLockboxRequest {
        name,
        content: encrypted_content,
        category,
        unlock_delay_seconds,
        relock_delay_seconds,
        reflection_enabled,
        reflection_message,
        reflection_checklist,
        penalty_enabled,
        penalty_seconds,
        panic_code_hash,
        scheduled_unlock_at,
        tags,
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
    reflection_enabled: Option<bool>,
    reflection_message: Option<String>,
    reflection_checklist: Option<String>,
    penalty_enabled: Option<bool>,
    penalty_seconds: Option<i64>,
    panic_code: Option<String>,
    scheduled_unlock_at: Option<i64>,
    tags: Option<String>,
    state: State<AppState>,
) -> Result<Lockbox, String> {
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

    let panic_code_hash = panic_code.map(|c| crypto::hash_password(&c));

    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.update_lockbox(UpdateLockboxRequest {
        id,
        name,
        content: encrypted_content,
        category,
        unlock_delay_seconds,
        relock_delay_seconds,
        reflection_enabled,
        reflection_message,
        reflection_checklist,
        penalty_enabled,
        penalty_seconds,
        panic_code_hash,
        scheduled_unlock_at,
        tags,
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
pub fn cancel_unlock(id: i64, state: State<AppState>) -> Result<Lockbox, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.cancel_unlock(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn extend_unlock_delay(
    id: i64,
    additional_seconds: i64,
    state: State<AppState>,
) -> Result<Lockbox, String> {
    if additional_seconds <= 0 {
        return Err("Additional delay must be positive".to_string());
    }
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.extend_unlock_delay(id, additional_seconds)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn use_panic_code(id: i64, code: String, state: State<AppState>) -> Result<Option<Lockbox>, String> {
    let code_hash = crypto::hash_password(&code);
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.use_panic_code(id, &code_hash).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reset_panic_code(
    id: i64,
    new_code: Option<String>,
    state: State<AppState>,
) -> Result<Lockbox, String> {
    let new_code_hash = new_code.map(|c| crypto::hash_password(&c));
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.reset_panic_code(id, new_code_hash.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_access_log(
    lockbox_id: i64,
    state: State<AppState>,
) -> Result<Vec<AccessLogEntry>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_access_log(lockbox_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_global_access_log(state: State<AppState>) -> Result<Vec<AccessLogEntry>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_global_access_log().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn relock_lockbox(id: i64, state: State<AppState>) -> Result<Lockbox, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.relock_lockbox(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn check_and_update_lockboxes(state: State<AppState>) -> Result<Vec<Lockbox>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.check_and_update_states().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_master_password(password: String, state: State<AppState>) -> Result<(), String> {
    let hash = crypto::hash_password(&password);

    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.set_setting("master_password_hash", &hash)
        .map_err(|e| e.to_string())?;

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
    let master_hash = {
        let pw = state.master_password_hash.lock().map_err(|e| e.to_string())?;
        pw.clone()
    };
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let lockboxes = db.get_all_lockboxes().map_err(|e| e.to_string())?;

    let export_data = ExportData {
        version: "2.0.0".to_string(),
        exported_at: chrono::Utc::now().timestamp_millis(),
        lockboxes: lockboxes
            .into_iter()
            .map(|lb| {
                let sign_data = lockbox_sign_data(
                    &lb.name,
                    &lb.content,
                    lb.unlock_delay_seconds,
                    lb.relock_delay_seconds,
                    lb.penalty_enabled,
                    lb.penalty_seconds,
                );
                let signature = master_hash.as_deref().map(|key| crypto::hmac_sign(&sign_data, key));
                ExportLockbox {
                    name: lb.name,
                    content: lb.content,
                    category: lb.category,
                    unlock_delay_seconds: lb.unlock_delay_seconds,
                    relock_delay_seconds: lb.relock_delay_seconds,
                    reflection_enabled: lb.reflection_enabled,
                    reflection_message: lb.reflection_message,
                    reflection_checklist: lb.reflection_checklist,
                    penalty_enabled: lb.penalty_enabled,
                    penalty_seconds: lb.penalty_seconds,
                    tags: lb.tags,
                    signature,
                }
            })
            .collect(),
    };

    serde_json::to_string_pretty(&export_data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn import_lockboxes(
    data: String,
    source_password: Option<String>,
    state: State<AppState>,
) -> Result<Vec<String>, String> {
    let export_data: ExportData =
        serde_json::from_str(&data).map_err(|e| format!("Invalid file format: {}", e))?;

    // Get current master password hash for re-encryption
    let current_hash = {
        let password_hash = state.master_password_hash.lock().map_err(|e| e.to_string())?;
        password_hash.clone()
    };

    // If a source password is provided, compute its hash for decryption
    let source_hash = source_password.map(|p| crypto::hash_password(&p));

    let db = state.db.lock().map_err(|e| e.to_string())?;
    let existing = db.get_all_lockboxes().map_err(|e| e.to_string())?;
    let existing_names: std::collections::HashSet<_> = existing.iter().map(|lb| &lb.name).collect();

    let mut imported = Vec::new();

    for lb in export_data.lockboxes {
        if existing_names.contains(&lb.name) {
            continue;
        }

        // Verify HMAC signature before doing anything with this lockbox.
        // Use source hash if provided (cross-machine), otherwise current hash.
        let verify_key = source_hash.as_deref().or(current_hash.as_deref());
        if let (Some(sig), Some(key)) = (&lb.signature, verify_key) {
            let sign_data = lockbox_sign_data(
                &lb.name,
                &lb.content,
                lb.unlock_delay_seconds,
                lb.relock_delay_seconds,
                lb.penalty_enabled,
                lb.penalty_seconds,
            );
            if !crypto::hmac_verify(&sign_data, key, sig) {
                return Err(format!(
                    "Integrity check failed for '{}': the file may have been tampered with.",
                    lb.name
                ));
            }
        }

        // If source hash differs from current hash, decrypt then re-encrypt
        let final_content = match (&source_hash, &current_hash) {
            (Some(src), Some(cur)) if src != cur => {
                let decrypted = crypto::decrypt(&lb.content, src)
                    .map_err(|_| format!("Failed to decrypt '{}': wrong source password?", lb.name))?;
                crypto::encrypt(&decrypted, cur).map_err(|e| e.to_string())?
            }
            _ => lb.content, // same machine / same password: keep as-is
        };

        db.create_lockbox(CreateLockboxRequest {
            name: lb.name.clone(),
            content: final_content,
            category: lb.category,
            unlock_delay_seconds: lb.unlock_delay_seconds,
            relock_delay_seconds: lb.relock_delay_seconds,
            reflection_enabled: lb.reflection_enabled,
            reflection_message: lb.reflection_message,
            reflection_checklist: lb.reflection_checklist,
            penalty_enabled: lb.penalty_enabled,
            penalty_seconds: lb.penalty_seconds,
            panic_code_hash: None, // panic code hashes cannot be transferred
            scheduled_unlock_at: None, // scheduled dates are not restored on import
            tags: lb.tags,
        })
        .map_err(|e| e.to_string())?;

        imported.push(lb.name);
    }

    Ok(imported)
}
