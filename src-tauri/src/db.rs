use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lockbox {
    pub id: i64,
    pub name: String,
    pub content: String,           // Encrypted content
    pub category: Option<String>,
    pub is_locked: bool,
    pub unlock_delay_seconds: i64,
    pub relock_delay_seconds: i64,
    pub unlock_timestamp: Option<i64>,  // When box will unlock (epoch ms)
    pub relock_timestamp: Option<i64>,  // When box will relock (epoch ms)
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateLockboxRequest {
    pub name: String,
    pub content: String,
    pub category: Option<String>,
    pub unlock_delay_seconds: i64,
    pub relock_delay_seconds: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateLockboxRequest {
    pub id: i64,
    pub name: Option<String>,
    pub content: Option<String>,
    pub category: Option<String>,
    pub unlock_delay_seconds: Option<i64>,
    pub relock_delay_seconds: Option<i64>,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new() -> Result<Self> {
        let db_path = Self::get_db_path();
        
        // Ensure parent directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).ok();
        }

        let conn = Connection::open(&db_path)?;
        let db = Database { conn };
        db.initialize()?;
        Ok(db)
    }

    fn get_db_path() -> PathBuf {
        // Try to use app data directory, fallback to current directory
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

        // Create index for faster searches
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_lockboxes_category ON lockboxes(category)",
            [],
        )?;

        Ok(())
    }

    pub fn get_all_lockboxes(&self) -> Result<Vec<Lockbox>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, content, category, is_locked, unlock_delay_seconds, 
                    relock_delay_seconds, unlock_timestamp, relock_timestamp, 
                    created_at, updated_at 
             FROM lockboxes 
             ORDER BY name ASC"
        )?;

        let lockboxes = stmt.query_map([], |row| {
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
            })
        })?;

        lockboxes.collect()
    }

    pub fn get_lockbox(&self, id: i64) -> Result<Option<Lockbox>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, content, category, is_locked, unlock_delay_seconds, 
                    relock_delay_seconds, unlock_timestamp, relock_timestamp, 
                    created_at, updated_at 
             FROM lockboxes 
             WHERE id = ?"
        )?;

        let mut rows = stmt.query(params![id])?;
        
        if let Some(row) = rows.next()? {
            Ok(Some(Lockbox {
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
            }))
        } else {
            Ok(None)
        }
    }

    pub fn create_lockbox(&self, req: CreateLockboxRequest) -> Result<Lockbox> {
        let now = chrono::Utc::now().timestamp_millis();
        
        self.conn.execute(
            "INSERT INTO lockboxes (name, content, category, is_locked, unlock_delay_seconds, 
                                   relock_delay_seconds, created_at, updated_at)
             VALUES (?1, ?2, ?3, 1, ?4, ?5, ?6, ?7)",
            params![
                req.name,
                req.content,
                req.category,
                req.unlock_delay_seconds,
                req.relock_delay_seconds,
                now,
                now
            ],
        )?;

        let id = self.conn.last_insert_rowid();
        self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn update_lockbox(&self, req: UpdateLockboxRequest) -> Result<Lockbox> {
        let now = chrono::Utc::now().timestamp_millis();
        let current = self.get_lockbox(req.id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)?;

        self.conn.execute(
            "UPDATE lockboxes SET 
                name = ?1, content = ?2, category = ?3, 
                unlock_delay_seconds = ?4, relock_delay_seconds = ?5, updated_at = ?6
             WHERE id = ?7",
            params![
                req.name.unwrap_or(current.name),
                req.content.unwrap_or(current.content),
                req.category.or(current.category),
                req.unlock_delay_seconds.unwrap_or(current.unlock_delay_seconds),
                req.relock_delay_seconds.unwrap_or(current.relock_delay_seconds),
                now,
                req.id
            ],
        )?;

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

        self.get_lockbox(id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
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

    // Check and update lockbox states based on timestamps
    pub fn check_and_update_states(&self) -> Result<Vec<Lockbox>> {
        let now = chrono::Utc::now().timestamp_millis();
        
        // Complete unlocks for boxes whose unlock_timestamp has passed
        self.conn.execute(
            "UPDATE lockboxes 
             SET is_locked = 0, 
                 relock_timestamp = ?1 + (relock_delay_seconds * 1000),
                 unlock_timestamp = NULL,
                 updated_at = ?1
             WHERE is_locked = 1 AND unlock_timestamp IS NOT NULL AND unlock_timestamp <= ?1",
            params![now],
        )?;

        // Relock boxes whose relock_timestamp has passed
        self.conn.execute(
            "UPDATE lockboxes 
             SET is_locked = 1, 
                 relock_timestamp = NULL,
                 updated_at = ?1
             WHERE is_locked = 0 AND relock_timestamp IS NOT NULL AND relock_timestamp <= ?1",
            params![now],
        )?;

        self.get_all_lockboxes()
    }
}
