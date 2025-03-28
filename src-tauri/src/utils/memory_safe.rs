//! Memory-safe data handling utilities for Tauri applications
//! 
//! This module provides utilities for handling data safely in Rust:
//! 1. Safe string handling to prevent buffer overflows
//! 2. Secure memory handling for sensitive data
//! 3. Zero-copy data processing where possible
//! 4. Sanitization of data crossing FFI boundaries

use std::fmt;
use std::ops::{Deref, DerefMut};
use std::ptr;
use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use thiserror::Error;
use once_cell::sync::Lazy;
use log::{debug, error, warn};

/// Errors related to secure memory operations
#[derive(Error, Debug)]
pub enum SecureMemoryError {
    #[error("Failed to allocate secure memory: {0}")]
    AllocationFailed(String),
    
    #[error("Failed to lock memory: {0}")]
    LockFailed(String),
    
    #[error("Memory operation failed: {0}")]
    OperationFailed(String),
    
    #[error("Invalid secure memory access")]
    InvalidAccess,
}

/// A container for sensitive string data that will be zeroed when dropped
#[derive(Clone, Debug, Serialize, Deserialize)]
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
    
    /// Create a new non-sensitive string (won't be zeroed)
    pub fn new_non_sensitive(data: impl Into<String>) -> Self {
        Self {
            data: data.into(),
            sensitive: false,
        }
    }
    
    /// Get the length of the string
    pub fn len(&self) -> usize {
        self.data.len()
    }
    
    /// Check if the string is empty
    pub fn is_empty(&self) -> bool {
        self.data.is_empty()
    }
    
    /// Convert to a regular String (creates a copy)
    pub fn to_string(&self) -> String {
        self.data.clone()
    }
    
    /// Clear and zero the string's memory
    pub fn clear(&mut self) {
        if self.sensitive {
            // Zero out the memory before clearing
            unsafe {
                ptr::write_bytes(
                    self.data.as_mut_ptr(),
                    0,
                    self.data.capacity(),
                );
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

/// A container for sensitive binary data that will be zeroed when dropped
pub struct SecureBytes {
    /// The sensitive data
    data: Vec<u8>,
    
    /// Whether this data contains sensitive information
    sensitive: bool,
}

impl SecureBytes {
    /// Create a new secure byte container
    pub fn new(data: impl Into<Vec<u8>>) -> Self {
        Self {
            data: data.into(),
            sensitive: true,
        }
    }
    
    /// Create a new non-sensitive byte container (won't be zeroed)
    pub fn new_non_sensitive(data: impl Into<Vec<u8>>) -> Self {
        Self {
            data: data.into(),
            sensitive: false,
        }
    }
    
    /// Get the length of the data
    pub fn len(&self) -> usize {
        self.data.len()
    }
    
    /// Check if the data is empty
    pub fn is_empty(&self) -> bool {
        self.data.is_empty()
    }
    
    /// Clear and zero the data's memory
    pub fn clear(&mut self) {
        if self.sensitive {
            // Zero out the memory before clearing
            unsafe {
                ptr::write_bytes(
                    self.data.as_mut_ptr(),
                    0,
                    self.data.capacity(),
                );
            }
        }
        self.data.clear();
    }
    
    /// Get a reference to the underlying bytes
    pub fn as_bytes(&self) -> &[u8] {
        &self.data
    }
    
    /// Convert to a regular Vec<u8> (creates a copy)
    pub fn to_vec(&self) -> Vec<u8> {
        self.data.clone()
    }
}

impl Drop for SecureBytes {
    fn drop(&mut self) {
        self.clear();
    }
}

impl fmt::Debug for SecureBytes {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.sensitive {
            write!(f, "SecureBytes { data: [REDACTED], len: {} }", self.len())
        } else {
            write!(f, "SecureBytes {{ data: {:?}, len: {} }}", self.data, self.len())
        }
    }
}

impl AsRef<[u8]> for SecureBytes {
    fn as_ref(&self) -> &[u8] {
        &self.data
    }
}

impl Deref for SecureBytes {
    type Target = [u8];
    
    fn deref(&self) -> &Self::Target {
        &self.data
    }
}

impl DerefMut for SecureBytes {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.data
    }
}

/// A registry for tracking and monitoring sensitive memory allocations
static SECURE_MEMORY_REGISTRY: Lazy<Mutex<Vec<*mut u8>>> = Lazy::new(|| Mutex::new(Vec::new()));

/// Register memory as secure and track it
pub fn register_secure_memory(ptr: *mut u8) -> Result<(), SecureMemoryError> {
    let mut registry = SECURE_MEMORY_REGISTRY.lock().map_err(|e| {
        error!("Failed to lock secure memory registry: {}", e);
        SecureMemoryError::LockFailed(e.to_string())
    })?;
    
    debug!("Registering secure memory at {:?}", ptr);
    registry.push(ptr);
    
    Ok(())
}

/// Deregister secure memory
pub fn deregister_secure_memory(ptr: *mut u8) -> Result<(), SecureMemoryError> {
    let mut registry = SECURE_MEMORY_REGISTRY.lock().map_err(|e| {
        error!("Failed to lock secure memory registry: {}", e);
        SecureMemoryError::LockFailed(e.to_string())
    })?;
    
    debug!("Deregistering secure memory at {:?}", ptr);
    registry.retain(|&p| p != ptr);
    
    Ok(())
}

/// Secure memory allocator for sensitive data
/// This is a simplified implementation; in production, 
/// you would use a more robust secure allocator
pub struct SecureAllocator;

impl SecureAllocator {
    /// Allocate secure memory with a given size
    pub fn allocate(size: usize) -> Result<*mut u8, SecureMemoryError> {
        let layout = std::alloc::Layout::from_size_align(size, std::mem::align_of::<u8>())
            .map_err(|e| SecureMemoryError::AllocationFailed(e.to_string()))?;
        
        unsafe {
            let ptr = std::alloc::alloc(layout);
            if ptr.is_null() {
                return Err(SecureMemoryError::AllocationFailed("allocation returned null".into()));
            }
            
            // Zero the memory
            ptr::write_bytes(ptr, 0, size);
            
            // Register the allocation
            if let Err(e) = register_secure_memory(ptr) {
                // Free the memory if registration fails
                std::alloc::dealloc(ptr, layout);
                return Err(e);
            }
            
            debug!("Allocated {} bytes of secure memory at {:?}", size, ptr);
            Ok(ptr)
        }
    }
    
    /// Deallocate secure memory
    pub fn deallocate(ptr: *mut u8, size: usize) -> Result<(), SecureMemoryError> {
        if ptr.is_null() {
            return Err(SecureMemoryError::InvalidAccess);
        }
        
        let layout = std::alloc::Layout::from_size_align(size, std::mem::align_of::<u8>())
            .map_err(|e| SecureMemoryError::OperationFailed(e.to_string()))?;
        
        unsafe {
            // Zero the memory before deallocation
            ptr::write_bytes(ptr, 0, size);
            
            // Deregister from tracking
            if let Err(e) = deregister_secure_memory(ptr) {
                warn!("Failed to deregister secure memory: {}", e);
                // Continue with deallocation anyway
            }
            
            // Deallocate
            std::alloc::dealloc(ptr, layout);
            debug!("Deallocated {} bytes of secure memory at {:?}", size, ptr);
            
            Ok(())
        }
    }
}

/// Validator for input sent across FFI boundaries
pub struct BoundaryValidator;

impl BoundaryValidator {
    /// Validate a string to ensure it doesn't contain potentially harmful content
    pub fn validate_string(input: &str) -> bool {
        // Check for common code injection patterns
        let injection_patterns = [
            "<script", "javascript:", "data:text/html", "vbscript:",
            "onload=", "onerror=", "onclick=", "onmouseover=",
        ];
        
        for pattern in &injection_patterns {
            if input.to_lowercase().contains(pattern) {
                warn!("Potentially harmful content detected in string: {}", pattern);
                return false;
            }
        }
        
        // Check for SQLi patterns (simplified)
        let sql_patterns = [
            "' OR ", "\" OR ", "' OR '1'='1", "\" OR \"1\"=\"1",
            "'; DROP TABLE", "\"; DROP TABLE", "'; SELECT ", "'; INSERT ",
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
            "..", "~", "/etc/", "C:\\Windows\\", "/dev/", "/proc/",
            "/sys/", "/var/log/", "/root/", "/home/",
        ];
        
        for pattern in &traversal_patterns {
            if path.contains(pattern) {
                warn!("Potential path traversal detected: {}", pattern);
                return false;
            }
        }
        
        true
    }
    
    /// Sanitize a string to make it safe for use
    pub fn sanitize_string(input: &str) -> String {
        // Replace potentially harmful characters
        let mut result = input.to_string();
        
        // Replace HTML special chars
        result = result.replace('&', "&amp;")
            .replace('<', "&lt;")
            .replace('>', "&gt;")
            .replace('"', "&quot;")
            .replace('\'', "&#39;");
        
        // Remove null bytes
        result = result.replace('\0', "");
        
        result
    }
    
    /// Sanitize a path to make it safe for filesystem operations
    pub fn sanitize_path(path: &str) -> String {
        let mut result = path.to_string();
        
        // Replace path traversal sequences
        result = result.replace("..", "")
            .replace("~", "")
            .replace("\\", "/");
        
        // Remove leading slashes
        result = result.trim_start_matches('/').to_string();
        
        result
    }
}

/// Example usage of secure memory in a Tauri command
#[tauri::command]
pub fn handle_sensitive_data(sensitive_input: String) -> Result<String, String> {
    // Create a secure string to store sensitive data
    let mut secure_data = SecureString::new(sensitive_input);
    
    // Validate the input
    if !BoundaryValidator::validate_string(&secure_data) {
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
    
    // Sanitize the path
    let safe_path = BoundaryValidator::sanitize_path(&path);
    
    // Process the path (in a real app, you would do something useful here)
    let result = format!("Processed path: {}", safe_path);
    
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
        assert!(!BoundaryValidator::validate_string("<script>alert(1)</script>"));
        assert!(!BoundaryValidator::validate_string("javascript:alert(1)"));
        assert!(!BoundaryValidator::validate_string("' OR '1'='1"));
        
        // Test valid strings
        assert!(BoundaryValidator::validate_string("Hello, world!"));
        assert!(BoundaryValidator::validate_string("12345"));
        assert!(BoundaryValidator::validate_string("user@example.com"));
        
        // Test sanitize string
        let sanitized = BoundaryValidator::sanitize_string("<script>alert(1)</script>");
        assert_eq!(sanitized, "&lt;script&gt;alert(1)&lt;/script&gt;");
        
        // Test path validation
        assert!(!BoundaryValidator::validate_path("../../../etc/passwd"));
        assert!(!BoundaryValidator::validate_path("/etc/shadow"));
        
        // Test path sanitization
        let sanitized_path = BoundaryValidator::sanitize_path("../../../etc/passwd");
        assert_eq!(sanitized_path, "etc/passwd");
    }
} 