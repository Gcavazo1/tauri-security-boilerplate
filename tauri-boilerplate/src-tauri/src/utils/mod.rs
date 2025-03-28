/// Utilities for the Tauri application
/// 
/// This module contains various utilities for enhancing application security,
/// including memory-safe data handling, secure sanitization, and validation.

// Export the memory-safe submodule
pub mod memory_safe;

// Include tests in test mode
#[cfg(test)]
mod memory_safe_tests;

// Re-export important safety utilities for easy access
pub use memory_safe::{
    SecureString, 
    SecureBytes, 
    BoundaryValidator,
    handle_sensitive_data,
    validate_and_process_path,
};

/// Register all the security utility commands with Tauri
pub fn register_security_commands<R: tauri::Runtime>(
    builder: &mut tauri::Builder<R>,
) -> tauri::Builder<R> {
    builder.invoke_handler(tauri::generate_handler![
        memory_safe::handle_sensitive_data,
        memory_safe::validate_and_process_path,
    ])
} 