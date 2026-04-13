use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lockbox {
    pub id: i64,
    pub name: String,
    pub content: String,
    pub category: Option<String>,
    pub is_locked: bool,
    pub unlock_delay_seconds: i64,
    pub relock_delay_seconds: i64,
    pub unlock_timestamp: Option<i64>,
    pub relock_timestamp: Option<i64>,
    pub created_at: i64,
    pub updated_at: i64,
    // Reflection modal
    pub reflection_enabled: bool,
    pub reflection_message: Option<String>,
    pub reflection_checklist: Option<String>, // JSON array stored as string
    // Penalty mode
    pub penalty_enabled: bool,
    pub penalty_seconds: i64,
    // Panic code
    pub panic_code_hash: Option<String>,
    pub panic_code_used: bool,
    // Scheduled unlock
    pub scheduled_unlock_at: Option<i64>,
    // Free tags
    pub tags: Option<String>, // JSON array e.g. '["urgent","work"]'
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateLockboxRequest {
    pub name: String,
    pub content: String,
    pub category: Option<String>,
    pub unlock_delay_seconds: i64,
    pub relock_delay_seconds: i64,
    pub reflection_enabled: bool,
    pub reflection_message: Option<String>,
    pub reflection_checklist: Option<String>,
    pub penalty_enabled: bool,
    pub penalty_seconds: i64,
    pub panic_code_hash: Option<String>,
    pub scheduled_unlock_at: Option<i64>,
    pub tags: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateLockboxRequest {
    pub id: i64,
    pub name: Option<String>,
    pub content: Option<String>,
    pub category: Option<String>,
    pub clear_category: bool,
    pub unlock_delay_seconds: Option<i64>,
    pub relock_delay_seconds: Option<i64>,
    pub reflection_enabled: Option<bool>,
    pub reflection_message: Option<String>,
    pub clear_reflection_message: bool,
    pub reflection_checklist: Option<String>,
    pub clear_reflection_checklist: bool,
    pub penalty_enabled: Option<bool>,
    pub penalty_seconds: Option<i64>,
    pub panic_code_hash: Option<String>,
    pub scheduled_unlock_at: Option<i64>,
    pub tags: Option<String>,
    pub clear_tags: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessLogEntry {
    pub id: i64,
    pub lockbox_id: i64,
    pub event_type: String,
    pub timestamp: i64,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new() -> Result<Self> {
        let db_path = Self::get_db_path();

        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).ok();
        }

        let conn = Connection::open(&db_path)?;
        let db = Database { conn };
        db.initialize()?;
        Ok(db)
    }

    fn get_db_path() -> PathBuf {
        if let Some(data_dir) = dirs::data_local_dir() {
            let app_dir = data_dir.join("com.lockbox.local");
            std::fs::create_dir_all(&app_dir).ok();
            app_dir.join("lockbox.db")
        } else {
            PathBuf::from("lockbox.db")
        }
    }

    fn initialize(&self) -> Result<()> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS lockboxes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                content TEXT NOT NULL,
                category TEXT,
                is_locked INTEGER NOT NULL DEFAULT 1,
                unlock_delay_seconds INTEGER NOT NULL DEFAULT 60,
                relock_delay_seconds INTEGER NOT NULL DEFAULT 3600,
                unlock_timestamp INTEGER,
                relock_timestamp INTEGER,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS access_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lockbox_id INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                FOREIGN KEY (lockbox_id) REFERENCES lockboxes(id) ON DELETE CASCADE
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_lockboxes_category ON lockboxes(category)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_access_log_lockbox ON access_log(lockbox_id, timestamp)",
            [],
        )?;

        self.migrate()?;
        Ok(())
    }

    fn migrate(&self) -> Result<()> {
        let version: i32 = self.conn.query_row("PRAGMA user_version", [], |r| r.get(0))?;

        if version < 1 {
            let _ = self.conn.execute("ALTER TABLE lockboxes ADD COLUMN reflection_enabled INTEGER NOT NULL DEFAULT 0", []);
            let _ = self.conn.execute("ALTER TABLE lockboxes ADD COLUMN reflection_message TEXT", []);
            let _ = self.conn.execute("ALTER TABLE lockboxes ADD COLUMN reflection_checklist TEXT", []);
            let _ = self.conn.execute("ALTER TABLE lockboxes ADD COLUMN penalty_enabled INTEGER NOT NULL DEFAULT 0", []);
            let _ = self.conn.execute("ALTER TABLE lockboxes ADD COLUMN penalty_seconds INTEGER NOT NULL DEFAULT 0", []);
            let _ = self.conn.execute("ALTER TABLE lockboxes ADD COLUMN panic_code_hash TEXT", []);
            let _ = self.conn.execute("ALTER TABLE lockboxes ADD COLUMN panic_code_used INTEGER NOT NULL DEFAULT 0", []);
            let _ = self.conn.execute("ALTER TABLE lockboxes ADD COLUMN scheduled_unlock_at INTEGER", []);
            self.conn.execute("PRAGMA user_version = 1", [])?;
        }

        if version < 2 {
            let _ = self.conn.execute("ALTER TABLE lockboxes ADD COLUMN tags TEXT", []);
            self.conn.execute("PRAGMA user_version = 2", [])?;
        }

        Ok(())
    }

    fn row_to_lockbox(row: &rusqlite::Row) -> rusqlite::Result<Lockbox> {
        Ok(Lockbox {
            id: row.get(0)?,
            name: row.get(1)?,
            content: row.get(2)?,
            category: row.get(3)?,
            is_locked: row.get::<_, i32>(4)? == 1,
            unlock_delay_seconds: row.get(5)?,
            relock_delay_seconds: row.get(6)?,
            unlock_timestamp: row.get(7)?,
            relock_timestamp: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
            reflection_enabled: row.get::<_, i32>(11).unwrap_or(0) == 1,
            reflection_message: row.get(12).unwrap_or(None),
            reflection_checklist: row.get(13).unwrap_or(None),
            penalty_enabled: row.get::<_, i32>(14).unwrap_or(0) == 1,
            penalty_seconds: row.get(15).unwrap_or(0),
            panic_code_hash: row.get(16).unwrap_or(None),
            panic_code_used: row.get::<_, i32>(17).unwrap_or(0) == 1,
            scheduled_unlock_at: row.get(18).unwrap_or(None),
            tags: row.get(19).unwrap_or(None),
        })
    }

    const SELECT_LOCKBOX: &'static str = "SELECT id, name, content, category, is_locked, \
        unlock_delay_seconds, relock_delay_seconds, unlock_timestamp, relock_timestamp, \
        created_at, updated_at, reflection_enabled, reflection_message, reflection_checklist, \
        penalty_enabled, penalty_seconds, panic_code_hash, panic_code_used, scheduled_unlock_at, \
        tags \
        FROM lockboxes";

    pub fn get_all_lockboxes(&self) -> Result<Vec<Lockbox>> {
        let query = format!("{} ORDER BY name ASC", Self::SELECT_LOCKBOX);
        let mut stmt = self.conn.prepare(&query)?;
        let lockboxes = stmt.query_map([], Self::row_to_lockbox)?;
        lockboxes.collect()
    }

    pub fn get_lockbox(&self, id: i64) -> Result<Option<Lockbox>> {
        let query = format!("{} WHERE id = ?", Self::SELECT_LOCKBOX);
        let mut stmt = self.conn.prepare(&query)?;
        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Self::row_to_lockbox(row)?))
        } else {
            Ok(None)
        }
    }

    pub fn create_lockbox(&self, req: CreateLockboxRequest) -> Result<Lockbox> {
        let now = chrono::Utc::now().timestamp_millis();

        self.conn.execute(
            "INSERT INTO lockboxes (name, content, category, is_locked, unlock_delay_seconds,
                relock_delay_seconds, created_at, updated_at,
                reflection_enabled, reflection_message, reflection_checklist,
                penalty_enabled, penalty_seconds, panic_code_hash, scheduled_unlock_at, tags)
             VALUES (?1, ?2, ?3, 1, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
            params![
                req.name,
                req.content,
                req.category,
                req.unlock_delay_seconds,
                req.relock_delay_seconds,
                now,
                now,
                req.reflection_enabled as i32,
                req.reflection_message,
                req.reflection_checklist,
                req.penalty_enabled as i32,
                req.penalty_seconds,
                req.panic_code_hash,
                req.scheduled_unlock_at,
                req.tags,
            ],
        )?;

        let id = self.conn.last_insert_rowid();
        self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn update_lockbox(&self, req: UpdateLockboxRequest) -> Result<Lockbox> {
        let now = chrono::Utc::now().timestamp_millis();
        let current = self.get_lockbox(req.id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)?;

        let category = if req.clear_category { None } else { req.category.or(current.category) };
        let reflection_message = if req.clear_reflection_message { None } else { req.reflection_message.or(current.reflection_message) };
        let reflection_checklist = if req.clear_reflection_checklist { None } else { req.reflection_checklist.or(current.reflection_checklist) };
        let tags = if req.clear_tags { None } else { req.tags.or(current.tags) };

        self.conn.execute(
            "UPDATE lockboxes SET
                name = ?1, content = ?2, category = ?3,
                unlock_delay_seconds = ?4, relock_delay_seconds = ?5,
                reflection_enabled = ?6, reflection_message = ?7, reflection_checklist = ?8,
                penalty_enabled = ?9, penalty_seconds = ?10, panic_code_hash = ?11,
                scheduled_unlock_at = ?12, tags = ?13, updated_at = ?14
             WHERE id = ?15",
            params![
                req.name.unwrap_or(current.name),
                req.content.unwrap_or(current.content),
                category,
                req.unlock_delay_seconds.unwrap_or(current.unlock_delay_seconds),
                req.relock_delay_seconds.unwrap_or(current.relock_delay_seconds),
                req.reflection_enabled.unwrap_or(current.reflection_enabled) as i32,
                reflection_message,
                reflection_checklist,
                req.penalty_enabled.unwrap_or(current.penalty_enabled) as i32,
                req.penalty_seconds.unwrap_or(current.penalty_seconds),
                req.panic_code_hash.or(current.panic_code_hash),
                req.scheduled_unlock_at.or(current.scheduled_unlock_at),
                tags,
                now,
                req.id,
            ],
        )?;

        self.log_access_event(req.id, "field_updated")?;
        self.get_lockbox(req.id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn delete_lockbox(&self, id: i64) -> Result<()> {
        self.conn.execute("DELETE FROM lockboxes WHERE id = ?", params![id])?;
        Ok(())
    }

    pub fn unlock_lockbox(&self, id: i64) -> Result<Lockbox> {
        let now = chrono::Utc::now().timestamp_millis();
        let current = self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)?;

        let unlock_timestamp = now + (current.unlock_delay_seconds * 1000);

        self.conn.execute(
            "UPDATE lockboxes SET unlock_timestamp = ?1, updated_at = ?2 WHERE id = ?3",
            params![unlock_timestamp, now, id],
        )?;

        self.log_access_event(id, "unlock_requested")?;
        self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn cancel_unlock(&self, id: i64) -> Result<Lockbox> {
        let now = chrono::Utc::now().timestamp_millis();
        let current = self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)?;

        let new_delay = if current.penalty_enabled {
            current.unlock_delay_seconds + current.penalty_seconds
        } else {
            current.unlock_delay_seconds
        };

        self.conn.execute(
            "UPDATE lockboxes SET is_locked = 1, unlock_timestamp = NULL, scheduled_unlock_at = NULL,
                unlock_delay_seconds = ?1, updated_at = ?2
             WHERE id = ?3",
            params![new_delay, now, id],
        )?;

        self.log_access_event(id, "unlock_cancelled")?;
        self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn extend_unlock_delay(&self, id: i64, additional_seconds: i64) -> Result<Lockbox> {
        let now = chrono::Utc::now().timestamp_millis();
        let current = self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)?;

        let additional_ms = additional_seconds * 1000;
        let new_delay = current.unlock_delay_seconds + additional_seconds;

        let new_unlock_timestamp = current.unlock_timestamp.map(|ts| ts + additional_ms);
        let new_scheduled = current.scheduled_unlock_at.map(|ts| ts + additional_ms);

        self.conn.execute(
            "UPDATE lockboxes SET unlock_delay_seconds = ?1, unlock_timestamp = ?2,
                scheduled_unlock_at = ?3, updated_at = ?4
             WHERE id = ?5",
            params![new_delay, new_unlock_timestamp, new_scheduled, now, id],
        )?;

        self.log_access_event(id, "extend_delay")?;
        self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn complete_unlock(&self, id: i64) -> Result<Lockbox> {
        let now = chrono::Utc::now().timestamp_millis();
        let current = self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)?;

        let relock_timestamp = now + (current.relock_delay_seconds * 1000);

        self.conn.execute(
            "UPDATE lockboxes SET is_locked = 0, unlock_timestamp = NULL,
                relock_timestamp = ?1, updated_at = ?2
             WHERE id = ?3",
            params![relock_timestamp, now, id],
        )?;

        self.log_access_event(id, "unlock_completed")?;
        self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn relock_lockbox(&self, id: i64) -> Result<Lockbox> {
        let now = chrono::Utc::now().timestamp_millis();

        self.conn.execute(
            "UPDATE lockboxes SET is_locked = 1, unlock_timestamp = NULL,
                relock_timestamp = NULL, updated_at = ?1
             WHERE id = ?2",
            params![now, id],
        )?;

        self.log_access_event(id, "relock_manual")?;
        self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn use_panic_code(&self, id: i64, code_hash: &str) -> Result<Option<Lockbox>> {
        let current = self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)?;

        let stored_hash = match &current.panic_code_hash {
            Some(h) => h.clone(),
            None => return Ok(None),
        };

        if current.panic_code_used {
            return Ok(None);
        }

        if stored_hash != code_hash {
            return Ok(None);
        }

        let now = chrono::Utc::now().timestamp_millis();
        let relock_timestamp = now + (current.relock_delay_seconds * 1000);

        self.conn.execute(
            "UPDATE lockboxes SET is_locked = 0, unlock_timestamp = NULL, scheduled_unlock_at = NULL,
                relock_timestamp = ?1, panic_code_used = 1, updated_at = ?2
             WHERE id = ?3",
            params![relock_timestamp, now, id],
        )?;

        self.log_access_event(id, "panic_used")?;
        Ok(Some(self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)?))
    }

    pub fn reset_panic_code(&self, id: i64, new_code_hash: Option<&str>) -> Result<Lockbox> {
        let now = chrono::Utc::now().timestamp_millis();

        self.conn.execute(
            "UPDATE lockboxes SET panic_code_hash = ?1, panic_code_used = 0, updated_at = ?2
             WHERE id = ?3",
            params![new_code_hash, now, id],
        )?;

        self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn log_access_event(&self, lockbox_id: i64, event_type: &str) -> Result<()> {
        let now = chrono::Utc::now().timestamp_millis();
        self.conn.execute(
            "INSERT INTO access_log (lockbox_id, event_type, timestamp) VALUES (?1, ?2, ?3)",
            params![lockbox_id, event_type, now],
        )?;
        Ok(())
    }

    pub fn get_access_log(&self, lockbox_id: i64) -> Result<Vec<AccessLogEntry>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, lockbox_id, event_type, timestamp FROM access_log
             WHERE lockbox_id = ? ORDER BY timestamp DESC LIMIT 50",
        )?;

        let entries = stmt.query_map(params![lockbox_id], |row| {
            Ok(AccessLogEntry {
                id: row.get(0)?,
                lockbox_id: row.get(1)?,
                event_type: row.get(2)?,
                timestamp: row.get(3)?,
            })
        })?;

        entries.collect()
    }

    pub fn get_global_access_log(&self) -> Result<Vec<AccessLogEntry>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, lockbox_id, event_type, timestamp FROM access_log
             ORDER BY timestamp DESC",
        )?;

        let entries = stmt.query_map([], |row| {
            Ok(AccessLogEntry {
                id: row.get(0)?,
                lockbox_id: row.get(1)?,
                event_type: row.get(2)?,
                timestamp: row.get(3)?,
            })
        })?;

        entries.collect()
    }

    pub fn get_setting(&self, key: &str) -> Result<Option<String>> {
        let mut stmt = self.conn.prepare("SELECT value FROM settings WHERE key = ?")?;
        let mut rows = stmt.query(params![key])?;

        if let Some(row) = rows.next()? {
            Ok(Some(row.get(0)?))
        } else {
            Ok(None)
        }
    }

    pub fn set_setting(&self, key: &str, value: &str) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
            params![key, value],
        )?;
        Ok(())
    }

    pub fn check_and_update_states(&self) -> Result<Vec<Lockbox>> {
        let now = chrono::Utc::now().timestamp_millis();

        // Collect IDs that will complete countdown-based unlock
        let countdown_ids: Vec<i64> = {
            let mut stmt = self.conn.prepare(
                "SELECT id FROM lockboxes WHERE is_locked = 1 AND unlock_timestamp IS NOT NULL AND unlock_timestamp <= ?1"
            )?;
            let ids: Vec<i64> = stmt.query_map(params![now], |row| row.get(0))?.filter_map(|r| r.ok()).collect();
            ids
        };

        self.conn.execute(
            "UPDATE lockboxes
             SET is_locked = 0,
                 relock_timestamp = ?1 + (relock_delay_seconds * 1000),
                 unlock_timestamp = NULL,
                 updated_at = ?1
             WHERE is_locked = 1 AND unlock_timestamp IS NOT NULL AND unlock_timestamp <= ?1",
            params![now],
        )?;

        for id in countdown_ids {
            let _ = self.log_access_event(id, "unlock_completed");
        }

        // Collect IDs that will complete scheduled unlock
        let scheduled_ids: Vec<i64> = {
            let mut stmt = self.conn.prepare(
                "SELECT id FROM lockboxes WHERE is_locked = 1 AND scheduled_unlock_at IS NOT NULL AND scheduled_unlock_at <= ?1 AND unlock_timestamp IS NULL"
            )?;
            let ids: Vec<i64> = stmt.query_map(params![now], |row| row.get(0))?.filter_map(|r| r.ok()).collect();
            ids
        };

        self.conn.execute(
            "UPDATE lockboxes
             SET is_locked = 0,
                 relock_timestamp = ?1 + (relock_delay_seconds * 1000),
                 scheduled_unlock_at = NULL,
                 updated_at = ?1
             WHERE is_locked = 1 AND scheduled_unlock_at IS NOT NULL AND scheduled_unlock_at <= ?1
               AND unlock_timestamp IS NULL",
            params![now],
        )?;

        for id in scheduled_ids {
            let _ = self.log_access_event(id, "scheduled_unlock_completed");
        }

        // Collect IDs that will auto-relock
        let relock_ids: Vec<i64> = {
            let mut stmt = self.conn.prepare(
                "SELECT id FROM lockboxes WHERE is_locked = 0 AND relock_timestamp IS NOT NULL AND relock_timestamp <= ?1"
            )?;
            let ids: Vec<i64> = stmt.query_map(params![now], |row| row.get(0))?.filter_map(|r| r.ok()).collect();
            ids
        };

        self.conn.execute(
            "UPDATE lockboxes
             SET is_locked = 1,
                 relock_timestamp = NULL,
                 updated_at = ?1
             WHERE is_locked = 0 AND relock_timestamp IS NOT NULL AND relock_timestamp <= ?1",
            params![now],
        )?;

        for id in relock_ids {
            let _ = self.log_access_event(id, "auto_relocked");
        }

        self.get_all_lockboxes()
    }
}
