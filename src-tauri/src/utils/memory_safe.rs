//! Memory-safe data handling utilities for Tauri applications
//!
//! This module provides utilities for handling data safely in Rust:
//! 1. Safe string handling to prevent buffer overflows
//! 2. Secure memory handling for sensitive data
//! 3. Zero-copy data processing where possible
//! 4. Sanitization of data crossing FFI boundaries

use log::warn;
use std::fmt;
use std::ptr;

/// A container for sensitive string data that will be zeroed when dropped
#[derive(Clone, Debug)]
pub struct SecureString {
    /// The sensitive data
    data: String,

    /// Whether this data contains sensitive information
    sensitive: bool,
}

impl SecureString {
    /// Create a new secure string
    pub fn new(data: impl Into<String>) -> Self {
        Self {
            data: data.into(),
            sensitive: true,
        }
    }

    /// Get a reference to the string as &str
    pub fn as_str(&self) -> &str {
        &self.data
    }

    /// Get the length of the string
    pub fn len(&self) -> usize {
        self.data.len()
    }

    /// Clear and zero the string's memory
    pub fn clear(&mut self) {
        if self.sensitive {
            // Zero out the memory before clearing
            unsafe {
                ptr::write_bytes(self.data.as_mut_ptr(), 0, self.data.capacity());
            }
        }
        self.data.clear();
    }
}

impl Drop for SecureString {
    fn drop(&mut self) {
        self.clear();
    }
}

impl fmt::Display for SecureString {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.sensitive {
            write!(f, "***REDACTED***")
        } else {
            write!(f, "{}", self.data)
        }
    }
}

impl AsRef<str> for SecureString {
    fn as_ref(&self) -> &str {
        &self.data
    }
}

/// Validator for input sent across FFI boundaries
pub struct BoundaryValidator;

impl BoundaryValidator {
    /// Validate a string to ensure it doesn't contain potentially harmful content
    pub fn validate_string(input: &str) -> bool {
        // Check for common code injection patterns
        let injection_patterns = [
            "<script",
            "javascript:",
            "data:text/html",
            "vbscript:",
            "onload=",
            "onerror=",
            "onclick=",
            "onmouseover=",
        ];

        for pattern in &injection_patterns {
            if input.to_lowercase().contains(pattern) {
                warn!(
                    "Potentially harmful content detected in string: {}",
                    pattern
                );
                return false;
            }
        }

        // Check for SQLi patterns (simplified)
        let sql_patterns = [
            "' OR ",
            "\" OR ",
            "' OR '1'='1",
            "\" OR \"1\"=\"1",
            "'; DROP TABLE",
            "\"; DROP TABLE",
            "'; SELECT ",
            "'; INSERT ",
        ];

        for pattern in &sql_patterns {
            if input.to_uppercase().contains(&pattern.to_uppercase()) {
                warn!("Potential SQL injection detected: {}", pattern);
                return false;
            }
        }

        // Check for null bytes
        if input.contains('\0') {
            warn!("Null byte detected in input string");
            return false;
        }

        true
    }

    /// Validate a path to prevent path traversal attacks
    pub fn validate_path(path: &str) -> bool {
        // Check for path traversal attempts
        let traversal_patterns = [
            "..",
            "~",
            "/etc/",
            "C:\\Windows\\",
            "/dev/",
            "/proc/",
            "/sys/",
            "/var/log/",
            "/root/",
            "/home/",
        ];

        for pattern in &traversal_patterns {
            if path.contains(pattern) {
                warn!("Potential path traversal detected: {}", pattern);
                return false;
            }
        }

        true
    }
}

/// Example usage of secure memory in a Tauri command
#[tauri::command]
pub fn handle_sensitive_data(sensitive_input: String) -> Result<String, String> {
    // Create a secure string to store sensitive data
    let mut secure_data = SecureString::new(sensitive_input);

    // Validate the input
    if !BoundaryValidator::validate_string(secure_data.as_str()) {
        return Err("Invalid input detected".into());
    }

    // Process the data (in a real app, you would do something useful here)
    let result = format!("Processed sensitive data of length: {}", secure_data.len());

    // Clear the sensitive data as soon as we're done with it
    secure_data.clear();

    Ok(result)
}

/// Example usage of secure memory in a Tauri command handling file paths
#[tauri::command]
pub fn validate_and_process_path(path: String) -> Result<String, String> {
    // Validate the path
    if !BoundaryValidator::validate_path(&path) {
        return Err("Invalid path detected".into());
    }

    // Process the path (in a real app, you would do something useful here)
    let result = format!("Processed path: {}", path);

    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_secure_string_zeroing() {
        let password = "SuperSecretPassword123!";

        // Create and then immediately drop a secure string
        {
            let _secure_password = SecureString::new(password);
            // The secure string goes out of scope here and should be zeroed
        }

        // No direct way to verify memory content in a test,
        // but this demonstrates the usage pattern
    }

    #[test]
    fn test_boundary_validator() {
        // Test invalid strings
        assert!(!BoundaryValidator::validate_string(
            "<script>alert(1)</script>"
        ));
        assert!(!BoundaryValidator::validate_string("javascript:alert(1)"));
        assert!(!BoundaryValidator::validate_string("' OR '1'='1"));

        // Test valid strings
        assert!(BoundaryValidator::validate_string("Hello, world!"));
        assert!(BoundaryValidator::validate_string("12345"));
        assert!(BoundaryValidator::validate_string("user@example.com"));

        // Test path validation
        assert!(!BoundaryValidator::validate_path("../../../etc/passwd"));
        assert!(!BoundaryValidator::validate_path("/etc/shadow"));
    }
}
