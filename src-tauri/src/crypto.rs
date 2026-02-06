use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use pbkdf2::pbkdf2_hmac;
use rand::RngCore;
use sha2::{Digest, Sha256};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CryptoError {
    #[error("Encryption failed")]
    EncryptionFailed,
    #[error("Decryption failed")]
    DecryptionFailed,
    #[error("Invalid data format")]
    InvalidFormat,
}

const SALT_LENGTH: usize = 16;
const NONCE_LENGTH: usize = 12;
const KEY_LENGTH: usize = 32;
const PBKDF2_ITERATIONS: u32 = 100_000;

/// Derives a 256-bit key from a password using PBKDF2
fn derive_key(password: &str, salt: &[u8]) -> [u8; KEY_LENGTH] {
    let mut key = [0u8; KEY_LENGTH];
    pbkdf2_hmac::<Sha256>(password.as_bytes(), salt, PBKDF2_ITERATIONS, &mut key);
    key
}

/// Encrypts content using AES-256-GCM
/// Returns base64 encoded: salt || nonce || ciphertext
pub fn encrypt(content: &str, password: &str) -> Result<String, CryptoError> {
    // Generate random salt and nonce
    let mut salt = [0u8; SALT_LENGTH];
    let mut nonce_bytes = [0u8; NONCE_LENGTH];
    OsRng.fill_bytes(&mut salt);
    OsRng.fill_bytes(&mut nonce_bytes);

    // Derive key from password
    let key = derive_key(password, &salt);
    let cipher = Aes256Gcm::new_from_slice(&key).map_err(|_| CryptoError::EncryptionFailed)?;
    let nonce = Nonce::from_slice(&nonce_bytes);

    // Encrypt the content
    let ciphertext = cipher
        .encrypt(nonce, content.as_bytes())
        .map_err(|_| CryptoError::EncryptionFailed)?;

    // Combine salt + nonce + ciphertext and encode as base64
    let mut combined = Vec::with_capacity(SALT_LENGTH + NONCE_LENGTH + ciphertext.len());
    combined.extend_from_slice(&salt);
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&ciphertext);

    Ok(BASE64.encode(&combined))
}

/// Decrypts content encrypted with encrypt()
pub fn decrypt(encrypted: &str, password: &str) -> Result<String, CryptoError> {
    // Decode base64
    let combined = BASE64
        .decode(encrypted)
        .map_err(|_| CryptoError::InvalidFormat)?;

    if combined.len() < SALT_LENGTH + NONCE_LENGTH {
        return Err(CryptoError::InvalidFormat);
    }

    // Extract salt, nonce, and ciphertext
    let salt = &combined[..SALT_LENGTH];
    let nonce_bytes = &combined[SALT_LENGTH..SALT_LENGTH + NONCE_LENGTH];
    let ciphertext = &combined[SALT_LENGTH + NONCE_LENGTH..];

    // Derive key and decrypt
    let key = derive_key(password, salt);
    let cipher = Aes256Gcm::new_from_slice(&key).map_err(|_| CryptoError::DecryptionFailed)?;
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| CryptoError::DecryptionFailed)?;

    String::from_utf8(plaintext).map_err(|_| CryptoError::DecryptionFailed)
}

/// Hashes the master password for storage verification
pub fn hash_password(password: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    hex::encode(hasher.finalize())
}

/// Verifies a password against its hash
pub fn verify_password(password: &str, hash: &str) -> bool {
    hash_password(password) == hash
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let content = "Hello, World!";
        let password = "secret123";
        
        let encrypted = encrypt(content, password).unwrap();
        let decrypted = decrypt(&encrypted, password).unwrap();
        
        assert_eq!(content, decrypted);
    }

    #[test]
    fn test_wrong_password() {
        let content = "Hello, World!";
        let password = "secret123";
        let wrong_password = "wrong";
        
        let encrypted = encrypt(content, password).unwrap();
        let result = decrypt(&encrypted, wrong_password);
        
        assert!(result.is_err());
    }

    #[test]
    fn test_password_hash() {
        let password = "mypassword";
        let hash = hash_password(password);
        
        assert!(verify_password(password, &hash));
        assert!(!verify_password("wrongpassword", &hash));
    }
}
